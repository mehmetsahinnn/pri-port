// Local dev server that needs no Vercel login: serves ./src and routes /api/<name>
// to src/api/<name>.js with a Vercel-style req/res (query, parsed JSON body,
// res.status().json().send()).
//
//   npm run dev:local            # http://localhost:3000
//   PORT=4000 npm run dev:local
//
// Admin endpoints need ADMIN_USERNAME / ADMIN_PASSWORD / ADMIN_SECRET. Put them
// in .env.local (gitignored) as KEY=value lines; without them those endpoints
// answer 500 and the public site still works.

import http from 'node:http';
import { existsSync, readFileSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = join(fileURLToPath(import.meta.url), '..', '..');
const srcDir = join(root, 'src');
const port = Number(process.env.PORT || 3000);

const envFile = join(root, '.env.local');
if (existsSync(envFile)) {
  for (const line of readFileSync(envFile, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
    if (m && !(m[1] in process.env)) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
}

const types = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css',
  '.webp': 'image/webp', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon', '.json': 'application/json', '.webmanifest': 'application/manifest+json',
  '.woff2': 'font/woff2', '.txt': 'text/plain; charset=utf-8', '.pdf': 'application/pdf',
};

async function runApi(req, res, url) {
  const name = url.pathname.slice('/api/'.length);
  // `_`-prefixed and nested paths are not endpoints (same as Vercel).
  if (!name || name.startsWith('_') || name.includes('/')) {
    res.statusCode = 404;
    return res.end();
  }
  const file = join(srcDir, 'api', `${name}.js`);
  if (!existsSync(file)) {
    res.statusCode = 404;
    return res.end();
  }

  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const raw = Buffer.concat(chunks).toString();
  req.query = Object.fromEntries(url.searchParams);
  try { req.body = raw ? JSON.parse(raw) : undefined; } catch { req.body = raw; }

  res.status = (code) => { res.statusCode = code; return res; };
  res.json = (data) => { res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify(data)); return res; };
  res.send = (body) => { res.end(body); return res; };

  try {
    const mod = await import(`${pathToFileURL(file).href}?t=${Date.now()}`); // re-read on every request
    await mod.default(req, res);
  } catch (err) {
    console.error(`[api/${name}]`, err);
    if (!res.headersSent) res.statusCode = 500;
    res.end();
  }
}

http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  if (url.pathname.startsWith('/api/')) return runApi(req, res, url);

  // Mirror production: dependencies and manifests are not served.
  if (/^\/(node_modules\/|package(-lock)?\.json$)/.test(url.pathname)) {
    res.statusCode = 404;
    return res.end('Not found');
  }
  const requested = url.pathname === '/' ? '/index.html' : url.pathname;
  const rel = normalize(decodeURIComponent(requested)).replace(/^(\.\.[/\\])+/, '');
  try {
    const buf = await readFile(join(srcDir, rel));
    res.setHeader('Content-Type', types[extname(rel)] || 'application/octet-stream');
    res.end(buf);
  } catch {
    res.statusCode = 404;
    res.end('Not found');
  }
}).listen(port, () => console.log(`Local dev server: http://localhost:${port}`));
