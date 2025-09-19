const axios = require('axios');

// Función para probar la autenticación
async function testAuth() {
  try {
    console.log('🧪 Probando autenticación...');
    
    // URL del endpoint de usuarios
    const url = 'http://localhost:3000/users';
    
    // Token de prueba (reemplaza con un token real de Firebase)
    const token = 'TU_TOKEN_DE_FIREBASE_AQUI';
    
    const response = await axios.get(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Autenticación exitosa!');
    console.log('Respuesta:', response.data);
    
  } catch (error) {
    console.log('❌ Error en autenticación:');
    console.log('Status:', error.response?.status);
    console.log('Message:', error.response?.data?.message || error.message);
    console.log('Headers:', error.response?.headers);
  }
}

// Ejecutar la prueba
testAuth();

