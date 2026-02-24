const { setRedisController, getRedisController, deleteRedisController } = require('../controller/redisController');

module.exports = [
    {
        method: 'POST',
        path: '/api/redis/set',
        handler: setRedisController,
        options: {
            tags: ['api', 'redis'],
            description: 'Set value in Redis',
            auth: 'jwt'
        }
    },
    {
        method: 'GET',
        path: '/api/redis/get/{key}',
        handler: getRedisController,
        options: {
            tags: ['api', 'redis'],
            description: 'Get value from Redis',
            auth: 'jwt'
        }
    },
    {
        method: 'DELETE',
        path: '/api/redis/delete/{key}',
        handler: deleteRedisController,
        options: {
            tags: ['api','redis'],
            description: 'Delete key from Redis',
            auth: 'jwt'
        }
    }
];