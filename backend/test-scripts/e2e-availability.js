// E2E smoke script for availability/appointments
// Run with: node test-scripts/e2e-availability.js

const base = 'http://localhost:4000';

async function run() {
  try {
    const ts = Date.now();
    const profEmail = `prof+${ts}@example.com`;
    const profPass = 'pass1234';

    console.log('1) Registering professional...');
    let res = await fetch(`${base}/auth/register`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: profEmail, password: profPass, fullName: 'Dr Test' }) });
    let data = await res.json();
    if (!res.ok) throw new Error('Register failed: ' + JSON.stringify(data));
    console.log(' -> registered');

    console.log('2) Logging in...');
    res = await fetch(`${base}/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: profEmail, password: profPass }) });
    data = await res.json();
    if (!res.ok) throw new Error('Login failed: ' + JSON.stringify(data));
    const token = data.token;
    console.log(' -> login OK, token length', token.length);

    // create availability: 3 consecutive hours starting next day at 09:00 local
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(9,0,0,0);
    const start = new Date(tomorrow);
    const end = new Date(tomorrow);
    end.setHours(end.getHours() + 3);

    console.log('3) Creating availability (3h):', start.toISOString(), '->', end.toISOString());
    res = await fetch(`${base}/availability`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify({ start: start.toISOString(), end: end.toISOString() }) });
    data = await res.json();
    if (!res.ok) throw new Error('Create availability failed: ' + JSON.stringify(data));
    console.log(' -> created slots count', data.length);

    const slots = data;
    if (slots.length < 2) throw new Error('Need at least 2 slots for test');

    // show public availability
    console.log('4) Public availability (before booking):');
    res = await fetch(`${base}/availability/public/${data[0].userId}`);
    let pub = await res.json();
    console.log(pub.map(s => s.start));

    // Public booking using slotId = slots[1]
    console.log('5) Booking public for slot', slots[1].id);
    res = await fetch(`${base}/appointments/public`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ professionalId: slots[1].userId, tutorName: 'Cliente A', tutorEmail: `cli+${ts}@example.com`, tutorPhone: '555-0001', petName: 'Firulais', petType: 'Perro', slotId: slots[1].id }) });
    data = await res.json();
    if (!res.ok) throw new Error('Public booking failed: ' + JSON.stringify(data));
    console.log(' -> booked appointment id', data.id, 'date', data.date);
    const apptId = data.id;

    // Check availability after booking
    console.log('6) Public availability (after booking):');
    res = await fetch(`${base}/availability/public/${slots[1].userId}`);
    pub = await res.json();
    console.log(' Slots count:', pub.length, 'starts:', pub.map(s => s.start));

    // Reprogram appointment to slots[0]
    console.log('7) Reprogramming appointment to slot', slots[0].id);
    res = await fetch(`${base}/appointments/${apptId}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify({ slotId: slots[0].id }) });
    data = await res.json();
    if (!res.ok) throw new Error('Reprogram failed: ' + JSON.stringify(data));
    console.log(' -> reprogrammed to', data.date);

    // Check availability after reprogram
    console.log('8) Public availability (after reprogram):');
    res = await fetch(`${base}/availability/public/${slots[0].userId}`);
    pub = await res.json();
    console.log(' Slots count:', pub.length, 'starts:', pub.map(s => s.start));

    // Now delete appointment
    console.log('9) Deleting appointment', apptId);
    res = await fetch(`${base}/appointments/${apptId}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
    data = await res.json();
    if (!res.ok) throw new Error('Delete failed: ' + JSON.stringify(data));
    console.log(' -> deleted');

    // Check availability after delete
    console.log('10) Public availability (after delete):');
    res = await fetch(`${base}/availability/public/${slots[0].userId}`);
    pub = await res.json();
    console.log(' Slots count:', pub.length, 'starts:', pub.map(s => s.start));

    console.log('E2E sequence completed successfully');
  } catch (err) {
    console.error('E2E error:', err);
    process.exitCode = 1;
  }
}

run();
