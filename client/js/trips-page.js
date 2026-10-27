import { api } from './api.js';
import { $, el, form, notify, money, requireSession, tripStatus } from './ui.js';

const user = requireSession();
let trips = [];
let filter = 'all';

function card(t, i) {
  const c = el('button', 'card trip-card'); c.type = 'button';
  const cover = el('div', 'trip-cover v' + (i % 4));
  cover.append(el('span', 'badge', tripStatus(t)), el('span', 'badge ' + (t.rol === 'organizador' ? 'badge-org' : ''), t.rol === 'organizador' ? 'Organizer' : 'Participant'));
  const body = el('div', 'trip-body');
  body.append(el('h3', '', t.nombre), el('p', 'muted', `${t.destino} · ${t.fecha_inicio} to ${t.fecha_fin}`),
    el('p', '', 'Budget: ' + money(t.presupuesto_total)));
  const bar = el('div', 'progress'); bar.append(el('i')); // filled in Sprint 4 (expenses)
  body.append(bar, el('span', 'muted', 'View trip details →'));
  c.append(cover, body);
  c.onclick = () => { location.href = 'trip.html?id=' + t.id; };
  return c;
}

function render() {
  const list = $('trip-list'); list.replaceChildren();
  const shown = trips.filter((t) => filter === 'all' || tripStatus(t) === filter);
  $('empty').hidden = shown.length > 0;
  shown.forEach((t, i) => list.append(card(t, i)));
  $('stat-active').textContent = trips.filter((t) => tripStatus(t) !== 'past').length;
  $('stat-total').textContent = trips.length;
  $('stat-budget').textContent = money(trips.reduce((s, t) => s + Number(t.presupuesto_total), 0));
}

async function load() {
  try { trips = await api('/viajes'); render(); } catch (err) { notify('trips-msg', err.message); }
}

$('greeting').textContent = `Hi, ${user.nombre.split(' ')[0]}! Ready for your next adventure?`;
document.querySelectorAll('.chip').forEach((c) => {
  c.onclick = () => { filter = c.dataset.filter; document.querySelectorAll('.chip').forEach((x) => x.classList.toggle('active', x === c)); render(); };
});
$('btn-new').onclick = () => { $('new-trip').hidden = !$('new-trip').hidden; };
$('btn-cancel').onclick = () => { $('new-trip').hidden = true; };
$('trip-form').onsubmit = async (e) => {
  e.preventDefault();
  try {
    await api('/viajes', 'POST', form(e.target));
    e.target.reset(); $('new-trip').hidden = true; notify('form-msg', ''); load();
  } catch (err) { notify('form-msg', err.message); }
};
load();
