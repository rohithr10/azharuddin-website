import 'server-only';
import { cookies } from 'next/headers';
import { SignJWT, jwtVerify } from 'jose';

export const SESSION_COOKIE = 'az_admin_session';
const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export type SessionPayload = {
  userId: string;
  username: string;
};

function secretKey(): Uint8Array {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 16) {
    throw new Error(
      'SESSION_SECRET is missing or too short. Set a value of at least 32 characters in .env.local'
    );
  }
  return new TextEncoder().encode(secret);
}

export async function signSession(payload: SessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE}s`)
    .sign(secretKey());
}

export async function verifySession(token?: string | null): Promise<SessionPayload | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secretKey());
    if (typeof payload.userId !== 'string' || typeof payload.username !== 'string') return null;
    return { userId: payload.userId, username: payload.username };
  } catch {
    return null;
  }
}

export async function createSessionCookie(payload: SessionPayload): Promise<void> {
  const token = await signSession(payload);
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: SESSION_MAX_AGE,
  });
}

export async function destroySessionCookie(): Promise<void> {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

export async function getSession(): Promise<SessionPayload | null> {
  const store = await cookies();
  return verifySession(store.get(SESSION_COOKIE)?.value);
}

/** Throws when called outside an authenticated admin request. */
export async function requireSession(): Promise<SessionPayload> {
  const session = await getSession();
  if (!session) throw new Error('Not authenticated');
  return session;
}

/* --------------------------------------------------------------- *
 * Best-effort brute-force throttle for the login form. In-memory is
 * enough for a single-admin site; swap for a shared store if the app
 * is ever scaled to multiple instances.
 * --------------------------------------------------------------- */
const attempts = new Map<string, { count: number; firstAt: number }>();
const WINDOW_MS = 10 * 60 * 1000;
const MAX_ATTEMPTS = 8;

export function registerFailedAttempt(key: string): void {
  const now = Date.now();
  const entry = attempts.get(key);
  if (!entry || now - entry.firstAt > WINDOW_MS) {
    attempts.set(key, { count: 1, firstAt: now });
    return;
  }
  entry.count += 1;
}

export function isThrottled(key: string): boolean {
  const entry = attempts.get(key);
  if (!entry) return false;
  if (Date.now() - entry.firstAt > WINDOW_MS) {
    attempts.delete(key);
    return false;
  }
  return entry.count >= MAX_ATTEMPTS;
}

export function clearAttempts(key: string): void {
  attempts.delete(key);
}
