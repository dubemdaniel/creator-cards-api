if (!process.env.__ALREADY_BOOTSTRAPPED_ENVS) require('dotenv').config();

const fs = require('fs');
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

server.startServer();
