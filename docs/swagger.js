const spec = {
  openapi: '3.0.0',
  info: {
    title: 'Creator Card API',
    version: '1.0.0',
    description: 'REST API for Creator Cards - shareable profile cards with links and service rates',
  },
  servers: [
    { url: 'http://localhost:3000', description: 'Development server' },
  ],
  paths: {
    '/creator-cards': {
      post: {
        summary: 'Create a new Creator Card',
        description: 'Creates a Creator Card with the provided details. Validates all fields against business rules. Auto-generates slug if omitted.',
        tags: ['Creator Cards'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['title', 'creator_reference', 'status'],
                properties: {
                  title: { type: 'string', minLength: 3, maxLength: 100, example: 'George Cooks' },
                  description: { type: 'string', maxLength: 500, example: 'Weekly cooking podcast' },
                  slug: { type: 'string', minLength: 5, maxLength: 50, pattern: '^[a-z0-9_-]+$', example: 'george-cooks' },
                  creator_reference: { type: 'string', length: 20, example: 'crt_8f2k1m9x4p7w3q5z' },
                  links: {
                    type: 'array',
                    items: {
                      type: 'object',
                      required: ['title', 'url'],
                      properties: {
                        title: { type: 'string', minLength: 1, maxLength: 100 },
                        url: { type: 'string', maxLength: 200, pattern: '^https?://' },
                      },
                    },
                  },
                  service_rates: {
                    type: 'object',
                    properties: {
                      currency: { type: 'string', enum: ['NGN', 'USD', 'GBP', 'GHS'] },
                      rates: {
                        type: 'array',
                        minItems: 1,
                        items: {
                          type: 'object',
                          required: ['name', 'amount'],
                          properties: {
                            name: { type: 'string', minLength: 3, maxLength: 100 },
                            description: { type: 'string', maxLength: 250 },
                            amount: { type: 'integer', minimum: 1 },
                          },
                        },
                      },
                    },
                  },
                  status: { type: 'string', enum: ['draft', 'published'] },
                  access_type: { type: 'string', enum: ['public', 'private'] },
                  access_code: { type: 'string', length: 6, pattern: '^[A-Za-z0-9]{6}$' },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Creator Card created successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', enum: ['success'] },
                    message: { type: 'string' },
                    data: { $ref: '#/components/schemas/CreatorCard' },
                  },
                },
              },
            },
          },
          '400': {
            description: 'Validation error or business rule violation',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
            examples: {
              slug_taken: {
                summary: 'Slug already exists',
                value: { status: 'error', message: 'Slug is already taken', code: 'SL02' },
              },
              access_code_required: {
                summary: 'Access code required for private card',
                value: { status: 'error', message: 'access_code is required when access_type is private', code: 'AC01' },
              },
              access_code_not_allowed: {
                summary: 'Access code not allowed on public card',
                value: { status: 'error', message: 'access_code can only be set on private cards', code: 'AC05' },
              },
            },
          },
        },
      },
    },
    '/creator-cards/{slug}': {
      get: {
        summary: 'Retrieve a Creator Card by slug',
        description: 'Public endpoint to retrieve a published Creator Card. Draft cards return 404 (NF02). Private cards require access_code query parameter.',
        tags: ['Creator Cards'],
        parameters: [
          { name: 'slug', in: 'path', required: true, schema: { type: 'string' }, description: 'The public identifier of the card' },
          { name: 'access_code', in: 'query', required: false, schema: { type: 'string', length: 6, pattern: '^[A-Za-z0-9]{6}$' }, description: 'Required for private cards' },
        ],
        responses: {
          '200': {
            description: 'Creator Card retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', enum: ['success'] },
                    message: { type: 'string' },
                    data: { $ref: '#/components/schemas/CreatorCard' },
                  },
                },
              },
            },
          },
          '403': {
            description: 'Access denied (private card without/with wrong access_code)',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } },
            examples: {
              access_code_required: {
                summary: 'Private card needs access code',
                value: { status: 'error', message: 'This card is private. An access code is required', code: 'AC03' },
              },
              invalid_access_code: {
                summary: 'Wrong access code provided',
                value: { status: 'error', message: 'Invalid access code', code: 'AC04' },
              },
            },
          },
          '404': {
            description: 'Card not found or is a draft',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } },
            examples: {
              not_found: {
                summary: 'Card does not exist or was deleted',
                value: { status: 'error', message: 'Creator card not found', code: 'NF01' },
              },
              draft: {
                summary: 'Card exists but is a draft',
                value: { status: 'error', message: 'Creator card not found', code: 'NF02' },
              },
            },
          },
        },
      },
      delete: {
        summary: 'Delete a Creator Card',
        description: 'Soft-deletes a Creator Card by setting the deleted timestamp. Requires creator_reference to verify ownership.',
        tags: ['Creator Cards'],
        parameters: [
          { name: 'slug', in: 'path', required: true, schema: { type: 'string' }, description: 'The public identifier of the card to delete' },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['creator_reference'],
                properties: {
                  creator_reference: { type: 'string', length: 20, example: 'crt_8f2k1m9x4p7w3q5z' },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Creator Card deleted successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', enum: ['success'] },
                    message: { type: 'string' },
                    data: { $ref: '#/components/schemas/CreatorCard' },
                  },
                },
              },
            },
          },
          '404': {
            description: 'Card not found or already deleted',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } },
            examples: {
              not_found: {
                summary: 'Card does not exist or already deleted',
                value: { status: 'error', message: 'Creator card not found', code: 'NF01' },
              },
            },
          },
        },
      },
    },
  },
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
  },
};

module.exports = spec;
