export type EvalTier = 'Bronze' | 'Silver' | 'Gold' | 'Diamond';

export type TradeMode = 'SPOT' | 'FUTURES';
export type Side = 'LONG' | 'SHORT';

export interface EvalRules {
  maxDailyDrawdownPct: number; // e.g. 2
  maxTotalDrawdownPct: number; // e.g. 5
  minTradesToPass: number; // e.g. 10
}

export interface EvalAccount {
  id: string;
  publicId?: string; // public profile id (safe to share)
  agentName: string;
  tier: EvalTier;
  startingBalanceUsd: number;
  balanceUsd: number;
  equityUsd: number;
  createdAt: string;
  lastEquityResetDay: string; // YYYY-MM-DD
  dayStartEquityUsd: number;
  rules: EvalRules;
  status: 'ACTIVE' | 'FAILED' | 'PASSED';
  contact?: {
    telegram?: string;
    x?: string;
    website?: string;
  };
}

export interface PaperTrade {
  id: string;
  accountId: string;
  mint: string;
  mode: TradeMode; // SPOT default, FUTURES optional
  side: Side; // LONG/SHORT (for spot we treat LONG as BUY)
  leverage?: number; // futures only
  sizePct: number; // % of equity allocated to this trade (virtual)
  entryTime: string;
  entryPriceUsd: number;
  tpPct?: number;
  slPct?: number;
  closeTime?: string;
  closePriceUsd?: number;
  pnlPct?: number;
  pnlUsd?: number;
  status: 'OPEN' | 'CLOSED';
}

const LS_KEY = 'agentRep_eval_v1';

export interface EvalState {
  account: EvalAccount | null;
  trades: PaperTrade[];
}

export function todayKey(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function loadState(): EvalState {
  if (typeof window === 'undefined') return { account: null, trades: [] };
  const raw = window.localStorage.getItem(LS_KEY);
  if (!raw) return { account: null, trades: [] };
  try {
    const parsed = JSON.parse(raw);
    return {
      account: parsed.account ?? null,
      trades: Array.isArray(parsed.trades) ? parsed.trades : [],
    };
  } catch {
    return { account: null, trades: [] };
  }
}

export function saveState(state: EvalState) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(LS_KEY, JSON.stringify(state));
}

export function resetAccount(agentName: string, tier: EvalTier, startingBalanceUsd: number, rules: EvalRules): EvalAccount {
  const now = new Date();
  const day = todayKey(now);
  return {
    id: `acc_${Math.random().toString(36).slice(2, 10)}`,
    agentName,
    tier,
    startingBalanceUsd,
    balanceUsd: startingBalanceUsd,
    equityUsd: startingBalanceUsd,
    createdAt: now.toISOString(),
    lastEquityResetDay: day,
    dayStartEquityUsd: startingBalanceUsd,
    rules,
    status: 'ACTIVE',
  };
}

export function computePnlPct(side: Side, entry: number, exit: number, leverage = 1) {
  if (entry <= 0 || exit <= 0) return 0;
  const raw = (exit - entry) / entry;
  const base = side === 'LONG' ? raw * 100 : (-raw) * 100;
  return base * Math.max(1, leverage);
}

export function applyCloseTrade(account: EvalAccount, trade: PaperTrade, exitPriceUsd: number) {
  const pnlPct = computePnlPct(trade.side, trade.entryPriceUsd, exitPriceUsd, trade.leverage ?? 1);
  const positionNotional = account.equityUsd * (trade.sizePct / 100);
  const pnlUsd = positionNotional * (pnlPct / 100);

  const newEquity = account.equityUsd + pnlUsd;

  const now = new Date();
  const day = todayKey(now);
  let dayStartEquityUsd = account.dayStartEquityUsd;

  // New day reset
  if (account.lastEquityResetDay !== day) {
    dayStartEquityUsd = account.equityUsd;
  }

  const dailyDD = ((dayStartEquityUsd - newEquity) / dayStartEquityUsd) * 100;
  const totalDD = ((account.startingBalanceUsd - newEquity) / account.startingBalanceUsd) * 100;

  let status: EvalAccount['status'] = account.status;
  if (dailyDD >= account.rules.maxDailyDrawdownPct || totalDD >= account.rules.maxTotalDrawdownPct) {
    status = 'FAILED';
  }

  // Pass condition: min trades closed and not failed
  // (simple MVP rule; can add winrate constraint later)
  // Caller should handle after updating trades list.

  return {
    updatedAccount: {
      ...account,
      equityUsd: newEquity,
      balanceUsd: newEquity,
      lastEquityResetDay: day,
      dayStartEquityUsd,
      status,
    },
    updatedTrade: {
      ...trade,
      closeTime: now.toISOString(),
      closePriceUsd: exitPriceUsd,
      pnlPct,
      pnlUsd,
      status: 'CLOSED' as const,
    },
  };
}
