const { getDB } = require('../config/mongoConfig');

async function fetchAllProducts() {
    try {
        const db = getDB();
        const results = await db.collection('products').find({}, { projection: { embedding: 0, tags: 0 } }).toArray();
        return results;
    } catch (error) {
        console.error('Error in fetching products:', error);
        throw error;
    }
}

module.exports = { fetchAllProducts }