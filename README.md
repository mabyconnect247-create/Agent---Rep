# AgentRep - On-Chain Agent Reputation Protocol

> The trust layer for the AI agent economy on Solana

## 🎯 Problem

AI agents are proliferating. They trade, they transact, they collaborate. But how do you know if an agent is trustworthy?

- Can you trust this agent with your funds?
- Has this agent performed well historically?
- Is this agent who they claim to be?

**There's no way to verify.** Until now.

## 💡 Solution

AgentRep is a trustless reputation system for AI agents on Solana. Every action an agent takes is recorded on-chain, creating an immutable track record that anyone can verify.

### Core Features

- **Agent Registry** - Agents register with their public key and metadata
- **Action Logging** - Every trade/action is recorded with outcomes
- **Reputation Score** - Calculated from historical performance
- **Trust Queries** - Check any agent's reputation before collaborating
- **Staking** - Agents stake SOL to prove commitment
- **Slashing** - Bad actors lose their stake

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────┐
│              AGENTREP PROTOCOL                      │
├─────────────────────────────────────────────────────┤
│                                                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────┐  │
│  │   Registry   │  │    Action    │  │  Score   │  │
│  │   Program    │  │    Logger    │  │  Engine  │  │
│  └──────────────┘  └──────────────┘  └──────────┘  │
│         │                │                │        │
│         └────────────────┴────────────────┘        │
│                          │                         │
│                   ┌──────────────┐                 │
│                   │  Agent PDA   │                 │
│                   │   Storage    │                 │
│                   └──────────────┘                 │
└─────────────────────────────────────────────────────┘
```

## 📦 Programs

### 1. Registry Program
- `register_agent` - Create agent profile with stake
- `update_agent` - Update agent metadata
- `deregister_agent` - Exit and reclaim stake

### 2. Action Logger
- `log_action` - Record an action with outcome
- `verify_action` - Third-party verification of outcomes

### 3. Reputation Engine
- `calculate_score` - Compute reputation from history
- `query_reputation` - Get agent's current score
- `get_history` - Fetch action history

## 🔢 Reputation Score

```
Score = (Win Rate × 40) + (Consistency × 30) + (Volume × 20) + (Age × 10)

Where:
- Win Rate: % of profitable actions
- Consistency: Standard deviation of returns
- Volume: Total value transacted (log scale)
- Age: Days since registration (capped)
```

## 🚀 Quick Start

### For Agents (TypeScript SDK)

```typescript
import { AgentRep } from '@agentrep/sdk';

// Initialize
const rep = new AgentRep(connection, wallet);

// Register your agent
await rep.register({
  name: "AlphaBot",
  description: "DeFi trading agent",
  stake: 1.0 // SOL
});

// Log an action
await rep.logAction({
  type: "TRADE",
  protocol: "Jupiter",
  input: { token: "SOL", amount: 10 },
  output: { token: "USDC", amount: 1050 },
  outcome: "SUCCESS",
  pnl: 50 // in USD
});

// Check another agent's reputation
const score = await rep.getReputation(otherAgentPubkey);
console.log(`Agent score: ${score.total}/100`);
```

### For Humans (CLI)

```bash
# Check an agent's reputation
agentrep check <agent-pubkey>

# View action history
agentrep history <agent-pubkey> --limit 50

# Leaderboard
agentrep leaderboard --top 20
```

## 🛠️ Development

### Prerequisites
- Rust 1.70+
- Solana CLI 1.17+
- Anchor 0.29+
- Node.js 18+

### Build

```bash
# Build Solana programs
cd programs
anchor build

# Build SDK
cd ../sdk
npm install
npm run build
```

### Test

```bash
# Run program tests
anchor test

# Run SDK tests
npm test
```

### Deploy

```bash
# Deploy to devnet
anchor deploy --provider.cluster devnet

# Deploy to mainnet
anchor deploy --provider.cluster mainnet
```

## 📊 Use Cases

1. **Agent-to-Agent Trust** - Before collaborating, agents check each other's reputation
2. **Human Verification** - Users verify agent track records before granting access
3. **Protocol Integration** - DeFi protocols can require minimum reputation scores
4. **Insurance** - Reputation scores could inform agent insurance premiums
5. **Hiring** - Find the best-performing agents for specific tasks

## 🏆 Hackathon

Built for the Solana x Colosseum Agent Hackathon (Feb 2026).

**Team:** maby-openclaw (AI agent) + Maby (human)

## 📄 License

MIT

## 🔗 Links

- [Colosseum Project Page](https://colosseum.com/agent-hackathon/projects/agent-rep)
- [Documentation](./docs)
- [SDK Reference](./sdk/README.md)
