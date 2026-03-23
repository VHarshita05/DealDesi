# DealDesi — Group Shopping Frontend

React + Vite microservice. Deploy separately on Render.

## Setup

```bash
cd frontend
npm install
cp .env.example .env      # set VITE_BACKEND_URL
npm run dev               # development  → http://localhost:5173
npm run build             # production build → dist/
```

## Render Deployment

1. Create a new **Static Site** on Render
2. Set **Root Directory** to `frontend`
3. Build command: `npm install && npm run build`
4. Publish directory: `dist`
5. Add environment variable:
   - `VITE_BACKEND_URL` → your backend Render URL  
     e.g. `https://dealdesi-group-backend.onrender.com`

## Connecting to your product service

Edit `src/data.js` — replace the `PRODUCTS` array with a fetch to your existing product microservice:

```js
export async function fetchProducts() {
  const res = await fetch("https://dealdesi-product-service.onrender.com/api/products");
  return res.json();
}
```

Then in `App.jsx`, load products with `useEffect` + `useState`.
