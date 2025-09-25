import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const user = { id: 14, email: 'test@test.com' };
const token = jwt.sign(user, process.env.JWT_SECRET);

console.log('Testing cleanup endpoint...');

try {
  const response = await fetch('http://localhost:4000/prescriptions/cleanup', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  
  console.log('Status:', response.status);
  
  if (response.ok) {
    const data = await response.json();
    console.log('✅ Cleanup successful:', data);
  } else {
    const error = await response.text();
    console.log('❌ Cleanup failed:', error);
  }
} catch (error) {
  console.error('❌ Request failed:', error.message);
}