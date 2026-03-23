# DealDesi — Group Shopping Microservice

Full-stack group shopping feature for DealDesi. Two separate microservices designed for Render deployment.

```
dealdesi-group-shopping/
├── frontend/    React + Vite  →  Render Static Site
└── backend/     Node + Express + Socket.io  →  Render Web Service
```

## Quick Start (local)

```bash
# Terminal 1 — backend
cd backend
npm install
cp .env.example .env
npm run dev        # http://localhost:4000

# Terminal 2 — frontend
cd frontend
npm install
cp .env.example .env    # VITE_BACKEND_URL=http://localhost:4000
npm run dev        # http://localhost:5173
```

## Render Deployment

### 1. Backend (Web Service)
| Setting | Value |
|---------|-------|
| Root directory | `backend` |
| Build command | `npm install` |
| Start command | `npm start` |
| Env var `FRONTEND_URL` | your frontend Render URL |

### 2. Frontend (Static Site)
| Setting | Value |
|---------|-------|
| Root directory | `frontend` |
| Build command | `npm install && npm run build` |
| Publish directory | `dist` |
| Env var `VITE_BACKEND_URL` | your backend Render URL |

## Features
- ✦ Create group rooms (2–20 members)
- 💬 Real-time chat via Socket.io
- 🛍 Share products directly in chat with 1-tap add-to-cart
- 🛒 Synced shared group cart across all members
- 🎉 Group checkout when minimum members met
- 🎨 DealDesi brand — exact navbar, fonts, colours
