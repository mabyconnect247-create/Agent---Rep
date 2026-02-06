// Vercel KV helper (Upstash Redis) with graceful fallback.
// On Vercel, linking KV injects KV_REST_API_URL / KV_REST_API_TOKEN.

type KVClient = {
  get<T = any>(key: string): Promise<T | null>;
  set(key: string, value: any, opts?: any): Promise<any>;
  del(key: string): Promise<any>;
  sadd(key: string, ...members: string[]): Promise<any>;
  smembers(key: string): Promise<string[]>;
};

let _client: KVClient | null | undefined;

export function kvEnabled() {
  return Boolean(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);
}

export async function kvClient(): Promise<KVClient | null> {
  if (_client !== undefined) return _client;
  if (!kvEnabled()) {
    _client = null;
    return _client;
  }
  try {
    // dynamic import so local dev doesn't require the package/config
    const mod: any = await import('@vercel/kv');
    _client = mod.kv as KVClient;
    return _client;
  } catch {
    _client = null;
    return _client;
  }
}

export async function kvGetJSON<T>(key: string): Promise<T | null> {
  const kv = await kvClient();
  if (!kv) return null;
  return (await kv.get<T>(key)) ?? null;
}

export async function kvSetJSON(key: string, value: any): Promise<void> {
  const kv = await kvClient();
  if (!kv) return;
  await kv.set(key, value);
}

export async function kvDel(key: string): Promise<void> {
  const kv = await kvClient();
  if (!kv) return;
  await kv.del(key);
}

export async function kvSAdd(key: string, member: string): Promise<void> {
  const kv = await kvClient();
  if (!kv) return;
  await kv.sadd(key, member);
}

export async function kvSMembers(key: string): Promise<string[]> {
  const kv = await kvClient();
  if (!kv) return [];
  return (await kv.smembers(key)) ?? [];
}
