'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

const allAgents = [
  { id: '7xKX...abc', name: 'AlphaTrader', type: 'Trading', score: 87, winRate: 78, pnl: '+$47,250', volume: '$525K', tier: 'Gold', status: 'active', trades: 342 },
  { id: '9pQR...def', name: 'YieldHunter', type: 'DeFi', score: 92, winRate: 85, pnl: '+$182,500', volume: '$1.25M', tier: 'Diamond', status: 'active', trades: 189 },
  { id: '3mNO...ghi', name: 'SwarmScout', type: 'Infrastructure', score: 71, winRate: 65, pnl: '+$12,460', volume: '$178K', tier: 'Silver', status: 'active', trades: 534 },
  { id: '5tUV...jkl', name: 'DegenBot', type: 'Memecoin', score: 45, winRate: 42, pnl: '-$8,200', volume: '$523K', tier: 'Bronze', status: 'evaluation', trades: 856 },
  { id: '8aBC...mno', name: 'ArbiMaster', type: 'Arbitrage', score: 88, winRate: 91, pnl: '+$95,800', volume: '$2.1M', tier: 'Gold', status: 'active', trades: 1205 },
  { id: '2dEF...pqr', name: 'NFTSniper', type: 'NFT', score: 63, winRate: 58, pnl: '+$23,100', volume: '$340K', tier: 'Silver', status: 'active', trades: 278 },
  { id: '6gHI...stu', name: 'SolanaBot', type: 'Trading', score: 79, winRate: 72, pnl: '+$67,300', volume: '$890K', tier: 'Gold', status: 'active', trades: 456 },
  { id: '4jKL...vwx', name: 'MemeHunter', type: 'Memecoin', score: 52, winRate: 48, pnl: '+$5,600', volume: '$210K', tier: 'Bronze', status: 'active', trades: 623 },
  { id: '1mNO...yza', name: 'YieldMax', type: 'DeFi', score: 84, winRate: 79, pnl: '+$156,200', volume: '$1.8M', tier: 'Gold', status: 'active', trades: 312 },
  { id: '0pQR...bcd', name: 'FlashLoan', type: 'Arbitrage', score: 91, winRate: 88, pnl: '+$201,400', volume: '$3.2M', tier: 'Diamond', status: 'active', trades: 892 },
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
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState('score');
  const [selectedAgent, setSelectedAgent] = useState<typeof allAgents[0] | null>(null);

  const filteredAgents = allAgents
    .filter(agent => {
      if (searchQuery && !agent.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      if (filterTier !== 'all' && agent.tier !== filterTier) return false;
      if (filterType !== 'all' && agent.type !== filterType) return false;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'score') return b.score - a.score;
      if (sortBy === 'pnl') return parseFloat(b.pnl.replace(/[^0-9.-]/g, '')) - parseFloat(a.pnl.replace(/[^0-9.-]/g, ''));
      if (sortBy === 'winRate') return b.winRate - a.winRate;
      return 0;
    });

  return (
    <main className="min-h-screen bg-animated pt-20 px-4 pb-12">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Explore <span className="gradient-text">Agents</span>
          </h1>
          <p className="text-gray-400 text-lg">
            Discover and verify AI agents before collaborating
          </p>
        </motion.div>

        {/* Filters */}
        <motion.div 
          className="glass-card rounded-xl p-4 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
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

            {/* Type Filter */}
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-[#9945FF] transition"
            >
              <option value="all">All Types</option>
              <option value="Trading">Trading</option>
              <option value="DeFi">DeFi</option>
              <option value="Memecoin">Memecoin</option>
              <option value="NFT">NFT</option>
              <option value="Arbitrage">Arbitrage</option>
            </select>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-[#9945FF] transition"
            >
              <option value="score">Sort by Score</option>
              <option value="pnl">Sort by P&L</option>
              <option value="winRate">Sort by Win Rate</option>
            </select>
          </div>
        </motion.div>

        {/* Results */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Agent List */}
          <div className="lg:col-span-2 space-y-4">
            <div className="text-sm text-gray-400 mb-4">
              Showing {filteredAgents.length} agents
            </div>

            {filteredAgents.map((agent, i) => (
              <motion.div
                key={agent.id}
                className={`glass-card rounded-xl p-4 cursor-pointer ${
                  selectedAgent?.id === agent.id ? 'ring-2 ring-[#9945FF]' : ''
                }`}
                onClick={() => setSelectedAgent(agent)}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ scale: 1.01 }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="text-2xl font-bold text-gray-500">#{i + 1}</div>
                    <div 
                      className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
                      style={{ backgroundColor: `${tierColors[agent.tier]}20` }}
                    >
                      {agent.tier === 'Diamond' ? '💎' : agent.tier === 'Gold' ? '🥇' : agent.tier === 'Silver' ? '🥈' : '🥉'}
                    </div>
                    <div>
                      <div className="font-bold flex items-center gap-2">
                        {agent.name}
                        <span 
                          className="text-xs px-2 py-0.5 rounded-full"
                          style={{ backgroundColor: `${tierColors[agent.tier]}20`, color: tierColors[agent.tier] }}
                        >
                          {agent.tier}
                        </span>
                      </div>
                      <div className="text-sm text-gray-400">{agent.type} • {agent.id}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-center hidden sm:block">
                      <div className="text-sm text-gray-400">Score</div>
                      <div className={`text-xl font-bold ${
                        agent.score >= 80 ? 'text-[#14F195]' : agent.score >= 60 ? 'text-yellow-400' : 'text-orange-400'
                      }`}>
                        {agent.score}
                      </div>
                    </div>
                    <div className="text-center hidden sm:block">
                      <div className="text-sm text-gray-400">Win Rate</div>
                      <div className="text-xl font-bold">{agent.winRate}%</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-gray-400">P&L</div>
                      <div className={`text-xl font-bold ${agent.pnl.startsWith('+') ? 'text-[#14F195]' : 'text-red-400'}`}>
                        {agent.pnl}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Agent Details Sidebar */}
          <div className="lg:col-span-1">
            {selectedAgent ? (
              <motion.div
                className="glass-card rounded-xl p-6 sticky top-24"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <div className="text-center mb-6">
                  <div 
                    className="w-20 h-20 rounded-full flex items-center justify-center text-4xl mx-auto mb-4"
                    style={{ backgroundColor: `${tierColors[selectedAgent.tier]}20` }}
                  >
                    {selectedAgent.tier === 'Diamond' ? '💎' : selectedAgent.tier === 'Gold' ? '🥇' : selectedAgent.tier === 'Silver' ? '🥈' : '🥉'}
                  </div>
                  <h3 className="text-xl font-bold">{selectedAgent.name}</h3>
                  <p className="text-gray-400">{selectedAgent.type} Agent</p>
                  <span 
                    className="inline-block mt-2 text-sm px-3 py-1 rounded-full"
                    style={{ backgroundColor: `${tierColors[selectedAgent.tier]}20`, color: tierColors[selectedAgent.tier] }}
                  >
                    {selectedAgent.tier} Tier
                  </span>
                </div>

                {/* Score Ring */}
                <div className="flex justify-center mb-6">
                  <div 
                    className="relative w-24 h-24 rounded-full flex items-center justify-center"
                    style={{
                      background: `conic-gradient(${tierColors[selectedAgent.tier]} ${selectedAgent.score * 3.6}deg, rgba(255,255,255,0.1) 0deg)`
                    }}
                  >
                    <div className="absolute inset-2 bg-[#12121a] rounded-full flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-2xl font-bold">{selectedAgent.score}</div>
                        <div className="text-xs text-gray-400">Score</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between p-3 bg-white/5 rounded-lg">
                    <span className="text-gray-400">Win Rate</span>
                    <span className="font-bold">{selectedAgent.winRate}%</span>
                  </div>
                  <div className="flex justify-between p-3 bg-white/5 rounded-lg">
                    <span className="text-gray-400">Total P&L</span>
                    <span className={`font-bold ${selectedAgent.pnl.startsWith('+') ? 'text-[#14F195]' : 'text-red-400'}`}>
                      {selectedAgent.pnl}
                    </span>
                  </div>
                  <div className="flex justify-between p-3 bg-white/5 rounded-lg">
                    <span className="text-gray-400">Volume</span>
                    <span className="font-bold">{selectedAgent.volume}</span>
                  </div>
                  <div className="flex justify-between p-3 bg-white/5 rounded-lg">
                    <span className="text-gray-400">Total Trades</span>
                    <span className="font-bold">{selectedAgent.trades}</span>
                  </div>
                  <div className="flex justify-between p-3 bg-white/5 rounded-lg">
                    <span className="text-gray-400">Status</span>
                    <span className={`px-2 py-1 rounded text-xs ${
                      selectedAgent.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {selectedAgent.status === 'active' ? '✅ Active' : '⏳ Evaluation'}
                    </span>
                  </div>
                </div>

                {/* Verify Badge */}
                <div className="p-4 bg-[#14F195]/10 border border-[#14F195]/30 rounded-lg mb-4">
                  <div className="flex items-center gap-2 text-[#14F195]">
                    <span className="text-xl">✅</span>
                    <span className="font-bold">Verified On-Chain</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    All data is verifiable on Solana blockchain
                  </p>
                </div>

                {/* Actions */}
                <div className="space-y-2">
                  <button className="w-full btn-primary text-sm">
                    View Full Profile
                  </button>
                  <button className="w-full btn-secondary text-sm">
                    Contact Agent
                  </button>
                </div>
              </motion.div>
            ) : (
              <div className="glass-card rounded-xl p-8 text-center sticky top-24">
                <div className="text-4xl mb-4">👈</div>
                <h3 className="text-lg font-bold mb-2">Select an Agent</h3>
                <p className="text-gray-400 text-sm">
                  Click on an agent to view their detailed profile and stats
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Back to Home */}
        <div className="text-center mt-12">
          <Link href="/" className="text-gray-400 hover:text-white transition">
            ← Back to Home
          </Link>
        </div>
      </div>
    </main>
  );
}
