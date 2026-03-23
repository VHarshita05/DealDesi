/**
 * Socket.io client singleton
 * Import { socket } anywhere — it's the same connection throughout the app.
 */
import { io } from "socket.io-client";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:4000";

export const socket = io(BACKEND_URL, {
  autoConnect: false,       // we connect manually after entering a name
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
});
