import { NextResponse } from 'next/server';
import { authApiKey, getRecord } from '../_store';

export async function GET(req: Request) {
  const apiKey = authApiKey(req);
  if (!apiKey) return NextResponse.json({ error: 'missing api key' }, { status: 401 });

  const rec = await getRecord(apiKey);
  if (!rec) return NextResponse.json({ error: 'invalid api key' }, { status: 401 });

  return NextResponse.json({ account: rec.account });
}
