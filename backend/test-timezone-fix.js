// Test script to verify timezone fix for availability creation
// This simulates what happens when frontend sends datetime to backend

function testTimezoneHandling() {
  console.log('=== Testing Timezone Fix ===\n');
  
  // Simulate what frontend sends: ISO string representing 9 AM Chilean time
  const frontendInput = '2024-01-15T09:00:00.000Z';
  console.log('Frontend sends:', frontendInput);
  
  // OLD way (what was causing the problem)
  const oldWayParsing = new Date(frontendInput);
  console.log('Old parsing (as UTC):', oldWayParsing.toISOString());
  console.log('Old parsing in Santiago:', oldWayParsing.toLocaleString('es-CL', { timeZone: 'America/Santiago' }));
  
  console.log('\n---\n');
  
  // NEW way (our fix)
  const parseChileanDateTime = (isoString) => {
    // Remove the 'Z' and any timezone suffix, then parse as local time
    const cleanString = isoString.replace(/Z$/, '').replace(/[+-]\d{2}:\d{2}$/, '');
    
    // Parse date components manually to avoid UTC interpretation
    const [datePart, timePart] = cleanString.split('T');
    const [year, month, day] = datePart.split('-').map(Number);
    const [hours, minutes] = (timePart || '00:00').split(':').map(Number);
    
    // Create a Date object in local timezone, then convert to what it should be in Chilean time
    // This creates the date as if we're in Chilean timezone
    return new Date(year, month - 1, day, hours, minutes, 0, 0);
  };
  
  const newWayParsing = parseChileanDateTime(frontendInput);
  console.log('New parsing (as local):', newWayParsing.toISOString());
  console.log('New parsing in Santiago:', newWayParsing.toLocaleString('es-CL', { timeZone: 'America/Santiago' }));
  
  console.log('\n=== Summary ===');
  console.log('Expected: 9:00 AM in Santiago should create slots at 9:00 AM Santiago time');
  console.log('Old way result: Slots created at', oldWayParsing.toLocaleString('es-CL', { timeZone: 'America/Santiago' }));
  console.log('New way result: Slots created at', newWayParsing.toLocaleString('es-CL', { timeZone: 'America/Santiago' }));
  
  const santiagTime = newWayParsing.toLocaleString('es-CL', { timeZone: 'America/Santiago' });
  const isFixed = santiagTime.includes('9:00') || santiagTime.includes('09:00');
  console.log('Fix working?', isFixed ? '✅ YES' : '❌ NO');
}

testTimezoneHandling();