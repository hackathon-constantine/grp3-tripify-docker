// internal/app/server.go
package app

import (
	"context"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"os"
	"path/filepath"
	"time"

	"github.com/hyperledger/fabric-gateway/pkg/client"
	"google.golang.org/protobuf/types/known/timestamppb"

	"github.com/wailbentafat/fabric/internal/config" 
	"github.com/wailbentafat/fabric/internal/fabric" 
	pb "github.com/wailbentafat/fabric/pkg/proto"   
)

type DocumentAsset struct {
	ID           string `json:"ID"`
	UserID       string `json:"UserID"`
	FileName     string `json:"FileName"`
	FileType     string `json:"FileType"`
	DocumentHash string `json:"DocumentHash"`
	OffChainURL  string `json:"OffChainURL"`
	Timestamp    string `json:"Timestamp"`
}

type DocumentServiceServer struct {
	pb.UnimplementedDocumentServiceServer
	contract           *client.Contract
	offChainStorageDir string
}

func NewDocumentServiceServer(cfg *config.AppConfig) (*DocumentServiceServer, error) {
	err := os.MkdirAll(cfg.OffChainStorageDir, os.ModePerm)
	if err != nil {
		return nil, fmt.Errorf("failed to create off-chain storage directory '%s': %w", cfg.OffChainStorageDir, err)
	}
	log.Printf("Off-chain storage directory ensured: %s\n", cfg.OffChainStorageDir)

	log.Println("Connecting to Hyperledger Fabric Gateway...")
	gw, err := fabric.ConnectToFabricGateway(cfg) 
	if err != nil {
		return nil, fmt.Errorf("failed to connect to Fabric Gateway: %w", err)
	}
	log.Println("Successfully connected to Fabric Gateway.")

	network := gw.GetNetwork(cfg.ChannelName)
	contract := network.GetContract(cfg.ChaincodeName)
	log.Printf("Fabric Contract '%s' initialized on channel '%s'.\n", cfg.ChaincodeName, cfg.ChannelName)

	return &DocumentServiceServer{
		contract:           contract,
		offChainStorageDir: cfg.OffChainStorageDir,
	}, nil
}
func (s *DocumentServiceServer) UploadDocument(stream pb.DocumentService_UploadDocumentServer) error {
	var documentID, userID, fileName, fileType string
	var fileDataBuffer []byte
	var offChainFilePath string
	var file *os.File

	metadataReceived := false
	log.Println("Starting document upload stream reception...")

	for {
		req, err := stream.Recv()
		if err == io.EOF {
			log.Println("End of document upload stream detected.")
			break
		}
		if err != nil {
			log.Printf("Error receiving chunk: %v\n", err)
			if file != nil {
				file.Close()
				os.Remove(offChainFilePath) // Clean up partial file
			}
			return fmt.Errorf("failed to receive chunk: %w", err)
		}

		if !metadataReceived {
			documentID = req.GetDocumentId()
			userID = req.GetUserId()
			fileName = req.GetFileName()
			fileType = req.GetFileType()

			if documentID == "" || userID == "" || fileName == "" || fileType == "" {
				return fmt.Errorf("missing essential metadata (document_id, user_id, file_name, file_type) in first chunk")
			}

			log.Printf("Received metadata: DocumentID=%s, UserID=%s, FileName=%s, FileType=%s\n", documentID, userID, fileName, fileType)

			uniqueFileName := fmt.Sprintf("%s_%s_%d%s", documentID, fileName, time.Now().UnixNano(), filepath.Ext(fileName))
			offChainFilePath = filepath.Join(s.offChainStorageDir, uniqueFileName) // Use server's storage directory

			f, err := os.Create(offChainFilePath)
			if err != nil {
				return fmt.Errorf("failed to create off-chain file '%s': %w", offChainFilePath, err)
			}
			file = f
			defer func() {
				if file != nil {
					closeErr := file.Close()
					if closeErr != nil {
						log.Printf("Error closing off-chain file %s: %v\n", offChainFilePath, closeErr)
					} else {
						log.Printf("Off-chain file %s successfully closed.\n", offChainFilePath)
					}
				}
			}()

			metadataReceived = true
		}

		chunk := req.GetChunkData()
		if len(chunk) > 0 {
			n, writeErr := file.Write(chunk)
			if writeErr != nil {
				log.Printf("Failed to write chunk to off-chain file: %v\n", writeErr)
				return fmt.Errorf("failed to write chunk to off-chain file: %w", writeErr)
			}
			fileDataBuffer = append(fileDataBuffer, chunk...)
			log.Printf("Wrote %d bytes to %s\n", n, offChainFilePath)
		}
	}

	if !metadataReceived {
		return fmt.Errorf("no metadata received throughout the upload stream; no file was processed")
	}

	hasher := sha256.New()
	hasher.Write(fileDataBuffer)
	documentHash := hex.EncodeToString(hasher.Sum(nil))

	offChainURL := offChainFilePath

	log.Printf("File upload complete. Document Hash: %s, Off-chain URL: %s\n", documentHash, offChainURL)

	log.Println("Submitting CreateDocument transaction to Fabric ledger...")
	txName := "CreateDocument"

	args := []string{
		documentID,
		userID,
		fileName,
		fileType,
		documentHash,
		offChainURL,
		timestamppb.Now().String(),
	}

	_, commit, err := s.contract.SubmitAsync(txName, client.WithArguments(args...))
	if err != nil {
		log.Printf("Failed to submit transaction '%s': %v\n", txName, err)
		return stream.SendAndClose(&pb.UploadDocumentResponse{
			Success: false,
			Error:   fmt.Sprintf("Failed to submit transaction: %v", err),
		})
	}

	status, err := commit.Result()
	if err != nil {
		log.Printf("Failed to get transaction commit status for %s: %v\n", commit.TransactionID(), err)
		return stream.SendAndClose(&pb.UploadDocumentResponse{
			Success: false,
			Error:   fmt.Sprintf("Transaction commit failed: %v", err),
		})
	}

	txID := commit.TransactionID()
	log.Printf("Transaction '%s' committed successfully. Status: %s\n", txID, status.Status)

	return stream.SendAndClose(&pb.UploadDocumentResponse{
		Success:       true,
		Message:       "Document uploaded and recorded on ledger successfully.",
		DocumentHash:  documentHash,
		OffChainUrl:   offChainURL,
		TransactionId: txID,
	})
}

func (s *DocumentServiceServer) GetDocumentInfo(ctx context.Context, req *pb.GetDocumentInfoRequest) (*pb.GetDocumentInfoResponse, error) {
	documentID := req.GetDocumentId()
	log.Printf("Received GetDocumentInfo request for DocumentID: %s\n", documentID)

	log.Println("Evaluating ReadDocument transaction from Fabric ledger...")
	txName := "ReadDocument"

	result, err := s.contract.EvaluateTransaction(txName, documentID)
	if err != nil {
		log.Printf("Failed to evaluate transaction '%s' for DocumentID %s: %v\n", txName, documentID, err)
		return &pb.GetDocumentInfoResponse{
			Found: false,
			Error: fmt.Sprintf("Failed to query document: %v", err),
		}, nil
	}

	if len(result) == 0 {
		log.Printf("Document with ID %s not found on ledger (empty result).\n", documentID)
		return &pb.GetDocumentInfoResponse{
			Found: false,
			Error: fmt.Sprintf("Document with ID %s not found on ledger", documentID),
		}, nil
	}

	log.Printf("Raw chaincode response for DocumentID %s: %s\n", documentID, string(result))

	var docAsset DocumentAsset
	if err := json.Unmarshal(result, &docAsset); err != nil {
		log.Printf("Failed to unmarshal chaincode response into DocumentAsset struct: %v, raw data: %s\n", err, string(result))
		return &pb.GetDocumentInfoResponse{
			Found: false,
			Error: fmt.Sprintf("Failed to parse document data from ledger: %v", err),
		}, nil
	}

	log.Printf("Successfully unmarshaled document data for ID %s: %+v\n", documentID, docAsset)

	response := &pb.GetDocumentInfoResponse{
		Found:        true,
		DocumentId:   docAsset.ID,
		DocumentHash: docAsset.DocumentHash,
		OffChainUrl:  docAsset.OffChainURL,
		UserId:       docAsset.UserID,
		FileName:     docAsset.FileName,
		FileType:     docAsset.FileType,
		Message:      "Document information retrieved successfully.",
	}

	return response, nil
}