// Simple test to login and call /auth/me using global fetch (Node 18+)

async function run() {
  const base = 'http://localhost:4000';
  // Ensure user exists - we'll try to register then login
  const email = `test.cookie.${Date.now()}@example.com`;
  const registerRes = await fetch(`${base}/auth/register`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password: 'password123', fullName: 'Test Cookie', phone: '+56 9 9999 9999', professionalRut: '11.111.111-1', accountType: 'professional' })
  });
  const reg = await registerRes.json();
  console.log('register:', registerRes.status, reg.error ? reg.error : 'ok');

  // login
  const loginRes = await fetch(`${base}/auth/login`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password: 'password123' }),
    redirect: 'manual'
  });
  console.log('login status:', loginRes.status);
  const cookies = loginRes.headers.get('set-cookie') ? [loginRes.headers.get('set-cookie')] : [];
  console.log('set-cookie headers:', cookies);

  // call /auth/me with the cookie
  const cookieHeader = cookies.map(c => c.split(';')[0]).join('; ');
  const meRes = await fetch(`${base}/auth/me`, { headers: { Cookie: cookieHeader } });
  const meData = await meRes.json();
  console.log('/auth/me', meRes.status, meData);
}

run().catch(console.error);
