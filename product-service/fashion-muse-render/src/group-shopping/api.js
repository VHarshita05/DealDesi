const BASE = import.meta.env.VITE_BACKEND_URL || "http://localhost:4000";

async function req(method, path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: body ? { "Content-Type": "application/json" } : {},
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || "Request failed");
  }
  return res.json();
}

export const api = {
  createRoom:    (data) => req("POST",   "/rooms",             data),
  getRoomByCode: (code) => req("GET",    `/rooms/by-code/${code}`),
  getRoomById:   (id)   => req("GET",    `/rooms/${id}`),
};
