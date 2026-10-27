// Small DOM helpers. Always uses textContent (no innerHTML) to avoid XSS.
import { session } from './api.js';

export const $ = (id) => document.getElementById(id);
export function el(tag, cls, text) {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (text !== undefined) n.textContent = text;
  return n;
}
export const initials = (name) => name.split(/\s+/).slice(0, 2).map((w) => w[0]).join('').toUpperCase();
export const money = (n) => '$' + Number(n).toLocaleString('en-US', { minimumFractionDigits: 2 }) + ' USD';
export const form = (f) => Object.fromEntries(new FormData(f));
export function notify(id, text, ok = false) { const n = $(id); n.textContent = text; n.className = 'alert' + (ok ? ' ok' : ''); }
export function avatar(name) { const a = el('span', 'avatar', initials(name)); a.title = name; return a; }

// Redirects to the login page when there is no session; wires the logout button
export function requireSession() {
  const s = session.get();
  if (!s) { location.href = 'index.html'; return null; }
  $('user-name').textContent = s.user.nombre;
  $('btn-logout').onclick = () => { session.clear(); location.href = 'index.html'; };
  return s.user;
}
export function tripStatus(t) {
  const today = new Date().toISOString().slice(0, 10);
  return t.fecha_fin < today ? 'past' : t.fecha_inicio > today ? 'upcoming' : 'ongoing';
}
