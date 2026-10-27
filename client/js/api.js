// API client + session helpers (single place that talks to the server)
const KEY = 'ts_session';
export const session = {
  get: () => { try { return JSON.parse(sessionStorage.getItem(KEY)); } catch { return null; } },
  set: (token, user) => sessionStorage.setItem(KEY, JSON.stringify({ token, user })),
  clear: () => sessionStorage.removeItem(KEY),
};

export async function api(path, method = 'GET', body) {
  const s = session.get();
  const res = await fetch('/api' + path, {
    method,
    headers: { 'Content-Type': 'application/json', ...(s ? { Authorization: 'Bearer ' + s.token } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = res.status === 204 ? null : await res.json().catch(() => ({}));
  if (res.status === 401 && s) { session.clear(); location.href = 'index.html'; }
  if (!res.ok) throw new Error([data.error, ...(data.detalles || [])].filter(Boolean).join(' '));
  return data;
}
