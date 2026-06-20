const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Creator Card API',
      version: '1.0.0',
      description: 'REST API for Creator Cards - shareable profile cards with links and service rates',
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server',
      },
    ],
    components: {
      schemas: {
        CreatorCard: {
          type: 'object',
          properties: {
            id: { type: 'string', description: 'ULID identifier' },
            title: { type: 'string', minLength: 3, maxLength: 100 },
            description: { type: 'string', maxLength: 500, nullable: true },
            slug: { type: 'string', minLength: 5, maxLength: 50, pattern: '^[a-z0-9_-]+$' },
            creator_reference: { type: 'string', length: 20 },
            links: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  title: { type: 'string', minLength: 1, maxLength: 100 },
                  url: { type: 'string', maxLength: 200, pattern: '^https?://' },
                },
                required: ['title', 'url'],
              },
            },
            service_rates: {
              nullable: true,
              type: 'object',
              properties: {
                currency: { type: 'string', enum: ['NGN', 'USD', 'GBP', 'GHS'] },
                rates: {
                  type: 'array',
                  minItems: 1,
                  items: {
                    type: 'object',
                    properties: {
                      name: { type: 'string', minLength: 3, maxLength: 100 },
                      description: { type: 'string', maxLength: 250, nullable: true },
                      amount: { type: 'integer', minimum: 1 },
                    },
                    required: ['name', 'amount'],
                  },
                },
              },
              required: ['currency', 'rates'],
            },
            status: { type: 'string', enum: ['draft', 'published'] },
            access_type: { type: 'string', enum: ['public', 'private'], default: 'public' },
            access_code: { type: 'string', length: 6, pattern: '^[A-Za-z0-9]{6}$', nullable: true },
            created: { type: 'integer', description: 'Unix epoch milliseconds' },
            updated: { type: 'integer', description: 'Unix epoch milliseconds' },
            deleted: { type: 'integer', nullable: true, description: 'Unix epoch milliseconds when deleted' },
          },
          required: ['id', 'title', 'slug', 'creator_reference', 'status', 'created', 'updated', 'deleted'],
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            status: { type: 'string', enum: ['error'] },
            message: { type: 'string' },
            code: { type: 'string' },
            errors: { type: 'object', nullable: true },
            data: { type: 'object', nullable: true },
          },
          required: ['status', 'message', 'code'],
        },
      },
      securitySchemes: {},
    },
  },
  apis: ['./endpoints/**/*.js'],
};

module.exports = swaggerJsdoc(options);