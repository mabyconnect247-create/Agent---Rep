import { NextResponse } from 'next/server';

// Simple price proxy for Solana meme tokens.
// Uses DexScreener token endpoint and returns a best-effort USD price.
// NOTE: For hackathon MVP only. Production should add caching, rate limits,
// and multiple sources (Birdeye/Jupiter) + pair selection logic.

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const mint = searchParams.get('mint');

  if (!mint) {
    return NextResponse.json({ error: 'missing mint' }, { status: 400 });
  }

  try {
    const url = `https://api.dexscreener.com/latest/dex/tokens/${encodeURIComponent(mint)}`;
    const r = await fetch(url, {
      // DexScreener is public; set a UA for sanity.
      headers: { 'user-agent': 'agentrep-hackathon/1.0' },
      // Keep it fresh
      cache: 'no-store',
    });

    if (!r.ok) {
      return NextResponse.json({ error: `dexscreener ${r.status}` }, { status: 502 });
    }

    const data = await r.json();
    const pairs = Array.isArray(data?.pairs) ? data.pairs : [];

    // Pick the pair with the highest liquidity USD that has priceUsd.
    let best: any = null;
    for (const p of pairs) {
      if (!p?.priceUsd) continue;
      const liq = Number(p?.liquidity?.usd ?? 0);
      if (!best) best = p;
      else if (liq > Number(best?.liquidity?.usd ?? 0)) best = p;
    }

    if (!best?.priceUsd) {
      return NextResponse.json({ error: 'no price found' }, { status: 404 });
    }

    return NextResponse.json({
      mint,
      priceUsd: Number(best.priceUsd),
      pairAddress: best.pairAddress,
      dexId: best.dexId,
      liquidityUsd: Number(best?.liquidity?.usd ?? 0),
      fetchedAt: new Date().toISOString(),
    });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? 'unknown error' }, { status: 500 });
  }
}
