// Minimal static-file server — no dependencies, pure Node.js
const http = require('http');
const fs   = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const ROOT = __dirname;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css':  'text/css; charset=utf-8',
  '.js':   'application/javascript; charset=utf-8',
  '.jsx':  'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif':  'image/gif',
  '.svg':  'image/svg+xml',
  '.ico':  'image/x-icon',
  '.woff': 'font/woff',
  '.woff2':'font/woff2',
  '.ttf':  'font/ttf',
  '.webp': 'image/webp',
};

const server = http.createServer((req, res) => {
  // Strip query string
  let urlPath = req.url.split('?')[0];

  // Resolve the file path
  let filePath = path.join(ROOT, urlPath);

  // Directory → look for index.html
  if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
    const indexHtml = path.join(filePath, 'index.html');
    if (fs.existsSync(indexHtml)) {
      filePath = indexHtml;
    } else {
      send404(res);
      return;
    }
  }

  // Root → index.html
  if (urlPath === '/') {
    filePath = path.join(ROOT, 'index.html');
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      send404(res);
      return;
    }
    const ext  = path.extname(filePath).toLowerCase();
    const mime = MIME[ext] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': mime });
    res.end(data);
  });
});

function send404(res) {
  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('404 Not Found');
}

server.listen(PORT, () => {
  console.log(`Portfolio running at http://localhost:${PORT}`);
  console.log(`  /           → index.html`);
  console.log(`  /login      → login/index.html`);
  console.log(`  /cms        → cms/index.html`);
  console.log('\nPress Ctrl+C to stop.');
});
