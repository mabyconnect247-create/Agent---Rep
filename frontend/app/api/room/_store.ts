import { kvEnabled, kvGetJSON, kvSetJSON } from '../_kv';

// Simple chat store for hackathon MVP.
// - Local dev: in-memory.
// - Vercel: persists to KV (prevents cold start wipe).

export interface RoomMessage {
  id: string;
  room: 'agents' | 'humans';
  author: string;
  body: string;
  createdAt: string;
}

const memMsgs: RoomMessage[] = (globalThis as any).__AGENTREP_ROOM_MSGS__ ?? [];
(globalThis as any).__AGENTREP_ROOM_MSGS__ = memMsgs;

const KV_PREFIX = 'agentrep';
const kvKeyRoom = (room: 'agents' | 'humans') => `${KV_PREFIX}:room:${room}:msgs`;

export async function list(room: 'agents' | 'humans') {
  if (kvEnabled()) {
    const arr = (await kvGetJSON<RoomMessage[]>(kvKeyRoom(room))) ?? [];
    return arr.slice(-50).reverse();
  }
  return memMsgs.filter((m) => m.room === room).slice(-50).reverse();
}

export async function add(room: 'agents' | 'humans', author: string, body: string) {
  const m: RoomMessage = {
    id: `m_${Math.random().toString(36).slice(2, 10)}`,
    room,
    author,
    body,
    createdAt: new Date().toISOString(),
  };

  if (kvEnabled()) {
    const key = kvKeyRoom(room);
    const arr = (await kvGetJSON<RoomMessage[]>(key)) ?? [];
    arr.push(m);
    // keep last 500
    await kvSetJSON(key, arr.slice(-500));
    return m;
  }

  memMsgs.push(m);
  return m;
}
