const { getDB } = require('../config/mongoConfig');
const { getRedis } = require('../config/redisConfig');
const { ObjectId } = require('mongodb');
const { checkStock } = require('../utils/utils');

async function checkoutFunction(cacheKey) {

    try {

        const db = getDB();
        const redis = getRedis();

        const cartData = await redis.get(cacheKey);

        if (!cartData) {
            throw new Error("Cart is empty");
        }

        const parsedCart = JSON.parse(cartData);

        if (!parsedCart.items || parsedCart.items.length === 0) {
            throw new Error("Cart is empty");
        }

        const cartItems = parsedCart.items;

        const outOfStockItems = [];

        for (let i = 0; i < cartItems.length; i++) {

            const stockResult = await checkStock(
                cartItems[i]._id,
                cartItems[i].quantity
            );

            if (!stockResult.isAvailable) {

                outOfStockItems.push({
                    productId: cartItems[i]._id,
                    requested: cartItems[i].quantity,
                    available: stockResult.availableStock
                });
            }
        }

        if (outOfStockItems.length > 0) {
            return {
                message: "Some items are out of stock",
                outOfStock: outOfStockItems
            };
        }

        const productIds = cartItems.map(function (item) {
            return new ObjectId(item._id);
        });

        const aggregationResult = await db.collection('products').aggregate([

            { $match: { _id: { $in: productIds } } },

            {
                $addFields: {
                    quantity: {
                        $let: {
                            vars: {
                                matched: {
                                    $arrayElemAt: [
                                        {
                                            $filter: {
                                                input: cartItems,
                                                as: "c",
                                                cond: {
                                                    $eq: ["$$c._id", { $toString: "$_id" }]
                                                }
                                            }
                                        },
                                        0
                                    ]
                                }
                            },
                            in: "$$matched.quantity"
                        }
                    }
                }
            },

            {
                $addFields: {
                    itemTotal: { $multiply: ["$price", "$quantity"] }
                }
            },

            {
                $group: {
                    _id: null,
                    items: {
                        $push: {
                            productId: "$_id",
                            name: "$name",
                            price: "$price",
                            quantity: "$quantity",
                            total: "$itemTotal"
                        }
                    },
                    subtotal: { $sum: "$itemTotal" }
                }
            },

            {
                $addFields: {
                    tax: { $multiply: ["$subtotal", 0.18] },
                    discount: {
                        $cond: [
                            { $gt: ["$subtotal", 3000] },
                            { $multiply: ["$subtotal", 0.10] },
                            0
                        ]
                    }
                }
            },

            {
                $addFields: {
                    finalTotal: {
                        $subtract: [
                            { $add: ["$subtotal", "$tax"] },
                            "$discount"
                        ]
                    }
                }
            }

        ]).toArray();

        if (!aggregationResult.length) {
            throw new Error("Products not found");
        }

        const orderSummary = aggregationResult[0];

        for (let i = 0; i < orderSummary.items.length; i++) {

            const item = orderSummary.items[i];

            const updateResult = await db.collection('products').updateOne(
                {
                    _id: item.productId,
                    stock: { $gte: item.quantity }
                },
                { $inc: { stock: -item.quantity } }
            );

            if (updateResult.modifiedCount === 0) {
                throw new Error("Stock update failed for " + item.name);
            }
        }

        const orderDoc = {
            email: cacheKey.replace("cart:", ""),
            items: orderSummary.items,
            subtotal: orderSummary.subtotal,
            tax: orderSummary.tax,
            discount: orderSummary.discount,
            finalTotal: orderSummary.finalTotal,
            createdAt: new Date()
        };

        await db.collection('orders').insertOne(orderDoc);

        await redis.del(cacheKey);

        return {
            message: "Checkout successful",
            order: orderDoc
        };

    } catch (error) {
        console.error("Error in checkout:", error);
        throw error;
    }
}

module.exports = { checkoutFunction };