# AgentRep Demo Video Script
## Duration: 3 minutes

---

## INTRO (0:00 - 0:20)

**[Screen: AgentRep logo + tagline]**

> "AI agents are everywhere. They trade, they transact, they collaborate.
> But how do you know if an agent is trustworthy?
> 
> Introducing AgentRep - the on-chain reputation protocol for AI agents on Solana."

---

## THE PROBLEM (0:20 - 0:40)

**[Screen: Multiple agent icons with question marks]**

> "Right now, there's no way to verify an agent's track record.
> - Has this agent performed well historically?
> - Can you trust it with your funds?
> - Is it who they claim to be?
>
> AgentRep solves this with verifiable, on-chain reputation."

---

## HOW IT WORKS (0:40 - 1:30)

**[Screen: Architecture diagram]**

> "Here's how it works:"

### Step 1: Register
**[Screen: Code snippet - register call]**

> "Agents register on-chain with a SOL stake as commitment.
> They get a unique PDA and start with a neutral reputation score of 50."

### Step 2: Log Actions
**[Screen: Demo - logging trades]**

> "Every action is recorded on-chain.
> Trades, swaps, stakes - all with outcomes and PnL.
> This creates an immutable track record."

### Step 3: Build Reputation
**[Screen: Score breakdown visualization]**

> "Reputation scores are calculated from:
> - Win rate (40%)
> - Volume (30%)
> - Account age (20%)
> - Consistency (10%)
>
> Better performance = higher score. Simple."

---

## TRUST QUERIES (1:30 - 2:00)

**[Screen: CLI demo - trust check]**

> "Before interacting with any agent, you can verify their reputation."

```bash
$ agentrep trust 7xKXabc...

✅ TRUSTED
Score: 78/100
Actions: 142
Success Rate: 73%
```

> "Other agents can check this too - enabling agent-to-agent trust."

---

## USE CASES (2:00 - 2:30)

**[Screen: Integration logos]**

> "AgentRep is infrastructure. It enables:
>
> - **DeFi protocols** requiring minimum reputation to interact
> - **Agent marketplaces** showing verified track records
> - **Governance systems** with reputation-weighted voting
> - **Swarm coordination** where agents verify each other
>
> Multiple projects are already integrating."

---

## CLOSING (2:30 - 3:00)

**[Screen: GitHub + social links]**

> "AgentRep is open source and ready to integrate.
>
> The agent economy needs trust. We're building it.
>
> Check out our GitHub. Try the SDK. Join the future of agent trust."

**[Screen: Final logo]**

> "AgentRep. Trust, verified."

---

## TECHNICAL DETAILS FOR VIDEO

### Screen Recordings Needed:
1. CLI checking reputation
2. Demo script running (scripts/demo.ts)
3. Code walkthrough (lib.rs highlights)
4. GitHub repo tour

### Assets Needed:
- AgentRep logo
- Architecture diagram
- Score breakdown chart
- Integration partner logos

### Music:
- Upbeat, tech-forward, 3 minutes

---

## LINKS TO INCLUDE

- GitHub: https://github.com/mabyconnect247-create/Agent---Rep
- Colosseum: https://colosseum.com/agent-hackathon/projects/agentrep-on-chain-agent-reputation-protocol
- Demo: Run `npx ts-node scripts/demo.ts`
