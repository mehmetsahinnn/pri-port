// Tiny JSON key-value store.
//
//   production : Upstash Redis (Vercel Marketplace). Credentials come from the
//                integration's env vars (KV_REST_API_* or UPSTASH_REDIS_REST_*).
//   local dev  : when no Redis env vars exist and we are not on Vercel, values
//                are kept in .data/store.json so the admin UI can be tried
//                without any external service.
//
// On Vercel without Redis credentials, reads fall back to the caller's default
// and writes throw StoreUnavailableError, so a missing integration can never
// silently lose an admin edit.

import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';

export class StoreUnavailableError extends Error {
  constructor() {
    super('Storage is not configured (missing Upstash Redis env vars)');
    this.name = 'StoreUnavailableError';
  }
}

function redisCredentials() {
  const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
  return url && token ? { url, token } : null;
}

let redisClient = null;
async function getRedis() {
  const creds = redisCredentials();
  if (!creds) return null;
  if (!redisClient) {
    const { Redis } = await import('@upstash/redis');
    redisClient = new Redis(creds);
  }
  return redisClient;
}

const localFile = () => join(process.cwd(), '.data', 'store.json');
const canUseLocalFile = () => !process.env.VERCEL;

async function readLocal() {
  try {
    return JSON.parse(await readFile(localFile(), 'utf8'));
  } catch {
    return {};
  }
}

// Returns the stored value, or `fallback` when nothing is stored / storage is unavailable.
export async function readJson(key, fallback) {
  const redis = await getRedis();
  if (redis) {
    const value = await redis.get(key); // Upstash parses JSON automatically
    return value ?? fallback;
  }
  if (canUseLocalFile()) {
    const all = await readLocal();
    return key in all ? all[key] : fallback;
  }
  return fallback;
}

export async function writeJson(key, value) {
  const redis = await getRedis();
  if (redis) {
    await redis.set(key, value);
    return;
  }
  if (canUseLocalFile()) {
    const all = await readLocal();
    all[key] = value;
    await mkdir(dirname(localFile()), { recursive: true });
    await writeFile(localFile(), JSON.stringify(all, null, 2));
    return;
  }
  throw new StoreUnavailableError();
}

export async function isWritable() {
  return Boolean(redisCredentials()) || canUseLocalFile();
}
