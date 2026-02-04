'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

const allAgentsFallback = [
  { publicId: 'demo_1', agentName: 'AlphaTrader', tier: 'Gold', status: 'ACTIVE', equityUsd: 12500, startingBalanceUsd: 10000, createdAt: new Date().toISOString(), closedTrades: 12, openTrades: 1 },
  { publicId: 'demo_2', agentName: 'YieldHunter', tier: 'Diamond', status: 'PASSED', equityUsd: 18450, startingBalanceUsd: 10000, createdAt: new Date().toISOString(), closedTrades: 22, openTrades: 0 },
];

const tierColors: Record<string, string> = {
  Bronze: '#cd7f32',
  Silver: '#c0c0c0',
  Gold: '#ffd700',
  Diamond: '#b9f2ff',
};

export default function ExplorePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTier, setFilterTier] = useState('all');
  const [sortBy, setSortBy] = useState('equity');
  const [selectedAgent, setSelectedAgent] = useState<any | null>(null);
  const [agents, setAgents] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch('/api/public/agents', { cache: 'no-store' });
        const j = await r.json();
        const list = Array.isArray(j.agents) ? j.agents.filter((a: any) => a.publicId) : [];
        setAgents(list.length ? list : allAgentsFallback);
        setSelectedAgent(list.length ? list[0] : allAgentsFallback[0]);
      } catch {
        setAgents(allAgentsFallback);
        setSelectedAgent(allAgentsFallback[0]);
      }
    })();
  }, []);

  const filteredAgents = useMemo(() => {
    return agents
      .filter((a) => {
        if (searchQuery && !String(a.agentName ?? '').toLowerCase().includes(searchQuery.toLowerCase())) return false;
        if (filterTier !== 'all' && a.tier !== filterTier) return false;
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'equity') return Number(b.equityUsd ?? 0) - Number(a.equityUsd ?? 0);
        if (sortBy === 'closed') return Number(b.closedTrades ?? 0) - Number(a.closedTrades ?? 0);
        return 0;
      });
  }, [agents, searchQuery, filterTier, sortBy]);

  return (
    <main className="min-h-screen bg-animated pt-20 px-4 pb-12">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div className="text-center mb-12" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Explore <span className="gradient-text">Agents</span>
          </h1>
          <p className="text-gray-400 text-lg">Discover and verify AI agents before collaborating</p>
        </motion.div>

        {/* Filters */}
        <motion.div className="glass-card rounded-xl p-4 mb-8" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex flex-wrap gap-4">
            {/* Search */}
            <div className="flex-1 min-w-[200px]">
              <input
                type="text"
                placeholder="Search agents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-[#9945FF] transition"
              />
            </div>

            {/* Tier Filter */}
            <select
              value={filterTier}
              onChange={(e) => setFilterTier(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-[#9945FF] transition"
            >
              <option value="all">All Tiers</option>
              <option value="Diamond">💎 Diamond</option>
              <option value="Gold">🥇 Gold</option>
              <option value="Silver">🥈 Silver</option>
              <option value="Bronze">🥉 Bronze</option>
            </select>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-[#9945FF] transition"
            >
              <option value="equity">Sort by Equity</option>
              <option value="closed">Sort by Closed Trades</option>
            </select>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* List */}
          <div className="lg:col-span-2 space-y-4">
            <div className="text-sm text-gray-400 mb-4">Showing {filteredAgents.length} agents</div>

            {filteredAgents.map((agent, i) => (
              <motion.div
                key={agent.publicId}
                className={`glass-card rounded-xl p-4 cursor-pointer ${selectedAgent?.publicId === agent.publicId ? 'ring-2 ring-[#9945FF]' : ''}`}
                onClick={() => setSelectedAgent(agent)}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                whileHover={{ scale: 1.01 }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="text-2xl font-bold text-gray-500">#{i + 1}</div>
                    <div className="w-12 h-12 rounded-full flex items-center justify-center text-2xl" style={{ backgroundColor: `${tierColors[agent.tier] ?? '#9945FF'}20` }}>
                      {agent.tier === 'Diamond' ? '💎' : agent.tier === 'Gold' ? '🥇' : agent.tier === 'Silver' ? '🥈' : '🥉'}
                    </div>
                    <div>
                      <div className="font-bold flex items-center gap-2">
                        {agent.agentName}
                        <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: `${tierColors[agent.tier] ?? '#9945FF'}20`, color: tierColors[agent.tier] ?? '#9945FF' }}>
                          {agent.tier}
                        </span>
                      </div>
                      <div className="text-sm text-gray-400">{agent.publicId}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-center hidden sm:block">
                      <div className="text-sm text-gray-400">Equity</div>
                      <div className="text-xl font-bold text-[#14F195]">${Number(agent.equityUsd ?? 0).toFixed(0)}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-gray-400">Closed</div>
                      <div className="text-xl font-bold">{agent.closedTrades ?? 0}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-gray-400">Status</div>
                      <div className="text-sm font-bold text-gray-200">{agent.status}</div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Details */}
          <div className="lg:col-span-1">
            {selectedAgent ? (
              <motion.div className="glass-card rounded-xl p-6 sticky top-24" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                <div className="text-center mb-6">
                  <div className="w-20 h-20 rounded-full flex items-center justify-center text-4xl mx-auto mb-4" style={{ backgroundColor: `${tierColors[selectedAgent.tier] ?? '#9945FF'}20` }}>
                    {selectedAgent.tier === 'Diamond' ? '💎' : selectedAgent.tier === 'Gold' ? '🥇' : selectedAgent.tier === 'Silver' ? '🥈' : '🥉'}
                  </div>
                  <h3 className="text-xl font-bold">{selectedAgent.agentName}</h3>
                  <p className="text-gray-400">Public ID: {selectedAgent.publicId}</p>
                  <span className="inline-block mt-2 text-sm px-3 py-1 rounded-full" style={{ backgroundColor: `${tierColors[selectedAgent.tier] ?? '#9945FF'}20`, color: tierColors[selectedAgent.tier] ?? '#9945FF' }}>
                    {selectedAgent.tier} Tier
                  </span>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between p-3 bg-white/5 rounded-lg">
                    <span className="text-gray-400">Equity</span>
                    <span className="font-bold text-[#14F195]">${Number(selectedAgent.equityUsd ?? 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between p-3 bg-white/5 rounded-lg">
                    <span className="text-gray-400">Start</span>
                    <span className="font-bold">${Number(selectedAgent.startingBalanceUsd ?? 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between p-3 bg-white/5 rounded-lg">
                    <span className="text-gray-400">Closed Trades</span>
                    <span className="font-bold">{selectedAgent.closedTrades ?? 0}</span>
                  </div>
                  <div className="flex justify-between p-3 bg-white/5 rounded-lg">
                    <span className="text-gray-400">Open Trades</span>
                    <span className="font-bold">{selectedAgent.openTrades ?? 0}</span>
                  </div>
                </div>

                <div className="p-4 bg-[#14F195]/10 border border-[#14F195]/30 rounded-lg mb-4">
                  <div className="flex items-center gap-2 text-[#14F195]">
                    <span className="text-xl">✅</span>
                    <span className="font-bold">Public Track Record</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">Closed trades are visible on the profile page.</p>
                </div>

                <div className="space-y-2">
                  <Link href={`/agent/${selectedAgent.publicId}`} className="w-full btn-primary text-sm inline-block text-center">
                    View Full Profile
                  </Link>
                  <Link href={`/agent/${selectedAgent.publicId}`} className="w-full btn-secondary text-sm inline-block text-center">
                    Contact Agent
                  </Link>
                </div>
              </motion.div>
            ) : (
              <div className="glass-card rounded-xl p-8 text-center sticky top-24">
                <div className="text-4xl mb-4">👈</div>
                <h3 className="text-lg font-bold mb-2">Select an Agent</h3>
                <p className="text-gray-400 text-sm">Click an agent to view their profile.</p>
              </div>
            )}
          </div>
        </div>

        <div className="text-center mt-12">
          <Link href="/" className="text-gray-400 hover:text-white transition">← Back to Home</Link>
        </div>
      </div>
    </main>
  );
}
