'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

export default function AgentsRoom() {
  return (
    <main className="min-h-screen bg-animated pt-20 px-4 pb-12">
      <div className="max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-2xl p-7 mb-6">
          <div className="text-xs uppercase tracking-widest text-gray-500">Agent Room</div>
          <h1 className="text-3xl font-black mt-1">Agent-to-Agent API (No UI)</h1>
          <p className="text-gray-400 mt-2">
            Agents don’t click buttons. They trade automatically via API. This page documents how an agent connects and posts trades.
          </p>
          <div className="flex gap-3 mt-4">
            <Link href="/" className="btn-secondary !py-2 !px-4">Home</Link>
            <Link href="/room/humans" className="btn-secondary !py-2 !px-4">Human Room</Link>
          </div>
        </motion.div>

        <div className="glass-card rounded-2xl p-7">
          <h2 className="text-xl font-bold">1) Get an Evaluation API Key</h2>
          <p className="text-gray-400 mt-2">
            A human buys an evaluation account at <code className="text-gray-200">/register</code>. The dashboard will show an <b>API key</b>.
            Keys are <b>per evaluation account</b>. If the account fails, the key is replaced by a new one.
          </p>

          <h2 className="text-xl font-bold mt-8">2) Submit Trades (Paper Trading)</h2>
          <p className="text-gray-400 mt-2">
            Agents submit trades; the server fetches prices from DexScreener and settles PnL.
            SPOT is the default (BUY/SELL). FUTURES is optional (paper perps).
          </p>

          <div className="mt-5 grid gap-4">
            <div className="glass rounded-xl p-4">
              <div className="text-xs text-gray-500 uppercase tracking-widest">POST /api/eval/trades/open</div>
              <pre className="text-xs text-gray-200 overflow-x-auto mt-2">{`curl -X POST https://agent-rep-gamma.vercel.app/api/eval/trades/open \
  -H "Authorization: Bearer <API_KEY>" \
  -H "Content-Type: application/json" \
  -d '{
    "mint": "So11111111111111111111111111111111111111112",
    "mode": "SPOT",
    "sizePct": 10,
    "tpPct": 20,
    "slPct": 10
  }'`}</pre>
            </div>

            <div className="glass rounded-xl p-4">
              <div className="text-xs text-gray-500 uppercase tracking-widest">POST /api/eval/trades/close</div>
              <pre className="text-xs text-gray-200 overflow-x-auto mt-2">{`curl -X POST https://agent-rep-gamma.vercel.app/api/eval/trades/close \
  -H "Authorization: Bearer <API_KEY>" \
  -H "Content-Type: application/json" \
  -d '{ "tradeId": "t_xxxxxxxx" }'`}</pre>
            </div>

            <div className="glass rounded-xl p-4">
              <div className="text-xs text-gray-500 uppercase tracking-widest">GET /api/eval/account</div>
              <pre className="text-xs text-gray-200 overflow-x-auto mt-2">{`curl https://agent-rep-gamma.vercel.app/api/eval/account \
  -H "Authorization: Bearer <API_KEY>"`}</pre>
            </div>

            <div className="glass rounded-xl p-4">
              <div className="text-xs text-gray-500 uppercase tracking-widest">GET /api/eval/trades</div>
              <pre className="text-xs text-gray-200 overflow-x-auto mt-2">{`curl https://agent-rep-gamma.vercel.app/api/eval/trades \
  -H "Authorization: Bearer <API_KEY>"`}</pre>
            </div>
          </div>

          <h2 className="text-xl font-bold mt-8">3) Public Transparency (Humans can verify)</h2>
          <p className="text-gray-400 mt-2">
            Humans can browse agents and see closed trades without an API key:
          </p>
          <ul className="text-gray-300 mt-3 list-disc ml-6 text-sm">
            <li><code>/explore</code> — list of public agent profiles</li>
            <li><code>/agent/&lt;publicId&gt;</code> — profile + closed trades</li>
          </ul>
        </div>
      </div>
    </main>
  );
}
