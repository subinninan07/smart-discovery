const { getAllProducts } = require('../controller/productController');

module.exports = [
    {
        method: 'GET',
        path: '/api/products',
        handler: getAllProducts,
        options: {
            auth: 'jwt',
            tags: ['api', 'products'],
            description: 'Get all products',
            notes: 'Returns all products. Requires JWT.'
        }
    },
]