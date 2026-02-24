const { googleLogin } = require('../controller/authController');

module.exports = [
    {
        method: ['GET', 'POST'],
        path: '/auth/google',
        options: {
            auth: 'google',
            handler: googleLogin
        }
    }
]