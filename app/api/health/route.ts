import { NextResponse } from 'next/server';
import mongoose from 'mongoose';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * Deployment diagnostic. Reports whether the environment is configured and
 * whether the database is actually reachable, without ever revealing the
 * credentials themselves.
 *
 *   GET /api/health
 */
export async function GET() {
  const checks: Record<string, unknown> = {};
  let ok = true;

  /* ---- Environment ---- */
  const uri = process.env.MONGODB_URI;
  const secret = process.env.SESSION_SECRET;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

  if (!uri) {
    ok = false;
    checks.MONGODB_URI = {
      status: 'MISSING',
      fix: 'Add MONGODB_URI in your host’s environment variables. .env.local is git-ignored and never ships with the deployment.',
    };
  } else {
    const isLocal = /localhost|127\.0\.0\.1/.test(uri);
    // Pointing at localhost is correct in development and fatal in production.
    const localIsFatal = isLocal && process.env.NODE_ENV === 'production';

    // Strip the scheme, then any credentials, to leave just host:port.
    const host =
      uri
        .replace(/^[a-z+]+:\/\//i, '')
        .replace(/^[^@/]*@/, '')
        .split('/')[0]
        .split('?')[0] || 'unknown';

    checks.MONGODB_URI = {
      status: localIsFatal ? 'INVALID_FOR_HOSTING' : 'set',
      scheme: uri.split('://')[0],
      host,
      ...(localIsFatal
        ? {
            fix: 'This points at localhost, which does not exist on a hosting platform. Use a MongoDB Atlas connection string (mongodb+srv://...).',
          }
        : {}),
    };
    if (localIsFatal) ok = false;
  }

  if (!secret || secret.length < 16) {
    ok = false;
    checks.SESSION_SECRET = {
      status: secret ? 'TOO_SHORT' : 'MISSING',
      fix: 'Set SESSION_SECRET to at least 32 random characters. Without it, admin sign-in cannot work.',
    };
  } else {
    checks.SESSION_SECRET = { status: 'set', length: secret.length };
  }

  checks.NEXT_PUBLIC_SITE_URL = siteUrl
    ? { status: 'set', value: siteUrl }
    : {
        status: 'missing',
        fix: 'Optional, but set it to your real domain so canonical URLs, Open Graph tags, the sitemap and share links are correct.',
      };

  /* ---- Database connectivity ---- */
  if (uri) {
    const started = Date.now();
    try {
      const connection = await mongoose
        .createConnection(uri, { serverSelectionTimeoutMS: 6000 })
        .asPromise();

      const collections = await connection.db?.listCollections().toArray();
      const counts: Record<string, number> = {};
      for (const name of ['articles', 'categories', 'pages', 'settings', 'users']) {
        if (collections?.some((c) => c.name === name)) {
          counts[name] = await connection.db!.collection(name).countDocuments();
        }
      }

      await connection.close();

      checks.database = {
        status: 'connected',
        ms: Date.now() - started,
        collections: counts,
        ...(Object.keys(counts).length === 0
          ? { note: 'Connected, but the database is empty. Run the seed script against this database.' }
          : {}),
        ...(counts.users === 0
          ? { note: 'No admin user exists yet. Run the seed script against this database.' }
          : {}),
      };
    } catch (error) {
      ok = false;
      const message = error instanceof Error ? error.message : String(error);
      let fix = 'Check that the connection string is correct and the database is running.';

      if (/ENOTFOUND|querySrv|getaddrinfo/i.test(message)) {
        fix =
          'The cluster hostname could not be resolved. Copy the connection string again from Atlas → Connect → Drivers, and check for typos or a missing database name.';
      } else if (/IP|whitelist|not allowed to access|no primary/i.test(message)) {
        fix =
          'The database is refusing connections from your host. In MongoDB Atlas: Network Access → Add IP Address → Allow access from anywhere (0.0.0.0/0), since serverless functions do not have a fixed IP.';
      } else if (/auth|password|credentials/i.test(message)) {
        fix =
          'Authentication failed. Check the username and password in the connection string, and URL-encode any special characters in the password.';
      } else if (/timed out|ETIMEDOUT|ServerSelection/i.test(message)) {
        fix =
          'Could not reach the database in time. Usually the Atlas IP allowlist (add 0.0.0.0/0) or a cluster that is paused.';
      }

      checks.database = { status: 'FAILED', ms: Date.now() - started, error: message, fix };
    }
  } else {
    checks.database = { status: 'skipped', reason: 'No MONGODB_URI to connect with.' };
  }

  return NextResponse.json(
    { ok, environment: process.env.NODE_ENV, checks },
    { status: ok ? 200 : 503, headers: { 'cache-control': 'no-store' } }
  );
}
