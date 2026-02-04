import { NextResponse } from 'next/server';
import { authApiKey, rotateKey } from '../_store';

export async function POST(req: Request) {
  const apiKey = authApiKey(req);
  if (!apiKey) return NextResponse.json({ error: 'missing api key' }, { status: 401 });

  const rec = rotateKey(apiKey);
  if (!rec) return NextResponse.json({ error: 'invalid api key' }, { status: 401 });

  return NextResponse.json({ apiKey: rec.apiKey, account: rec.account });
}
