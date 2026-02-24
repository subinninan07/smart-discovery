const Joi = require('joi');
const { getAllProducts, cartProducts, clearCart, fetchCart } = require('../controller/cartController');

module.exports = [
    {
        method: 'POST',
        path: '/api/cart',
        handler: cartProducts,
        options: {
            auth: 'jwt',
            tags: ['api', 'cart'],
            description: 'Add products to cart',
            notes: 'Add products to redis cart',
            validate: {
                payload: Joi.array().items(
                    Joi.object({
                        _id: Joi.string()
                            .required()
                            .description('Product ID'),

                        name: Joi.string()
                            .min(2)
                            .required()
                            .description('Product name'),

                        quantity: Joi.number()
                            .integer()
                            .min(1)
                            .required()
                            .description('Product quantity')
                    })
                )
                    .min(1)
                    .required()
            }
        }
    },
    {
        method: 'DELETE',
        path: '/api/cart',
        handler: clearCart,
        options: {
            auth: 'jwt',
            tags: ['api', 'cart'],
            description: 'Delete products from cart',
            notes: 'delete products to redis cart'
        }
    },
    {
        method: 'GET',
        path: '/api/cart/fetch',
        handler: fetchCart,
        options: {
            auth: 'jwt',
            tags: ['api', 'cart'],
            description: 'fetch the products in cart',
            notes: 'fetch the products in cart'
        }
    }


];