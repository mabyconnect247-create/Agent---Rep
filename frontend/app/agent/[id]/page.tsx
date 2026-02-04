'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function AgentProfilePage() {
  const params = useParams<{ id: string }>();
  const id = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [closedTrades, setClosedTrades] = useState<any[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const r = await fetch(`/api/public/agent?id=${encodeURIComponent(id)}`, { cache: 'no-store' });
        const j = await r.json();
        if (!r.ok) throw new Error(j?.error || 'failed');
        if (cancelled) return;
        setProfile(j.profile);
        setClosedTrades(j.closedTrades || []);
        setError(null);
      } catch (e: any) {
        if (cancelled) return;
        setError(e?.message ?? 'error');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const totalPnl = useMemo(() => closedTrades.reduce((a, t) => a + (t.pnlUsd ?? 0), 0), [closedTrades]);

  if (loading) {
    return (
      <div className="min-h-screen bg-animated pt-20 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-[#9945FF] border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-animated pt-20 px-4">
        <div className="max-w-3xl mx-auto glass-card rounded-2xl p-8">
          <div className="text-red-300">{error}</div>
          <div className="mt-6">
            <Link href="/explore" className="btn-secondary">Back to Explore</Link>
          </div>
        </div>
      </div>
    );
  }

  const tg = profile?.contact?.telegram ? String(profile.contact.telegram) : null;

  return (
    <main className="min-h-screen bg-animated pt-20 px-4 pb-12">
      <div className="max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-2xl p-7 mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="text-xs uppercase tracking-widest text-gray-500">Agent Profile</div>
              <h1 className="text-3xl font-black mt-1">
                {profile.agentName} <span className="text-gray-500 text-base">({profile.publicId})</span>
              </h1>
              <div className="text-gray-400 mt-2">
                Tier: <b>{profile.tier}</b> • Status: <b>{profile.status}</b> • Started: {new Date(profile.createdAt).toLocaleString()}
              </div>
            </div>

            <div className="text-right">
              <div className="text-xs uppercase tracking-widest text-gray-500">Total PnL (closed)</div>
              <div className={`text-3xl font-black mt-1 ${totalPnl >= 0 ? 'text-[#14F195]' : 'text-red-400'}`}>
                {totalPnl >= 0 ? '+' : ''}${totalPnl.toFixed(2)}
              </div>
              <div className="text-xs text-gray-500 mt-2">Closed trades: {closedTrades.length}</div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 mt-6">
            <Link href="/explore" className="btn-secondary !py-2 !px-4">← Back</Link>
            {tg ? (
              <a className="btn-primary !py-2 !px-4" href={`https://t.me/${tg.replace('@', '')}`} target="_blank">
                Contact (Telegram)
              </a>
            ) : (
              <div className="text-gray-500 text-sm">Contact not set</div>
            )}
          </div>
        </motion.div>

        <div className="glass-card rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Closed Trades</h2>
            <div className="text-xs text-gray-500">Verified via our evaluation engine (prices from DexScreener)</div>
          </div>

          {closedTrades.length === 0 ? (
            <div className="text-gray-400 text-sm">No closed trades yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-gray-400 text-xs border-b border-white/10">
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
                  {closedTrades.map((t) => (
                    <tr key={t.id} className="border-b border-white/5 text-sm">
                      <td className="py-3 text-gray-300">{t.mode}</td>
                      <td className="py-3">
                        <span className={`px-2 py-0.5 rounded text-xs font-bold ${t.side === 'BUY' || t.side === 'LONG' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>{t.side}</span>
                      </td>
                      <td className="py-3 text-gray-300">{t.mint.slice(0, 4)}…{t.mint.slice(-4)}</td>
                      <td className="py-3 text-gray-400">${Number(t.entryPriceUsd).toFixed(6)}</td>
                      <td className="py-3 text-gray-400">${Number(t.closePriceUsd).toFixed(6)}</td>
                      <td className={`py-3 font-semibold ${Number(t.pnlPct) >= 0 ? 'text-[#14F195]' : 'text-red-400'}`}>{Number(t.pnlPct).toFixed(2)}%</td>
                      <td className={`py-3 font-semibold ${Number(t.pnlUsd) >= 0 ? 'text-[#14F195]' : 'text-red-400'}`}>{Number(t.pnlUsd) >= 0 ? '+' : ''}${Number(t.pnlUsd).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
