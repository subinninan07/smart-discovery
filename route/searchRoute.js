const Joi = require('joi');
const { searchcontroller } = require('../controller/searchController');

module.exports = [
  {
    method: 'POST',
    path: '/api/products/search',
    handler: searchcontroller,
    options: {
      auth: 'jwt',
      tags: ['api', 'search'],
      description: 'Search Products',
      notes: 'Search products using hybrid vector search',

      validate: {
        payload: Joi.object({
          search: Joi.string()
            .required()
            .example('laptop under 1000')
            .description('User search query')
        })
      }
    }
  }
];