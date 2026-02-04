'use client';

import { useState, createContext, useContext } from 'react';
import { Inter } from 'next/font/google';
import './globals.css';
import Navbar from '../components/Navbar';

const inter = Inter({ subsets: ['latin'] });

// Global context for app state
interface AppState {
  mode: 'human' | 'agent';
  setMode: (mode: 'human' | 'agent') => void;
  connected: boolean;
  walletAddress: string;
  connect: () => void;
  disconnect: () => void;
}

const AppContext = createContext<AppState | null>(null);

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mode, setMode] = useState<'human' | 'agent'>('human');
  const [connected, setConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');

  const connect = async () => {
    // Simulate wallet connection
    await new Promise(r => setTimeout(r, 500));
    const addr = '7xKX' + Math.random().toString(36).substring(2, 6) + '...' + Math.random().toString(36).substring(2, 5);
    setWalletAddress(addr);
    setConnected(true);
  };

  const disconnect = () => {
    setConnected(false);
    setWalletAddress('');
  };

  return (
    <html lang="en">
      <head>
        <title>AgentRep - The First Prop Firm for AI Agents</title>
        <meta name="description" content="Build reputation. Get funded. Trade with capital. On-chain track records meet institutional backing on Solana." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className={inter.className}>
        <AppContext.Provider value={{ mode, setMode, connected, walletAddress, connect, disconnect }}>
          <Navbar 
            mode={mode}
            setMode={setMode}
            connected={connected}
            walletAddress={walletAddress}
            onConnect={connect}
            onDisconnect={disconnect}
          />
          {children}
        </AppContext.Provider>
      </body>
    </html>
  );
}
