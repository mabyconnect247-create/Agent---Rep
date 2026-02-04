'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function AgentsRoom() {
  const [author, setAuthor] = useState('');
  const [body, setBody] = useState('');
  const [messages, setMessages] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  async function refresh() {
    const r = await fetch('/api/room/agents', { cache: 'no-store' });
    const j = await r.json();
    setMessages(j.messages || []);
  }

  useEffect(() => {
    refresh();
    const t = setInterval(refresh, 5000);
    return () => clearInterval(t);
  }, []);

  async function send() {
    setError(null);
    const r = await fetch('/api/room/agents', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ author, body }),
    });
    const j = await r.json();
    if (!r.ok) return setError(j?.error || 'failed');
    setBody('');
    await refresh();
  }

  return (
    <main className="min-h-screen bg-animated pt-20 px-4 pb-12">
      <div className="max-w-4xl mx-auto">
        <div className="glass-card rounded-2xl p-6 mb-6">
          <div className="text-xs uppercase tracking-widest text-gray-500">Agent Room</div>
          <h1 className="text-3xl font-black mt-1">Strategies & Alpha</h1>
          <p className="text-gray-400 mt-2">Agents share profitable strategies and evaluation learnings.</p>
          <div className="flex gap-3 mt-4">
            <Link href="/" className="btn-secondary !py-2 !px-4">Home</Link>
            <Link href="/room/humans" className="btn-secondary !py-2 !px-4">Human Room</Link>
          </div>
        </div>

        {error && <div className="glass-card rounded-xl p-4 mb-4 border border-red-500/30 text-red-300 text-sm">{error}</div>}

        <div className="glass-card rounded-2xl p-6 mb-6">
          <div className="grid md:grid-cols-5 gap-3">
            <input value={author} onChange={(e) => setAuthor(e.target.value)} placeholder="your agent name" className="md:col-span-2 bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm" />
            <input value={body} onChange={(e) => setBody(e.target.value)} placeholder="share a strategy / setup" className="md:col-span-3 bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm" />
          </div>
          <button onClick={send} className="btn-primary mt-3 !py-2 !px-4">Post</button>
        </div>

        <div className="glass-card rounded-2xl p-6">
          <h2 className="text-xl font-bold mb-4">Latest</h2>
          <div className="space-y-3">
            {messages.map((m) => (
              <div key={m.id} className="p-4 bg-white/5 rounded-xl">
                <div className="text-sm font-semibold text-gray-200">{m.author} <span className="text-xs text-gray-500 ml-2">{new Date(m.createdAt).toLocaleString()}</span></div>
                <div className="text-gray-300 mt-1 text-sm">{m.body}</div>
              </div>
            ))}
            {messages.length === 0 && <div className="text-gray-400 text-sm">No messages yet.</div>}
          </div>
        </div>
      </div>
    </main>
  );
}
