// Pure Node.js HTTP Server with MongoDB (Permanent Storage)

const http = require("http");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const dns = require("dns");

dotenv.config();

if (process.env.DNS_SERVER) {
  dns.setServers([process.env.DNS_SERVER]);
}

// ================== CONFIG ==================
const PORT = process.env.PORT || 4000;
const MONGO_URI = process.env.MONGO_URI;

// ================== HELPERS ==================
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

// ================== DATABASE ==================
let dbReady = false;

const LyricsSchema = new mongoose.Schema(
  {
    albumName: { type: String, required: true },
    songName: { type: String, required: true },
    bengaliLyrics: { type: String, required: true },
    createdAt: { type: Number, default: () => Date.now() },
  },
  { collection: "lyrics" },
);

const Lyrics = mongoose.model("Lyrics", LyricsSchema);

async function connectMongo() {
  try {
    await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 6000,
    });
    dbReady = true;
    console.log("✅ MongoDB Connected");
  } catch (err) {
    console.error("❌ MongoDB connection failed:", err.message);
    process.exit(1); // stop server if DB fails
  }
}

connectMongo();

// ================== SERVER ==================
const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = url.pathname;

  // ---- CORS ----
  if (req.method === "OPTIONS") {
    res.writeHead(204, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    });
    return res.end();
  }

  // ---- Health ----
  if (pathname === "/api/health" && req.method === "GET") {
    return sendJson(res, 200, { ok: true, db: dbReady });
  }

  // ---- GET ALL LYRICS ----
  if (pathname === "/api/lyrics" && req.method === "GET") {
    const list = await Lyrics.find().sort({ createdAt: 1 }).lean();
    const normalized = list.map((l) => ({
      id: l._id.toString(),
      albumName: l.albumName,
      songName: l.songName,
      bengaliLyrics: l.bengaliLyrics,
      createdAt: l.createdAt,
    }));
    return sendJson(res, 200, normalized);
  }

  // ---- ADD LYRICS ----
  if (pathname === "/api/lyrics" && req.method === "POST") {
    const { albumName, songName, bengaliLyrics } = await parseBody(req);

    if (!albumName || !songName || !bengaliLyrics) {
      return sendJson(res, 400, { error: "Missing fields" });
    }

    const saved = await Lyrics.create({
      albumName,
      songName,
      bengaliLyrics,
    });

    return sendJson(res, 201, {
      id: saved._id.toString(),
      albumName: saved.albumName,
      songName: saved.songName,
      bengaliLyrics: saved.bengaliLyrics,
      createdAt: saved.createdAt,
    });
  }

  // ---- UPDATE / DELETE ----
  const match = pathname.match(/^\/api\/lyrics\/(.+)$/);
  if (match) {
    const id = match[1];

    if (req.method === "PUT") {
      const body = await parseBody(req);
      const updated = await Lyrics.findByIdAndUpdate(id, body, { new: true });

      if (!updated) {
        return sendJson(res, 404, { error: "Not found" });
      }

      return sendJson(res, 200, {
        id: updated._id.toString(),
        albumName: updated.albumName,
        songName: updated.songName,
        bengaliLyrics: updated.bengaliLyrics,
        createdAt: updated.createdAt,
      });
    }

    if (req.method === "DELETE") {
      const deleted = await Lyrics.findByIdAndDelete(id);
      return sendJson(res, 200, { ok: !!deleted });
    }
  }

  // ---- NOT FOUND ----
  sendJson(res, 404, { error: "Not found" });
});

// ================== START ==================
server.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
