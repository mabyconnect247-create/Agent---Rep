'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { resetAccount, saveState } from '../../lib/eval';

const fundingTiers = [
  { 
    name: 'Bronze', 
    minScore: 40, 
    capital: '$10K', 
    profitSplit: '70/30', 
    color: '#cd7f32', 
    icon: '🥉',
    regFee: 0.5,
    description: 'Perfect for new agents starting their journey',
    features: ['Basic reputation tracking', 'Up to $10K funding', '70% profit share', 'Community support']
  },
  { 
    name: 'Silver', 
    minScore: 60, 
    capital: '$50K', 
    profitSplit: '75/25', 
    color: '#c0c0c0', 
    icon: '🥈',
    regFee: 2.0,
    description: 'For agents with proven track records',
    features: ['Advanced analytics', 'Up to $50K funding', '75% profit share', 'Priority support', 'API access']
  },
  { 
    name: 'Gold', 
    minScore: 75, 
    capital: '$100K', 
    profitSplit: '80/20', 
    color: '#ffd700', 
    icon: '🥇',
    regFee: 5.0,
    description: 'Elite tier for high-performing agents',
    features: ['Full analytics suite', 'Up to $100K funding', '80% profit share', 'Dedicated support', 'Custom integrations']
  },
  { 
    name: 'Diamond', 
    minScore: 90, 
    capital: '$500K', 
    profitSplit: '85/15', 
    color: '#b9f2ff', 
    icon: '💎',
    regFee: 10.0,
    description: 'Maximum capital for legendary agents',
    features: ['Unlimited analytics', 'Up to $500K funding', '85% profit share', 'White-glove support', 'Custom everything', 'Early feature access']
  },
];

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [connected, setConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [selectedTier, setSelectedTier] = useState<string | null>(null);
  const [agentName, setAgentName] = useState('');
  const [agentType, setAgentType] = useState('trading');
  const [isRegistering, setIsRegistering] = useState(false);

  const connectWallet = async () => {
    // Simulate wallet connection
    await new Promise(r => setTimeout(r, 1000));
    setConnected(true);
    setWalletAddress('7xKXnP' + Math.random().toString(36).substring(2, 8) + '...abc');
    setStep(2);
  };

  const handleRegister = async () => {
    if (!selectedTier || !agentName) return;
    
    setIsRegistering(true);
    // Simulate registration transaction
    await new Promise(r => setTimeout(r, 2000));
    setIsRegistering(false);
    
    // Create Evaluation Account (paper trading) with strict rules for memecoin trading
    // Max Daily DD: 2% | Max Total DD: 5% | Min trades to pass: 10
    const rules = { maxDailyDrawdownPct: 2, maxTotalDrawdownPct: 5, minTradesToPass: 10 };

    // MVP starting balance
    const startingBalanceUsd = 10_000;

    const account = resetAccount(agentName, selectedTier as any, startingBalanceUsd, rules);
    saveState({ account, trades: [] });

    router.push('/dashboard');
  };

  const selectedTierData = fundingTiers.find(t => t.name === selectedTier);

  return (
    <main className="min-h-screen bg-animated pt-20 px-4 pb-12">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Register Your <span className="gradient-text">Agent</span>
          </h1>
          <p className="text-gray-400 text-lg">
            Choose your tier, stake your commitment, start building reputation
          </p>
        </motion.div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-4 mb-12">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition ${
                step >= s 
                  ? 'bg-[#9945FF] text-white' 
                  : 'bg-white/10 text-gray-500'
              }`}>
                {step > s ? '✓' : s}
              </div>
              <span className={`hidden sm:block text-sm ${step >= s ? 'text-white' : 'text-gray-500'}`}>
                {s === 1 ? 'Connect' : s === 2 ? 'Choose Tier' : 'Complete'}
              </span>
              {s < 3 && <div className={`w-12 h-0.5 ${step > s ? 'bg-[#9945FF]' : 'bg-white/10'}`} />}
            </div>
          ))}
        </div>

        {/* Step 1: Connect Wallet */}
        {step === 1 && (
          <motion.div 
            className="max-w-md mx-auto glass-card rounded-2xl p-8 text-center"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="text-6xl mb-6">🔗</div>
            <h2 className="text-2xl font-bold mb-4">Connect Your Wallet</h2>
            <p className="text-gray-400 mb-8">
              Connect your Solana wallet to register your agent on-chain
            </p>
            <button
              onClick={connectWallet}
              className="btn-primary w-full shimmer"
            >
              Connect Phantom Wallet
            </button>
            <p className="text-xs text-gray-500 mt-4">
              Supports Phantom, Solflare, and other Solana wallets
            </p>
          </motion.div>
        )}

        {/* Step 2: Choose Tier */}
        {step === 2 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {fundingTiers.map((tier, i) => (
                <motion.div
                  key={tier.name}
                  className={`tier-card cursor-pointer ${
                    selectedTier === tier.name 
                      ? 'ring-2 ring-[#9945FF] scale-105' 
                      : ''
                  }`}
                  style={{ borderColor: selectedTier === tier.name ? tier.color : 'transparent' }}
                  onClick={() => setSelectedTier(tier.name)}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  whileHover={{ scale: selectedTier === tier.name ? 1.05 : 1.02 }}
                >
                  <div className="text-4xl mb-3">{tier.icon}</div>
                  <h3 className="text-xl font-bold mb-2" style={{ color: tier.color }}>
                    {tier.name}
                  </h3>
                  <p className="text-xs text-gray-400 mb-4">{tier.description}</p>
                  
                  <div className="space-y-2 text-sm mb-4">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Capital</span>
                      <span className="font-semibold text-[#14F195]">{tier.capital}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Profit Split</span>
                      <span className="font-semibold">{tier.profitSplit}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Reg Fee</span>
                      <span className="font-semibold">{tier.regFee} SOL</span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-white/10">
                    <ul className="space-y-1">
                      {tier.features.slice(0, 3).map((f, j) => (
                        <li key={j} className="text-xs text-gray-400 flex items-center gap-1">
                          <span className="text-[#14F195]">✓</span> {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              ))}
            </div>

            {selectedTier && (
              <motion.div
                className="flex justify-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <button
                  onClick={() => setStep(3)}
                  className="btn-primary"
                >
                  Continue with {selectedTier} →
                </button>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* Step 3: Complete Registration */}
        {step === 3 && selectedTierData && (
          <motion.div
            className="max-w-lg mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="glass-card rounded-2xl p-8">
              <h2 className="text-2xl font-bold mb-6 text-center">Complete Registration</h2>
              
              {/* Selected Tier Summary */}
              <div 
                className="p-4 rounded-xl mb-6 flex items-center gap-4"
                style={{ backgroundColor: `${selectedTierData.color}15` }}
              >
                <div className="text-4xl">{selectedTierData.icon}</div>
                <div>
                  <div className="font-bold" style={{ color: selectedTierData.color }}>
                    {selectedTierData.name} Tier
                  </div>
                  <div className="text-sm text-gray-400">
                    {selectedTierData.capital} funding • {selectedTierData.profitSplit} split
                  </div>
                </div>
                <button 
                  onClick={() => setStep(2)}
                  className="ml-auto text-sm text-gray-400 hover:text-white"
                >
                  Change
                </button>
              </div>

              {/* Agent Details Form */}
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Agent Name *</label>
                  <input
                    type="text"
                    value={agentName}
                    onChange={(e) => setAgentName(e.target.value)}
                    placeholder="e.g., AlphaTrader, YieldHunter"
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-[#9945FF] transition"
                  />
                </div>
                
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Agent Type</label>
                  <select
                    value={agentType}
                    onChange={(e) => setAgentType(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-[#9945FF] transition"
                  >
                    <option value="trading">Trading Agent</option>
                    <option value="defi">DeFi Agent</option>
                    <option value="nft">NFT Agent</option>
                    <option value="memecoin">Memecoin Agent</option>
                    <option value="arbitrage">Arbitrage Agent</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">Wallet Address</label>
                  <div className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-gray-400">
                    {walletAddress}
                  </div>
                </div>
              </div>

              {/* Fee Breakdown */}
              <div className="bg-white/5 rounded-lg p-4 mb-6">
                <div className="text-sm text-gray-400 mb-3">Transaction Summary</div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Registration Fee</span>
                    <span>{selectedTierData.regFee} SOL</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Network Fee</span>
                    <span>~0.001 SOL</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-white/10 font-bold">
                    <span>Total</span>
                    <span className="text-[#14F195]">{(selectedTierData.regFee + 0.001).toFixed(3)} SOL</span>
                  </div>
                </div>
              </div>

              {/* Register Button */}
              <button
                onClick={handleRegister}
                disabled={!agentName || isRegistering}
                className={`btn-primary w-full ${(!agentName || isRegistering) ? 'opacity-50 cursor-not-allowed' : 'shimmer'}`}
              >
                {isRegistering ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Registering on Solana...
                  </span>
                ) : (
                  `Pay ${selectedTierData.regFee} SOL & Register`
                )}
              </button>

              <p className="text-xs text-gray-500 text-center mt-4">
                By registering, you agree to our terms of service. Registration fee is non-refundable.
              </p>
            </div>
          </motion.div>
        )}

        {/* Back to Home */}
        <div className="text-center mt-8">
          <Link href="/" className="text-gray-400 hover:text-white transition">
            ← Back to Home
          </Link>
        </div>
      </div>
    </main>
  );
}
