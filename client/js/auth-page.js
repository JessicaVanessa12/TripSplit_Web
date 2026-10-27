import { api, session } from './api.js';
import { $, form, notify } from './ui.js';

if (session.get()) location.href = 'trips.html';
let register = false;

function setMode(isRegister) {
  register = isRegister;
  $('field-name').hidden = !isRegister;
  $('tab-login').classList.toggle('active', !isRegister);
  $('tab-register').classList.toggle('active', isRegister);
  $('auth-title').textContent = isRegister ? 'Create your account' : 'Welcome back!';
  $('btn-submit').textContent = isRegister ? 'Create account' : 'Sign in to TripSplit';
  $('auth-name').required = isRegister;
  notify('auth-msg', '');
}
$('tab-login').onclick = () => setMode(false);
$('tab-register').onclick = () => setMode(true);

$('auth-form').onsubmit = async (e) => {
  e.preventDefault();
  const btn = $('btn-submit'); btn.disabled = true;
  try {
    const r = await api(register ? '/auth/registro' : '/auth/login', 'POST', form(e.target));
    session.set(r.token, r.usuario);
    location.href = 'trips.html';
  } catch (err) { notify('auth-msg', err.message); } finally { btn.disabled = false; }
};
