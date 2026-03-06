// Pure Node.js HTTP Server with MongoDB Persistence

const http = require("http");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");
const dns = require("dns");

// Fix DNS resolution issues
dns.setServers(["8.8.8.8", "8.8.4.4"]);

// Load .env from the same directory as this script
dotenv.config({ path: path.join(__dirname, ".env") });

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

// ================== DATABASE (MongoDB) ==================
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

// Add a virtual 'id' field that maps to '_id'
LyricsSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

// Ensure virtual fields are serialized
LyricsSchema.set("toJSON", {
  virtuals: true,
  transform: function (doc, ret) {
    delete ret._id;
    delete ret.__v;
  },
});

const Lyrics = mongoose.model("Lyrics", LyricsSchema);

async function connectMongo() {
  try {
    if (!MONGO_URI) {
      console.error("❌ MONGO_URI is missing in .env");
      return;
    }
    await mongoose.connect(MONGO_URI);
    dbReady = true;
    console.log("✅ MongoDB Connected");
  } catch (err) {
    console.error("❌ MongoDB connection failed:", err.message);
    // Don't exit process, allow server to run but DB operations will fail
  }
}

connectMongo();

// ================== SERVER ==================
const server = http.createServer(async (req, res) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    res.writeHead(204, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    });
    return res.end();
  }

  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = url.pathname;

  // ---- Health ----
  if (pathname === "/api/health" && req.method === "GET") {
    return sendJson(res, 200, { ok: true, db: dbReady, type: "mongodb" });
  }

  // ---- GET ALL LYRICS ----
  if (pathname === "/api/lyrics" && req.method === "GET") {
    if (!dbReady) return sendJson(res, 503, { error: "Database not ready" });
    try {
      const list = await Lyrics.find().sort({ createdAt: -1 });
      return sendJson(res, 200, list);
    } catch (err) {
      return sendJson(res, 500, { error: err.message });
    }
  }

  // ---- ADD LYRICS ----
  if (pathname === "/api/lyrics" && req.method === "POST") {
    if (!dbReady) return sendJson(res, 503, { error: "Database not ready" });
    try {
      const body = await parseBody(req);
      const { albumName, songName, bengaliLyrics } = body;

      if (!albumName || !songName || !bengaliLyrics) {
        return sendJson(res, 400, { error: "Missing required fields" });
      }

      const newLyric = new Lyrics({
        albumName,
        songName,
        bengaliLyrics,
      });

      await newLyric.save();
      return sendJson(res, 201, newLyric);
    } catch (err) {
      return sendJson(res, 500, { error: err.message });
    }
  }

  // ---- UPDATE LYRICS ----
  // Matches /api/lyrics/:id
  const updateMatch = pathname.match(/^\/api\/lyrics\/([^\/]+)$/);
  if (updateMatch && req.method === "PUT") {
    if (!dbReady) return sendJson(res, 503, { error: "Database not ready" });
    try {
      const id = updateMatch[1];
      const body = await parseBody(req);
      const { albumName, songName, bengaliLyrics } = body;

      const updatedLyric = await Lyrics.findByIdAndUpdate(
        id,
        { albumName, songName, bengaliLyrics },
        { new: true }, // Return the updated document
      );

      if (!updatedLyric) {
        return sendJson(res, 404, { error: "Lyrics not found" });
      }

      return sendJson(res, 200, updatedLyric);
    } catch (err) {
      return sendJson(res, 500, { error: err.message });
    }
  }

  // ---- DELETE LYRICS ----
  const deleteMatch = pathname.match(/^\/api\/lyrics\/([^\/]+)$/);
  if (deleteMatch && req.method === "DELETE") {
    if (!dbReady) return sendJson(res, 503, { error: "Database not ready" });
    try {
      const id = deleteMatch[1];
      const result = await Lyrics.findByIdAndDelete(id);

      if (!result) {
        return sendJson(res, 404, { error: "Lyrics not found" });
      }

      return sendJson(res, 200, { success: true });
    } catch (err) {
      return sendJson(res, 500, { error: err.message });
    }
  }

  // 404
  sendJson(res, 404, { error: "Not Found" });
});

server.listen(PORT, () => {
  console.log(`🚀 Backend Server running on http://localhost:${PORT}`);
  console.log(`🔌 Connecting to MongoDB...`);
});
