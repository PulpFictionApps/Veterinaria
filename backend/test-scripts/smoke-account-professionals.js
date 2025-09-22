import { request as httpRequest } from 'http';
import { request as httpsRequest } from 'https';
import { URL } from 'url';
import dotenv from 'dotenv';
dotenv.config({ path: '../../.env' });

const API = process.env.BACKEND_BASE || process.env.API_BASE || 'http://localhost:4000';

function fetchJson(url, opts = {}) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const lib = u.protocol === 'https:' ? httpsRequest : httpRequest;
    const headers = opts.headers || {};
    const req = lib(url, { method: opts.method || 'GET', headers }, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const parsed = data ? JSON.parse(data) : null;
          resolve({ status: res.statusCode, body: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });
    req.on('error', reject);
    if (opts.body) req.write(typeof opts.body === 'string' ? opts.body : JSON.stringify(opts.body));
    req.end();
  });
}

async function run() {
  console.log('smoke: account professionals flow to', API);
  try {
    const unique = Date.now();
    const email = `smoke_${unique}@test.local`;
    const pw = 'test1234';

    console.log('registering', email);
    const reg = await fetchJson(`${API}/auth/register`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password: pw }) });
    if (reg.status !== 200 && reg.status !== 201) throw new Error('register failed: ' + JSON.stringify(reg));

    const token = reg.body.token;
    if (!token) throw new Error('no token from register');

    console.log('checking status (should be false)');
    let s = await fetchJson(`${API}/account/status`, { headers: { Authorization: 'Bearer ' + token } });
    console.log('status', s.status, s.body);

    console.log('activating premium');
    const a = await fetchJson(`${API}/account/activate-premium`, { method: 'POST', headers: { Authorization: 'Bearer ' + token } });
    console.log('activate', a.status, a.body);
    if (a.status !== 200) throw new Error('activate failed');

    console.log('creating professional');
    const c = await fetchJson(`${API}/account/professionals`, { method: 'POST', headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' }, body: JSON.stringify({ name: 'Dr Test Smoke', role: 'General', email: 'drsmoke@test.local' }) });
    console.log('create', c.status, c.body);
    if (c.status !== 200) throw new Error('create pro failed');
    const created = c.body;

    console.log('listing professionals');
    const l = await fetchJson(`${API}/account/professionals`, { headers: { Authorization: 'Bearer ' + token } });
    console.log('list', l.status, l.body);
    if (!Array.isArray(l.body) || l.body.length === 0) throw new Error('list empty after create');

    console.log('deleting professional', created.id);
    const d = await fetchJson(`${API}/account/professionals/${created.id}`, { method: 'DELETE', headers: { Authorization: 'Bearer ' + token } });
    console.log('delete', d.status, d.body);
    if (d.status !== 200) throw new Error('delete failed');

    const l2 = await fetchJson(`${API}/account/professionals`, { headers: { Authorization: 'Bearer ' + token } });
    console.log('list after delete', l2.status, l2.body);
    if (Array.isArray(l2.body) && l2.body.length === 0) {
      console.log('smoke: PASS');
      process.exit(0);
    } else {
      throw new Error('not empty after delete');
    }
  } catch (err) {
    console.error('smoke: FAIL', err && err.message ? err.message : err);
    process.exit(2);
  }
}

run();
