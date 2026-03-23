/**
 * DealDesi — Group Shopping Microservice
 * ────────────────────────────────────────
 * Express REST  : room CRUD
 * Socket.io     : real-time chat, cart sync, member presence
 *
 * Deploy on Render as a Web Service (Node environment).
 * Set env vars: PORT, FRONTEND_URL
 */

require("dotenv").config();
const express    = require("express");
const http       = require("http");
const { Server } = require("socket.io");
const cors       = require("cors");
const { v4: uuidv4 } = require("uuid");

const PORT         = process.env.PORT || 4000;
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

/* ── In-memory store (swap for Redis / MongoDB for production) ── */
const rooms = {};   // roomId → room object

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

/* ── Express app ────────────────────────────────────────────── */
const app = express();

app.use(cors({ origin: FRONTEND_URL, methods: ["GET","POST","DELETE"] }));
app.use(express.json());

// Health check — Render pings this to keep the service alive
app.get("/health", (_req, res) => res.json({ status: "ok", rooms: Object.keys(rooms).length }));

/* ─── REST: Create Room ─── */
app.post("/rooms", (req, res) => {
  const { name, theme, maxMembers, hostName, hostAvatar } = req.body;
  if (!name || !hostName) return res.status(400).json({ error: "name and hostName required" });

  const id   = uuidv4();
  const code = ensureUniqueCode();
  const room = {
    id,
    code,
    name,
    theme:      theme      || { label: "Festive Shopping", emoji: "🪔", accent: "#c0392b" },
    maxMembers: Math.min(Math.max(parseInt(maxMembers) || 10, 2), 20),
    host:       hostName,
    createdAt:  Date.now(),
    members:    [{ name: hostName, avatar: hostAvatar || "✨", joinedAt: Date.now() }],
    cart:       [],
    messages:   [
      { id: uuidv4(), type: "system", text: `${hostName} created the room 🎉`,        ts: Date.now()     },
      { id: uuidv4(), type: "system", text: `Share invite code ${code} with friends`, ts: Date.now() + 1 },
    ],
  };

  rooms[id] = room;
  console.log(`[ROOM CREATED] "${name}" id=${id} code=${code}`);
  res.status(201).json(room);
});

/* ─── REST: Get Room by invite code ─── */
app.get("/rooms/by-code/:code", (req, res) => {
  const room = Object.values(rooms).find(r => r.code === req.params.code.toUpperCase());
  if (!room) return res.status(404).json({ error: "Room not found" });
  res.json(room);
});

/* ─── REST: Get Room by id ─── */
app.get("/rooms/:id", (req, res) => {
  const room = rooms[req.params.id];
  if (!room) return res.status(404).json({ error: "Room not found" });
  res.json(room);
});

/* ─── REST: List all rooms (debug/admin) ─── */
app.get("/rooms", (_req, res) => {
  res.json(Object.values(rooms).map(r => ({
    id: r.id, code: r.code, name: r.name,
    members: r.members.length, max: r.maxMembers,
    createdAt: r.createdAt,
  })));
});

/* ── Socket.io ──────────────────────────────────────────────── */
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: FRONTEND_URL, methods: ["GET","POST"] },
});

io.on("connection", socket => {
  console.log(`[SOCKET] connected: ${socket.id}`);

  /* ── join-room ── */
  socket.on("join-room", ({ roomId, userName, userAvatar }, cb) => {
    const room = rooms[roomId];
    if (!room) return cb?.({ error: "Room not found" });
    if (room.members.length >= room.maxMembers && !room.members.find(m => m.name === userName))
      return cb?.({ error: "Room is full" });

    // Add member if not already in
    if (!room.members.find(m => m.name === userName)) {
      room.members.push({ name: userName, avatar: userAvatar || "✨", joinedAt: Date.now() });
      const sysMsg = { id: uuidv4(), type: "system", text: `${userAvatar} ${userName} joined ✨`, ts: Date.now() };
      room.messages.push(sysMsg);
      socket.to(roomId).emit("member-joined", { member: room.members.at(-1), message: sysMsg });
    }

    socket.join(roomId);
    socket.data.roomId   = roomId;
    socket.data.userName = userName;

    console.log(`[JOIN] ${userName} → room ${roomId}`);
    cb?.({ room });
  });

  /* ── send-message (text) ── */
  socket.on("send-message", ({ roomId, text, sender, avatar }, cb) => {
    const room = rooms[roomId];
    if (!room) return cb?.({ error: "Room not found" });

    const msg = { id: uuidv4(), type: "text", sender, avatar, text, ts: Date.now() };
    room.messages.push(msg);

    io.to(roomId).emit("new-message", msg);
    cb?.({ ok: true });
  });

  /* ── share-product (product card in chat) ── */
  socket.on("share-product", ({ roomId, product, sender, avatar }, cb) => {
    const room = rooms[roomId];
    if (!room) return cb?.({ error: "Room not found" });

    const msg = { id: uuidv4(), type: "product", sender, avatar, product, ts: Date.now() };
    room.messages.push(msg);

    io.to(roomId).emit("new-message", msg);
    cb?.({ ok: true });
  });

  /* ── toggle-cart ── */
  socket.on("toggle-cart", ({ roomId, product, userName }, cb) => {
    const room = rooms[roomId];
    if (!room) return cb?.({ error: "Room not found" });

    const idx = room.cart.findIndex(p => p.id === product.id);
    let action;
    if (idx === -1) {
      room.cart.push(product);
      action = "added";
      const sysMsg = { id: uuidv4(), type: "system", text: `${userName} added "${product.name}" to the group cart 🛒`, ts: Date.now() };
      room.messages.push(sysMsg);
      io.to(roomId).emit("new-message", sysMsg);
    } else {
      room.cart.splice(idx, 1);
      action = "removed";
    }

    io.to(roomId).emit("cart-updated", { cart: room.cart });
    cb?.({ ok: true, action, cart: room.cart });
  });

  /* ── leave-room ── */
  socket.on("leave-room", ({ roomId, userName }) => {
    const room = rooms[roomId];
    if (!room) return;

    room.members = room.members.filter(m => m.name !== userName);
    socket.leave(roomId);

    const sysMsg = { id: uuidv4(), type: "system", text: `${userName} left the room`, ts: Date.now() };
    room.messages.push(sysMsg);
    io.to(roomId).emit("member-left",  { userName });
    io.to(roomId).emit("new-message",  sysMsg);

    console.log(`[LEAVE] ${userName} ← room ${roomId}`);
  });

  /* ── disconnect ── */
  socket.on("disconnect", () => {
    const { roomId, userName } = socket.data;
    if (roomId && userName) {
      const room = rooms[roomId];
      if (room) {
        room.members = room.members.filter(m => m.name !== userName);
        const sysMsg = { id: uuidv4(), type: "system", text: `${userName} disconnected`, ts: Date.now() };
        room.messages.push(sysMsg);
        io.to(roomId).emit("member-left", { userName });
        io.to(roomId).emit("new-message", sysMsg);
      }
    }
    console.log(`[SOCKET] disconnected: ${socket.id}`);
  });
});

/* ── Start ──────────────────────────────────────────────────── */
server.listen(PORT, () => {
  console.log(`\n🛍  DealDesi Group Shopping backend`);
  console.log(`   Listening on http://localhost:${PORT}`);
  console.log(`   CORS allowed for: ${FRONTEND_URL}\n`);
});
