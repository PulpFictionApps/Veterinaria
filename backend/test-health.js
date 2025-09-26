import http from 'http';

function testAPI() {
  const options = {
    hostname: 'localhost',
    port: 4000,
    path: '/health',
    method: 'GET',
    timeout: 5000
  };

  console.log('Testing backend API...');
  
  const req = http.request(options, (res) => {
    let data = '';
    
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log(`✅ Status: ${res.statusCode}`);
      console.log(`📦 Response: ${data}`);
      console.log('🎉 Backend API is working!');
    });
  });

  req.on('error', (error) => {
    console.error('❌ API test failed:', error.message);
    console.log('💡 Make sure the backend server is running on port 4000');
  });

  req.on('timeout', () => {
    console.error('❌ Request timed out');
    req.destroy();
  });

  req.end();
}

// Wait a moment for server to fully start
setTimeout(testAPI, 2000);