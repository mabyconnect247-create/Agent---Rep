'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

interface AgentData {
  name: string;
  type: string;
  tier: string;
  wallet: string;
  registeredAt: string;
  score: number;
}

const mockTrades = [
  { id: 1, type: 'LONG', asset: 'SOL/USDC', entry: 98.50, exit: 105.20, pnl: '+6.8%', pnlUsd: '+$680', time: '2h ago', status: 'win' },
  { id: 2, type: 'SHORT', asset: 'BONK/SOL', entry: 0.000023, exit: 0.000019, pnl: '+17.4%', pnlUsd: '+$348', time: '5h ago', status: 'win' },
  { id: 3, type: 'LONG', asset: 'JUP/USDC', entry: 0.85, exit: 0.79, pnl: '-7.1%', pnlUsd: '-$142', time: '8h ago', status: 'loss' },
  { id: 4, type: 'LONG', asset: 'WIF/SOL', entry: 2.10, exit: 2.45, pnl: '+16.7%', pnlUsd: '+$501', time: '1d ago', status: 'win' },
  { id: 5, type: 'SHORT', asset: 'PYTH/USDC', entry: 0.42, exit: 0.38, pnl: '+9.5%', pnlUsd: '+$285', time: '1d ago', status: 'win' },
];

const tierColors: Record<string, string> = {
  Bronze: '#cd7f32',
  Silver: '#c0c0c0',
  Gold: '#ffd700',
  Diamond: '#b9f2ff',
};

const tierCapital: Record<string, string> = {
  Bronze: '$10,000',
  Silver: '$50,000',
  Gold: '$100,000',
  Diamond: '$500,000',
};

export default function DashboardPage() {
  const [agent, setAgent] = useState<AgentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  // Simulated live stats
  const [stats, setStats] = useState({
    score: 67,
    totalTrades: 47,
    winRate: 72,
    totalPnl: 4250,
    todayPnl: 680,
    drawdown: 8.5,
    allocated: 25000,
    available: 25000,
  });

  useEffect(() => {
    // Load agent data from localStorage
    const stored = localStorage.getItem('agentRep_registered');
    if (stored) {
      const data = JSON.parse(stored);
      setAgent(data);
      // Set score based on tier for demo
      if (data.tier === 'Bronze') setStats(s => ({ ...s, score: 52, allocated: 10000, available: 8500 }));
      if (data.tier === 'Silver') setStats(s => ({ ...s, score: 67, allocated: 50000, available: 42000 }));
      if (data.tier === 'Gold') setStats(s => ({ ...s, score: 81, allocated: 100000, available: 85000 }));
      if (data.tier === 'Diamond') setStats(s => ({ ...s, score: 94, allocated: 500000, available: 425000 }));
    }
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-animated flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-[#9945FF] border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!agent) {
    return (
      <div className="min-h-screen bg-animated flex items-center justify-center px-4">
        <div className="glass-card rounded-2xl p-8 text-center max-w-md">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold mb-4">Not Registered</h2>
          <p className="text-gray-400 mb-6">
            You need to register your agent to access the dashboard.
          </p>
          <Link href="/register" className="btn-primary inline-block">
            Register Now
          </Link>
        </div>
      </div>
    );
  }

  const nextTier = agent.tier === 'Bronze' ? 'Silver' : agent.tier === 'Silver' ? 'Gold' : agent.tier === 'Gold' ? 'Diamond' : null;
  const nextTierScore = agent.tier === 'Bronze' ? 60 : agent.tier === 'Silver' ? 75 : agent.tier === 'Gold' ? 90 : 100;
  const progressToNext = nextTier ? ((stats.score - (nextTierScore - 20)) / 20) * 100 : 100;

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
              🤖 {agent.name}
              <span 
                className="text-sm px-3 py-1 rounded-full"
                style={{ backgroundColor: `${tierColors[agent.tier]}20`, color: tierColors[agent.tier] }}
              >
                {agent.tier}
              </span>
            </h1>
            <p className="text-gray-400 mt-1">
              {agent.type.charAt(0).toUpperCase() + agent.type.slice(1)} Agent • Registered {new Date(agent.registeredAt).toLocaleDateString()}
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="glass px-4 py-2 rounded-lg">
              <span className="text-gray-400 text-sm">Wallet: </span>
              <span className="text-[#14F195]">{agent.wallet}</span>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <motion.div 
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          {/* Reputation Score */}
          <div className="glass-card rounded-xl p-6">
            <div className="text-sm text-gray-400 mb-2">Reputation Score</div>
            <div className="flex items-center gap-4">
              <div 
                className="relative w-16 h-16 rounded-full flex items-center justify-center"
                style={{
                  background: `conic-gradient(${tierColors[agent.tier]} ${stats.score * 3.6}deg, rgba(255,255,255,0.1) 0deg)`
                }}
              >
                <div className="absolute inset-1.5 bg-[#12121a] rounded-full flex items-center justify-center">
                  <span className="text-xl font-bold">{stats.score}</span>
                </div>
              </div>
              <div>
                <div className="text-2xl font-bold" style={{ color: tierColors[agent.tier] }}>{agent.tier}</div>
                {nextTier && (
                  <div className="text-xs text-gray-400">{nextTierScore - stats.score} pts to {nextTier}</div>
                )}
              </div>
            </div>
          </div>

          {/* Total P&L */}
          <div className="glass-card rounded-xl p-6">
            <div className="text-sm text-gray-400 mb-2">Total P&L</div>
            <div className="text-3xl font-bold text-[#14F195]">
              +${stats.totalPnl.toLocaleString()}
            </div>
            <div className="text-sm text-gray-400 mt-1">
              Today: <span className="text-[#14F195]">+${stats.todayPnl}</span>
            </div>
          </div>

          {/* Win Rate */}
          <div className="glass-card rounded-xl p-6">
            <div className="text-sm text-gray-400 mb-2">Win Rate</div>
            <div className="text-3xl font-bold">{stats.winRate}%</div>
            <div className="text-sm text-gray-400 mt-1">
              {stats.totalTrades} total trades
            </div>
          </div>

          {/* Allocated Capital */}
          <div className="glass-card rounded-xl p-6">
            <div className="text-sm text-gray-400 mb-2">Allocated Capital</div>
            <div className="text-3xl font-bold text-[#14F195]">
              ${stats.allocated.toLocaleString()}
            </div>
            <div className="text-sm text-gray-400 mt-1">
              Available: ${stats.available.toLocaleString()}
            </div>
          </div>
        </motion.div>

        {/* Progress to Next Tier */}
        {nextTier && (
          <motion.div 
            className="glass-card rounded-xl p-6 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm text-gray-400">Progress to {nextTier}</div>
              <div className="text-sm">
                <span style={{ color: tierColors[agent.tier] }}>{stats.score}</span>
                <span className="text-gray-500"> / </span>
                <span style={{ color: tierColors[nextTier] }}>{nextTierScore}</span>
              </div>
            </div>
            <div className="h-3 bg-white/10 rounded-full overflow-hidden">
              <motion.div 
                className="h-full rounded-full"
                style={{ 
                  background: `linear-gradient(90deg, ${tierColors[agent.tier]}, ${tierColors[nextTier]})`,
                }}
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(progressToNext, 100)}%` }}
                transition={{ duration: 1, delay: 0.5 }}
              />
            </div>
            <div className="flex justify-between mt-2 text-xs text-gray-500">
              <span>{tierCapital[agent.tier]} funding</span>
              <span>{tierCapital[nextTier]} funding</span>
            </div>
          </motion.div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto">
          {['overview', 'trades', 'analytics', 'settings'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition ${
                activeTab === tab 
                  ? 'bg-[#9945FF] text-white' 
                  : 'glass text-gray-400 hover:text-white'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {activeTab === 'overview' && (
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Recent Trades */}
              <div className="lg:col-span-2 glass-card rounded-xl p-6">
                <h3 className="text-lg font-bold mb-4">Recent Trades</h3>
                <div className="space-y-3">
                  {mockTrades.map((trade) => (
                    <div 
                      key={trade.id}
                      className="flex items-center justify-between p-3 bg-white/5 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <span className={`px-2 py-1 rounded text-xs font-bold ${
                          trade.type === 'LONG' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                        }`}>
                          {trade.type}
                        </span>
                        <div>
                          <div className="font-medium">{trade.asset}</div>
                          <div className="text-xs text-gray-400">{trade.time}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`font-bold ${trade.status === 'win' ? 'text-[#14F195]' : 'text-red-400'}`}>
                          {trade.pnl}
                        </div>
                        <div className={`text-sm ${trade.status === 'win' ? 'text-[#14F195]' : 'text-red-400'}`}>
                          {trade.pnlUsd}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <button className="w-full mt-4 py-2 text-sm text-gray-400 hover:text-white transition">
                  View All Trades →
                </button>
              </div>

              {/* Quick Stats */}
              <div className="space-y-6">
                <div className="glass-card rounded-xl p-6">
                  <h3 className="text-lg font-bold mb-4">Performance</h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-400">Max Drawdown</span>
                        <span className="text-yellow-400">{stats.drawdown}%</span>
                      </div>
                      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-yellow-400 rounded-full"
                          style={{ width: `${stats.drawdown * 4}%` }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-400">Capital Usage</span>
                        <span>{Math.round((stats.allocated - stats.available) / stats.allocated * 100)}%</span>
                      </div>
                      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-[#9945FF] rounded-full"
                          style={{ width: `${(stats.allocated - stats.available) / stats.allocated * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="glass-card rounded-xl p-6">
                  <h3 className="text-lg font-bold mb-4">Actions</h3>
                  <div className="space-y-3">
                    <button className="w-full py-3 glass rounded-lg text-sm hover:bg-white/10 transition flex items-center justify-center gap-2">
                      📝 Log New Trade
                    </button>
                    <button className="w-full py-3 glass rounded-lg text-sm hover:bg-white/10 transition flex items-center justify-center gap-2">
                      💰 Request Withdrawal
                    </button>
                    <button className="w-full py-3 glass rounded-lg text-sm hover:bg-white/10 transition flex items-center justify-center gap-2">
                      📊 Export Report
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'trades' && (
            <div className="glass-card rounded-xl p-6">
              <h3 className="text-lg font-bold mb-4">Trade History</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-gray-400 text-sm border-b border-white/10">
                      <th className="pb-3">Type</th>
                      <th className="pb-3">Asset</th>
                      <th className="pb-3">Entry</th>
                      <th className="pb-3">Exit</th>
                      <th className="pb-3">P&L</th>
                      <th className="pb-3">Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockTrades.map((trade) => (
                      <tr key={trade.id} className="border-b border-white/5">
                        <td className="py-3">
                          <span className={`px-2 py-1 rounded text-xs font-bold ${
                            trade.type === 'LONG' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                          }`}>
                            {trade.type}
                          </span>
                        </td>
                        <td className="py-3 font-medium">{trade.asset}</td>
                        <td className="py-3 text-gray-400">{trade.entry}</td>
                        <td className="py-3 text-gray-400">{trade.exit}</td>
                        <td className={`py-3 font-bold ${trade.status === 'win' ? 'text-[#14F195]' : 'text-red-400'}`}>
                          {trade.pnlUsd}
                        </td>
                        <td className="py-3 text-gray-400">{trade.time}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="glass-card rounded-xl p-6 text-center py-12">
              <div className="text-4xl mb-4">📊</div>
              <h3 className="text-xl font-bold mb-2">Analytics Coming Soon</h3>
              <p className="text-gray-400">Advanced charts and performance metrics</p>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="glass-card rounded-xl p-6 text-center py-12">
              <div className="text-4xl mb-4">⚙️</div>
              <h3 className="text-xl font-bold mb-2">Settings Coming Soon</h3>
              <p className="text-gray-400">Manage your agent profile and preferences</p>
            </div>
          )}
        </motion.div>
      </div>
    </main>
  );
}
