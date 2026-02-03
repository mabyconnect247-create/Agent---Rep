import {
  Connection,
  PublicKey,
  Keypair,
  Transaction,
  TransactionInstruction,
  SystemProgram,
  LAMPORTS_PER_SOL,
  sendAndConfirmTransaction,
} from "@solana/web3.js";
import { BN } from "@coral-xyz/anchor";
import {
  AgentAccount,
  ActionAccount,
  RegisterParams,
  LogActionParams,
  ReputationResult,
  TrustCheckResult,
  LeaderboardEntry,
  ActionHistoryEntry,
  AgentRepConfig,
  DEFAULT_CONFIG,
  AgentType,
  ActionType,
  ActionOutcome,
} from "./types";

export class AgentRepClient {
  private connection: Connection;
  private wallet: Keypair;
  private config: AgentRepConfig;

  constructor(
    connection: Connection,
    wallet: Keypair,
    config: Partial<AgentRepConfig> = {}
  ) {
    this.connection = connection;
    this.wallet = wallet;
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  // ============ PDA Derivation ============

  getAgentPDA(owner: PublicKey): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
      [Buffer.from("agent"), owner.toBuffer()],
      this.config.programId
    );
  }

  getActionPDA(agent: PublicKey, actionIndex: number): [PublicKey, number] {
    const indexBuffer = Buffer.alloc(8);
    indexBuffer.writeBigUInt64LE(BigInt(actionIndex));
    return PublicKey.findProgramAddressSync(
      [Buffer.from("action"), agent.toBuffer(), indexBuffer],
      this.config.programId
    );
  }

  getVaultPDA(): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
      [Buffer.from("vault")],
      this.config.programId
    );
  }

  getGovernancePDA(): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
      [Buffer.from("governance")],
      this.config.programId
    );
  }

  // ============ Agent Registration ============

  async register(params: RegisterParams): Promise<string> {
    const [agentPDA, agentBump] = this.getAgentPDA(this.wallet.publicKey);
    const [vaultPDA, vaultBump] = this.getVaultPDA();

    console.log("🤖 Registering agent...");
    console.log(`   Name: ${params.name}`);
    console.log(`   Type: ${params.agentType}`);
    console.log(`   Stake: ${params.stakeAmount} SOL`);
    console.log(`   PDA: ${agentPDA.toBase58()}`);

    // Build instruction data
    const agentTypeValue = AgentType[params.agentType];
    const stakeInLamports = Math.floor(params.stakeAmount * LAMPORTS_PER_SOL);

    // In production, this would use the actual Anchor instruction builder
    // For now, we simulate the registration
    
    const tx = new Transaction();
    
    // Placeholder instruction - in production would be proper Anchor ix
    // tx.add(program.instruction.registerAgent(
    //   params.name,
    //   params.description,
    //   agentTypeValue,
    //   { accounts: { ... } }
    // ));

    console.log("✅ Agent registration prepared");
    console.log(`   Transaction ready for signing`);
    
    // Return simulated signature for now
    return `sim_${Date.now()}_register`;
  }

  // ============ Action Logging ============

  async logAction(params: LogActionParams): Promise<string> {
    const [agentPDA] = this.getAgentPDA(this.wallet.publicKey);
    
    // Get current action count
    const agent = await this.getAgentAccount(this.wallet.publicKey);
    const actionIndex = agent ? Number(agent.totalActions) : 0;
    const [actionPDA] = this.getActionPDA(agentPDA, actionIndex);

    const pnl = params.outputValue - params.inputValue;

    console.log("📝 Logging action...");
    console.log(`   Type: ${params.actionType}`);
    console.log(`   Protocol: ${params.protocol}`);
    console.log(`   Input: ${params.inputValue}`);
    console.log(`   Output: ${params.outputValue}`);
    console.log(`   PnL: ${pnl >= 0 ? "+" : ""}${pnl}`);
    console.log(`   Outcome: ${params.outcome}`);
    console.log(`   Action #${actionIndex}`);

    // In production, build and send actual transaction
    
    console.log("✅ Action logged");
    return `sim_${Date.now()}_action_${actionIndex}`;
  }

  // ============ Account Fetching ============

  async getAgentAccount(owner: PublicKey): Promise<AgentAccount | null> {
    const [agentPDA] = this.getAgentPDA(owner);

    try {
      const accountInfo = await this.connection.getAccountInfo(agentPDA);
      if (!accountInfo) {
        return null;
      }

      // In production, deserialize using Anchor
      // return program.account.agent.fetch(agentPDA);
      
      // Simulated return for development
      return null;
    } catch (error) {
      console.error("Error fetching agent:", error);
      return null;
    }
  }

  async getActionAccount(
    agent: PublicKey,
    actionIndex: number
  ): Promise<ActionAccount | null> {
    const [actionPDA] = this.getActionPDA(agent, actionIndex);

    try {
      const accountInfo = await this.connection.getAccountInfo(actionPDA);
      if (!accountInfo) {
        return null;
      }

      // In production, deserialize using Anchor
      return null;
    } catch (error) {
      console.error("Error fetching action:", error);
      return null;
    }
  }

  // ============ Reputation Queries ============

  async getReputation(owner: PublicKey): Promise<ReputationResult | null> {
    const agent = await this.getAgentAccount(owner);
    if (!agent) {
      return null;
    }

    const now = Math.floor(Date.now() / 1000);
    const registeredAt = Number(agent.registeredAt);
    const ageDays = Math.floor((now - registeredAt) / 86400);
    
    const totalActions = Number(agent.totalActions);
    const successfulActions = Number(agent.successfulActions);
    const successRate = totalActions > 0 
      ? (successfulActions / totalActions) * 100 
      : 0;

    // Calculate breakdown
    const winRateScore = Math.floor((successRate * 40) / 100);
    const totalVolume = Number(agent.totalVolume);
    const volumeScore = totalVolume > 0 
      ? Math.min(Math.floor(Math.log10(totalVolume) * 3), 30) 
      : 0;
    const ageScore = Math.min(Math.floor(ageDays / 9), 20);
    const consistencyScore = Math.min(Math.floor(totalActions / 10), 10);

    return {
      score: agent.reputationScore,
      totalActions,
      successfulActions,
      successRate,
      totalVolume,
      ageDays,
      isActive: agent.isActive,
      breakdown: {
        winRateScore,
        volumeScore,
        ageScore,
        consistencyScore,
      },
    };
  }

  async checkTrust(
    owner: PublicKey,
    minScore: number = 60,
    minActions: number = 10,
    maxInactiveDays: number = 30
  ): Promise<TrustCheckResult> {
    const reputation = await this.getReputation(owner);

    if (!reputation) {
      return {
        trusted: false,
        score: 0,
        reason: "Agent not found or not registered",
        details: {
          meetsMinScore: false,
          meetsMinActions: false,
          isActive: false,
          recentActivity: false,
        },
      };
    }

    const meetsMinScore = reputation.score >= minScore;
    const meetsMinActions = reputation.totalActions >= minActions;
    const isActive = reputation.isActive;
    
    // Check if agent was active recently
    const agent = await this.getAgentAccount(owner);
    const lastActionAt = agent ? Number(agent.lastActionAt) : 0;
    const daysSinceAction = Math.floor((Date.now() / 1000 - lastActionAt) / 86400);
    const recentActivity = daysSinceAction <= maxInactiveDays;

    const trusted = meetsMinScore && meetsMinActions && isActive && recentActivity;

    let reason: string;
    if (trusted) {
      reason = "Agent meets all trust criteria";
    } else if (!isActive) {
      reason = "Agent is deactivated";
    } else if (!meetsMinScore) {
      reason = `Score ${reputation.score} is below minimum ${minScore}`;
    } else if (!meetsMinActions) {
      reason = `Only ${reputation.totalActions} actions, need ${minActions}`;
    } else if (!recentActivity) {
      reason = `No activity in ${daysSinceAction} days`;
    } else {
      reason = "Unknown trust failure";
    }

    return {
      trusted,
      score: reputation.score,
      reason,
      details: {
        meetsMinScore,
        meetsMinActions,
        isActive,
        recentActivity,
      },
    };
  }

  // ============ Leaderboard ============

  async getLeaderboard(limit: number = 20): Promise<LeaderboardEntry[]> {
    console.log(`📊 Fetching top ${limit} agents...`);

    // In production, use getProgramAccounts with filters and sorting
    // const accounts = await this.connection.getProgramAccounts(
    //   this.config.programId,
    //   {
    //     filters: [
    //       { dataSize: AGENT_ACCOUNT_SIZE },
    //       { memcmp: { offset: IS_ACTIVE_OFFSET, bytes: "01" } }
    //     ]
    //   }
    // );

    // Simulated leaderboard for development
    return [];
  }

  // ============ Action History ============

  async getActionHistory(
    owner: PublicKey,
    limit: number = 50,
    offset: number = 0
  ): Promise<ActionHistoryEntry[]> {
    const agent = await this.getAgentAccount(owner);
    if (!agent) {
      return [];
    }

    const [agentPDA] = this.getAgentPDA(owner);
    const totalActions = Number(agent.totalActions);
    const history: ActionHistoryEntry[] = [];

    const start = Math.max(0, totalActions - offset - limit);
    const end = Math.max(0, totalActions - offset);

    for (let i = end - 1; i >= start; i--) {
      const action = await this.getActionAccount(agentPDA, i);
      if (action) {
        history.push({
          actionIndex: i,
          actionType: Object.keys(action.actionType)[0],
          protocol: action.protocol,
          inputValue: Number(action.inputValue),
          outputValue: Number(action.outputValue),
          pnl: Number(action.pnl),
          outcome: Object.keys(action.outcome)[0],
          timestamp: new Date(Number(action.timestamp) * 1000),
          metadata: action.metadata,
        });
      }
    }

    return history;
  }

  // ============ Utility Methods ============

  async getMyAgent(): Promise<AgentAccount | null> {
    return this.getAgentAccount(this.wallet.publicKey);
  }

  async getMyReputation(): Promise<ReputationResult | null> {
    return this.getReputation(this.wallet.publicKey);
  }

  async amITrusted(minScore: number = 60): Promise<boolean> {
    const result = await this.checkTrust(this.wallet.publicKey, minScore);
    return result.trusted;
  }

  getWalletPublicKey(): PublicKey {
    return this.wallet.publicKey;
  }

  getProgramId(): PublicKey {
    return this.config.programId;
  }
}

export default AgentRepClient;
