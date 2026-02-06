# AgentRep Setup Guide

## Vercel KV (Persistence)

To enable persistent storage (required for production):

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select the `agent-rep` project
3. Click **Storage** tab
4. Click **Create Database** → Select **KV**
5. Name it `agentrep-kv` and click **Create**
6. Click **Connect** to link it to your project
7. Redeploy the project

The KV environment variables (`KV_REST_API_URL`, `KV_REST_API_TOKEN`) will be auto-injected.

## Solana Devnet Deployment

### Option 1: GitHub Actions (Recommended)

1. Go to repo Settings → Secrets → Actions
2. Add secret `DEPLOY_KEYPAIR` with your Solana keypair JSON
3. Go to Actions → "Deploy to Devnet" → Run workflow
4. Type "deploy" to confirm

### Option 2: Manual (requires Solana + Anchor CLI)

```bash
# Install Solana CLI
sh -c "$(curl -sSfL https://release.solana.com/v1.17.0/install)"

# Install Anchor
npm i -g @coral-xyz/anchor-cli

# Configure for devnet
solana config set --url devnet

# Airdrop SOL for deployment
solana airdrop 2

# Build and deploy
cd agent-rep
anchor build
anchor deploy --provider.cluster devnet
```

## Environment Variables

For local development, create `.env.local` in `/frontend`:

```
# Optional - KV falls back to in-memory if not set
KV_REST_API_URL=your-kv-url
KV_REST_API_TOKEN=your-kv-token

# Solana RPC (optional, defaults to devnet)
NEXT_PUBLIC_SOLANA_RPC=https://api.devnet.solana.com
```

## Running Locally

```bash
cd frontend
npm install
npm run dev
```

Visit http://localhost:3000
