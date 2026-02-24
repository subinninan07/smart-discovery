const { getRedis } = require('../config/redisConfig');

async function setRedisValue(key, value) {
    try {
        const redis = getRedis();

        const storedValue = typeof value === 'string' ? value : JSON.stringify(value);

        await redis.set(key, storedValue);

        return true;

    } catch (error) {
        console.error("Redis SET error:", error);
        throw error;
    }
}

async function getRedisValue(key) {
    try {
        const redis = getRedis();

        const value = await redis.get(key);

        if (!value) {
            return null;
        }

        try {
            return JSON.parse(value);
        } catch {
            return value;
        }

    } catch (error) {
        console.error("Redis GET error:", error);
        throw error;
    }
}

async function deleteRedisValue(key) {
    try {
        const redis = getRedis();

        const result = await redis.del(key);

        return result === 1;

    } catch (error) {
        console.error("Redis DELETE error:", error);
        throw error;
    }
}

module.exports = {
    setRedisValue,
    getRedisValue,
    deleteRedisValue
};