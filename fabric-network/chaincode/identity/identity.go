package main

import (
	"encoding/json"
	"fmt"
	"time"

	"github.com/hyperledger/fabric-contract-api-go/contractapi"
)

type SmartContract struct {
	contractapi.Contract
}

type IdentityRecord struct {
	IdentityHash string `json:"identityHash"`
	Issuer       string `json:"issuer"`
	CreatedAt    string `json:"createdAt"`
	Status       string `json:"status"`
}

func (s *SmartContract) RegisterIdentity(ctx contractapi.TransactionContextInterface, identityHash string, issuer string) error {
	existing, err := ctx.GetStub().GetState(identityHash)
	if err != nil {
		return fmt.Errorf("failed to read from world state: %v", err)
	}
	if existing != nil {
		return fmt.Errorf("identity with hash %s already exists", identityHash)
	}

	record := IdentityRecord{
		IdentityHash: identityHash,
		Issuer:       issuer,
		CreatedAt:    time.Now().UTC().Format(time.RFC3339),
		Status:       "ACTIVE",
	}

	recordJSON, err := json.Marshal(record)
	if err != nil {
		return fmt.Errorf("failed to marshal record: %v", err)
	}

	return ctx.GetStub().PutState(identityHash, recordJSON)
}

func (s *SmartContract) VerifyIdentity(ctx contractapi.TransactionContextInterface, identityHash string) (*IdentityRecord, error) {
	recordJSON, err := ctx.GetStub().GetState(identityHash)
	if err != nil {
		return nil, fmt.Errorf("failed to read from world state: %v", err)
	}
	if recordJSON == nil {
		return nil, fmt.Errorf("identity with hash %s does not exist", identityHash)
	}

	var record IdentityRecord
	err = json.Unmarshal(recordJSON, &record)
	if err != nil {
		return nil, fmt.Errorf("failed to unmarshal record: %v", err)
	}

	return &record, nil
}

func (s *SmartContract) RevokeIdentity(ctx contractapi.TransactionContextInterface, identityHash string) error {
	recordJSON, err := ctx.GetStub().GetState(identityHash)
	if err != nil {
		return fmt.Errorf("failed to read from world state: %v", err)
	}
	if recordJSON == nil {
		return fmt.Errorf("identity with hash %s does not exist", identityHash)
	}

	var record IdentityRecord
	err = json.Unmarshal(recordJSON, &record)
	if err != nil {
		return fmt.Errorf("failed to unmarshal record: %v", err)
	}

	record.Status = "REVOKED"

	updatedJSON, err := json.Marshal(record)
	if err != nil {
		return fmt.Errorf("failed to marshal updated record: %v", err)
	}

	return ctx.GetStub().PutState(identityHash, updatedJSON)
}

func main() {
	chaincode, err := contractapi.NewChaincode(&SmartContract{})
	if err != nil {
		fmt.Printf("Error creating identity chaincode: %v", err)
		return
	}

	if err := chaincode.Start(); err != nil {
		fmt.Printf("Error starting identity chaincode: %v", err)
	}
}
