import { io } from "socket.io-client";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:4000";

export const socket = io(BACKEND_URL, {
  autoConnect: false,
  transports: ["polling", "websocket"],   // polling first — more reliable on Render free tier
  reconnectionAttempts: 5,
  reconnectionDelay: 1500,
});
