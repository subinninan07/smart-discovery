const Redis = require('ioredis');

let redis;

const connectRedis = async () => {
  try {
    redis = new Redis(process.env.REDIS_URL);

    redis.on('connect', () => {
      console.log('🔁 Redis Connected Successfully');
    });

    redis.on('error', (err) => {
      console.error('❌ Redis Error:', err);
    });

    return redis;

  } catch (error) {
    console.error('❌ Redis Connection Failed:', error);
    process.exit(1);
  }
};

const getRedis = () => {
  if (!redis) {
    throw new Error('Redis not initialized. Call connectRedis first.');
  }
  return redis;
};

module.exports = { connectRedis, getRedis };
