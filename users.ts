import { db, writeDb } from "./db.ts";

interface DBData {
  products?: unknown[];
  nextId?: number;
  users?: { id: number; username: string; passwordHash: string }[];
  nextUserId?: number;
}

// simple helper to hash passwords using WebCrypto SHA-256
async function sha256Hex(text: string) {
  const enc = new TextEncoder();
  const data = enc.encode(text);
  const hash = await crypto.subtle.digest('SHA-256', data);
  const b = Array.from(new Uint8Array(hash)).map(n => n.toString(16).padStart(2, '0')).join('');
  return b;
}

export async function createUser({ username, password }: { username: string; password: string }) {
  username = (username || '').toLowerCase().trim();
  if (!username || !password) return { error: 'username and password required' };

  await db.read();
  const data = db.data as DBData || { products: [], nextId: 1, users: [], nextUserId: 1 };
  data.users = data.users || [];
  const exists = data.users.find(u => u.username === username);
  if (exists) return { error: 'user exists' };

  const hash = await sha256Hex(password);
  const id = data.nextUserId || 1;
  const user = { id, username, passwordHash: hash };
  data.users.push(user);
  data.nextUserId = id + 1;
  db.data = data as unknown;
  await writeDb();
  // don't return passwordHash
  return { id: user.id, username: user.username };
}

export async function authenticate({ username, password }: { username: string; password: string }) {
  username = (username || '').toLowerCase().trim();
  if (!username || !password) return { error: 'username and password required' };

  await db.read();
  const data = db.data as DBData || { users: [] };
  const user = (data.users || []).find(u => u.username === username);
  if (!user) return { error: 'invalid credentials' };
  const hash = await sha256Hex(password);
  if (hash !== user.passwordHash) return { error: 'invalid credentials' };

  // simple token (not JWT): base64 of id:username:timestamp
  const payload = `${user.id}:${user.username}:${Date.now()}`;
  const token = btoa(payload);
  return { id: user.id, username: user.username, token };
}

// verify a token previously issued by `authenticate`.
// returns a sanitized user { id, username } or null.
export async function verifyToken(token: string | null | undefined) {
  try {
    if (!token) return null;
    // token expected to be base64 of "id:username:timestamp"
    const payload = atob(String(token));
    const parts = payload.split(':');
    if (parts.length < 2) return null;
    const id = Number(parts[0]);
    const username = parts[1];

    await db.read();
    const data = db.data as DBData || { users: [] };
    const user = (data.users || []).find(u => u.id === id && u.username === username);
    if (!user) return null;
    return { id: user.id, username: user.username };
  } catch (_e) {
    return null;
  }
}
