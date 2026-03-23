const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");
const { v4: uuidv4 } = require("uuid");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

/* 🔥 IN-MEMORY STORE */
let rooms = {};

/* 🔥 CREATE ROOM */
app.post("/rooms", (req, res) => {
  const { name, hostName } = req.body;

  const id = uuidv4();
  const code = Math.floor(100000 + Math.random() * 900000).toString();

  const room = {
    id,
    code,
    name,
    members: [{ name: hostName, avatar: "🙂" }],
    messages: [],
    cart: [],
  };

  rooms[id] = room;

  res.json(room);
});

/* 🔥 GET ROOM BY ID */
app.get("/rooms/:id", (req, res) => {
  const room = rooms[req.params.id];
  if (!room) return res.status(404).json({ error: "Room not found" });

  res.json(room);
});

/* 🔥 GET ROOM BY CODE */
app.get("/rooms/by-code/:code", (req, res) => {
  const room = Object.values(rooms).find(r => r.code === req.params.code);
  if (!room) return res.status(404).json({ error: "Room not found" });

  res.json(room);
});

/* 🔥 SOCKET.IO */
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("join-room", ({ roomId, userName, userAvatar }) => {
    const room = rooms[roomId];
    if (!room) return;

    socket.join(roomId);

    const member = { name: userName, avatar: userAvatar };
    room.members.push(member);

    io.to(roomId).emit("member-joined", { member });
  });

  socket.on("send-message", ({ roomId, text, sender, avatar }) => {
    const room = rooms[roomId];
    if (!room) return;

    const msg = { text, sender, avatar };
    room.messages.push(msg);

    io.to(roomId).emit("new-message", msg);
  });

  socket.on("share-product", ({ roomId, product, sender, avatar }) => {
    const room = rooms[roomId];
    if (!room) return;

    const msg = { product, sender, avatar };
    room.messages.push(msg);

    io.to(roomId).emit("new-message", msg);
  });

  socket.on("toggle-cart", ({ roomId, product }) => {
    const room = rooms[roomId];
    if (!room) return;

    room.cart.push(product);

    io.to(roomId).emit("cart-updated", { cart: room.cart });
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

/* 🔥 HEALTH CHECK */
app.get("/", (req, res) => {
  res.send("Backend is running 🚀");
});

/* 🔥 START SERVER */
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});