// Simple test script to reproduce availability creation error
const base = 'http://localhost:4000';

async function testAvailability() {
  try {
    const ts = Date.now();
    const profEmail = `prof${ts}@example.com`;
    const profPass = 'pass1234';

    console.log('1) Registering professional...');
    let res = await fetch(`${base}/auth/register`, { 
      method: 'POST', 
      headers: { 'Content-Type': 'application/json' }, 
      body: JSON.stringify({ 
        email: profEmail, 
        password: profPass, 
        fullName: 'Dr Test' 
      }) 
    });
    let data = await res.json();
    if (!res.ok) throw new Error('Register failed: ' + JSON.stringify(data));
    console.log(' -> registered OK');

    console.log('2) Logging in...');
    res = await fetch(`${base}/auth/login`, { 
      method: 'POST', 
      headers: { 'Content-Type': 'application/json' }, 
      body: JSON.stringify({ 
        email: profEmail, 
        password: profPass 
      }) 
    });
    data = await res.json();
    if (!res.ok) throw new Error('Login failed: ' + JSON.stringify(data));
    const token = data.token;
    console.log(' -> login OK');

    // Create availability for tomorrow 9-12
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(9, 0, 0, 0);
    const start = new Date(tomorrow);
    const end = new Date(tomorrow);
    end.setHours(12, 0, 0, 0);

    console.log('3) Creating availability:', start.toISOString(), '->', end.toISOString());
    res = await fetch(`${base}/availability`, { 
      method: 'POST', 
      headers: { 
        'Content-Type': 'application/json', 
        'Authorization': `Bearer ${token}` 
      }, 
      body: JSON.stringify({ 
        start: start.toISOString(), 
        end: end.toISOString() 
      }) 
    });
    
    const responseText = await res.text();
    console.log(' -> Response status:', res.status);
    console.log(' -> Response body:', responseText);
    
    if (!res.ok) {
      throw new Error(`Create availability failed (${res.status}): ${responseText}`);
    }
    
    console.log(' -> Availability created successfully!');
    
  } catch (err) {
    console.error('Test error:', err);
    process.exitCode = 1;
  }
}

testAvailability();