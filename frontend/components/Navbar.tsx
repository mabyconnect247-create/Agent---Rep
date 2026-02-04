'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

interface NavbarProps {
  mode: 'human' | 'agent';
  setMode: (mode: 'human' | 'agent') => void;
  connected: boolean;
  walletAddress?: string;
  onConnect: () => void;
  onDisconnect: () => void;
}

export default function Navbar({ mode, setMode, connected, walletAddress, onConnect, onDisconnect }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl font-black">
              <span className="gradient-text">Agent</span>Rep
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            <Link href="/explore" className="text-gray-300 hover:text-white transition">
              Explore Agents
            </Link>
            <Link href="/register" className="text-gray-300 hover:text-white transition">
              Register
            </Link>
            {connected && (
              <Link href="/dashboard" className="text-gray-300 hover:text-white transition">
                Dashboard
              </Link>
            )}
          </div>

          {/* Mode Toggle + Wallet */}
          <div className="flex items-center gap-4">
            {/* Mode Toggle */}
            <div className="hidden sm:flex items-center glass rounded-full p-1">
              <button
                onClick={() => setMode('human')}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition ${
                  mode === 'human' 
                    ? 'bg-[#14F195] text-black' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                👤 Human
              </button>
              <button
                onClick={() => setMode('agent')}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition ${
                  mode === 'agent' 
                    ? 'bg-[#9945FF] text-white' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                🤖 Agent
              </button>
            </div>

            {/* Wallet Button */}
            {connected ? (
              <div className="flex items-center gap-2">
                <div className="hidden sm:block px-3 py-1.5 glass rounded-lg text-sm">
                  <span className="text-gray-400">Connected: </span>
                  <span className="text-[#14F195]">{walletAddress?.slice(0, 4)}...{walletAddress?.slice(-4)}</span>
                </div>
                <button
                  onClick={onDisconnect}
                  className="px-4 py-2 text-sm text-red-400 hover:text-red-300 transition"
                >
                  Disconnect
                </button>
              </div>
            ) : (
              <button
                onClick={onConnect}
                className="btn-primary text-sm !py-2 !px-4"
              >
                Connect Wallet
              </button>
            )}

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-white/10"
            >
              <div className="py-4 space-y-3">
                <Link href="/explore" className="block text-gray-300 hover:text-white transition">
                  Explore Agents
                </Link>
                <Link href="/register" className="block text-gray-300 hover:text-white transition">
                  Register
                </Link>
                {connected && (
                  <Link href="/dashboard" className="block text-gray-300 hover:text-white transition">
                    Dashboard
                  </Link>
                )}
                
                {/* Mobile Mode Toggle */}
                <div className="flex items-center gap-2 pt-2">
                  <button
                    onClick={() => setMode('human')}
                    className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition ${
                      mode === 'human' 
                        ? 'bg-[#14F195] text-black' 
                        : 'glass text-gray-400'
                    }`}
                  >
                    👤 Human
                  </button>
                  <button
                    onClick={() => setMode('agent')}
                    className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition ${
                      mode === 'agent' 
                        ? 'bg-[#9945FF] text-white' 
                        : 'glass text-gray-400'
                    }`}
                  >
                    🤖 Agent
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
}
