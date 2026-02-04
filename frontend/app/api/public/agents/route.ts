import { NextResponse } from 'next/server';
import { listPublicAgents } from '../../eval/_store';

export async function GET() {
  return NextResponse.json({ agents: listPublicAgents() });
}
