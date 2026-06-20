if (!process.env.__ALREADY_BOOTSTRAPPED_ENVS) require('dotenv').config();

const fs = require('fs');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./docs/swagger');
const { createServer } = require('@app-core/server');
const { createConnection } = require('@app-core/mongoose');

createConnection({
  uri: process.env.MONGODB_URI,
});

const server = createServer({
  port: process.env.PORT || 3000,
  JSONLimit: '10mb',
  enableCors: true,
});

const ENDPOINT_CONFIGS = [
  { path: './endpoints/creator-cards/' },
];

function setupEndpointHandlers(basePath) {
  const dirs = fs.readdirSync(basePath);
  dirs.forEach((file) => {
    const handler = require(`${basePath}${file}`);
    server.addHandler(handler);
  });
}

ENDPOINT_CONFIGS.forEach((config) => {
  setupEndpointHandlers(config.path, config.options);
});

// Serve Swagger UI at /docs using Express app directly
const app = server.getApp();
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Creator Card API Documentation',
}));
app.get('/docs.json', (req, res) => {
  res.json(swaggerSpec);
});

server.startServer();