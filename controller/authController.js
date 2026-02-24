const { getUserByEmail, createUser } = require('../models/user');
const jwt = require('jsonwebtoken');

async function googleLogin(req, h) {
    try {
        if (!req.auth.isAuthenticated) {
            return h.response('Authentication failed').code(401);
        }
        const profile = req.auth.credentials.profile;

        const email = profile.email;
        const name = profile.displayName;

        let user = await getUserByEmail(email);
        if (!user) {
            user = await createUser({ email, name, provider: 'google', createdAt: new Date() });
        }
        const token = jwt.sign({ userId: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1d' });
        const response = {
            message: 'Login successful, use this token to access the api via Swagger UI',
            token: token
        }

        return h.response(response).code(200);
    } catch (error) {
        console.error('Error logging in:', error);
        return h.response('Internal server error').code(500);
    }

}


module.exports = { googleLogin };