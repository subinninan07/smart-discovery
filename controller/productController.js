const { fetchAllProducts } = require('../service/productService')

async function getAllProducts(req, h) {
    try {
        const result = await fetchAllProducts();
        return result;
    } catch (error) {
        throw error;

    }
}

module.exports = { getAllProducts }