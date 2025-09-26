// Test script para probar el endpoint de registro

const testData = {
  email: "test@test.com",
  password: "password123",
  fullName: "Test User",
  phone: "123456789",
  clinicName: "Test Clinic",
  accountType: "professional"
};

console.log("Probando registro con datos:", testData);

fetch('http://localhost:4000/auth/register', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(testData)
})
.then(response => {
  console.log('Status:', response.status);
  return response.json();
})
.then(data => {
  console.log('Response:', data);
})
.catch(error => {
  console.error('Error:', error);
});