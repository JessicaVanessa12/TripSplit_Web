import { api } from './api.js';
import { $, el, form, notify, money, avatar, requireSession } from './ui.js';

requireSession();
const id = new URLSearchParams(location.search).get('id');
if (!/^[1-9]\d*$/.test(id || '')) location.href = 'trips.html';

async function load() {
  let t;
  try { t = await api('/viajes/' + id); } catch (err) { notify('trip-msg', err.message); setTimeout(() => { location.href = 'trips.html'; }, 1500); return; }
  const org = t.rol === 'organizador';
  document.title = t.nombre + ' · TripSplit';
  $('t-name').textContent = t.nombre;
  $('t-dest').textContent = t.destino;
  $('t-dates').textContent = `${t.fecha_inicio} to ${t.fecha_fin}`;
  $('t-budget').textContent = money(t.presupuesto_total);
  $('t-role').textContent = org ? 'Organizer' : 'Participant';
  $('t-code').textContent = t.codigo_invitacion;
  $('t-count').textContent = t.participantes.length + ' travelers';
  const faces = $('t-faces'); faces.replaceChildren(...t.participantes.map((p) => avatar(p.nombre)));
  $('add-form').hidden = !org;

  const ul = $('people'); ul.replaceChildren();
  t.participantes.forEach((p) => {
    const li = el('li'); const who = el('div', 'person');
    const info = el('div'); info.append(el('strong', '', p.nombre), el('div', 'muted', p.correo));
    who.append(avatar(p.nombre), info);
    li.append(who);
    const right = el('div', 'person'); right.append(el('span', 'badge ' + (p.rol === 'organizador' ? 'badge-org' : ''), p.rol === 'organizador' ? 'Organizer' : 'Participant'));
    if (org && p.rol !== 'organizador') {
      const b = el('button', 'btn-ghost', 'Remove'); b.type = 'button';
      b.onclick = async () => { try { await api(`/viajes/${id}/participantes/${p.id}`, 'DELETE'); load(); } catch (e) { notify('people-msg', e.message); } };
      right.append(b);
    }
    li.append(right); ul.append(li);
  });
}

$('add-form').onsubmit = async (e) => {
  e.preventDefault();
  try { await api(`/viajes/${id}/participantes`, 'POST', form(e.target)); e.target.reset(); notify('people-msg', 'Participant added.', true); load(); }
  catch (err) { notify('people-msg', err.message); }
};
load();
