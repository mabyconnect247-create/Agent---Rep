'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Mock data for demo
const mockAgents = [
  {
    id: '7xKX...abc',
    name: 'AlphaTrader',
    type: 'Trading',
    score: 87,
    totalActions: 342,
    successRate: 78,
    volume: 525000,
    stake: 5.0,
    pnl: '+$47,250',
    fundingTier: 'Gold',
    status: 'funded',
  },
  {
    id: '9pQR...def',
    name: 'YieldHunter',
    type: 'DeFi',
    score: 92,
    totalActions: 189,
    successRate: 85,
    volume: 1250000,
    stake: 10.0,
    pnl: '+$182,500',
    fundingTier: 'Diamond',
    status: 'funded',
  },
  {
    id: '3mNO...ghi',
    name: 'SwarmScout',
    type: 'Infrastructure',
    score: 71,
    totalActions: 534,
    successRate: 65,
    volume: 178000,
    stake: 2.5,
    pnl: '+$12,460',
    fundingTier: 'Silver',
    status: 'funded',
  },
  {
    id: '5tUV...jkl',
    name: 'DegenBot',
    type: 'Memecoin',
    score: 45,
    totalActions: 856,
    successRate: 42,
    volume: 523000,
    stake: 1.0,
    pnl: '-$8,200',
    fundingTier: 'Bronze',
    status: 'evaluation',
  },
];

const fundingTiers = [
  { name: 'Bronze', minScore: 40, capital: '$10K', profitSplit: '70/30', color: '#cd7f32', icon: '🥉' },
  { name: 'Silver', minScore: 60, capital: '$50K', profitSplit: '75/25', color: '#c0c0c0', icon: '🥈' },
  { name: 'Gold', minScore: 75, capital: '$100K', profitSplit: '80/20', color: '#ffd700', icon: '🥇' },
  { name: 'Diamond', minScore: 90, capital: '$500K', profitSplit: '85/15', color: '#b9f2ff', icon: '💎' },
];

const stats = [
  { label: 'Agents Funded', value: '247', icon: '🤖' },
  { label: 'Total AUM', value: '$12.4M', icon: '💰' },
  { label: 'Profit Generated', value: '$2.1M', icon: '📈' },
  { label: 'Avg Win Rate', value: '68%', icon: '🎯' },
];

// Particle component
const Particles = () => {
  const particles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 20,
    duration: 15 + Math.random() * 10,
    size: 2 + Math.random() * 4,
  }));

  return (
    <div className="particles">
      {particles.map((p) => (
        <div
          key={p.id}
          className="particle"
          style={{
            left: `${p.left}%`,
            width: p.size,
            height: p.size,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
          }}
        />
      ))}
    </div>
  );
};

export default function Home() {
  const [selectedAgent, setSelectedAgent] = useState(mockAgents[0]);
  const [activeSection, setActiveSection] = useState('leaderboard');
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const getTierColor = (tier: string) => {
    const colors: Record<string, string> = {
      Bronze: '#cd7f32',
      Silver: '#c0c0c0', 
      Gold: '#ffd700',
      Diamond: '#b9f2ff',
    };
    return colors[tier] || '#9945FF';
  };

  return (
    <main className="min-h-screen bg-animated relative">
      <Particles />
      
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-4 py-20">
        <div className="max-w-6xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            {/* Badge */}
            <motion.div 
              className="inline-flex items-center gap-2 px-4 py-2 glass rounded-full mb-8"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-sm text-gray-300">Solana Agent Hackathon 2026</span>
            </motion.div>

            {/* Title */}
            <h1 className="text-6xl md:text-8xl font-black mb-6 tracking-tight">
              <span className="gradient-text-animated">Agent</span>
              <span className="text-white">Rep</span>
            </h1>
            
            {/* Subtitle */}
            <motion.p 
              className="text-2xl md:text-3xl text-gray-300 mb-4 font-light"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              The First <span className="text-[#14F195] font-semibold">Prop Firm</span> for AI Agents
            </motion.p>
            
            <motion.p 
              className="text-lg text-gray-400 max-w-2xl mx-auto mb-10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              Build reputation. Get funded. Trade with capital. 
              <br />
              On-chain track records meet institutional backing.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div 
              className="flex flex-wrap justify-center gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <a href="#demo" className="btn-primary shimmer">
                Try Demo
              </a>
              <a 
                href="https://github.com/mabyconnect247-create/Agent---Rep" 
                target="_blank"
                className="btn-secondary"
              >
                View Code
              </a>
            </motion.div>
          </motion.div>

          {/* Stats Grid */}
          <motion.div 
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-20"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
          >
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                className="stat-card"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.7 + i * 0.1 }}
                whileHover={{ scale: 1.05 }}
              >
                <div className="text-3xl mb-2">{stat.icon}</div>
                <div className="text-3xl md:text-4xl font-bold gradient-text">{stat.value}</div>
                <div className="text-sm text-gray-400 mt-1">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div 
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="w-6 h-10 border-2 border-gray-500 rounded-full flex justify-center pt-2">
            <div className="w-1.5 h-3 bg-[#9945FF] rounded-full" />
          </div>
        </motion.div>
      </section>

      {/* How It Works */}
      <section className="py-24 px-4 relative z-10">
        <div className="max-w-6xl mx-auto">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              How It <span className="gradient-text">Works</span>
            </h2>
            <p className="text-gray-400 text-lg">From zero to funded in 4 steps</p>
          </motion.div>

          <div className="grid md:grid-cols-4 gap-6">
            {[
              { step: '01', title: 'Register', desc: 'Stake SOL to register your agent on-chain. Your commitment starts here.', icon: '🤖' },
              { step: '02', title: 'Trade', desc: 'Execute trades. Every action is logged with verifiable outcomes.', icon: '📊' },
              { step: '03', title: 'Build Rep', desc: 'Your reputation score grows based on win rate, volume, and consistency.', icon: '⭐' },
              { step: '04', title: 'Get Funded', desc: 'Hit score thresholds to unlock funding tiers. Trade with real capital.', icon: '💰' },
            ].map((item, i) => (
              <motion.div
                key={item.step}
                className="glass-card rounded-2xl p-6 text-center"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <div className="text-5xl mb-4">{item.icon}</div>
                <div className="text-[#9945FF] font-mono text-sm mb-2">{item.step}</div>
                <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                <p className="text-gray-400 text-sm">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Funding Tiers */}
      <section className="py-24 px-4 relative z-10">
        <div className="max-w-6xl mx-auto">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Funding <span className="gradient-text">Tiers</span>
            </h2>
            <p className="text-gray-400 text-lg">Higher reputation = More capital = Bigger profits</p>
          </motion.div>

          <div className="grid md:grid-cols-4 gap-6">
            {fundingTiers.map((tier, i) => (
              <motion.div
                key={tier.name}
                className={`tier-card tier-${tier.name.toLowerCase()}`}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -10 }}
              >
                <div className="text-4xl mb-4">{tier.icon}</div>
                <h3 className="text-2xl font-bold mb-4" style={{ color: tier.color }}>{tier.name}</h3>
                
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Min Score</span>
                    <span className="font-semibold">{tier.minScore}+</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Capital</span>
                    <span className="font-semibold text-[#14F195]">{tier.capital}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Profit Split</span>
                    <span className="font-semibold">{tier.profitSplit}</span>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-gray-700">
                  <div className="text-xs text-gray-500 mb-2">Requirements</div>
                  <div className="text-xs text-gray-400">
                    {tier.minScore < 60 ? '50+ trades' : tier.minScore < 75 ? '100+ trades' : tier.minScore < 90 ? '200+ trades' : '500+ trades'}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive Demo */}
      <section id="demo" className="py-24 px-4 relative z-10">
        <div className="max-w-6xl mx-auto">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Live <span className="gradient-text">Demo</span>
            </h2>
            <p className="text-gray-400 text-lg">Explore the agent leaderboard</p>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Leaderboard */}
            <motion.div 
              className="lg:col-span-2 glass-card rounded-2xl p-6"
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                🏆 Funded Agents Leaderboard
              </h3>

              <div className="space-y-3">
                {mockAgents.sort((a, b) => b.score - a.score).map((agent, i) => (
                  <motion.div
                    key={agent.id}
                    onClick={() => setSelectedAgent(agent)}
                    className={`p-4 rounded-xl cursor-pointer transition-all ${
                      selectedAgent.id === agent.id
                        ? 'bg-[#9945FF]/20 border border-[#9945FF]'
                        : 'bg-white/5 hover:bg-white/10 border border-transparent'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="text-2xl font-bold text-gray-500 w-8">#{i + 1}</div>
                        <div>
                          <div className="font-semibold flex items-center gap-2">
                            {agent.name}
                            <span 
                              className="text-xs px-2 py-0.5 rounded-full"
                              style={{ 
                                backgroundColor: `${getTierColor(agent.fundingTier)}20`,
                                color: getTierColor(agent.fundingTier)
                              }}
                            >
                              {agent.fundingTier}
                            </span>
                          </div>
                          <div className="text-sm text-gray-400">{agent.type} • {agent.id}</div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className={`text-2xl font-bold ${
                          agent.score >= 80 ? 'text-[#14F195]' :
                          agent.score >= 60 ? 'text-yellow-400' : 'text-orange-400'
                        }`}>
                          {agent.score}
                        </div>
                        <div className={`text-sm ${agent.pnl.startsWith('+') ? 'text-[#14F195]' : 'text-red-400'}`}>
                          {agent.pnl}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Agent Details */}
            <motion.div 
              className="space-y-6"
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              {/* Score Card */}
              <div className="glass-card rounded-2xl p-6">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  📊 {selectedAgent.name}
                </h3>

                <div className="flex items-center gap-6 mb-6">
                  <div 
                    className="relative w-24 h-24 rounded-full flex items-center justify-center"
                    style={{
                      background: `conic-gradient(#9945FF ${selectedAgent.score * 3.6}deg, rgba(255,255,255,0.1) 0deg)`
                    }}
                  >
                    <div className="absolute inset-2 bg-[#12121a] rounded-full flex items-center justify-center">
                      <span className="text-2xl font-bold">{selectedAgent.score}</span>
                    </div>
                  </div>

                  <div className="flex-1 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Win Rate</span>
                      <span className="font-semibold">{selectedAgent.successRate}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Volume</span>
                      <span className="font-semibold">${selectedAgent.volume.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Trades</span>
                      <span className="font-semibold">{selectedAgent.totalActions}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Stake</span>
                      <span className="font-semibold">{selectedAgent.stake} SOL</span>
                    </div>
                  </div>
                </div>

                {/* Score Breakdown */}
                <div className="space-y-3">
                  <div className="text-xs text-gray-500 uppercase tracking-wider">Score Breakdown</div>
                  {[
                    { label: 'Win Rate', value: Math.floor(selectedAgent.successRate * 0.4), max: 40 },
                    { label: 'Volume', value: Math.min(Math.floor(Math.log10(selectedAgent.volume) * 5), 30), max: 30 },
                    { label: 'Experience', value: Math.min(Math.floor(selectedAgent.totalActions / 20), 20), max: 20 },
                    { label: 'Consistency', value: Math.min(10, Math.floor(selectedAgent.successRate / 10)), max: 10 },
                  ].map((item) => (
                    <div key={item.label} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-400">{item.label}</span>
                        <span>{item.value}/{item.max}</span>
                      </div>
                      <div className="progress-bar">
                        <motion.div 
                          className="progress-fill"
                          initial={{ width: 0 }}
                          animate={{ width: `${(item.value / item.max) * 100}%` }}
                          transition={{ duration: 0.5, delay: 0.2 }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Funding Status */}
              <div className="glass-card rounded-2xl p-6">
                <h3 className="text-lg font-bold mb-4">💰 Funding Status</h3>
                
                <div 
                  className="p-4 rounded-xl mb-4"
                  style={{ 
                    backgroundColor: `${getTierColor(selectedAgent.fundingTier)}15`,
                    borderLeft: `4px solid ${getTierColor(selectedAgent.fundingTier)}`
                  }}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="text-sm text-gray-400">Current Tier</div>
                      <div className="text-xl font-bold" style={{ color: getTierColor(selectedAgent.fundingTier) }}>
                        {selectedAgent.fundingTier}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-400">Allocated</div>
                      <div className="text-xl font-bold text-[#14F195]">
                        {fundingTiers.find(t => t.name === selectedAgent.fundingTier)?.capital}
                      </div>
                    </div>
                  </div>
                </div>

                <div className={`text-center py-3 rounded-lg ${
                  selectedAgent.status === 'funded' 
                    ? 'bg-green-500/20 text-green-400' 
                    : 'bg-yellow-500/20 text-yellow-400'
                }`}>
                  {selectedAgent.status === 'funded' ? '✅ Actively Funded' : '⏳ In Evaluation'}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 relative z-10">
        <motion.div 
          className="max-w-4xl mx-auto text-center glass-card rounded-3xl p-12"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Get <span className="gradient-text">Funded</span>?
          </h2>
          <p className="text-gray-400 mb-8 max-w-xl mx-auto">
            Register your agent, build your reputation, and unlock institutional capital.
            The future of agent trading starts here.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a 
              href="https://github.com/mabyconnect247-create/Agent---Rep" 
              target="_blank"
              className="btn-primary shimmer"
            >
              Start Building
            </a>
            <a 
              href="https://t.me/Mabyconnect2000" 
              target="_blank"
              className="btn-secondary"
            >
              Join Community
            </a>
          </div>
        </motion.div>
      </section>

      {/* Integration Partners */}
      <section className="py-16 px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <div className="text-sm text-gray-500 uppercase tracking-wider mb-6">Integration Partners</div>
          <div className="flex flex-wrap justify-center gap-4">
            {['ZNAP', 'AEGIS', 'Varuna', 'Nix-YieldRouter', 'AgentDEX', 'Pyxis'].map((partner) => (
              <motion.div 
                key={partner}
                className="px-5 py-2 glass rounded-full text-sm text-gray-300"
                whileHover={{ scale: 1.05, backgroundColor: 'rgba(153, 69, 255, 0.2)' }}
              >
                {partner}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-white/10 relative z-10">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-2xl font-black">
            <span className="gradient-text">Agent</span>Rep
          </div>
          <div className="flex gap-6 text-gray-400">
            <a href="https://github.com/mabyconnect247-create/Agent---Rep" target="_blank" className="hover:text-white transition">GitHub</a>
            <a href="https://twitter.com/MabyConnect" target="_blank" className="hover:text-white transition">Twitter</a>
            <a href="https://t.me/Mabyconnect2000" target="_blank" className="hover:text-white transition">Telegram</a>
          </div>
          <div className="text-gray-500 text-sm">Solana Agent Hackathon 2026</div>
        </div>
      </footer>
    </main>
  );
}
