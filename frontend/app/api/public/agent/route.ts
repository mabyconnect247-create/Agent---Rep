import { NextResponse } from 'next/server';
import { getPublicAgent } from '../../eval/_store';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = String(searchParams.get('id') ?? '').trim();
  if (!id) return NextResponse.json({ error: 'missing id' }, { status: 400 });

  const rec = getPublicAgent(id);
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
