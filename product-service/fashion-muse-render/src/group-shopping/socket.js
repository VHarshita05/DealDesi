import { io } from "socket.io-client";

const BACKEND_URL = "https://groupshopping.onrender.com";

export const socket = io(BACKEND_URL, {
  autoConnect: false,
  transports: ["polling", "websocket"],   // polling first — more reliable on Render free tier
  reconnectionAttempts: 5,
  reconnectionDelay: 1500,
});
