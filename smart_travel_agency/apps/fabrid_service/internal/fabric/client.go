package fabric

import (
	"fmt"
	"io/ioutil"
	"log"
	"path/filepath"

	"github.com/hyperledger/fabric-gateway/pkg/client"
	"github.com/hyperledger/fabric-gateway/pkg/identity"
	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials"

	"github.com/wailbentafat/fabric/internal/config" 
)

func ConnectToFabricGateway(cfg *config.AppConfig) (*client.Gateway, error) {
	// Load TLS certificate for the gateway peer
	log.Printf("Loading TLS certificate from: %s\n", cfg.TLSCertPath)
	tlsCert, err := ioutil.ReadFile(cfg.TLSCertPath)
	if err != nil {
		return nil, fmt.Errorf("failed to load TLS certificate from %s: %w", cfg.TLSCertPath, err)
	}
	cred := credentials.NewClientTLSFromCert(tlsCert, cfg.GatewayPeer)

	// Load user's signing certificate
	log.Printf("Loading user certificate from: %s\n", cfg.CertPath)
	cert, err := ioutil.ReadFile(cfg.CertPath)
	if err != nil {
		return nil, fmt.Errorf("failed to load user certificate from %s: %w", cfg.CertPath, err)
	}

	log.Printf("Loading private key from directory: %s\n", cfg.KeyPath)
	keyDirEntries, err := ioutil.ReadDir(cfg.KeyPath)
	if err != nil {
		return nil, fmt.Errorf("failed to read private key directory %s: %w", cfg.KeyPath, err)
	}
	if len(keyDirEntries) == 0 {
		return nil, fmt.Errorf("no private key found in directory %s", cfg.KeyPath)
	}
	privateKeyPath := filepath.Join(cfg.KeyPath, keyDirEntries[0].Name())
	key, err := ioutil.ReadFile(privateKeyPath)
	if err != nil {
		return nil, fmt.Errorf("failed to load private key from %s: %w", privateKeyPath, err)
	}

	id, err := identity.NewX509Identity(cfg.MSP_ID, cert)
	if err != nil {
		return nil, fmt.Errorf("failed to create X509 identity: %w", err)
	}
	signer, err := identity.NewPrivateKeySign(key)
	if err != nil {
		return nil, fmt.Errorf("failed to create private key signer: %w", err)
	}

	// Connect to the Fabric Gateway
	gw, err := client.Connect(
		id,
		client.WithSign(signer),
		client.WithClientConnection(
			client.ConnectWith(grpc.WithTransportCredentials(cred)),
			client.WithTarget(cfg.PeerEndpoint),
		),
	)
	if err != nil {
		return nil, fmt.Errorf("failed to connect to gateway: %w", err)
	}
	return gw, nil
}