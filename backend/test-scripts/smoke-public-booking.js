import { request as httpRequest } from 'http';
import { request as httpsRequest } from 'https';
import { URL } from 'url';
import dotenv from 'dotenv';
dotenv.config({ path: '../../.env' });

const API = process.env.API_BASE || 'http://localhost:4000';

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
  console.log('testing public booking flow to', API);
  const professionalId = process.env.TEST_PROFESSIONAL_ID || '1';
  try {
    const availRes = await fetchJson(`${API}/availability/public/${professionalId}`);
    const avail = availRes.body;
    console.log('availability public count:', Array.isArray(avail) ? avail.length : JSON.stringify(avail));
    if (!Array.isArray(avail) || avail.length === 0) {
      console.log('no availability found — cannot proceed with booking test');
      return;
    }
    const slot = avail[0];
    console.log('using slot id:', slot.id, slot.start);

    const body = {
      professionalId: professionalId,
      tutorName: 'Test User',
      tutorEmail: 'test@example.com',
      tutorPhone: '+10000000000',
      petName: 'TestPet',
      slotId: slot.id,
      reason: 'Smoke test'
    };

    const bookRes = await fetchJson(`${API}/appointments/public`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    console.log('booking result status:', bookRes.status, 'body:', bookRes.body);
  } catch (err) {
    console.error('smoke test error', err && err.message ? err.message : err);
  }
}

run();
