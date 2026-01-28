// Minimal Node server with file-based persistence for lyrics
// No external dependencies
const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = process.env.PORT || 4000;
const DATA_DIR = path.join(__dirname, 'data');
const LYRICS_FILE = path.join(DATA_DIR, 'lyrics.json');

function ensureDataFile() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(LYRICS_FILE)) fs.writeFileSync(LYRICS_FILE, '[]', 'utf-8');
}

function readLyrics() {
  ensureDataFile();
  try {
    const raw = fs.readFileSync(LYRICS_FILE, 'utf-8');
    return JSON.parse(raw || '[]');
  } catch {
    return [];
  }
}

function writeLyrics(list) {
  ensureDataFile();
  fs.writeFileSync(LYRICS_FILE, JSON.stringify(list, null, 2), 'utf-8');
}

function sendJson(res, status, data) {
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  });
  res.end(JSON.stringify(data));
}

function parseBody(req) {
  return new Promise((resolve) => {
    let body = '';
    req.on('data', (chunk) => (body += chunk));
    req.on('end', () => {
      try {
        resolve(JSON.parse(body || '{}'));
      } catch {
        resolve({});
      }
    });
  });
}

const server = http.createServer(async (req, res) => {
  const parsed = url.parse(req.url, true);
  const pathname = parsed.pathname || '';

  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    });
    return res.end();
  }

  if (pathname === '/api/health' && req.method === 'GET') {
    return sendJson(res, 200, { ok: true });
  }

  if (pathname === '/api/lyrics' && req.method === 'GET') {
    const list = readLyrics();
    return sendJson(res, 200, list);
  }

  if (pathname === '/api/lyrics' && req.method === 'POST') {
    const body = await parseBody(req);
    const { albumName, songName, bengaliLyrics } = body;
    if (!albumName || !songName || !bengaliLyrics) {
      return sendJson(res, 400, { error: 'Missing fields' });
    }
    const list = readLyrics();
    const newItem = {
      id: `lyrics_${Date.now()}`,
      albumName,
      songName,
      bengaliLyrics,
      createdAt: Date.now(),
    };
    list.push(newItem);
    writeLyrics(list);
    return sendJson(res, 201, newItem);
  }

  const lyricsIdMatch = pathname.match(/^\/api\/lyrics\/(.+)$/);
  if (lyricsIdMatch) {
    const id = decodeURIComponent(lyricsIdMatch[1]);
    if (req.method === 'PUT') {
      const body = await parseBody(req);
      const list = readLyrics();
      const idx = list.findIndex((l) => l.id === id);
      if (idx === -1) return sendJson(res, 404, { error: 'Not found' });
      list[idx] = {
        ...list[idx],
        albumName: body.albumName ?? list[idx].albumName,
        songName: body.songName ?? list[idx].songName,
        bengaliLyrics: body.bengaliLyrics ?? list[idx].bengaliLyrics,
      };
      writeLyrics(list);
      return sendJson(res, 200, list[idx]);
    }
    if (req.method === 'DELETE') {
      const list = readLyrics();
      const filtered = list.filter((l) => l.id !== id);
      writeLyrics(filtered);
      return sendJson(res, 200, { ok: true });
    }
  }

  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Not found' }));
});

server.listen(PORT, () => {
  console.log(`Lyrics API server running on http://localhost:${PORT}`);
});
