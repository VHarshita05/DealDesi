/**
 * DealDesi — Group Shopping Backend
 * ─────────────────────────────────
 * Express REST  : room CRUD
 * Socket.io     : real-time chat, cart sync, member presence
 * Persistence   : JSON file (survives process restarts on Render free tier)
 *
 * KEY FIX: Rooms are persisted to rooms.json so they survive
 * Render's service restarts / cold starts.
 */

require("dotenv").config();
const express    = require("express");
const http       = require("http");
const { Server } = require("socket.io");
const cors       = require("cors");
const { v4: uuidv4 } = require("uuid");
const fs         = require("fs");
const path       = require("path");

const PORT         = process.env.PORT || 4000;
const FRONTEND_URL = process.env.FRONTEND_URL || "*";
const DB_FILE      = path.join(__dirname, "rooms.json");

/* ── File-based persistence ─────────────────────────────────── */
function loadRooms() {
  try {
    if (fs.existsSync(DB_FILE)) {
      return JSON.parse(fs.readFileSync(DB_FILE, "utf8"));
    }
  } catch (e) {
    console.error("[DB] Failed to load rooms.json:", e.message);
  }
  return {};
}

function saveRooms(rooms) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(rooms, null, 2));
  } catch (e) {
    console.error("[DB] Failed to save rooms.json:", e.message);
  }
}

/* ── In-memory store (backed by file) ───────────────────────── */
let rooms = loadRooms();
console.log(`[DB] Loaded ${Object.keys(rooms).length} existing room(s) from disk`);

/* ── Helpers ────────────────────────────────────────────────── */
function genCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

function ensureUniqueCode() {
  let code;
  const existing = new Set(Object.values(rooms).map(r => r.code));
  do { code = genCode(); } while (existing.has(code));
  return code;
}

/* ── Express ────────────────────────────────────────────────── */
const app = express();

// Allow all origins — needed for Render free tier (frontend and backend on different domains)
app.use(cors({
  origin: true,   // reflects the request origin
  methods: ["GET", "POST", "DELETE", "OPTIONS"],
  credentials: true,
}));
app.options("*", cors());
app.use(express.json());

// Health check — keeps Render service alive via uptime monitors
app.get("/health", (_req, res) => {
  res.json({ status: "ok", rooms: Object.keys(rooms).length, ts: Date.now() });
});

/* ── POST /rooms — Create a room ────────────────────────────── */
app.post("/rooms", (req, res) => {
  const { name, theme, maxMembers, hostName, hostAvatar } = req.body;

  if (!name || !hostName) {
    return res.status(400).json({ error: "name and hostName are required" });
  }

  const id   = uuidv4();
  const code = ensureUniqueCode();
  const room = {
    id,
    code,
    name,
    theme: theme || { label: "Festive Shopping", emoji: "🪔", accent: "#c0392b" },
    maxMembers: Math.min(Math.max(parseInt(maxMembers) || 10, 2), 20),
    host: hostName,
    createdAt: Date.now(),
    members: [{ name: hostName, avatar: hostAvatar || "✨", joinedAt: Date.now() }],
    cart: [],
    messages: [
      { id: uuidv4(), type: "system", text: `${hostName} created the room 🎉`,         ts: Date.now()     },
      { id: uuidv4(), type: "system", text: `Share invite code ${code} with friends!`, ts: Date.now() + 1 },
    ],
  };

  rooms[id] = room;
  saveRooms(rooms);
  console.log(`[CREATE] Room "${name}"  id=${id}  code=${code}`);
  res.status(201).json(room);
});

/* ── GET /rooms/by-code/:code ───────────────────────────────── */
app.get("/rooms/by-code/:code", (req, res) => {
  const code = req.params.code.trim().toUpperCase();
  const room = Object.values(rooms).find(r => r.code === code);
  if (!room) {
    console.log(`[JOIN FAIL] Code "${code}" not found. Existing codes:`, Object.values(rooms).map(r => r.code));
    return res.status(404).json({ error: "Room not found" });
  }
  res.json(room);
});

/* ── GET /rooms/:id ─────────────────────────────────────────── */
app.get("/rooms/:id", (req, res) => {
  const room = rooms[req.params.id];
  if (!room) return res.status(404).json({ error: "Room not found" });
  res.json(room);
});

/* ── GET /rooms — list all (debug) ─────────────────────────── */
app.get("/rooms", (_req, res) => {
  res.json(Object.values(rooms).map(r => ({
    id: r.id, code: r.code, name: r.name,
    members: r.members.length, max: r.maxMembers,
    createdAt: r.createdAt,
  })));
});

/* ── DELETE /rooms/:id ──────────────────────────────────────── */
app.delete("/rooms/:id", (req, res) => {
  if (!rooms[req.params.id]) return res.status(404).json({ error: "Room not found" });
  delete rooms[req.params.id];
  saveRooms(rooms);
  res.json({ ok: true });
});

/* ── Socket.io ──────────────────────────────────────────────── */
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: true,
    methods: ["GET", "POST"],
    credentials: true,
  },
  // Allow both polling and websocket — important for Render free tier
  transports: ["polling", "websocket"],
});

io.on("connection", socket => {
  console.log(`[SOCKET] connected  id=${socket.id}`);

  /* join-room */
  socket.on("join-room", ({ roomId, userName, userAvatar }, cb) => {
    const room = rooms[roomId];
    if (!room) { cb?.({ error: "Room not found" }); return; }

    const alreadyIn = room.members.find(m => m.name === userName);
    if (!alreadyIn) {
      if (room.members.length >= room.maxMembers) { cb?.({ error: "Room is full" }); return; }
      room.members.push({ name: userName, avatar: userAvatar || "✨", joinedAt: Date.now() });
      const sysMsg = { id: uuidv4(), type: "system", text: `${userAvatar || "✨"} ${userName} joined ✨`, ts: Date.now() };
      room.messages.push(sysMsg);
      saveRooms(rooms);
      socket.to(roomId).emit("member-joined", { member: room.members.at(-1), message: sysMsg });
    }

    socket.join(roomId);
    socket.data.roomId   = roomId;
    socket.data.userName = userName;

    console.log(`[JOIN] ${userName} → room ${roomId}`);
    cb?.({ room });
  });

  /* send-message */
  socket.on("send-message", ({ roomId, text, sender, avatar }, cb) => {
    const room = rooms[roomId];
    if (!room) { cb?.({ error: "Room not found" }); return; }
    const msg = { id: uuidv4(), type: "text", sender, avatar, text, ts: Date.now() };
    room.messages.push(msg);
    saveRooms(rooms);
    io.to(roomId).emit("new-message", msg);
    cb?.({ ok: true });
  });

  /* share-product */
  socket.on("share-product", ({ roomId, product, sender, avatar }, cb) => {
    const room = rooms[roomId];
    if (!room) { cb?.({ error: "Room not found" }); return; }
    const msg = { id: uuidv4(), type: "product", sender, avatar, product, ts: Date.now() };
    room.messages.push(msg);
    saveRooms(rooms);
    io.to(roomId).emit("new-message", msg);
    cb?.({ ok: true });
  });

  /* toggle-cart */
  socket.on("toggle-cart", ({ roomId, product, userName }, cb) => {
    const room = rooms[roomId];
    if (!room) { cb?.({ error: "Room not found" }); return; }

    const idx = room.cart.findIndex(p => p.id === product.id);
    if (idx === -1) {
      room.cart.push(product);
      const sysMsg = { id: uuidv4(), type: "system", text: `${userName} added "${product.name}" to the group cart 🛒`, ts: Date.now() };
      room.messages.push(sysMsg);
      io.to(roomId).emit("new-message", sysMsg);
    } else {
      room.cart.splice(idx, 1);
    }

    saveRooms(rooms);
    io.to(roomId).emit("cart-updated", { cart: room.cart });
    cb?.({ ok: true, cart: room.cart });
  });

  /* leave-room (explicit) */
  socket.on("leave-room", ({ roomId, userName }) => {
    _handleLeave(socket, roomId, userName, "left the room 👋");
  });

  /* disconnect */
  socket.on("disconnect", () => {
    const { roomId, userName } = socket.data || {};
    if (roomId && userName) {
      _handleLeave(socket, roomId, userName, "disconnected");
    }
    console.log(`[SOCKET] disconnected  id=${socket.id}`);
  });
});

function _handleLeave(socket, roomId, userName, reason) {
  const room = rooms[roomId];
  if (!room) return;

  room.members = room.members.filter(m => m.name !== userName);
  socket.leave(roomId);

  const sysMsg = { id: uuidv4(), type: "system", text: `${userName} ${reason}`, ts: Date.now() };
  room.messages.push(sysMsg);
  saveRooms(rooms);

  io.to(roomId).emit("member-left",  { userName });
  io.to(roomId).emit("new-message",  sysMsg);
  console.log(`[LEAVE] ${userName} ← room ${roomId} (${reason})`);
}

/* ── Start ──────────────────────────────────────────────────── */
server.listen(PORT, () => {
  console.log(`\n🛍  DealDesi Group Shopping backend`);
  console.log(`   http://localhost:${PORT}`);
  console.log(`   CORS: open (all origins)\n`);
});
