// Pure Node.js HTTP server (Railway compatible)

const http = require("http");
const fs = require("fs");
const path = require("path");
const url = require("url");

// ================== CONFIG ==================
const PORT = process.env.PORT || 4000;
const DATA_DIR = path.join(__dirname, "data");
const LYRICS_FILE = path.join(DATA_DIR, "lyrics.json");

// ================== FILE HELPERS ==================
function ensureDataFile() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(LYRICS_FILE)) {
      fs.writeFileSync(LYRICS_FILE, "[]", "utf-8");
    }
  } catch (err) {
    console.error("File init error:", err);
  }
}

function readLyrics() {
  try {
    ensureDataFile();
    const raw = fs.readFileSync(LYRICS_FILE, "utf-8");
    return JSON.parse(raw || "[]");
  } catch {
    return [];
  }
}

function writeLyrics(list) {
  try {
    ensureDataFile();
    fs.writeFileSync(LYRICS_FILE, JSON.stringify(list, null, 2), "utf-8");
  } catch (err) {
    console.error("Write error:", err);
  }
}

// ================== RESPONSE HELPERS ==================
function sendJson(res, status, data) {
  res.writeHead(status, {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  });
  res.end(JSON.stringify(data));
}

function parseBody(req) {
  return new Promise((resolve) => {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => {
      try {
        resolve(JSON.parse(body || "{}"));
      } catch {
        resolve({});
      }
    });
  });
}

// ================== INIT FILE SYSTEM ==================
ensureDataFile();

// ================== SERVER ==================
const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname || "";

  // ---- CORS Preflight ----
  if (req.method === "OPTIONS") {
    res.writeHead(204, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    });
    return res.end();
  }

  // ---- Health Check ----
  if (pathname === "/api/health" && req.method === "GET") {
    return sendJson(res, 200, { ok: true });
  }

  // ---- Get Lyrics ----
  if (pathname === "/api/lyrics" && req.method === "GET") {
    return sendJson(res, 200, readLyrics());
  }

  // ---- Add Lyrics ----
  if (pathname === "/api/lyrics" && req.method === "POST") {
    const body = await parseBody(req);
    const { albumName, songName, bengaliLyrics } = body;

    if (!albumName || !songName || !bengaliLyrics) {
      return sendJson(res, 400, { error: "Missing fields" });
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

  const match = pathname.match(/^\/api\/lyrics\/(.+)$/);
  if (match) {
    const id = decodeURIComponent(match[1]);
    const list = readLyrics();
    const index = list.findIndex((l) => l.id === id);

    if (index === -1) {
      return sendJson(res, 404, { error: "Not found" });
    }

    if (req.method === "PUT") {
      const body = await parseBody(req);
      list[index] = { ...list[index], ...body };
      writeLyrics(list);
      return sendJson(res, 200, list[index]);
    }

    if (req.method === "DELETE") {
      list.splice(index, 1);
      writeLyrics(list);
      return sendJson(res, 200, { ok: true });
    }
  }

  // ---- Not Found ----
  sendJson(res, 404, { error: "Not found" });
});

// ================== LISTEN (RAILWAY SAFE) ==================
server.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
