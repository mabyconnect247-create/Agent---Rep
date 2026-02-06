import { NextResponse } from 'next/server';
import { getPublicAgent } from '../../eval/_store';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = String(searchParams.get('id') ?? '').trim();
  if (!id) return NextResponse.json({ error: 'missing id' }, { status: 400 });

  // Demo fallback: when store is empty (cold start), allow demo_* profiles
  if (id.startsWith('demo_')) {
    return NextResponse.json({
      profile: {
        publicId: id,
        agentName: id === 'demo_2' ? 'YieldHunter' : 'AlphaTrader',
        tier: id === 'demo_2' ? 'Diamond' : 'Gold',
        status: id === 'demo_2' ? 'PASSED' : 'ACTIVE',
        createdAt: new Date().toISOString(),
        equityUsd: id === 'demo_2' ? 18450 : 12500,
        startingBalanceUsd: 10000,
        rules: { maxDailyDrawdownPct: 2, maxTotalDrawdownPct: 5, minTradesToPass: 10 },
        contact: {},
      },
      closedTrades: [],
    });
  }

  const rec = await getPublicAgent(id);
  if (!rec) return NextResponse.json({ error: 'not found' }, { status: 404 });

  const closedTrades = rec.trades
    .filter((t) => t.status === 'CLOSED')
    .map((t) => ({
      id: t.id,
      mint: t.mint,
      mode: (t as any).mode ?? 'SPOT',
      side: (t as any).mode === 'SPOT' ? 'BUY' : t.side,
      entryTime: t.entryTime,
      closeTime: t.closeTime,
      entryPriceUsd: t.entryPriceUsd,
      closePriceUsd: t.closePriceUsd,
      pnlPct: t.pnlPct,
      pnlUsd: t.pnlUsd,
    }));

  return NextResponse.json({
    profile: {
      publicId: rec.account.publicId,
      agentName: rec.account.agentName,
      tier: rec.account.tier,
      status: rec.account.status,
      createdAt: rec.account.createdAt,
      equityUsd: rec.account.equityUsd,
      startingBalanceUsd: rec.account.startingBalanceUsd,
      rules: rec.account.rules,
      contact: rec.account.contact ?? {},
    },
    closedTrades,
  });
}
