const { fetchAllProducts, cartFunction, clearCartService } = require('../service/cartService')
const { getRedisValue } = require('./../service/redisService')

async function getAllProducts(req, h) {
    try {
        const result = await fetchAllProducts();
        return result;
    } catch (error) {
        throw error;

    }
}

async function cartProducts(req, h) {
    try {
        const userEmail = req?.auth.credentials?.email
        const payload = req?.payload
        if (!userEmail) {
            throw new Error("user mail not found in request");
        }
        const cacheKey = `cart:${userEmail}`
        const result = await cartFunction(cacheKey, payload)
        return result

    } catch (error) {
        if (error.message?.includes('Insufficient stock')) {
            return h.response({ message: error.message }).code(422);
        }
        if (error.message?.includes('Product not found')) {
            return h.response({ message: error.message }).code(404);
        }
        throw error;
    }
}

async function clearCart(req, h) {
    try {
        const userEmail = req?.auth.credentials?.email
        if (!userEmail) {
            throw new Error("user mail not found in request");
        }
        const cacheKey = `cart:${userEmail}`
        const result = await clearCartService(cacheKey)
        return result

    } catch (error) {
        if (error.message?.includes('Error in clearing Cart')) {
            return h.response({ message: error.message }).code(500);
        }
        throw error;
    }
}

async function fetchCart(req, h) {
    try {
        const userEmail = req?.auth.credentials?.email
        if (!userEmail) {
            throw new Error("user mail not found in request");
        }
        const cacheKey = `cart:${userEmail}`
        const cart = await getRedisValue(cacheKey)
        if(!cart){
            return "cart is empty"
        }
        return cart
    } catch (error) {
        throw err
    }
}


module.exports = { getAllProducts, cartProducts, clearCart, fetchCart }