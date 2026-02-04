'use client';

import { useState, createContext, useContext } from 'react';
import Navbar from './Navbar';

// Global context for app state
export interface AppState {
  mode: 'human' | 'agent';
  setMode: (mode: 'human' | 'agent') => void;
  connected: boolean;
  walletAddress: string;
  connect: () => Promise<void>;
  disconnect: () => void;
}

const AppContext = createContext<AppState | null>(null);

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
}

export default function Providers({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<'human' | 'agent'>('human');
  const [connected, setConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');

  const connect = async () => {
    // Simulate wallet connection
    await new Promise((r) => setTimeout(r, 500));
    const addr =
      '7xKX' +
      Math.random().toString(36).substring(2, 6) +
      '...' +
      Math.random().toString(36).substring(2, 5);
    setWalletAddress(addr);
    setConnected(true);
  };

  const disconnect = () => {
    setConnected(false);
    setWalletAddress('');
  };

  return (
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
  );
}
