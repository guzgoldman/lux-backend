const Redis = require('ioredis');

// Cliente Redis para operaciones generales (no solo colas)
const redisClient = new Redis({
  host: process.env.REDIS_HOST || '127.0.0.1',
  port: Number(process.env.REDIS_PORT || 6379),
  password: process.env.REDIS_PASSWORD || undefined,
  maxRetriesPerRequest: 3,
  retryStrategy(times) {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
});

redisClient.on('connect', () => {
  console.log('[REDIS] Cliente conectado correctamente');
});

redisClient.on('error', (err) => {
  console.error('[REDIS] Error en conexión:', err.message);
});

module.exports = redisClient;
