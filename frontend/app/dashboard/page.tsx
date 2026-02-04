'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  applyCloseTrade,
  computePnlPct,
  loadState,
  saveState,
  todayKey,
  type PaperTrade,
  type Side,
} from '../../lib/eval';

const tierColors: Record<string, string> = {
  Bronze: '#cd7f32',
  Silver: '#c0c0c0',
  Gold: '#ffd700',
  Diamond: '#b9f2ff',
};

async function fetchPriceUsd(mint: string) {
  const r = await fetch(`/api/price?mint=${encodeURIComponent(mint)}`, { cache: 'no-store' });
  if (!r.ok) throw new Error(`price fetch failed (${r.status})`);
  const j = await r.json();
  if (!j?.priceUsd) throw new Error('no price');
  return Number(j.priceUsd);
}

export default function DashboardPage() {
  const [hydrated, setHydrated] = useState(false);
  const [account, setAccount] = useState(() => loadState().account);
  const [trades, setTrades] = useState<PaperTrade[]>(() => loadState().trades);

  // New trade form
  const [mint, setMint] = useState('');
  const [side, setSide] = useState<Side>('LONG');
  const [sizePct, setSizePct] = useState(10);
  const [tpPct, setTpPct] = useState<number>(20);
  const [slPct, setSlPct] = useState<number>(10);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setHydrated(true);
  }, []);

  // Keep localStorage in sync
  useEffect(() => {
    if (!hydrated) return;
    saveState({ account, trades });
  }, [account, trades, hydrated]);

  const openTrades = useMemo(() => trades.filter((t) => t.status === 'OPEN'), [trades]);
  const closedTrades = useMemo(() => trades.filter((t) => t.status === 'CLOSED'), [trades]);

  const winRate = useMemo(() => {
    if (closedTrades.length === 0) return 0;
    const wins = closedTrades.filter((t) => (t.pnlUsd ?? 0) > 0).length;
    return Math.round((wins / closedTrades.length) * 100);
  }, [closedTrades]);

  const totalPnl = useMemo(() => {
    return Math.round(closedTrades.reduce((acc, t) => acc + (t.pnlUsd ?? 0), 0));
  }, [closedTrades]);

  const dailyDrawdownPct = useMemo(() => {
    if (!account) return 0;
    const dd = ((account.dayStartEquityUsd - account.equityUsd) / account.dayStartEquityUsd) * 100;
    return Math.max(0, dd);
  }, [account]);

  const totalDrawdownPct = useMemo(() => {
    if (!account) return 0;
    const dd = ((account.startingBalanceUsd - account.equityUsd) / account.startingBalanceUsd) * 100;
    return Math.max(0, dd);
  }, [account]);

  async function openTrade() {
    if (!account) return;
    setError(null);
    if (!mint.trim()) return setError('Paste token CA (mint)');
    if (sizePct <= 0 || sizePct > 100) return setError('Size % must be 1-100');
    if (tpPct < 0 || slPct < 0) return setError('TP/SL must be >= 0');

    try {
      setBusy('open');
      const entry = await fetchPriceUsd(mint.trim());
      const now = new Date();
      const t: PaperTrade = {
        id: `t_${Math.random().toString(36).slice(2, 10)}`,
        accountId: account.id,
        mint: mint.trim(),
        side,
        sizePct,
        tpPct,
        slPct,
        entryTime: now.toISOString(),
        entryPriceUsd: entry,
        status: 'OPEN',
      };
      setTrades((prev) => [t, ...prev]);
      setMint('');
    } catch (e: any) {
      setError(e?.message ?? 'failed to open trade');
    } finally {
      setBusy(null);
    }
  }

  async function closeTrade(tradeId: string) {
    if (!account) return;
    setError(null);

    const trade = trades.find((t) => t.id === tradeId);
    if (!trade) return;

    try {
      setBusy(`close:${tradeId}`);
      const exit = await fetchPriceUsd(trade.mint);

      const { updatedAccount, updatedTrade } = applyCloseTrade(account, trade, exit);

      // Update account first
      let nextAccount = updatedAccount;

      // Pass condition: at least minTradesToPass closed trades and not failed
      const nextClosedCount = trades.filter((t) => t.status === 'CLOSED').length + 1;
      if (nextAccount.status !== 'FAILED' && nextClosedCount >= nextAccount.rules.minTradesToPass) {
        nextAccount = { ...nextAccount, status: 'PASSED' };
      }

      setAccount(nextAccount);
      setTrades((prev) => prev.map((t) => (t.id === tradeId ? updatedTrade : t)));
    } catch (e: any) {
      setError(e?.message ?? 'failed to close trade');
    } finally {
      setBusy(null);
    }
  }

  async function autoCheckStops() {
    if (!account) return;
    if (openTrades.length === 0) return;

    try {
      setBusy('check');
      setError(null);

      // Fetch prices serially (MVP). Can batch later.
      for (const t of openTrades) {
        const px = await fetchPriceUsd(t.mint);
        const pnlPct = computePnlPct(t.side, t.entryPriceUsd, px);

        const hitTP = typeof t.tpPct === 'number' && t.tpPct > 0 && pnlPct >= t.tpPct;
        const hitSL = typeof t.slPct === 'number' && t.slPct > 0 && pnlPct <= -t.slPct;
        if (hitTP || hitSL) {
          await closeTrade(t.id);
        }
      }
    } catch (e: any) {
      setError(e?.message ?? 'auto-check failed');
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

  if (!account) {
    return (
      <div className="min-h-screen bg-animated flex items-center justify-center px-4">
        <div className="glass-card rounded-2xl p-8 text-center max-w-md">
          <div className="text-6xl mb-4">🧾</div>
          <h2 className="text-2xl font-bold mb-4">No Evaluation Account</h2>
          <p className="text-gray-400 mb-6">Create an evaluation account to start paper trading.</p>
          <Link href="/register" className="btn-primary inline-block">Buy Evaluation Account</Link>
        </div>
      </div>
    );
  }

  const tierColor = tierColors[account.tier] ?? '#9945FF';

  return (
    <main className="min-h-screen bg-animated pt-20 px-4 pb-12">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              🧪 Evaluation Dashboard
              <span className="text-sm px-3 py-1 rounded-full" style={{ backgroundColor: `${tierColor}20`, color: tierColor }}>
                {account.tier}
              </span>
              <span
                className={`text-xs px-2 py-1 rounded-full ${
                  account.status === 'ACTIVE'
                    ? 'bg-blue-500/20 text-blue-300'
                    : account.status === 'PASSED'
                      ? 'bg-green-500/20 text-green-400'
                      : 'bg-red-500/20 text-red-400'
                }`}
              >
                {account.status}
              </span>
            </h1>
            <p className="text-gray-400 mt-1">Agent: {account.agentName} • Day: {todayKey()}</p>
          </div>

          <div className="glass px-4 py-2 rounded-lg text-sm">
            Rules: Daily DD ≤ <b>2%</b> • Total DD ≤ <b>5%</b> • Pass after <b>10</b> closed trades
          </div>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="glass-card rounded-xl p-6">
            <div className="text-sm text-gray-400 mb-2">Equity (USD)</div>
            <div className="text-3xl font-bold text-[#14F195]">${account.equityUsd.toFixed(2)}</div>
            <div className="text-xs text-gray-500 mt-1">Start: ${account.startingBalanceUsd.toFixed(2)}</div>
          </div>
          <div className="glass-card rounded-xl p-6">
            <div className="text-sm text-gray-400 mb-2">Total P&L</div>
            <div className={`text-3xl font-bold ${totalPnl >= 0 ? 'text-[#14F195]' : 'text-red-400'}`}>{totalPnl >= 0 ? '+' : ''}${totalPnl}</div>
            <div className="text-xs text-gray-500 mt-1">Closed trades: {closedTrades.length}</div>
          </div>
          <div className="glass-card rounded-xl p-6">
            <div className="text-sm text-gray-400 mb-2">Win Rate</div>
            <div className="text-3xl font-bold">{winRate}%</div>
            <div className="text-xs text-gray-500 mt-1">Open: {openTrades.length}</div>
          </div>
          <div className="glass-card rounded-xl p-6">
            <div className="text-sm text-gray-400 mb-2">Drawdown</div>
            <div className="text-lg font-bold">Daily: <span className={dailyDrawdownPct >= 2 ? 'text-red-400' : 'text-yellow-300'}>{dailyDrawdownPct.toFixed(2)}%</span></div>
            <div className="text-lg font-bold">Total: <span className={totalDrawdownPct >= 5 ? 'text-red-400' : 'text-yellow-300'}>{totalDrawdownPct.toFixed(2)}%</span></div>
          </div>
        </div>

        {error && (
          <div className="glass-card rounded-xl p-4 mb-6 border border-red-500/30">
            <div className="text-red-300 text-sm">{error}</div>
          </div>
        )}

        {/* Trade Entry */}
        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-1 glass-card rounded-xl p-6">
            <h3 className="text-lg font-bold mb-4">📌 New Paper Trade</h3>

            <label className="text-sm text-gray-400">Token CA (Mint)</label>
            <input
              value={mint}
              onChange={(e) => setMint(e.target.value)}
              placeholder="Paste Solana token mint..."
              className="w-full mt-2 bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#9945FF]"
            />

            <div className="grid grid-cols-2 gap-3 mt-4">
              <div>
                <label className="text-sm text-gray-400">Side</label>
                <select
                  value={side}
                  onChange={(e) => setSide(e.target.value as Side)}
                  className="w-full mt-2 bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#9945FF]"
                >
                  <option value="LONG">LONG</option>
                  <option value="SHORT">SHORT</option>
                </select>
              </div>
              <div>
                <label className="text-sm text-gray-400">Size %</label>
                <input
                  type="number"
                  value={sizePct}
                  onChange={(e) => setSizePct(Number(e.target.value))}
                  className="w-full mt-2 bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#9945FF]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-4">
              <div>
                <label className="text-sm text-gray-400">TP %</label>
                <input
                  type="number"
                  value={tpPct}
                  onChange={(e) => setTpPct(Number(e.target.value))}
                  className="w-full mt-2 bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#9945FF]"
                />
              </div>
              <div>
                <label className="text-sm text-gray-400">SL %</label>
                <input
                  type="number"
                  value={slPct}
                  onChange={(e) => setSlPct(Number(e.target.value))}
                  className="w-full mt-2 bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#9945FF]"
                />
              </div>
            </div>

            <button
              onClick={openTrade}
              disabled={account.status !== 'ACTIVE' || busy === 'open'}
              className={`btn-primary w-full mt-5 ${account.status !== 'ACTIVE' ? 'opacity-50 cursor-not-allowed' : 'shimmer'}`}
            >
              {busy === 'open' ? 'Opening…' : 'Open Paper Trade'}
            </button>

            <button
              onClick={autoCheckStops}
              disabled={account.status !== 'ACTIVE' || openTrades.length === 0 || busy === 'check'}
              className="btn-secondary w-full mt-3"
            >
              {busy === 'check' ? 'Checking…' : 'Auto-check TP/SL'}
            </button>

            {account.status === 'FAILED' && (
              <div className="mt-5 p-4 rounded-lg bg-red-500/15 border border-red-500/30">
                <div className="font-bold text-red-300">Account Failed</div>
                <div className="text-xs text-gray-400 mt-1">
                  You hit max drawdown. Buy a new evaluation account to try again.
                </div>
                <Link href="/register" className="btn-primary inline-block mt-3">Buy New Account</Link>
              </div>
            )}

            {account.status === 'PASSED' && (
              <div className="mt-5 p-4 rounded-lg bg-green-500/15 border border-green-500/30">
                <div className="font-bold text-green-300">Evaluation Passed ✅</div>
                <div className="text-xs text-gray-400 mt-1">
                  Next: list this agent in the funding marketplace for humans to back.
                </div>
              </div>
            )}
          </div>

          {/* Open trades */}
          <div className="lg:col-span-2 glass-card rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">📈 Open Trades</h3>
              <div className="text-xs text-gray-500">(prices sourced from DexScreener)</div>
            </div>

            {openTrades.length === 0 ? (
              <div className="text-gray-400 text-sm">No open trades. Open one to start tracking performance.</div>
            ) : (
              <div className="space-y-3">
                {openTrades.map((t) => (
                  <div key={t.id} className="p-4 bg-white/5 rounded-xl flex items-center justify-between gap-4">
                    <div>
                      <div className="font-semibold flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-xs font-bold ${t.side === 'LONG' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>{t.side}</span>
                        <span className="text-gray-300">{t.mint.slice(0, 4)}…{t.mint.slice(-4)}</span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Entry ${t.entryPriceUsd.toFixed(6)} • Size {t.sizePct}% • TP {t.tpPct ?? 0}% • SL {t.slPct ?? 0}%
                      </div>
                      <div className="text-xs text-gray-500">Opened {new Date(t.entryTime).toLocaleString()}</div>
                    </div>

                    <button
                      onClick={() => closeTrade(t.id)}
                      disabled={account.status !== 'ACTIVE' || busy === `close:${t.id}`}
                      className="btn-primary !py-2 !px-4"
                    >
                      {busy === `close:${t.id}` ? 'Closing…' : 'Close'}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* History */}
        <div className="glass-card rounded-xl p-6">
          <h3 className="text-lg font-bold mb-4">🧾 Trade History</h3>
          {closedTrades.length === 0 ? (
            <div className="text-gray-400 text-sm">No closed trades yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-gray-400 text-xs border-b border-white/10">
                    <th className="py-3">Side</th>
                    <th className="py-3">Token</th>
                    <th className="py-3">Entry</th>
                    <th className="py-3">Exit</th>
                    <th className="py-3">PnL %</th>
                    <th className="py-3">PnL $</th>
                    <th className="py-3">Closed</th>
                  </tr>
                </thead>
                <tbody>
                  {closedTrades.map((t) => (
                    <tr key={t.id} className="border-b border-white/5 text-sm">
                      <td className="py-3">
                        <span className={`px-2 py-0.5 rounded text-xs font-bold ${t.side === 'LONG' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>{t.side}</span>
                      </td>
                      <td className="py-3 text-gray-300">{t.mint.slice(0, 4)}…{t.mint.slice(-4)}</td>
                      <td className="py-3 text-gray-400">${(t.entryPriceUsd ?? 0).toFixed(6)}</td>
                      <td className="py-3 text-gray-400">${(t.closePriceUsd ?? 0).toFixed(6)}</td>
                      <td className={`py-3 font-semibold ${(t.pnlPct ?? 0) >= 0 ? 'text-[#14F195]' : 'text-red-400'}`}>{(t.pnlPct ?? 0).toFixed(2)}%</td>
                      <td className={`py-3 font-semibold ${(t.pnlUsd ?? 0) >= 0 ? 'text-[#14F195]' : 'text-red-400'}`}>{(t.pnlUsd ?? 0) >= 0 ? '+' : ''}${(t.pnlUsd ?? 0).toFixed(2)}</td>
                      <td className="py-3 text-gray-500">{t.closeTime ? new Date(t.closeTime).toLocaleString() : '-'}</td>
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
