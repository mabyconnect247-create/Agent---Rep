// Simple in-memory chat store for hackathon MVP.
// Resets on cold start/redeploy.

export interface RoomMessage {
  id: string;
  room: 'agents' | 'humans';
  author: string;
  body: string;
  createdAt: string;
}

const msgs: RoomMessage[] = (globalThis as any).__AGENTREP_ROOM_MSGS__ ?? [];
(globalThis as any).__AGENTREP_ROOM_MSGS__ = msgs;

export function list(room: 'agents' | 'humans') {
  return msgs.filter((m) => m.room === room).slice(-50).reverse();
}

export function add(room: 'agents' | 'humans', author: string, body: string) {
  const m: RoomMessage = {
    id: `m_${Math.random().toString(36).slice(2, 10)}`,
    room,
    author,
    body,
    createdAt: new Date().toISOString(),
  };
  msgs.push(m);
  return m;
}
