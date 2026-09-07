import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import { Message } from '@/lib/models';
import { sanitizeText } from '@/lib/sanitize';

export const dynamic = 'force-dynamic';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Best-effort per-IP throttle so the form cannot be hammered. */
const hits = new Map<string, { count: number; firstAt: number }>();
const WINDOW_MS = 15 * 60 * 1000;
const MAX_PER_WINDOW = 5;

function throttled(ip: string): boolean {
  const now = Date.now();
  const entry = hits.get(ip);
  if (!entry || now - entry.firstAt > WINDOW_MS) {
    hits.set(ip, { count: 1, firstAt: now });
    return false;
  }
  entry.count += 1;
  return entry.count > MAX_PER_WINDOW;
}

export async function POST(request: Request) {
  try {
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') ||
      'unknown';

    if (throttled(ip)) {
      return NextResponse.json(
        { error: 'Too many messages sent. Please try again later.' },
        { status: 429 }
      );
    }

    const payload = await request.json();

    // Honeypot: silently accept, but store nothing.
    if (typeof payload.company === 'string' && payload.company.trim()) {
      return NextResponse.json({ ok: true });
    }

    const name = sanitizeText(payload.name, 120);
    const email = sanitizeText(payload.email, 180).toLowerCase();
    const subject = sanitizeText(payload.subject, 160);
    const message = sanitizeText(payload.message, 4000);

    if (!name || !email || !message) {
      return NextResponse.json({ error: 'Please complete every required field.' }, { status: 400 });
    }
    if (!EMAIL_RE.test(email)) {
      return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 });
    }

    await dbConnect();
    await Message.create({ name, email, subject, message });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Contact submission failed:', error);
    return NextResponse.json({ error: 'Could not send the message.' }, { status: 500 });
  }
}
