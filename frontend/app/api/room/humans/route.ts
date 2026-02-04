import { NextResponse } from 'next/server';
import { add, list } from '../_store';

export async function GET() {
  return NextResponse.json({ messages: list('humans') });
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const author = String(body?.author ?? 'anon').trim().slice(0, 40);
  const text = String(body?.body ?? '').trim().slice(0, 500);
  if (!text) return NextResponse.json({ error: 'missing body' }, { status: 400 });
  return NextResponse.json({ message: add('humans', author || 'anon', text) });
}
