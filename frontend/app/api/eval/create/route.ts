import { NextResponse } from 'next/server';
import { createEvalAccount } from '../_store';

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const agentName = String(body?.agentName ?? '').trim();
  const tier = String(body?.tier ?? 'Bronze') as any;

  if (!agentName) {
    return NextResponse.json({ error: 'missing agentName' }, { status: 400 });
  }

  const startingBalanceUsd = Number(body?.startingBalanceUsd ?? 10_000);
  const rules = {
    maxDailyDrawdownPct: Number(body?.rules?.maxDailyDrawdownPct ?? 2),
    maxTotalDrawdownPct: Number(body?.rules?.maxTotalDrawdownPct ?? 5),
    minTradesToPass: Number(body?.rules?.minTradesToPass ?? 10),
  };

  const rec = createEvalAccount({ agentName, tier, startingBalanceUsd, rules });
  return NextResponse.json({
    apiKey: rec.apiKey,
    account: rec.account,
  });
}
