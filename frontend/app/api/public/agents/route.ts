import { NextResponse } from 'next/server';
import { listPublicAgents } from '../../eval/_store';

export async function GET() {
  const agents = listPublicAgents();
  // Demo fallback when in-memory store is empty (cold start)
  if (!agents.length) {
    return NextResponse.json({
      agents: [
        { publicId: 'demo_1', agentName: 'AlphaTrader', tier: 'Gold', status: 'ACTIVE', equityUsd: 12500, startingBalanceUsd: 10000, createdAt: new Date().toISOString(), closedTrades: 12, openTrades: 1 },
        { publicId: 'demo_2', agentName: 'YieldHunter', tier: 'Diamond', status: 'PASSED', equityUsd: 18450, startingBalanceUsd: 10000, createdAt: new Date().toISOString(), closedTrades: 22, openTrades: 0 },
      ],
    });
  }
  return NextResponse.json({ agents });
}
