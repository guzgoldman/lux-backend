const redisClient = require('../lib/redisClient');
const crypto = require('crypto');

/**
 * Servicio para manejar verificaciones temporales de cambios de datos
 * Utiliza Redis para almacenar códigos de verificación con TTL
 */

class VerificationService {
  /**
   * Genera un código de verificación aleatorio de 6 dígitos
   */
  generateCode() {
    return crypto.randomInt(100000, 999999).toString();
  }

  /**
   * Guarda una solicitud de cambio pendiente en Redis
   * @param {number} userId - ID del usuario
   * @param {string} field - Campo a cambiar ('email' o 'telefono')
   * @param {string} newValue - Nuevo valor
   * @param {string} currentEmail - Email actual del usuario (para enviar el código)
   * @param {number} expirationMinutes - Minutos hasta que expire el código (default: 15)
   * @returns {Promise<string>} - Código de verificación generado
   */
  async createVerificationRequest(userId, field, newValue, currentEmail, expirationMinutes = 15) {
    const code = this.generateCode();
    const key = `verification:${userId}:${field}`;
    
    const data = {
      code,
      newValue,
      currentEmail,
      createdAt: new Date().toISOString(),
    };

    // Guardar en Redis con expiración
    await redisClient.setex(
      key,
      expirationMinutes * 60,
      JSON.stringify(data)
    );
    return code;
  }

  /**
   * Verifica un código y retorna los datos si es válido
   * @param {number} userId - ID del usuario
   * @param {string} field - Campo que se está verificando
   * @param {string} code - Código ingresado por el usuario
   * @returns {Promise<object|null>} - Datos de verificación o null si es inválido
   */
  async verifyCode(userId, field, code) {
    const key = `verification:${userId}:${field}`;
    const data = await redisClient.get(key);

    if (!data) {
      return null; // No existe o expiró
    }

    const parsed = JSON.parse(data);

    if (parsed.code !== code) {
      return null; // Código incorrecto
    }

    return parsed;
  }

  /**
   * Elimina una solicitud de verificación después de ser usada
   * @param {number} userId - ID del usuario
   * @param {string} field - Campo verificado
   */
  async deleteVerificationRequest(userId, field) {
    const key = `verification:${userId}:${field}`;
    await redisClient.del(key);
  }

  /**
   * Verifica si existe una solicitud pendiente
   * @param {number} userId - ID del usuario
   * @param {string} field - Campo a verificar
   * @returns {Promise<boolean>}
   */
  async hasPendingRequest(userId, field) {
    const key = `verification:${userId}:${field}`;
    const exists = await redisClient.exists(key);
    return exists === 1;
  }

  /**
   * Obtiene el tiempo restante de una verificación
   * @param {number} userId - ID del usuario
   * @param {string} field - Campo a verificar
   * @returns {Promise<number>} - Segundos restantes, -1 si no existe
   */
  async getTimeRemaining(userId, field) {
    const key = `verification:${userId}:${field}`;
    return await redisClient.ttl(key);
  }

  /**
   * Obtiene los datos de una verificación pendiente (sin el código)
   * @param {number} userId - ID del usuario
   * @param {string} field - Campo a verificar
   * @returns {Promise<object|null>} - { newValue, timeRemaining } o null si no existe
   */
  async getPendingVerificationData(userId, field) {
    const key = `verification:${userId}:${field}`;
    const data = await redisClient.get(key);

    if (!data) {
      return null;
    }

    const parsed = JSON.parse(data);
    const timeRemaining = await redisClient.ttl(key);

    return {
      newValue: parsed.newValue,
      timeRemaining: timeRemaining > 0 ? timeRemaining : 0,
      createdAt: parsed.createdAt
    };
  }

  /**
   * Crea una solicitud de recuperación de contraseña
   * @param {number} userId - ID del usuario
   * @param {string} email - Email del usuario
   * @param {string} username - Username del usuario
   * @param {string} nombreCompleto - Nombre completo del usuario
   * @param {number} expirationMinutes - Minutos hasta que expire
   * @returns {Promise<string>} - Código generado
   */
  async createPasswordResetRequest(userId, email, username, nombreCompleto, expirationMinutes = 15) {
    const code = this.generateCode();
    const key = `verification:${userId}:password_reset`;
    
    const data = {
      code,
      email,
      username,
      nombreCompleto,
      createdAt: new Date().toISOString(),
    };

    await redisClient.setex(
      key,
      expirationMinutes * 60,
      JSON.stringify(data)
    );
    return code;
  }

  /**
   * Verifica un código de recuperación de contraseña
   * @param {number} userId - ID del usuario
   * @param {string} code - Código ingresado
   * @returns {Promise<object|null>} - Datos si es válido, null si no
   */
  async verifyPasswordReset(userId, code) {
    const key = `verification:${userId}:password_reset`;
    const data = await redisClient.get(key);

    if (!data) {
      return null;
    }

    const parsed = JSON.parse(data);

    if (parsed.code !== code) {
      return null;
    }

    return parsed;
  }

  /**
   * Elimina una solicitud de recuperación de contraseña
   * @param {number} userId - ID del usuario
   */
  async deletePasswordResetRequest(userId) {
    const key = `verification:${userId}:password_reset`;
    await redisClient.del(key);
  }
}

module.exports = new VerificationService();
