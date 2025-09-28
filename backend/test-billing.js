// Quick test script for billing endpoint
import fetch from 'node-fetch';

// Test the billing endpoint directly
async function testBilling() {
  try {
    console.log('Testing billing endpoint...');
    
    // Note: In a real test, you'd need a valid JWT token
    // This is just to check if the endpoint responds properly
    const response = await fetch('http://localhost:4000/billing/create-preference', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer fake-token-for-testing'
      },
      body: JSON.stringify({ planId: 'basic' })
    });

    const data = await response.json();
    console.log('Response status:', response.status);
    console.log('Response data:', data);
    
  } catch (error) {
    console.error('Test error:', error);
  }
}

testBilling();