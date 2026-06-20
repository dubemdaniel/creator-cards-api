if (!process.env.__ALREADY_BOOTSTRAPPED_ENVS) require('dotenv').config();

const fs = require('fs');
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

const app = server.getApp();
app.get('/docs', (req, res) => {
  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Creator Card API Documentation</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui.css">
  <style>
    .swagger-ui .topbar { display: none }
    html { box-sizing: border-box; overflow: -moz-scrollbars-vertical; overflow-y: scroll; }
    *, *:before, *:after { box-sizing: inherit; }
    body { margin: 0; background: #fafafa; }
  </style>
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui-standalone-preset.js"></script>
  <script>
    SwaggerUIBundle({
      url: '/docs.json',
      dom_id: '#swagger-ui',
      presets: [
        SwaggerUIBundle.presets.apis,
        SwaggerUIStandalonePreset
      ],
      layout: "StandaloneLayout",
    });
  </script>
</body>
</html>`);
});
app.get('/docs.json', (req, res) => {
  res.json(swaggerSpec);
});

server.startServer();
