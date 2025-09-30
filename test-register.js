// Test registro con validación chilena
const API_BASE = 'http://localhost:4000';

async function testRegister() {
  console.log('🧪 Testing Professional Registration with Chilean Validation\n');

  const testCases = [
    {
      name: 'Registro válido',
      data: {
        email: 'dra.martinez@veterinaria.cl',
        password: 'password123',
        fullName: 'Dra. Carmen Martínez',
        phone: '+56 9 1234 5678',
        professionalRut: '12.345.678-9',
        clinicName: 'Clínica Veterinaria Martínez',
        accountType: 'professional'
      },
      shouldSucceed: true
    },
    {
      name: 'Registro sin RUT (debe fallar)',
      data: {
        email: 'dr.lopez@veterinaria.cl',
        password: 'password123',
        fullName: 'Dr. Luis López',
        phone: '+56 9 8765 4321',
        clinicName: 'Clínica López',
        accountType: 'professional'
      },
      shouldSucceed: false
    },
    {
      name: 'Registro sin teléfono (debe fallar)',
      data: {
        email: 'dra.gonzalez@veterinaria.cl',
        password: 'password123',
        fullName: 'Dra. Ana González',
        professionalRut: '98.765.432-1',
        clinicName: 'Clínica González',
        accountType: 'professional'
      },
      shouldSucceed: false
    },
    {
      name: 'Registro con teléfono duplicado (debe fallar)',
      data: {
        email: 'dr.silva@veterinaria.cl',
        password: 'password123',
        fullName: 'Dr. Pedro Silva',
        phone: '+56 9 1234 5678', // Mismo teléfono que el primer caso
        professionalRut: '11.222.333-4',
        clinicName: 'Clínica Silva',
        accountType: 'professional'
      },
      shouldSucceed: false
    },
    {
      name: 'Registro con RUT duplicado (debe fallar)',
      data: {
        email: 'dra.torres@veterinaria.cl',
        password: 'password123',
        fullName: 'Dra. María Torres',
        phone: '+56 9 5555 6666',
        professionalRut: '12.345.678-9', // Mismo RUT que el primer caso
        clinicName: 'Clínica Torres',
        accountType: 'professional'
      },
      shouldSucceed: false
    }
  ];

  for (const testCase of testCases) {
    console.log(`📋 ${testCase.name}`);
    try {
      const response = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(testCase.data)
      });

      const result = await response.json();
      
      if (testCase.shouldSucceed && response.ok) {
        console.log(`   ✅ Registro exitoso: ${testCase.data.fullName}`);
        console.log(`   🎫 Token: ${result.token ? 'Generado' : 'No generado'}`);
      } else if (!testCase.shouldSucceed && !response.ok) {
        console.log(`   ✅ Falló como se esperaba: ${result.error}`);
      } else if (testCase.shouldSucceed && !response.ok) {
        console.log(`   ❌ Falló inesperadamente: ${result.error}`);
      } else {
        console.log(`   ❌ Éxito inesperado cuando debería fallar`);
      }
      
    } catch (error) {
      console.log(`   ❌ Error de conexión: ${error.message}`);
    }
    
    console.log(''); // Línea en blanco
  }
}

testRegister().catch(console.error);