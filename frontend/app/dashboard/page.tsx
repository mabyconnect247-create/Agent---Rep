'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import type { EvalAccount, PaperTrade, TradeMode, Side } from '../../lib/eval';

const tierColors: Record<string, string> = {
  Bronze: '#cd7f32',
  Silver: '#c0c0c0',
  Gold: '#ffd700',
  Diamond: '#b9f2ff',
};

function maskKey(k: string) {
  if (!k) return '';
  if (k.length <= 14) return k;
  return `${k.slice(0, 6)}…${k.slice(-6)}`;
}

async function apiGET(path: string, apiKey: string) {
  const r = await fetch(path, { headers: { Authorization: `Bearer ${apiKey}` }, cache: 'no-store' });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(j?.error || `HTTP ${r.status}`);
  return j;
}

async function apiPOST(path: string, apiKey: string, body?: any) {
  const r = await fetch(path, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : '{}',
  });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(j?.error || `HTTP ${r.status}`);
  return j;
}

export default function DashboardPage() {
  const [hydrated, setHydrated] = useState(false);
  const [apiKey, setApiKey] = useState<string>('');
  const [account, setAccount] = useState<EvalAccount | null>(null);
  const [trades, setTrades] = useState<PaperTrade[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  // Minimal “agent can trade automatically” endpoints preview
  const endpoints = useMemo(
    () =>
      apiKey
        ? {
            open: `${location.origin}/api/eval/trades/open`,
            close: `${location.origin}/api/eval/trades/close`,
            account: `${location.origin}/api/eval/account`,
            trades: `${location.origin}/api/eval/trades`,
          }
        : null,
    [apiKey]
  );

  useEffect(() => {
    setHydrated(true);
    const k = localStorage.getItem('agentRep_apiKey') || '';
    setApiKey(k);
  }, []);

  async function refreshAll(k: string) {
    const [a, t] = await Promise.all([apiGET('/api/eval/account', k), apiGET('/api/eval/trades', k)]);
    setAccount(a.account);
    setTrades(t.trades);
  }

  useEffect(() => {
    if (!hydrated) return;
    if (!apiKey) return;
    refreshAll(apiKey).catch((e) => setError(e.message));
  }, [hydrated, apiKey]);

  const openTrades = useMemo(() => trades.filter((t) => t.status === 'OPEN'), [trades]);
  const closedTrades = useMemo(() => trades.filter((t) => t.status === 'CLOSED'), [trades]);

  const totalPnlUsd = useMemo(() => closedTrades.reduce((acc, t) => acc + (t.pnlUsd ?? 0), 0), [closedTrades]);
  const winRate = useMemo(() => {
    if (closedTrades.length === 0) return 0;
    const wins = closedTrades.filter((t) => (t.pnlUsd ?? 0) > 0).length;
    return Math.round((wins / closedTrades.length) * 100);
  }, [closedTrades]);

  const dailyDD = useMemo(() => {
    if (!account) return 0;
    return Math.max(0, ((account.dayStartEquityUsd - account.equityUsd) / account.dayStartEquityUsd) * 100);
  }, [account]);

  const totalDD = useMemo(() => {
    if (!account) return 0;
    return Math.max(0, ((account.startingBalanceUsd - account.equityUsd) / account.startingBalanceUsd) * 100);
  }, [account]);

  async function rotate() {
    if (!apiKey) return;
    try {
      setBusy('rotate');
      setError(null);
      const j = await apiPOST('/api/eval/rotate', apiKey);
      localStorage.setItem('agentRep_apiKey', j.apiKey);
      setApiKey(j.apiKey);
      await refreshAll(j.apiKey);
    } catch (e: any) {
      setError(e?.message ?? 'rotate failed');
    } finally {
      setBusy(null);
    }
  }

  async function copy(text: string) {
    try {
      await navigator.clipboard.writeText(text);
    } catch {}
  }

  async function autoCloseTP_SL() {
    if (!apiKey) return;
    if (openTrades.length === 0) return;

    // Calls close endpoint for each open trade (server will fetch live price and settle).
    // Hackathon MVP: user triggers this manually.
    try {
      setBusy('autocheck');
      setError(null);
      for (const t of openTrades) {
        // We don't have live pnl in the client now; just let agent do it.
        // For demo: close all open trades.
        await apiPOST('/api/eval/trades/close', apiKey, { tradeId: t.id });
      }
      await refreshAll(apiKey);
    } catch (e: any) {
      setError(e?.message ?? 'auto-close failed');
    } finally {
      setBusy(null);
    }
  }

  if (!hydrated) {
    return (
      <div className="min-h-screen bg-animated flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-[#9945FF] border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!apiKey) {
    return (
      <div className="min-h-screen bg-animated flex items-center justify-center px-4">
        <div className="glass-card rounded-2xl p-8 text-center max-w-md">
          <div className="text-6xl mb-4">🔑</div>
          <h2 className="text-2xl font-bold mb-3">No API Key Found</h2>
          <p className="text-gray-400 mb-6">
            Buy an evaluation account to get your per-account API key.
          </p>
          <Link href="/register" className="btn-primary inline-block">Buy Evaluation Account</Link>
        </div>
      </div>
    );
  }

  const tierColor = account ? (tierColors[account.tier] ?? '#9945FF') : '#9945FF';

  return (
    <main className="min-h-screen bg-animated pt-20 px-4 pb-12">
      <div className="max-w-6xl mx-auto">
        {/* Top */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6"
        >
          <div>
            <div className="text-xs uppercase tracking-widest text-gray-500">Evaluation</div>
            <h1 className="text-4xl font-black leading-tight">
              <span className="gradient-text">Account</span> Dashboard
            </h1>
            {account && (
              <div className="text-gray-400 mt-2">
                Agent: <span className="text-white font-semibold">{account.agentName}</span>
                <span className="text-gray-600"> • </span>
                Tier: <span style={{ color: tierColor }} className="font-semibold">{account.tier}</span>
                <span className="text-gray-600"> • </span>
                Status:{' '}
                <span
                  className={`font-semibold ${
                    account.status === 'ACTIVE'
                      ? 'text-blue-300'
                      : account.status === 'PASSED'
                        ? 'text-green-400'
                        : 'text-red-400'
                  }`}
                >
                  {account.status}
                </span>
              </div>
            )}
          </div>

          <div className="glass-card rounded-2xl p-4 md:p-5">
            <div className="text-xs text-gray-500 uppercase tracking-widest">Rules</div>
            <div className="text-sm text-gray-200 mt-1">
              Daily DD ≤ <b>2%</b> • Total DD ≤ <b>5%</b> • Pass after <b>10</b> closed trades
            </div>
          </div>
        </motion.div>

        {error && (
          <div className="glass-card rounded-xl p-4 mb-6 border border-red-500/30">
            <div className="text-red-300 text-sm">{error}</div>
          </div>
        )}

        {/* Key panel */}
        <div className="glass-card rounded-2xl p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="text-xs text-gray-500 uppercase tracking-widest">Agent API Key (per evaluation account)</div>
              <div className="mt-2 font-mono text-sm text-gray-200 break-all">{apiKey}</div>
              <div className="text-xs text-gray-500 mt-2">
                Use this key to submit trades automatically. If this account fails, the key becomes useless.
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <button onClick={() => copy(apiKey)} className="btn-primary !py-2 !px-4">Copy Key</button>
              <button onClick={rotate} className="btn-secondary !py-2 !px-4">
                {busy === 'rotate' ? 'Rotating…' : 'Rotate Key'}
              </button>
            </div>
          </div>

          {endpoints && (
            <div className="mt-5 grid md:grid-cols-2 gap-3 text-xs">
              <div className="glass rounded-xl p-3">
                <div className="text-gray-500">POST</div>
                <div className="font-mono text-gray-200">{endpoints.open}</div>
                <div className="text-gray-500 mt-1">Open trade (SPOT default, FUTURES optional)</div>
              </div>
              <div className="glass rounded-xl p-3">
                <div className="text-gray-500">POST</div>
                <div className="font-mono text-gray-200">{endpoints.close}</div>
                <div className="text-gray-500 mt-1">Close trade by tradeId</div>
              </div>
            </div>
          )}
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="glass-card rounded-2xl p-5">
            <div className="text-xs text-gray-500 uppercase tracking-widest">Equity</div>
            <div className="text-3xl font-black text-[#14F195] mt-2">${account?.equityUsd?.toFixed(2) ?? '—'}</div>
            <div className="text-xs text-gray-500 mt-2">Start: ${account?.startingBalanceUsd?.toFixed(2) ?? '—'}</div>
          </div>
          <div className="glass-card rounded-2xl p-5">
            <div className="text-xs text-gray-500 uppercase tracking-widest">Total P&L</div>
            <div className={`text-3xl font-black mt-2 ${totalPnlUsd >= 0 ? 'text-[#14F195]' : 'text-red-400'}`}>
              {totalPnlUsd >= 0 ? '+' : ''}${totalPnlUsd.toFixed(2)}
            </div>
            <div className="text-xs text-gray-500 mt-2">Closed trades: {closedTrades.length}</div>
          </div>
          <div className="glass-card rounded-2xl p-5">
            <div className="text-xs text-gray-500 uppercase tracking-widest">Win Rate</div>
            <div className="text-3xl font-black mt-2">{winRate}%</div>
            <div className="text-xs text-gray-500 mt-2">Open: {openTrades.length}</div>
          </div>
          <div className="glass-card rounded-2xl p-5">
            <div className="text-xs text-gray-500 uppercase tracking-widest">Drawdown</div>
            <div className="text-sm font-semibold mt-2">
              Daily: <span className={dailyDD >= 2 ? 'text-red-400' : 'text-yellow-300'}>{dailyDD.toFixed(2)}%</span>
            </div>
            <div className="text-sm font-semibold">
              Total: <span className={totalDD >= 5 ? 'text-red-400' : 'text-yellow-300'}>{totalDD.toFixed(2)}%</span>
            </div>
          </div>
        </div>

        {/* Actions (minimal for demo) */}
        <div className="flex flex-wrap gap-3 mb-6">
          <button onClick={() => apiKey && refreshAll(apiKey)} className="btn-secondary !py-2 !px-4">Refresh</button>
          <button onClick={autoCloseTP_SL} className="btn-secondary !py-2 !px-4" disabled={busy === 'autocheck'}>
            {busy === 'autocheck' ? 'Closing…' : 'Settle Open Trades (demo)'}
          </button>
          <Link href="/register" className="btn-primary !py-2 !px-4">Buy New Account</Link>
        </div>

        {/* Trades table */}
        <div className="glass-card rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold">Trade History</h3>
            <div className="text-xs text-gray-500">Agent submits trades via API • prices from DexScreener</div>
          </div>

          {trades.length === 0 ? (
            <div className="text-gray-400 text-sm">No trades yet. Once your agent starts submitting, they’ll appear here.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-gray-400 text-xs border-b border-white/10">
                    <th className="py-3">Status</th>
                    <th className="py-3">Mode</th>
                    <th className="py-3">Action</th>
                    <th className="py-3">Token</th>
                    <th className="py-3">Entry</th>
                    <th className="py-3">Exit</th>
                    <th className="py-3">PnL %</th>
                    <th className="py-3">PnL $</th>
                  </tr>
                </thead>
                <tbody>
                  {trades.map((t) => (
                    <tr key={t.id} className="border-b border-white/5 text-sm">
                      <td className="py-3">
                        <span className={`px-2 py-0.5 rounded text-xs font-bold ${t.status === 'OPEN' ? 'bg-blue-500/20 text-blue-300' : 'bg-white/10 text-gray-200'}`}>
                          {t.status}
                        </span>
                      </td>
                      <td className="py-3 text-gray-300">{(t as any).mode ?? 'SPOT'}</td>
                      <td className="py-3">
                        <span className={`px-2 py-0.5 rounded text-xs font-bold ${t.side === 'LONG' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                          {(t as any).mode === 'SPOT' ? 'BUY' : t.side}
                        </span>
                      </td>
                      <td className="py-3 text-gray-300">{t.mint.slice(0, 4)}…{t.mint.slice(-4)}</td>
                      <td className="py-3 text-gray-400">${t.entryPriceUsd.toFixed(6)}</td>
                      <td className="py-3 text-gray-400">{t.closePriceUsd ? `$${t.closePriceUsd.toFixed(6)}` : '—'}</td>
                      <td className={`py-3 font-semibold ${(t.pnlPct ?? 0) >= 0 ? 'text-[#14F195]' : 'text-red-400'}`}>
                        {t.pnlPct === undefined ? '—' : `${t.pnlPct.toFixed(2)}%`}
                      </td>
                      <td className={`py-3 font-semibold ${(t.pnlUsd ?? 0) >= 0 ? 'text-[#14F195]' : 'text-red-400'}`}>
                        {t.pnlUsd === undefined ? '—' : `${(t.pnlUsd ?? 0) >= 0 ? '+' : ''}$${(t.pnlUsd ?? 0).toFixed(2)}`}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="text-center mt-10">
          <Link href="/" className="text-gray-400 hover:text-white transition">← Back to Home</Link>
        </div>
      </div>
    </main>
  );
}
