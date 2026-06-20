const { createHandler } = require('@app-core/server');
const { createCreatorCard } = require('@app/services');
const { CreatorCardMessages } = require('@app/messages');

/**
 * @swagger
 * /creator-cards:
 *   post:
 *     summary: Create a new Creator Card
 *     description: Creates a Creator Card with the provided details. Validates all fields against business rules. Auto-generates slug if omitted.
 *     tags: [Creator Cards]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - creator_reference
 *               - status
 *             properties:
 *               title:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 100
 *                 example: "George Cooks"
 *               description:
 *                 type: string
 *                 maxLength: 500
 *                 example: "Weekly cooking podcast"
 *               slug:
 *                 type: string
 *                 minLength: 5
 *                 maxLength: 50
 *                 pattern: '^[a-z0-9_-]+$'
 *                 example: "george-cooks"
 *               creator_reference:
 *                 type: string
 *                 length: 20
 *                 example: "crt_8f2k1m9x4p7w3q5z"
 *               links:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required: [title, url]
 *                   properties:
 *                     title:
 *                       type: string
 *                       minLength: 1
 *                       maxLength: 100
 *                     url:
 *                       type: string
 *                       maxLength: 200
 *                       pattern: '^https?://'
 *               service_rates:
 *                 type: object
 *                 properties:
 *                   currency:
 *                     type: string
 *                     enum: [NGN, USD, GBP, GHS]
 *                   rates:
 *                     type: array
 *                     minItems: 1
 *                     items:
 *                       type: object
 *                       required: [name, amount]
 *                       properties:
 *                         name:
 *                           type: string
 *                           minLength: 3
 *                           maxLength: 100
 *                         description:
 *                           type: string
 *                           maxLength: 250
 *                         amount:
 *                           type: integer
 *                           minimum: 1
 *               status:
 *                 type: string
 *                 enum: [draft, published]
 *               access_type:
 *                 type: string
 *                 enum: [public, private]
 *               access_code:
 *                 type: string
 *                 length: 6
 *                 pattern: '^[A-Za-z0-9]{6}$'
 *     responses:
 *       '200':
 *         description: Creator Card created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   enum: [success]
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/CreatorCard'
 *       '400':
 *         description: Validation error or business rule violation
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *         examples:
 *           slug_taken:
 *             summary: Slug already exists
 *             value:
 *               status: error
 *               message: "Slug is already taken"
 *               code: SL02
 *           access_code_required:
 *             summary: Access code required for private card
 *             value:
 *               status: error
 *               message: "access_code is required when access_type is private"
 *               code: AC01
 *           access_code_not_allowed:
 *             summary: Access code not allowed on public card
 *             value:
 *               status: error
 *               message: "access_code can only be set on public cards"
 *               code: AC05
 */
module.exports = createHandler({
  path: '/creator-cards',
  method: 'post',
  middlewares: [],
  async handler(rc, helpers) {
    const payload = rc.body;
    const result = await createCreatorCard(payload);

    return {
      status: helpers.http_statuses.HTTP_200_OK,
      message: CreatorCardMessages.CARD_CREATED,
      data: result,
    };
  },
});