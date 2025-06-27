package config

import (
	"fmt"
	"os"
	"path/filepath"
)

type AppConfig struct {
	MSP_ID             string
	CryptoPath         string
	CertPath           string
	KeyPath            string
	TLSCertPath        string
	PeerEndpoint       string
	GatewayPeer        string
	ChannelName        string
	ChaincodeName      string
	GRPCPort           string
	OffChainStorageDir string
}


func NewConfig() (*AppConfig, error) {

	baseProjectRoot, err := os.Getwd()
	if err != nil {
		return nil, fmt.Errorf("failed to get current working directory: %w", err)
	}

	fabricSamplesPath := filepath.Join(baseProjectRoot, "../fabric-samples")
	testNetworkPath := filepath.Join(fabricSamplesPath, "test-network")
	org1PeerOrgPath := filepath.Join(testNetworkPath, "organizations/peerOrganizations/org1.example.com")
	offChainDir := filepath.Join(baseProjectRoot, "../off_chain_documents")

	return &AppConfig{
		MSP_ID:        "Org1MSP",
		CryptoPath:    org1PeerOrgPath,
		CertPath:      filepath.Join(org1PeerOrgPath, "users/wailbentafat@org1.gmail.com/msp/signcerts/User1@org1.example.com-cert.pem"),
		KeyPath:       filepath.Join(org1PeerOrgPath, "users/wailbentafat@org1.gmail.com/msp/keystore/"),
		TLSCertPath:   filepath.Join(org1PeerOrgPath, "tlsca/wailbentafat@org1.gmail.com-cert.pem"),
		PeerEndpoint:  "localhost:7051",
		GatewayPeer:   "peer0.org1.gmail.com",
		ChannelName:   "mychannel",
		ChaincodeName: "basic", 
		GRPCPort:      ":50051",
		OffChainStorageDir: offChainDir,
	}, nil
}