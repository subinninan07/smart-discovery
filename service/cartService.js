const { getDB } = require('../config/mongoConfig');
const { getRedis } = require('../config/redisConfig');
const { checkStock } = require('../utils/utils')

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

async function cartFunction(key, cartData) {
  const redis = getRedis();

  const existingCartRaw = await redis.get(key);

  let currentCart;
  if (existingCartRaw) {
    try {
      const parsed = JSON.parse(existingCartRaw);
      currentCart =
        parsed && Array.isArray(parsed.items) ? parsed : { items: [] };
    } catch {
      currentCart = { items: [] };
    }
  } else {
    currentCart = { items: [] };
  }

  const itemsToAdd = Array.isArray(cartData) ? cartData : [cartData];

  for (const item of itemsToAdd) {
    if (!item || !item._id || !item.quantity) {
      throw new Error('Invalid cart item payload');
    }

    const existingItem = currentCart.items.find(
      (cartItem) => String(cartItem._id) === String(item._id)
    );

    const existingQuantity = existingItem ? existingItem.quantity : 0;
    const desiredTotalQuantity = existingQuantity + item.quantity;

    const { isAvailable, availableStock } = await checkStock(
      item._id,
      desiredTotalQuantity
    );

    if (!isAvailable) {
        console.log('Cart error:');
      throw new Error(
        `Insufficient stock for product ${item.name || item._id}. ` +
          `Requested: ${desiredTotalQuantity}, available: ${availableStock}`
      );
    }

    if (existingItem) {
      existingItem.quantity = desiredTotalQuantity;
    } else {
      currentCart.items.push({
        _id: item._id,
        name: item.name,
        quantity: item.quantity
      });
    }
  }

  // Save back to Redis
  await redis.set(key, JSON.stringify(currentCart));

  return currentCart;
}

async function clearCartService(key) {
        const redis = getRedis();
        const result = await redis.del(key);
        return 'cart cleared successfully'
}

module.exports = { fetchAllProducts, cartFunction, checkStock, clearCartService }