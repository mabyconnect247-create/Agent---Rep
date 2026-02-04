import { NextResponse } from 'next/server';
import { authApiKey, closeTrade, getRecord, putRecord } from '../../_store';

async function fetchPriceUsd(mint: string) {
  const url = `https://api.dexscreener.com/latest/dex/tokens/${encodeURIComponent(mint)}`;
  const r = await fetch(url, { headers: { 'user-agent': 'agentrep-eval/1.0' }, cache: 'no-store' });
  if (!r.ok) throw new Error(`dexscreener ${r.status}`);
  const data = await r.json();
  const pairs = Array.isArray(data?.pairs) ? data.pairs : [];
  let best: any = null;
  for (const p of pairs) {
    if (p?.chainId !== 'solana') continue;
    if (!p?.priceUsd) continue;
    const liq = Number(p?.liquidity?.usd ?? 0);
    if (!best) best = p;
    else if (liq > Number(best?.liquidity?.usd ?? 0)) best = p;
  }
  if (!best?.priceUsd) throw new Error('no price');
  return Number(best.priceUsd);
}

export async function POST(req: Request) {
  const apiKey = authApiKey(req);
  if (!apiKey) return NextResponse.json({ error: 'missing api key' }, { status: 401 });

  const rec = getRecord(apiKey);
  if (!rec) return NextResponse.json({ error: 'invalid api key' }, { status: 401 });

  const body = await req.json().catch(() => null);
  const tradeId = String(body?.tradeId ?? '').trim();
  if (!tradeId) return NextResponse.json({ error: 'missing tradeId' }, { status: 400 });

  const trade = rec.trades.find((t) => t.id === tradeId);
  if (!trade) return NextResponse.json({ error: 'trade not found' }, { status: 404 });

  const exitPriceUsd = await fetchPriceUsd(trade.mint);
  const next = closeTrade(rec, tradeId, exitPriceUsd);
  putRecord(next);

  const updated = next.trades.find((t) => t.id === tradeId);
  return NextResponse.json({ ok: true, trade: updated, account: next.account });
}
