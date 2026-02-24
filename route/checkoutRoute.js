const { checkoutController } = require('../controller/checkoutController');

module.exports = [
  {
    method: 'POST',
    path: '/api/checkout',
    handler: checkoutController,
    options: {
      auth: 'jwt',
      tags: ['api', 'checkout'],
      description: 'checkout products in cart',
      notes: 'checkout products in cart'
    }
  }
];