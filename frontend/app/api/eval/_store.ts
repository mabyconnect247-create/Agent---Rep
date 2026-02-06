import type { EvalAccount, EvalRules, PaperTrade, EvalTier } from '../../../lib/eval';
import { applyCloseTrade } from '../../../lib/eval';
import { kvDel, kvGetJSON, kvSAdd, kvSMembers, kvSetJSON, kvEnabled } from '../_kv';

// Hackathon MVP store.
// - Local dev: in-memory.
// - Vercel: persists to Vercel KV when configured (fixes cold start resets).

export interface EvalRecord {
  apiKey: string;
  account: EvalAccount;
  trades: PaperTrade[];
}

const memStore: Map<string, EvalRecord> = (globalThis as any).__AGENTREP_EVAL_STORE__ ?? new Map();
const memPublicIndex: Map<string, string> = (globalThis as any).__AGENTREP_PUBLIC_INDEX__ ?? new Map();
(globalThis as any).__AGENTREP_EVAL_STORE__ = memStore;
(globalThis as any).__AGENTREP_PUBLIC_INDEX__ = memPublicIndex;

const KV_PREFIX = 'agentrep';
const kvKeyByApiKey = (apiKey: string) => `${KV_PREFIX}:eval:byApiKey:${apiKey}`;
const kvKeyApiKeyByPublicId = (publicId: string) => `${KV_PREFIX}:eval:apiKeyByPublicId:${publicId}`;
const kvSetPublicIds = () => `${KV_PREFIX}:eval:publicIds`;

export function randomKey(prefix = 'ar') {
  return `${prefix}_${Math.random().toString(36).slice(2)}_${Math.random().toString(36).slice(2)}`;
}

export function authApiKey(req: Request): string | null {
  const h = req.headers.get('authorization') || req.headers.get('Authorization');
  if (!h) return null;
  const m = h.match(/Bearer\s+(.+)/i);
  return m?.[1]?.trim() || null;
}

async function kvGetRecord(apiKey: string): Promise<EvalRecord | null> {
  return await kvGetJSON<EvalRecord>(kvKeyByApiKey(apiKey));
}

async function kvPutRecord(rec: EvalRecord): Promise<void> {
  await kvSetJSON(kvKeyByApiKey(rec.apiKey), rec);
  if (rec.account.publicId) {
    await kvSetJSON(kvKeyApiKeyByPublicId(rec.account.publicId), rec.apiKey);
    await kvSAdd(kvSetPublicIds(), rec.account.publicId);
  }
}

async function kvDeleteRecord(apiKey: string): Promise<void> {
  await kvDel(kvKeyByApiKey(apiKey));
}

export async function getRecord(apiKey: string): Promise<EvalRecord | null> {
  if (kvEnabled()) {
    const rec = await kvGetRecord(apiKey);
    if (rec) return rec;
    // If KV is enabled but record missing, do not fall back to memory (prevents stale keys).
    return null;
  }
  return memStore.get(apiKey) ?? null;
}

export async function putRecord(rec: EvalRecord) {
  if (kvEnabled()) return kvPutRecord(rec);
  memStore.set(rec.apiKey, rec);
  if (rec.account.publicId) memPublicIndex.set(rec.account.publicId, rec.apiKey);
}

export async function rotateKey(oldKey: string): Promise<EvalRecord | null> {
  const rec = await getRecord(oldKey);
  if (!rec) return null;

  const apiKey = randomKey('ar');
  const next: EvalRecord = { ...rec, apiKey };

  if (kvEnabled()) {
    await kvDeleteRecord(oldKey);
    await kvPutRecord(next);
    return next;
  }

  memStore.delete(oldKey);
  memStore.set(apiKey, next);
  if (next.account.publicId) memPublicIndex.set(next.account.publicId, apiKey);
  return next;
}

export async function createEvalAccount(params: {
  agentName: string;
  tier: EvalTier;
  startingBalanceUsd: number;
  rules: EvalRules;
  contact?: EvalAccount['contact'];
}): Promise<EvalRecord> {
  const now = new Date();
  const dayKey = now.toISOString().slice(0, 10);
  const publicId = `ag_${Math.random().toString(36).slice(2, 10)}`;
  const account: EvalAccount = {
    id: `acc_${Math.random().toString(36).slice(2, 10)}`,
    publicId,
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
    contact: params.contact,
  };

  const apiKey = randomKey('ar');
  const rec: EvalRecord = { apiKey, account, trades: [] };

  if (kvEnabled()) {
    await kvPutRecord(rec);
    return rec;
  }

  memStore.set(apiKey, rec);
  memPublicIndex.set(publicId, apiKey);
  return rec;
}

export async function listPublicAgents() {
  // Return a compact list safe for public display
  if (kvEnabled()) {
    const ids = await kvSMembers(kvSetPublicIds());
    const recs: EvalRecord[] = [];
    for (const publicId of ids.slice(-250)) {
      const apiKey = await kvGetJSON<string>(kvKeyApiKeyByPublicId(publicId));
      if (!apiKey) continue;
      const rec = await kvGetRecord(apiKey);
      if (rec) recs.push(rec);
    }

    return recs.map((r) => ({
      publicId: r.account.publicId,
      agentName: r.account.agentName,
      tier: r.account.tier,
      status: r.account.status,
      equityUsd: r.account.equityUsd,
      startingBalanceUsd: r.account.startingBalanceUsd,
      createdAt: r.account.createdAt,
      closedTrades: r.trades.filter((t) => t.status === 'CLOSED').length,
      openTrades: r.trades.filter((t) => t.status === 'OPEN').length,
    }));
  }

  return Array.from(memStore.values()).map((r) => ({
    publicId: r.account.publicId,
    agentName: r.account.agentName,
    tier: r.account.tier,
    status: r.account.status,
    equityUsd: r.account.equityUsd,
    startingBalanceUsd: r.account.startingBalanceUsd,
    createdAt: r.account.createdAt,
    closedTrades: r.trades.filter((t) => t.status === 'CLOSED').length,
    openTrades: r.trades.filter((t) => t.status === 'OPEN').length,
  }));
}

export async function getPublicAgent(publicId: string): Promise<EvalRecord | null> {
  if (kvEnabled()) {
    const apiKey = await kvGetJSON<string>(kvKeyApiKeyByPublicId(publicId));
    if (!apiKey) return null;
    return (await kvGetRecord(apiKey)) ?? null;
  }
  const apiKey = memPublicIndex.get(publicId);
  if (!apiKey) return null;
  return memStore.get(apiKey) ?? null;
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
