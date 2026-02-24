const { getDB } = require('../config/mongoConfig');
const { ObjectId } = require('mongodb');

async function checkStock(productId, desiredQuantity) {
    try {
      const db = getDB();
  
      const product = await db
        .collection('products')
        .findOne({ _id: new ObjectId(productId) });
  
      if (!product) {
        throw new Error('Product not found');
      }
  
      const availableStock = product.stock ?? 0;
  
      return {
        isAvailable: desiredQuantity <= availableStock,
        availableStock
      };
    } catch (error) {
      console.error('Error checking stock:', error);
      throw error;
    }
  }

  module.exports = { checkStock }