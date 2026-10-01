'use strict';
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const { ROOT, loadMaster, renderOutputs } = require('./catalog-data.cjs');
const outputs = renderOutputs(loadMaster());
for (const [name, content] of outputs) { fs.writeFileSync(path.join(ROOT, 'dist', name), content, 'utf8'); }
const directory = path.join(ROOT, 'dist');
const port = Number(process.env.PORT ?? 8766);
/** @type {Record<string,string>} */
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8', '.svg': 'image/svg+xml', '.pdf': 'application/pdf' };
http.createServer((request, response) => {
  try {
    const pathname = decodeURIComponent(new URL(request.url ?? '/', 'http://127.0.0.1').pathname);
    const target = path.resolve(directory, '.' + pathname + (pathname.endsWith('/') ? 'index.html' : ''));
    const relative = path.relative(directory, target);
    if (relative.startsWith('..') || path.isAbsolute(relative) || !fs.existsSync(target) || !fs.statSync(target).isFile()) {
      response.writeHead(404); response.end('Not found'); return;
    }
    response.writeHead(200, { 'content-type': types[path.extname(target)] ?? 'application/octet-stream', 'cache-control': 'no-store' });
    if (request.method === 'HEAD') { response.end(); }
    else { fs.createReadStream(target).pipe(response); }
  } catch (_error) { response.writeHead(400); response.end('Bad request'); }
}).listen(port, '127.0.0.1', () => console.log(`Local catalogue: http://127.0.0.1:${port}/ (dist only)`));
