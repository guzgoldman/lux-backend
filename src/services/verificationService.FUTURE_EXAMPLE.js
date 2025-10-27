// Ejemplo de extensión del verificationService.js para incluir SMS
// Este código NO está implementado, solo es una guía para el futuro

const redisClient = require('../lib/redisClient');
const crypto = require('crypto');
const { enviarCorreo } = require('../lib/mailer');
// const { enviarSMS } = require('../lib/smsService'); // Necesitarías implementar esto

class VerificationService {
  // ... código existente ...

  /**
   * EJEMPLO: Enviar código por SMS (requiere servicio como Twilio)
   * 
   * @param {string} phoneNumber - Número de teléfono
   * @param {string} code - Código de verificación
   */
  async sendSMSCode(phoneNumber, code) {
    // Ejemplo usando Twilio (necesitarías instalarlo):
    // npm install twilio
    
    /*
    const twilio = require('twilio');
    const client = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );

    await client.messages.create({
      body: `Tu código de verificación es: ${code}. Válido por 15 minutos.`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phoneNumber
    });
    */
    
    throw new Error('Verificación por SMS no implementada aún');
  }

  /**
   * EJEMPLO: Solicitar verificación con opción de método
   * 
   * @param {number} userId 
   * @param {string} field 
   * @param {string} newValue 
   * @param {object} contactInfo - { email, telefono }
   * @param {string} method - 'email' o 'sms'
   */
  async createVerificationWithMethod(userId, field, newValue, contactInfo, method = 'email') {
    const code = this.generateCode();
    const key = `verification:${userId}:${field}`;
    
    const data = {
      code,
      newValue,
      method,
      currentEmail: contactInfo.email,
      currentPhone: contactInfo.telefono,
      createdAt: new Date().toISOString(),
    };

    await redisClient.setex(key, 15 * 60, JSON.stringify(data));

    // Enviar por el método elegido
    if (method === 'email') {
      // Usar el método existente de email
      // await this.sendEmailCode(contactInfo.email, code, field, newValue);
    } else if (method === 'sms') {
      await this.sendSMSCode(contactInfo.telefono, code);
    }

    return code;
  }

  /**
   * EJEMPLO: Reenviar código
   * 
   * Útil cuando el usuario no recibió el código la primera vez
   */
  async resendCode(userId, field) {
    const key = `verification:${userId}:${field}`;
    const data = await redisClient.get(key);

    if (!data) {
      throw new Error('No hay ninguna solicitud pendiente');
    }

    const parsed = JSON.parse(data);
    
    // Generar nuevo código pero mantener los mismos datos
    const newCode = this.generateCode();
    parsed.code = newCode;
    parsed.resentAt = new Date().toISOString();

    // Actualizar en Redis manteniendo el TTL original
    const ttl = await redisClient.ttl(key);
    if (ttl > 0) {
      await redisClient.setex(key, ttl, JSON.stringify(parsed));
    }

    // Reenviar por el método original
    if (parsed.method === 'email') {
      // await this.sendEmailCode(...);
    } else if (parsed.method === 'sms') {
      await this.sendSMSCode(parsed.currentPhone, newCode);
    }

    return newCode;
  }

  /**
   * EJEMPLO: Limitar intentos de verificación
   * 
   * Para evitar ataques de fuerza bruta
   */
  async verifyCodeWithAttempts(userId, field, code, maxAttempts = 3) {
    const attemptKey = `verification:${userId}:${field}:attempts`;
    
    // Obtener intentos actuales
    let attempts = await redisClient.get(attemptKey);
    attempts = attempts ? parseInt(attempts) : 0;

    if (attempts >= maxAttempts) {
      // Eliminar la verificación después de demasiados intentos
      await this.deleteVerificationRequest(userId, field);
      await redisClient.del(attemptKey);
      throw new Error('Demasiados intentos. Solicita un nuevo código.');
    }

    // Verificar código
    const verificationData = await this.verifyCode(userId, field, code);

    if (!verificationData) {
      // Incrementar intentos fallidos
      await redisClient.setex(attemptKey, 15 * 60, attempts + 1);
      return null;
    }

    // Código correcto, limpiar intentos
    await redisClient.del(attemptKey);
    return verificationData;
  }

  /**
   * EJEMPLO: Historial de cambios (requiere base de datos)
   * 
   * Para auditoría y seguridad
   */
  async saveChangeHistory(userId, field, oldValue, newValue) {
    // Esto requeriría un modelo en Sequelize
    /*
    const CambioHistorial = require('../models/cambio_historial');
    
    await CambioHistorial.create({
      id_usuario: userId,
      campo: field,
      valor_anterior: oldValue,
      valor_nuevo: newValue,
      fecha_cambio: new Date(),
      ip_address: req.ip, // Necesitarías pasarlo desde el controlador
      user_agent: req.get('user-agent')
    });
    */
  }
}

module.exports = new VerificationService();

/* 
 * PARA IMPLEMENTAR ESTO EN EL FUTURO:
 * 
 * 1. Instalar dependencias:
 *    npm install twilio
 * 
 * 2. Agregar variables de entorno:
 *    TWILIO_ACCOUNT_SID=your_account_sid
 *    TWILIO_AUTH_TOKEN=your_auth_token
 *    TWILIO_PHONE_NUMBER=+1234567890
 * 
 * 3. Crear modelo CambioHistorial si quieres guardar historial:
 *    npx sequelize-cli model:generate --name CambioHistorial \
 *      --attributes id_usuario:integer,campo:string,valor_anterior:string,valor_nuevo:string
 * 
 * 4. Actualizar el frontend para:
 *    - Permitir al usuario elegir método (email o SMS)
 *    - Agregar botón "Reenviar código"
 *    - Mostrar intentos restantes
 * 
 * 5. Actualizar controladores para usar los nuevos métodos
 */
