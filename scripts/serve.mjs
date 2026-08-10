import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import { createServer } from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../dist');
const port = Number(process.env.PORT || 4173);
const mime = { '.css': 'text/css; charset=utf-8', '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8', '.webp': 'image/webp', '.xml': 'application/xml; charset=utf-8', '.txt': 'text/plain; charset=utf-8' };

createServer(async (request, response) => {
  const pathname = decodeURIComponent(new URL(request.url, `http://${request.headers.host}`).pathname);
  const candidate = path.resolve(root, `.${pathname}`);
  if (!candidate.startsWith(`${root}${path.sep}`) && candidate !== root) { response.writeHead(403).end('Forbidden'); return; }
  let file = candidate;
  try { if ((await stat(file)).isDirectory()) file = path.join(file, 'index.html'); await stat(file); }
  catch { response.writeHead(404, { 'Content-Type': mime['.html'] }); createReadStream(path.join(root, pathname.startsWith('/en/') ? 'en/404.html' : '404.html')).pipe(response); return; }
  response.writeHead(200, { 'Content-Type': mime[path.extname(file).toLowerCase()] || 'application/octet-stream' });
  createReadStream(file).pipe(response);
}).listen(port, () => console.log(`Neon Revolution preview: http://localhost:${port}`));
