import { PublicKey } from "@solana/web3.js";

// ============ Enums ============

export enum AgentType {
  Trading = { trading: {} },
  DeFi = { deFi: {} },
  NFT = { nft: {} },
  Social = { social: {} },
  Infrastructure = { infrastructure: {} },
  Other = { other: {} },
}

export enum ActionType {
  Trade = { trade: {} },
  Swap = { swap: {} },
  Stake = { stake: {} },
  Unstake = { unstake: {} },
  Lend = { lend: {} },
  Borrow = { borrow: {} },
  Mint = { mint: {} },
  Burn = { burn: {} },
  Transfer = { transfer: {} },
  Vote = { vote: {} },
  Other = { other: {} },
}

export enum ActionOutcome {
  Success = { success: {} },
  Failure = { failure: {} },
  Profit = { profit: {} },
  Loss = { loss: {} },
  Neutral = { neutral: {} },
}

// ============ Account Types ============

export interface AgentAccount {
  owner: PublicKey;
  name: string;
  description: string;
  agentType: AgentType;
  stake: bigint;
  reputationScore: number;
  totalActions: bigint;
  successfulActions: bigint;
  totalVolume: bigint;
  registeredAt: bigint;
  lastActionAt: bigint;
  isActive: boolean;
  bump: number;
}

export interface ActionAccount {
  agent: PublicKey;
  actionType: ActionType;
  protocol: string;
  inputValue: bigint;
  outputValue: bigint;
  pnl: bigint;
  outcome: ActionOutcome;
  metadata: string;
  timestamp: bigint;
  actionIndex: bigint;
  bump: number;
}

// ============ SDK Types ============

export interface RegisterParams {
  name: string;
  description: string;
  agentType: keyof typeof AgentType;
  stakeAmount: number; // in SOL
}

export interface LogActionParams {
  actionType: keyof typeof ActionType;
  protocol: string;
  inputValue: number; // in lamports or smallest unit
  outputValue: number;
  outcome: keyof typeof ActionOutcome;
  metadata?: string;
}

export interface ReputationResult {
  score: number;
  totalActions: number;
  successfulActions: number;
  successRate: number;
  totalVolume: number;
  ageDays: number;
  isActive: boolean;
  breakdown: {
    winRateScore: number;
    volumeScore: number;
    ageScore: number;
    consistencyScore: number;
  };
}

export interface TrustCheckResult {
  trusted: boolean;
  score: number;
  reason: string;
  details: {
    meetsMinScore: boolean;
    meetsMinActions: boolean;
    isActive: boolean;
    recentActivity: boolean;
  };
}

export interface LeaderboardEntry {
  rank: number;
  agent: PublicKey;
  owner: PublicKey;
  name: string;
  score: number;
  totalActions: number;
  successRate: number;
  agentType: string;
}

export interface ActionHistoryEntry {
  actionIndex: number;
  actionType: string;
  protocol: string;
  inputValue: number;
  outputValue: number;
  pnl: number;
  outcome: string;
  timestamp: Date;
  metadata: string;
}

// ============ Event Types ============

export interface AgentRegisteredEvent {
  agent: PublicKey;
  owner: PublicKey;
  name: string;
  stake: bigint;
  timestamp: bigint;
}

export interface ActionLoggedEvent {
  agent: PublicKey;
  action: PublicKey;
  actionType: ActionType;
  outcome: ActionOutcome;
  pnl: bigint;
  newScore: number;
  timestamp: bigint;
}

export interface ReputationQueriedEvent {
  agent: PublicKey;
  querier: PublicKey;
  score: number;
  totalActions: bigint;
  successRate: bigint;
  timestamp: bigint;
}

// ============ Config Types ============

export interface AgentRepConfig {
  programId: PublicKey;
  cluster: "mainnet-beta" | "devnet" | "localnet";
  commitment: "processed" | "confirmed" | "finalized";
}

export const DEFAULT_CONFIG: AgentRepConfig = {
  programId: new PublicKey("AgntRep1111111111111111111111111111111111111"),
  cluster: "devnet",
  commitment: "confirmed",
};
