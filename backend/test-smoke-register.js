const http = require('http');
const data = JSON.stringify({
  email: 'smoke+test@example.com',
  password: 'Password123!',
  fullName: 'Smoke Tester',
  phone: '+5511999999999',
  clinicName: 'Test Clinic',
  accountType: 'client'
});

const opts = {
  hostname: 'localhost',
  port: 4000,
  path: '/auth/register',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(data)
  }
};

const req = http.request(opts, res => {
  let b = '';
  console.log('STATUS', res.statusCode);
  res.on('data', c => b += c);
  res.on('end', () => {
    try { console.log('BODY', JSON.parse(b)); }
    catch (e) { console.log('BODY', b); }
    process.exit(res.statusCode === 200 ? 0 : 1);
  });
});
req.on('error', e => {
  console.error('ERR', e.message);
  process.exit(1);
});
req.write(data);
req.end();
