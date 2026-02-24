require('dotenv').config();
const HapiAuthJwt2 = require('hapi-auth-jwt2');
const Hapi = require('@hapi/hapi');
const Bell = require('@hapi/bell');
const Cookie = require('@hapi/cookie');
const HapiSwagger = require('hapi-swagger');
const Inert = require('@hapi/inert');
const Vision = require('@hapi/vision');
const Pack = require('./package.json');
const authRoutes = require('./route/authRoute.js');
const cartRoutes = require('./route/cartRoute.js');
const searchRoute = require('./route/searchRoute.js');
const checkoutRoute = require('./route/checkoutRoute.js');
const productRoute = require('./route/productRoute.js');
const redisRoute = require('./route/redisRoute.js');
const seedProduct = require('./models/seedProduct.js');
const { connectDB } = require('./config/mongoConfig');
const { connectRedis } = require('./config/redisConfig');


const init = async () => {

  await connectDB();
  await connectRedis();

  const server = Hapi.server({
    port: process.env.PORT || 3000,
    host: '0.0.0.0'
  });


  await server.register([Bell, Cookie]);

  const swaggerOptions = {
    info: {
      title: 'Smart Discovery API',
      version: Pack.version,
      description: 'API documentation for Smart Discovery service'
    },
    schemes: ['http'],
    grouping: 'tags',
    securityDefinitions: {
      jwt: {
        type: 'apiKey',
        name: 'Authorization',
        in: 'header'
      }
    },
    security: [{ jwt: [] }]
  };

  await server.register([
    Inert,
    Vision,
    {
      plugin: HapiSwagger,
      options: swaggerOptions,
      auth : false
    }
  ]);

  await server.register(HapiAuthJwt2);

  server.auth.strategy('jwt', 'jwt', {
    key: process.env.JWT_SECRET,
    validate: async (decoded) => {
      return { isValid: true, credentials: decoded };
    },
    verifyOptions: {
      algorithms: ['HS256']
    }
  });

  server.auth.default('jwt');


  server.auth.strategy('session', 'cookie', {
    cookie: {
      name: 'oauth-session',
      password: process.env.COOKIE_PASSWORD,
      isSecure: true
    },
    redirectTo: false
  });

  server.auth.strategy('google', 'bell', {
    provider: 'google',
    password: process.env.COOKIE_PASSWORD,
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    isSecure: true,
    location: process.env.BASE_URL
  });

  //await seedProduct();

  server.route(authRoutes);
  server.route(cartRoutes)
  server.route(productRoute);
  server.route(searchRoute);
  server.route(checkoutRoute);
  server.route(redisRoute);

  await server.start();
  console.log(`🚀 Server running on ${server.info.uri}`);
};

init().catch(err => {
  console.error("Server failed to start:", err);
  process.exit(1);
});