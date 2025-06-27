// cmd/server/main.go
package main

import (
	"log"
	"net"

	"google.golang.org/grpc"

	"github.com/wailbentafat/fabric/internal/app"
	"github.com/wailbentafat/fabric/internal/config"
	pb "github.com/wailbentafat/fabric/pkg/proto"
	"github.com/wailbentafat/fabric/pkg/proto/pb" 
)

func main() {
	log.SetFlags(log.LstdFlags | log.Lshortfile)

	// Load configuration
	cfg, err := config.NewConfig()
	if err != nil {
		log.Fatalf("Failed to load configuration: %v", err)
	}

	documentService, err := app.NewDocumentServiceServer(cfg)
	if err != nil {
		log.Fatalf("Failed to create DocumentServiceServer: %v", err)
	}

	lis, err := net.Listen("tcp", cfg.GRPCPort)
	if err != nil {
		log.Fatalf("Failed to listen on port %s: %v", cfg.GRPCPort, err)
	}

	s := grpc.NewServer()

	pb.RegisterDocumentServiceServer(s, documentService)

	log.Printf("Go gRPC server listening on %v\n", lis.Addr())

	if err := s.Serve(lis); err != nil {
		log.Fatalf("Failed to serve gRPC: %v", err)
	}
}