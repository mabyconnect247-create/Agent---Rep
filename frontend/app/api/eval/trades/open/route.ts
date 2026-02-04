import { NextResponse } from 'next/server';
import { authApiKey, getRecord, openTrade, putRecord } from '../../_store';

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
  const mint = String(body?.mint ?? '').trim();
  const mode = (String(body?.mode ?? 'SPOT') as any) || 'SPOT';
  const side = (String(body?.side ?? 'LONG') as any) || 'LONG';
  const leverage = Number(body?.leverage ?? 1);
  const sizePct = Number(body?.sizePct ?? 10);
  const tpPct = body?.tpPct === undefined ? undefined : Number(body.tpPct);
  const slPct = body?.slPct === undefined ? undefined : Number(body.slPct);

  if (!mint) return NextResponse.json({ error: 'missing mint' }, { status: 400 });
  if (!(sizePct > 0 && sizePct <= 100)) return NextResponse.json({ error: 'sizePct must be 1-100' }, { status: 400 });

  const entryPriceUsd = await fetchPriceUsd(mint);

  const next = openTrade(rec, {
    mint,
    mode,
    side: mode === 'SPOT' ? 'LONG' : side,
    leverage: mode === 'FUTURES' ? Math.max(1, leverage) : undefined,
    sizePct,
    tpPct,
    slPct,
    entryPriceUsd,
  });

  putRecord(next);
  return NextResponse.json({ ok: true, trade: next.trades[0], account: next.account });
}
