'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

// Mock data for demo
const mockAgents = [
  {
    id: '7xKX...abc',
    name: 'AlphaTrader',
    type: 'Trading',
    score: 78,
    totalActions: 142,
    successRate: 73,
    volume: 125000,
    stake: 2.5,
    status: 'active',
  },
  {
    id: '9pQR...def',
    name: 'YieldHunter',
    type: 'DeFi',
    score: 85,
    totalActions: 89,
    successRate: 81,
    volume: 450000,
    stake: 5.0,
    status: 'active',
  },
  {
    id: '3mNO...ghi',
    name: 'SwarmScout',
    type: 'Infrastructure',
    score: 62,
    totalActions: 234,
    successRate: 58,
    volume: 78000,
    stake: 1.0,
    status: 'active',
  },
  {
    id: '5tUV...jkl',
    name: 'NFTSniper',
    type: 'NFT',
    score: 45,
    totalActions: 56,
    successRate: 42,
    volume: 23000,
    stake: 0.5,
    status: 'warning',
  },
];

const mockActions = [
  { type: 'SWAP', protocol: 'Jupiter', input: 1000, output: 1150, outcome: 'Profit', time: '2 min ago' },
  { type: 'STAKE', protocol: 'Marinade', input: 500, output: 525, outcome: 'Profit', time: '15 min ago' },
  { type: 'TRADE', protocol: 'Raydium', input: 2000, output: 1850, outcome: 'Loss', time: '1 hr ago' },
  { type: 'SWAP', protocol: 'Orca', input: 800, output: 920, outcome: 'Profit', time: '3 hr ago' },
];

export default function Home() {
  const [selectedAgent, setSelectedAgent] = useState(mockAgents[0]);
  const [trustCheckResult, setTrustCheckResult] = useState<null | { trusted: boolean; reason: string }>(null);
  const [minScore, setMinScore] = useState(60);

  const checkTrust = () => {
    if (selectedAgent.score >= minScore) {
      setTrustCheckResult({ trusted: true, reason: `Score ${selectedAgent.score} meets minimum ${minScore}` });
    } else {
      setTrustCheckResult({ trusted: false, reason: `Score ${selectedAgent.score} below minimum ${minScore}` });
    }
  };

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-solana-purple/10 to-transparent" />
        
        <div className="max-w-6xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              <span className="gradient-text">AgentRep</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-4">
              On-Chain Agent Reputation Protocol
            </p>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto mb-8">
              Trustless reputation system for AI agents on Solana. 
              Every action on-chain. Every score verifiable.
            </p>
            
            <div className="flex flex-wrap justify-center gap-4">
              <a 
                href="https://github.com/mabyconnect247-create/Agent---Rep" 
                target="_blank"
                className="px-6 py-3 bg-solana-purple hover:bg-solana-purple/80 rounded-lg font-semibold transition"
              >
                View GitHub
              </a>
              <a 
                href="#demo" 
                className="px-6 py-3 border border-solana-green text-solana-green hover:bg-solana-green/10 rounded-lg font-semibold transition"
              >
                Try Demo
              </a>
            </div>
          </motion.div>
        </div>

        {/* Stats */}
        <div className="max-w-4xl mx-auto mt-16 grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Agents Registered', value: '1,247' },
            { label: 'Actions Logged', value: '45,892' },
            { label: 'Total Volume', value: '$2.4M' },
            { label: 'Trust Queries', value: '12,456' },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              className="glow-border rounded-lg p-4 text-center"
            >
              <div className="text-2xl md:text-3xl font-bold gradient-text">{stat.value}</div>
              <div className="text-sm text-gray-400">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 px-4 bg-card-bg/50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '1',
                title: 'Register',
                desc: 'Agents register on-chain with SOL stake as commitment. Get a unique PDA and start at neutral score.',
                icon: '🤖',
              },
              {
                step: '2',
                title: 'Log Actions',
                desc: 'Every trade, swap, and transaction is recorded with outcomes. Build an immutable track record.',
                icon: '📝',
              },
              {
                step: '3',
                title: 'Build Trust',
                desc: 'Reputation scores calculated from win rate, volume, age, and consistency. Verify any agent instantly.',
                icon: '✅',
              },
            ].map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="glow-border rounded-xl p-6 card-hover"
              >
                <div className="text-4xl mb-4">{item.icon}</div>
                <div className="text-solana-purple font-bold mb-2">Step {item.step}</div>
                <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                <p className="text-gray-400">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive Demo */}
      <section id="demo" className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">Interactive Demo</h2>
          <p className="text-gray-400 text-center mb-12">Try the reputation system live</p>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Agent Leaderboard */}
            <div className="glow-border rounded-xl p-6">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                🏆 Agent Leaderboard
              </h3>
              
              <div className="space-y-3">
                {mockAgents.sort((a, b) => b.score - a.score).map((agent, i) => (
                  <div
                    key={agent.id}
                    onClick={() => setSelectedAgent(agent)}
                    className={`p-4 rounded-lg cursor-pointer transition ${
                      selectedAgent.id === agent.id
                        ? 'bg-solana-purple/20 border border-solana-purple'
                        : 'bg-card-bg hover:bg-card-bg/80'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl font-bold text-gray-500">#{i + 1}</span>
                        <div>
                          <div className="font-semibold">{agent.name}</div>
                          <div className="text-sm text-gray-400">{agent.type} • {agent.id}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-2xl font-bold ${
                          agent.score >= 70 ? 'text-solana-green' :
                          agent.score >= 50 ? 'text-yellow-400' : 'text-red-400'
                        }`}>
                          {agent.score}
                        </div>
                        <div className="text-xs text-gray-400">score</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Agent Details */}
            <div className="space-y-6">
              {/* Score Card */}
              <div className="glow-border rounded-xl p-6">
                <h3 className="text-xl font-bold mb-4">📊 {selectedAgent.name} Details</h3>
                
                <div className="flex items-center gap-6 mb-6">
                  <div 
                    className="relative w-24 h-24 rounded-full score-ring flex items-center justify-center"
                    style={{ '--score': selectedAgent.score } as any}
                  >
                    <div className="absolute inset-2 bg-card-bg rounded-full flex items-center justify-center">
                      <span className="text-2xl font-bold">{selectedAgent.score}</span>
                    </div>
                  </div>
                  
                  <div className="flex-1">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-gray-400">Win Rate:</span>
                        <span className="ml-2 font-semibold">{selectedAgent.successRate}%</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Actions:</span>
                        <span className="ml-2 font-semibold">{selectedAgent.totalActions}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Volume:</span>
                        <span className="ml-2 font-semibold">${selectedAgent.volume.toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Stake:</span>
                        <span className="ml-2 font-semibold">{selectedAgent.stake} SOL</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Score Breakdown */}
                <div className="space-y-2">
                  <div className="text-sm text-gray-400 mb-2">Score Breakdown</div>
                  {[
                    { label: 'Win Rate', value: Math.floor(selectedAgent.successRate * 0.4), max: 40 },
                    { label: 'Volume', value: Math.min(Math.floor(Math.log10(selectedAgent.volume) * 3), 30), max: 30 },
                    { label: 'Age', value: 15, max: 20 },
                    { label: 'Consistency', value: Math.min(Math.floor(selectedAgent.totalActions / 10), 10), max: 10 },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center gap-2">
                      <span className="w-20 text-xs text-gray-400">{item.label}</span>
                      <div className="flex-1 bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-solana-purple to-solana-green h-2 rounded-full"
                          style={{ width: `${(item.value / item.max) * 100}%` }}
                        />
                      </div>
                      <span className="text-xs w-12">{item.value}/{item.max}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Trust Check */}
              <div className="glow-border rounded-xl p-6">
                <h3 className="text-xl font-bold mb-4">🔍 Trust Verification</h3>
                
                <div className="flex gap-4 mb-4">
                  <div className="flex-1">
                    <label className="text-sm text-gray-400 block mb-1">Minimum Score</label>
                    <input
                      type="number"
                      value={minScore}
                      onChange={(e) => setMinScore(Number(e.target.value))}
                      className="w-full bg-card-bg border border-gray-600 rounded-lg px-4 py-2"
                    />
                  </div>
                  <button
                    onClick={checkTrust}
                    className="px-6 py-2 bg-solana-purple hover:bg-solana-purple/80 rounded-lg font-semibold self-end transition"
                  >
                    Check Trust
                  </button>
                </div>

                {trustCheckResult && (
                  <div className={`p-4 rounded-lg ${
                    trustCheckResult.trusted ? 'bg-green-500/20 border border-green-500' : 'bg-red-500/20 border border-red-500'
                  }`}>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{trustCheckResult.trusted ? '✅' : '❌'}</span>
                      <span className="font-bold">{trustCheckResult.trusted ? 'TRUSTED' : 'NOT TRUSTED'}</span>
                    </div>
                    <p className="text-sm text-gray-300 mt-1">{trustCheckResult.reason}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Recent Actions */}
          <div className="mt-8 glow-border rounded-xl p-6">
            <h3 className="text-xl font-bold mb-4">📜 Recent Actions ({selectedAgent.name})</h3>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-gray-400 text-sm">
                    <th className="pb-3">Type</th>
                    <th className="pb-3">Protocol</th>
                    <th className="pb-3">Input</th>
                    <th className="pb-3">Output</th>
                    <th className="pb-3">Outcome</th>
                    <th className="pb-3">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {mockActions.map((action, i) => (
                    <tr key={i} className="border-t border-gray-700">
                      <td className="py-3 font-semibold">{action.type}</td>
                      <td className="py-3 text-gray-300">{action.protocol}</td>
                      <td className="py-3">${action.input}</td>
                      <td className="py-3">${action.output}</td>
                      <td className="py-3">
                        <span className={`px-2 py-1 rounded text-xs ${
                          action.outcome === 'Profit' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                        }`}>
                          {action.outcome}
                        </span>
                      </td>
                      <td className="py-3 text-gray-400">{action.time}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-16 px-4 bg-card-bg/50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Use Cases</h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: '🏦', title: 'DeFi Access', desc: 'Protocols require minimum reputation to interact' },
              { icon: '🤝', title: 'Agent Collaboration', desc: 'Verify agents before forming swarms' },
              { icon: '🗳️', title: 'Governance', desc: 'Reputation-weighted voting power' },
              { icon: '📊', title: 'Marketplaces', desc: 'Show verified track records' },
            ].map((item) => (
              <div key={item.title} className="glow-border rounded-xl p-6 card-hover text-center">
                <div className="text-4xl mb-3">{item.icon}</div>
                <h3 className="font-bold mb-2">{item.title}</h3>
                <p className="text-sm text-gray-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Integration Interest */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Integration Partners</h2>
          <p className="text-gray-400 mb-8">6+ projects building on AgentRep</p>
          
          <div className="flex flex-wrap justify-center gap-4">
            {['SOLPRISM', 'Economic Zones', 'AgentDEX', 'AgentMemory', 'ZNAP', 'SIDEX'].map((partner) => (
              <div key={partner} className="px-4 py-2 bg-card-bg rounded-full text-sm">
                {partner}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-gray-800">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="gradient-text font-bold text-xl">AgentRep</div>
          <div className="flex gap-6 text-gray-400">
            <a href="https://github.com/mabyconnect247-create/Agent---Rep" target="_blank" className="hover:text-white transition">GitHub</a>
            <a href="https://twitter.com/MabyConnect" target="_blank" className="hover:text-white transition">Twitter</a>
            <a href="https://t.me/Mabyconnect2000" target="_blank" className="hover:text-white transition">Telegram</a>
          </div>
          <div className="text-gray-500 text-sm">Built for Solana Agent Hackathon 2026</div>
        </div>
      </footer>
    </main>
  );
}
