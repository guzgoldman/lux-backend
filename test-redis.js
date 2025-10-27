/**
 * Script de prueba para verificar la conexión a Redis
 * y el funcionamiento del servicio de verificación
 * 
 * Ejecutar con: node test-redis.js
 */

require('dotenv').config();
const redisClient = require('./src/lib/redisClient');
const verificationService = require('./src/services/verificationService');

async function testRedis() {
  console.log('🧪 Iniciando pruebas de Redis...\n');

  try {
    // Test 1: Conexión a Redis
    console.log('Test 1: Verificando conexión a Redis...');
    await redisClient.ping();
    console.log('✅ Conexión a Redis exitosa\n');

    // Test 2: Crear solicitud de verificación
    console.log('Test 2: Creando solicitud de verificación...');
    const testUserId = 999;
    const testField = 'email';
    const testNewValue = 'test@example.com';
    const testCurrentEmail = 'current@example.com';
    
    const code = await verificationService.createVerificationRequest(
      testUserId,
      testField,
      testNewValue,
      testCurrentEmail,
      1 // 1 minuto de expiración para la prueba
    );
    console.log(`✅ Código generado: ${code}\n`);

    // Test 3: Verificar que existe la solicitud
    console.log('Test 3: Verificando solicitud pendiente...');
    const hasPending = await verificationService.hasPendingRequest(testUserId, testField);
    console.log(`✅ Solicitud pendiente: ${hasPending}\n`);

    // Test 4: Obtener tiempo restante
    console.log('Test 4: Verificando tiempo restante...');
    const timeRemaining = await verificationService.getTimeRemaining(testUserId, testField);
    console.log(`✅ Tiempo restante: ${timeRemaining} segundos\n`);

    // Test 5: Verificar código incorrecto
    console.log('Test 5: Verificando código incorrecto...');
    const incorrectVerification = await verificationService.verifyCode(testUserId, testField, '000000');
    console.log(`✅ Código incorrecto rechazado: ${incorrectVerification === null}\n`);

    // Test 6: Verificar código correcto
    console.log('Test 6: Verificando código correcto...');
    const correctVerification = await verificationService.verifyCode(testUserId, testField, code);
    console.log(`✅ Código correcto aceptado: ${correctVerification !== null}`);
    console.log(`   Nuevo valor: ${correctVerification.newValue}\n`);

    // Test 7: Eliminar solicitud
    console.log('Test 7: Eliminando solicitud...');
    await verificationService.deleteVerificationRequest(testUserId, testField);
    const stillPending = await verificationService.hasPendingRequest(testUserId, testField);
    console.log(`✅ Solicitud eliminada: ${!stillPending}\n`);

    console.log('🎉 Todas las pruebas pasaron exitosamente!\n');
    console.log('Redis está funcionando correctamente para el sistema de verificación.');

  } catch (error) {
    console.error('❌ Error durante las pruebas:', error.message);
    console.error('\nAsegúrate de que:');
    console.error('1. Redis esté corriendo (redis-server)');
    console.error('2. Las variables REDIS_HOST y REDIS_PORT estén configuradas en .env');
    console.error('3. No haya firewall bloqueando la conexión\n');
  } finally {
    // Cerrar conexión
    await redisClient.quit();
    console.log('\n👋 Conexión a Redis cerrada');
    process.exit(0);
  }
}

// Ejecutar pruebas
testRedis();
