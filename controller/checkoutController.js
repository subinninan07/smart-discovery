const { checkoutFunction } = require('../service/checkoutService')

async function checkoutController(req, h) {
    try {
        const userEmail = req?.auth.credentials?.email
        if (!userEmail) {
            throw new Error("user mail not found in request");
        }
        const cacheKey = `cart:${userEmail}`
        const result = await checkoutFunction(cacheKey)
        return result
    } catch (error) {
        if (error.message?.includes('Cart is empty')) {
            return h.response({ message: error.message }).code(400);
        }
        throw error;

    }
}

module.exports = { checkoutController }