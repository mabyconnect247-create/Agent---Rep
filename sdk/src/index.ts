import * as anchor from "@coral-xyz/anchor";
import { Program, AnchorProvider, BN } from "@coral-xyz/anchor";
import { 
  Connection, 
  PublicKey, 
  Keypair, 
  SystemProgram,
  LAMPORTS_PER_SOL 
} from "@solana/web3.js";

// Program ID - update after deployment
export const PROGRAM_ID = new PublicKey("AgntRep1111111111111111111111111111111111111");

// ============ Types ============

export enum AgentType {
  Trading = "Trading",
  DeFi = "DeFi", 
  NFT = "NFT",
  Social = "Social",
  Infrastructure = "Infrastructure",
  Other = "Other",
}

export enum ActionType {
  Trade = "Trade",
  Swap = "Swap",
  Stake = "Stake",
  Unstake = "Unstake",
  Lend = "Lend",
  Borrow = "Borrow",
  Mint = "Mint",
  Burn = "Burn",
  Transfer = "Transfer",
  Vote = "Vote",
  Other = "Other",
}

export enum ActionOutcome {
  Success = "Success",
  Failure = "Failure",
  Profit = "Profit",
  Loss = "Loss",
  Neutral = "Neutral",
}

export interface AgentProfile {
  owner: PublicKey;
  name: string;
  description: string;
  agentType: AgentType;
  stake: number;
  reputationScore: number;
  totalActions: number;
  successfulActions: number;
  totalVolume: number;
  registeredAt: number;
  lastActionAt: number;
  isActive: boolean;
}

export interface ActionRecord {
  agent: PublicKey;
  actionType: ActionType;
  protocol: string;
  inputValue: number;
  outputValue: number;
  pnl: number;
  outcome: ActionOutcome;
  metadata: string;
  timestamp: number;
  actionIndex: number;
}

export interface ReputationScore {
  score: number;
  totalActions: number;
  successRate: number;
  totalVolume: number;
  ageDays: number;
  breakdown: {
    winRateScore: number;
    volumeScore: number;
    ageScore: number;
    consistencyScore: number;
  };
}

// ============ SDK Class ============

export class AgentRep {
  private connection: Connection;
  private provider: AnchorProvider;
  private program: Program;
  private wallet: Keypair;

  constructor(
    connection: Connection,
    wallet: Keypair,
    programId: PublicKey = PROGRAM_ID
  ) {
    this.connection = connection;
    this.wallet = wallet;
    
    // Create provider
    const provider = new AnchorProvider(
      connection,
      {
        publicKey: wallet.publicKey,
        signAllTransactions: async (txs) => {
          txs.forEach(tx => tx.sign(wallet));
          return txs;
        },
        signTransaction: async (tx) => {
          tx.sign(wallet);
          return tx;
        },
      },
      { commitment: "confirmed" }
    );
    this.provider = provider;
    
    // Load program (IDL would be loaded here in production)
    // this.program = new Program(IDL, programId, provider);
  }

  // ============ PDA Helpers ============

  getAgentPDA(owner: PublicKey): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
      [Buffer.from("agent"), owner.toBuffer()],
      PROGRAM_ID
    );
  }

  getActionPDA(agent: PublicKey, actionIndex: number): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
      [
        Buffer.from("action"),
        agent.toBuffer(),
        new BN(actionIndex).toArrayLike(Buffer, "le", 8),
      ],
      PROGRAM_ID
    );
  }

  getVaultPDA(): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
      [Buffer.from("vault")],
      PROGRAM_ID
    );
  }

  // ============ Agent Registration ============

  async register(params: {
    name: string;
    description: string;
    agentType: AgentType;
    stakeAmount: number; // in SOL
  }): Promise<string> {
    const [agentPDA] = this.getAgentPDA(this.wallet.publicKey);
    const [vaultPDA] = this.getVaultPDA();

    // Build and send transaction
    // In production, this would use the actual program instruction
    console.log(`Registering agent: ${params.name}`);
    console.log(`Agent PDA: ${agentPDA.toBase58()}`);
    console.log(`Stake: ${params.stakeAmount} SOL`);

    // Placeholder - actual implementation would call program
    return "tx_signature_placeholder";
  }

  // ============ Action Logging ============

  async logAction(params: {
    actionType: ActionType;
    protocol: string;
    inputValue: number;
    outputValue: number;
    outcome: ActionOutcome;
    metadata?: string;
  }): Promise<string> {
    const [agentPDA] = this.getAgentPDA(this.wallet.publicKey);
    
    // Get current action count to derive action PDA
    const agent = await this.getAgent(this.wallet.publicKey);
    const actionIndex = agent ? agent.totalActions : 0;
    const [actionPDA] = this.getActionPDA(agentPDA, actionIndex);

    console.log(`Logging action: ${params.actionType}`);
    console.log(`Protocol: ${params.protocol}`);
    console.log(`PnL: ${params.outputValue - params.inputValue}`);

    // Placeholder - actual implementation would call program
    return "tx_signature_placeholder";
  }

  // ============ Queries ============

  async getAgent(owner: PublicKey): Promise<AgentProfile | null> {
    const [agentPDA] = this.getAgentPDA(owner);
    
    try {
      // In production, fetch and deserialize account data
      const accountInfo = await this.connection.getAccountInfo(agentPDA);
      if (!accountInfo) return null;
      
      // Deserialize and return
      // return deserializeAgent(accountInfo.data);
      return null;
    } catch (error) {
      return null;
    }
  }

  async getReputation(owner: PublicKey): Promise<ReputationScore | null> {
    const agent = await this.getAgent(owner);
    if (!agent) return null;

    const now = Math.floor(Date.now() / 1000);
    const ageDays = Math.floor((now - agent.registeredAt) / 86400);
    const successRate = agent.totalActions > 0 
      ? (agent.successfulActions / agent.totalActions) * 100 
      : 0;

    // Calculate breakdown
    const winRateScore = Math.floor((successRate * 40) / 100);
    const volumeScore = agent.totalVolume > 0 
      ? Math.min(Math.floor(Math.log10(agent.totalVolume) * 3), 30)
      : 0;
    const ageScore = Math.min(Math.floor(ageDays / 9), 20);
    const consistencyScore = Math.min(Math.floor(agent.totalActions / 10), 10);

    return {
      score: agent.reputationScore,
      totalActions: agent.totalActions,
      successRate,
      totalVolume: agent.totalVolume,
      ageDays,
      breakdown: {
        winRateScore,
        volumeScore,
        ageScore,
        consistencyScore,
      },
    };
  }

  async getActionHistory(
    owner: PublicKey,
    limit: number = 50
  ): Promise<ActionRecord[]> {
    const agent = await this.getAgent(owner);
    if (!agent) return [];

    const [agentPDA] = this.getAgentPDA(owner);
    const actions: ActionRecord[] = [];

    // Fetch recent actions (would use getProgramAccounts with filters in production)
    const startIndex = Math.max(0, agent.totalActions - limit);
    
    for (let i = startIndex; i < agent.totalActions; i++) {
      const [actionPDA] = this.getActionPDA(agentPDA, i);
      // Fetch and deserialize action account
      // actions.push(deserializeAction(accountInfo.data));
    }

    return actions;
  }

  // ============ Leaderboard ============

  async getLeaderboard(limit: number = 20): Promise<AgentProfile[]> {
    // In production, use getProgramAccounts with filters
    // Sort by reputation_score descending
    console.log(`Fetching top ${limit} agents by reputation...`);
    return [];
  }

  // ============ Trust Check ============

  async canTrust(
    agentOwner: PublicKey,
    minScore: number = 60,
    minActions: number = 10
  ): Promise<{ trusted: boolean; reason: string }> {
    const reputation = await this.getReputation(agentOwner);
    
    if (!reputation) {
      return { trusted: false, reason: "Agent not found" };
    }

    if (reputation.score < minScore) {
      return { 
        trusted: false, 
        reason: `Score ${reputation.score} below minimum ${minScore}` 
      };
    }

    if (reputation.totalActions < minActions) {
      return { 
        trusted: false, 
        reason: `Only ${reputation.totalActions} actions, need ${minActions}` 
      };
    }

    return { trusted: true, reason: "Meets all trust criteria" };
  }
}

// ============ CLI Helper ============

export async function checkReputation(
  connection: Connection,
  agentPubkey: string
): Promise<void> {
  const pubkey = new PublicKey(agentPubkey);
  const dummyWallet = Keypair.generate();
  const sdk = new AgentRep(connection, dummyWallet);
  
  const rep = await sdk.getReputation(pubkey);
  
  if (!rep) {
    console.log("Agent not found");
    return;
  }

  console.log("\n========== AGENT REPUTATION ==========");
  console.log(`Score: ${rep.score}/100`);
  console.log(`Total Actions: ${rep.totalActions}`);
  console.log(`Success Rate: ${rep.successRate.toFixed(1)}%`);
  console.log(`Total Volume: $${rep.totalVolume.toLocaleString()}`);
  console.log(`Age: ${rep.ageDays} days`);
  console.log("\n--- Score Breakdown ---");
  console.log(`Win Rate:    ${rep.breakdown.winRateScore}/40`);
  console.log(`Volume:      ${rep.breakdown.volumeScore}/30`);
  console.log(`Age:         ${rep.breakdown.ageScore}/20`);
  console.log(`Consistency: ${rep.breakdown.consistencyScore}/10`);
  console.log("=======================================\n");
}

export default AgentRep;
