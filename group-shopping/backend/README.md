# DealDesi — Group Shopping Backend

Express + Socket.io microservice. Deploy separately on Render.

## Setup

```bash
cd backend
npm install
cp .env.example .env    # fill in FRONTEND_URL
npm run dev             # development
npm start               # production
```

## Render Deployment

1. Create a new **Web Service** on Render
2. Set **Root Directory** to `backend`
3. Build command: `npm install`
4. Start command: `npm start`
5. Add environment variables:
   - `PORT` → `4000` (Render sets this automatically)
   - `FRONTEND_URL` → your frontend Render URL

## API Reference

### REST

| Method | Path | Description |
|--------|------|-------------|
| GET | /health | Health check |
| POST | /rooms | Create a room |
| GET | /rooms/by-code/:code | Find room by invite code |
| GET | /rooms/:id | Get room by ID |

### POST /rooms body
```json
{
  "name": "Diwali Shopping",
  "theme": { "label": "Festive Shopping", "emoji": "🪔", "accent": "#c0392b" },
  "maxMembers": 10,
  "hostName": "Priya",
  "hostAvatar": "🌸"
}
```

### Socket.io Events

**Emit (client → server)**

| Event | Payload |
|-------|---------|
| `join-room` | `{ roomId, userName, userAvatar }` |
| `send-message` | `{ roomId, text, sender, avatar }` |
| `share-product` | `{ roomId, product, sender, avatar }` |
| `toggle-cart` | `{ roomId, product, userName }` |
| `leave-room` | `{ roomId, userName }` |

**Listen (server → client)**

| Event | Payload |
|-------|---------|
| `new-message` | message object |
| `member-joined` | `{ member, message }` |
| `member-left` | `{ userName }` |
| `cart-updated` | `{ cart }` |
