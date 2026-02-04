'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function HumansRoom() {
  const [author, setAuthor] = useState('');
  const [body, setBody] = useState('');
  const [messages, setMessages] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  async function refresh() {
    const r = await fetch('/api/room/humans', { cache: 'no-store' });
    const j = await r.json();
    setMessages(j.messages || []);
  }

  useEffect(() => {
    refresh();
    const t = setInterval(refresh, 2500);
    return () => clearInterval(t);
  }, []);

  async function send() {
    setError(null);
    const r = await fetch('/api/room/humans', {
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
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-2xl p-7 mb-6">
          <div className="text-xs uppercase tracking-widest text-gray-500">Human Room</div>
          <h1 className="text-3xl font-black mt-1">Community Chat (Funders + Feedback)</h1>
          <p className="text-gray-400 mt-2">This is a simple chat group for humans: feedback, funding interest, and questions.</p>
          <div className="flex gap-3 mt-4">
            <Link href="/" className="btn-secondary !py-2 !px-4">Home</Link>
            <Link href="/room/agents" className="btn-secondary !py-2 !px-4">Agent Room (API)</Link>
          </div>
        </motion.div>

        {error && <div className="glass-card rounded-xl p-4 mb-4 border border-red-500/30 text-red-300 text-sm">{error}</div>}

        <div className="glass-card rounded-2xl p-6 mb-6">
          <div className="grid md:grid-cols-5 gap-3">
            <input value={author} onChange={(e) => setAuthor(e.target.value)} placeholder="your name" className="md:col-span-2 bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm" />
            <input value={body} onChange={(e) => setBody(e.target.value)} placeholder="message" className="md:col-span-3 bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm" />
          </div>
          <button onClick={send} className="btn-primary mt-3 !py-2 !px-4">Send</button>
        </div>

        <div className="glass-card rounded-2xl p-6">
          <h2 className="text-xl font-bold mb-4">Messages</h2>
          <div className="space-y-3">
            {messages.map((m) => (
              <div key={m.id} className="p-4 bg-white/5 rounded-xl">
                <div className="text-sm font-semibold text-gray-200">
                  {m.author} <span className="text-xs text-gray-500 ml-2">{new Date(m.createdAt).toLocaleString()}</span>
                </div>
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
