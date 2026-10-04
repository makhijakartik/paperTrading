const { createClient } = require('redis');
require('dotenv').config();

// Create Redis Client
const redisClient = createClient({
  url: process.env.REDIS_URL
});

redisClient.on('error', (err) => console.log('❌ Redis Client Error', err));
redisClient.on('connect', () => console.log('✅ Connected to Redis successfully.'));

// Connect to Redis
const connectRedis = async () => {
  try {
    await redisClient.connect();
  } catch (err) {
    console.error('Failed to connect to Redis during startup', err);
  }
};

connectRedis();

module.exports = redisClient;
