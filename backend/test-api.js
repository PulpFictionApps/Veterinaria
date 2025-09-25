import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

// Crear un token de prueba
const user = { id: 14, email: 'test@test.com' }; // Usuario ID del test anterior
const jwtSecret = process.env.JWT_SECRET;
console.log('JWT_SECRET:', jwtSecret);

const token = jwt.sign(user, jwtSecret);

console.log('Token JWT generado:', token);

// Test de la API con fetch
const testAPI = async () => {
  const prescriptionData = {
    petId: 16,
    tutorId: 13,
    title: 'Test API',
    content: 'Test desde script',
    medication: 'Amoxicilina',
    dosage: '250mg',
    frequency: 'cada 8 horas', 
    duration: '7 días',
    instructions: 'Con comida'
  };

  try {
    const response = await fetch('http://localhost:4000/prescriptions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(prescriptionData)
    });

    console.log('Status:', response.status);
    console.log('Headers:', Object.fromEntries(response.headers));

    if (response.ok) {
      const result = await response.json();
      console.log('✓ API funcionó:', result);
    } else {
      const error = await response.text();
      console.log('❌ Error de la API:', error);
    }
  } catch (error) {
    console.error('❌ Error de conexión:', error.message);
  }
};

testAPI();