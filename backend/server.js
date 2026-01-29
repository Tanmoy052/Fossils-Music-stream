// Pure Node.js HTTP server (Railway compatible)

const http = require("http");
const fs = require("fs");
const path = require("path");
const url = require("url");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config({ path: path.join(__dirname, ".env") });
console.log("MONGO_URI =", process.env.MONGO_URI);

// ================== CONFIG ==================
const PORT = process.env.PORT || 4000;
const DATA_DIR = path.join(__dirname, "data");
const LYRICS_FILE = path.join(DATA_DIR, "lyrics.json");
const MONGO_URI = process.env.MONGO_URI || "";

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
// Optional MongoDB connection and model
let dbReady = false;
let LyricsModel = null;
const LyricsSchema = new mongoose.Schema(
  {
    albumName: { type: String, required: true },
    songName: { type: String, required: true },
    bengaliLyrics: { type: String, required: true },
    createdAt: { type: Number, default: () => Date.now() },
  },
  { collection: "lyrics" },
);
async function connectMongo() {
  if (!MONGO_URI) {
    console.log("MongoDB URI not set. Using file-based storage.");
    return;
  }
  try {
    const options = {
      serverSelectionTimeoutMS: 6000,
      dbName: undefined,
    };
    await mongoose.connect(MONGO_URI, options);
    dbReady = true;
    LyricsModel = mongoose.model("Lyrics", LyricsSchema);
    console.log("✅ MongoDB Connected");
  } catch (err) {
    dbReady = false;
    console.error("❌ MongoDB connection error:", err?.message || err);
    console.log("Falling back to file-based storage.");
  }
}
connectMongo();

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
    return sendJson(res, 200, { ok: true, db: dbReady });
  }

  // ---- Get Lyrics ----
  if (pathname === "/api/lyrics" && req.method === "GET") {
    if (dbReady && LyricsModel) {
      const list = await LyricsModel.find().sort({ createdAt: 1 }).lean();
      return sendJson(res, 200, list);
    }
    return sendJson(res, 200, readLyrics());
  }

  // ---- Add Lyrics ----
  if (pathname === "/api/lyrics" && req.method === "POST") {
    const body = await parseBody(req);
    const { albumName, songName, bengaliLyrics } = body;

    if (!albumName || !songName || !bengaliLyrics) {
      return sendJson(res, 400, { error: "Missing fields" });
    }

    if (dbReady && LyricsModel) {
      const saved = await LyricsModel.create({
        albumName,
        songName,
        bengaliLyrics,
      });
      return sendJson(res, 201, saved);
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
    if (req.method === "PUT") {
      const body = await parseBody(req);
      if (dbReady && LyricsModel) {
        const updated = await LyricsModel.findByIdAndUpdate(id, body, {
          new: true,
        });
        if (!updated) {
          return sendJson(res, 404, { error: "Not found" });
        }
        return sendJson(res, 200, updated);
      }
      const list = readLyrics();
      const index = list.findIndex((l) => l.id === id);
      if (index === -1) {
        return sendJson(res, 404, { error: "Not found" });
      }
      list[index] = { ...list[index], ...body };
      writeLyrics(list);
      return sendJson(res, 200, list[index]);
    }

    if (req.method === "DELETE") {
      if (dbReady && LyricsModel) {
        const del = await LyricsModel.findByIdAndDelete(id);
        return sendJson(res, 200, { ok: !!del });
      }
      const list = readLyrics();
      const index = list.findIndex((l) => l.id === id);
      if (index === -1) {
        return sendJson(res, 404, { error: "Not found" });
      }
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
