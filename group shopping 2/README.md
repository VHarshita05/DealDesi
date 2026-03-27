# DealDesi — Group Shopping (v2 — Bug Fixes)

## What was fixed

### 🐛 "Room not found" bug
**Root cause:** Rooms were stored only in memory. When Render's free tier restarts
or cold-starts your backend service (which happens after ~15 min of inactivity),
all rooms are wiped — so any existing invite codes stop working.

**Fix:** Rooms are now persisted to `backend/src/rooms.json` on every write.
The file is loaded on startup so rooms survive restarts.

### 🐛 CORS blocking join requests  
**Fix:** Backend now accepts all origins (`origin: true`) instead of a single
hardcoded URL. Critical when frontend and backend live on different `.onrender.com`
subdomains.

### 🐛 Socket transport fallback
**Fix:** Both frontend and backend now use `["polling", "websocket"]` transport
order. Render free tier doesn't always support raw WebSocket upgrades — falling
back to long-polling first ensures reliable connections.

### ✨ Exit Room button
Added a prominent **Leave** button in the room header (red, with icon) plus
a confirmation modal so users don't leave by accident. Also accessible from the
bottom of the Cart tab.

---

## Project structure

```
dealdesi-group-shopping/
├── backend/
│   ├── src/
│   │   ├── index.js       ← Express + Socket.io server
│   │   └── rooms.json     ← auto-created on first room creation
│   ├── package.json
│   └── .env.example
└── frontend/
    ├── src/
    │   ├── App.jsx         ← full UI
    │   ├── socket.js       ← Socket.io client singleton
    │   ├── api.js          ← REST helpers
    │   ├── data.js         ← products + helpers
    │   └── main.jsx
    ├── index.html
    ├── vite.config.js
    ├── package.json
    └── .env.example
```

## Local setup

```bash
# Backend
cd backend
npm install
cp .env.example .env
npm run dev        # → http://localhost:4000

# Frontend (new terminal)
cd frontend
npm install
cp .env.example .env      # VITE_BACKEND_URL=http://localhost:4000
npm run dev        # → http://localhost:5173
```

## Render deployment

### Backend — Web Service
| Field | Value |
|-------|-------|
| Root Directory | `backend` |
| Build Command | `npm install` |
| Start Command | `npm start` |
| Env: `FRONTEND_URL` | `https://your-frontend.onrender.com` |

### Frontend — Static Site
| Field | Value |
|-------|-------|
| Root Directory | `frontend` |
| Build Command | `npm install && npm run build` |
| Publish Directory | `dist` |
| Env: `VITE_BACKEND_URL` | `https://your-backend.onrender.com` |

> **Tip:** After deploying the backend, copy its URL into the frontend's
> `VITE_BACKEND_URL` env var before building the frontend.
