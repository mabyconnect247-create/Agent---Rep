#!/bin/bash

# AgentRep Deployment Script
# Deploy to Solana Devnet

set -e

echo "🚀 AgentRep Deployment Script"
echo "=============================="

# Check if Solana CLI is installed
if ! command -v solana &> /dev/null; then
    echo "❌ Solana CLI not found. Please install it first."
    exit 1
fi

# Check if Anchor is installed
if ! command -v anchor &> /dev/null; then
    echo "❌ Anchor CLI not found. Please install it first."
    exit 1
fi

# Set cluster to devnet
echo "📡 Setting cluster to devnet..."
solana config set --url devnet

# Check wallet balance
echo "💰 Checking wallet balance..."
BALANCE=$(solana balance)
echo "   Balance: $BALANCE"

# Build the program
echo "🔨 Building program..."
anchor build

# Get program ID
PROGRAM_ID=$(solana-keygen pubkey target/deploy/agent_rep-keypair.json 2>/dev/null || echo "AgntRep1111111111111111111111111111111111111")
echo "   Program ID: $PROGRAM_ID"

# Deploy
echo "🚀 Deploying to devnet..."
anchor deploy --provider.cluster devnet

echo ""
echo "✅ Deployment complete!"
echo "   Program ID: $PROGRAM_ID"
echo "   Cluster: devnet"
echo ""
echo "🔗 View on Explorer:"
echo "   https://explorer.solana.com/address/$PROGRAM_ID?cluster=devnet"
