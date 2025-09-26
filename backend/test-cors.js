// Script para probar CORS configuration
import fetch from 'node-fetch';

async function testCORS() {
  console.log('🌐 Probando configuración de CORS...\n');
  
  const frontendUrls = [
    'https://veterinaria-p918.vercel.app',
    'https://veterinaria-gamma-virid.vercel.app', 
    'http://localhost:3000'
  ];
  
  const backendUrl = 'https://veterinaria-gamma-virid.vercel.app';
  
  for (const origin of frontendUrls) {
    console.log(`🔗 Probando desde origin: ${origin}`);
    
    try {
      // Test preflight request
      const preflightResponse = await fetch(`${backendUrl}/health`, {
        method: 'OPTIONS',
        headers: {
          'Origin': origin,
          'Access-Control-Request-Method': 'GET',
          'Access-Control-Request-Headers': 'Content-Type,Authorization'
        }
      });
      
      console.log(`   Preflight Status: ${preflightResponse.status}`);
      console.log(`   CORS Headers: ${preflightResponse.headers.get('Access-Control-Allow-Origin')}`);
      
      // Test actual request
      const response = await fetch(`${backendUrl}/health`, {
        method: 'GET',
        headers: {
          'Origin': origin,
          'Content-Type': 'application/json'
        }
      });
      
      console.log(`   GET Status: ${response.status}`);
      const text = await response.text();
      console.log(`   Response: ${text.substring(0, 100)}...`);
      
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
    }
    
    console.log('');
  }
}

testCORS();