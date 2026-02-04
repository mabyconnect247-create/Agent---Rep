import type { EvalAccount, EvalRules, PaperTrade, EvalTier, TradeMode, Side } from '../../../lib/eval';
import { applyCloseTrade } from '../../../lib/eval';

// Hackathon MVP in-memory store.
// NOTE: This will reset on redeploy / cold start. For production, move to Redis/Postgres.

export interface EvalRecord {
  apiKey: string;
  account: EvalAccount;
  trades: PaperTrade[];
}

const store: Map<string, EvalRecord> = (globalThis as any).__AGENTREP_EVAL_STORE__ ?? new Map();
(globalThis as any).__AGENTREP_EVAL_STORE__ = store;

export function randomKey(prefix = 'ar') {
  return `${prefix}_${Math.random().toString(36).slice(2)}_${Math.random().toString(36).slice(2)}`;
}

export function authApiKey(req: Request): string | null {
  const h = req.headers.get('authorization') || req.headers.get('Authorization');
  if (!h) return null;
  const m = h.match(/Bearer\s+(.+)/i);
  return m?.[1]?.trim() || null;
}

export function getRecord(apiKey: string): EvalRecord | null {
  return store.get(apiKey) ?? null;
}

export function putRecord(rec: EvalRecord) {
  store.set(rec.apiKey, rec);
}

export function rotateKey(oldKey: string): EvalRecord | null {
  const rec = store.get(oldKey);
  if (!rec) return null;
  store.delete(oldKey);
  const apiKey = randomKey('ar');
  const next = { ...rec, apiKey };
  store.set(apiKey, next);
  return next;
}

export function createEvalAccount(params: {
  agentName: string;
  tier: EvalTier;
  startingBalanceUsd: number;
  rules: EvalRules;
}): EvalRecord {
  const now = new Date();
  const dayKey = now.toISOString().slice(0, 10);
  const account: EvalAccount = {
    id: `acc_${Math.random().toString(36).slice(2, 10)}`,
    agentName: params.agentName,
    tier: params.tier,
    startingBalanceUsd: params.startingBalanceUsd,
    balanceUsd: params.startingBalanceUsd,
    equityUsd: params.startingBalanceUsd,
    createdAt: now.toISOString(),
    lastEquityResetDay: dayKey,
    dayStartEquityUsd: params.startingBalanceUsd,
    rules: params.rules,
    status: 'ACTIVE',
  };

  const apiKey = randomKey('ar');
  const rec: EvalRecord = { apiKey, account, trades: [] };
  store.set(apiKey, rec);
  return rec;
}

export function openTrade(rec: EvalRecord, trade: Omit<PaperTrade, 'id' | 'accountId' | 'entryTime' | 'status'>): EvalRecord {
  if (rec.account.status !== 'ACTIVE') return rec;

  const now = new Date();
  const t: PaperTrade = {
    id: `t_${Math.random().toString(36).slice(2, 10)}`,
    accountId: rec.account.id,
    entryTime: now.toISOString(),
    status: 'OPEN',
    ...trade,
  };

  return { ...rec, trades: [t, ...rec.trades] };
}

export function closeTrade(rec: EvalRecord, tradeId: string, exitPriceUsd: number): EvalRecord {
  const trade = rec.trades.find((t) => t.id === tradeId);
  if (!trade || trade.status !== 'OPEN') return rec;

  const { updatedAccount, updatedTrade } = applyCloseTrade(rec.account, trade, exitPriceUsd);

  // Pass condition: >= minTradesToPass closed and not failed
  const closedCount = rec.trades.filter((t) => t.status === 'CLOSED').length + 1;
  const account =
    updatedAccount.status !== 'FAILED' && closedCount >= updatedAccount.rules.minTradesToPass
      ? { ...updatedAccount, status: 'PASSED' as const }
      : updatedAccount;

  const trades = rec.trades.map((t) => (t.id === tradeId ? updatedTrade : t));
  return { ...rec, account, trades };
}
