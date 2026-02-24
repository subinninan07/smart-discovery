const { setRedisValue, getRedisValue, deleteRedisValue } = require('../service/redisService');

async function setRedisController(req, h) {
    try {
        const { key, value } = req.payload;

        if (!key) {
            throw new Error("Key is required");
        }

        const result = await setRedisValue(key, value);

        return { message: "Key set successfully", result };

    } catch (error) {
        throw error;
    }
}

async function getRedisController(req, h) {
    try {
        const key = req.params.key;

        const result = await getRedisValue(key);

        return { key: key, value: result };

    } catch (error) {
        throw error;
    }
}

async function deleteRedisController(req, h) {
    try {
        const key = req.params.key;

        const result = await deleteRedisValue(key);

        return { message: "Key deleted", deleted: result };

    } catch (error) {
        throw error;
    }
}

module.exports = {
    setRedisController,
    getRedisController,
    deleteRedisController
};