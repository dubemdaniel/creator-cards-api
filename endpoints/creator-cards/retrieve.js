const { createHandler } = require('@app-core/server');
const { retrieveCreatorCard } = require('@app/services');
const { CreatorCardMessages } = require('@app/messages');

/**
 * @swagger
 * /creator-cards/{slug}:
 *   get:
 *     summary: Retrieve a Creator Card by slug
 *     description: Public endpoint to retrieve a published Creator Card. Draft cards return 404 (NF02). Private cards require access_code query parameter.
 *     tags: [Creator Cards]
 *     parameters:
 *       - name: slug
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: The public identifier of the card
 *       - name: access_code
 *         in: query
 *         required: false
 *         schema:
 *           type: string
 *           length: 6
 *           pattern: '^[A-Za-z0-9]{6}$'
 *         description: Required for private cards
 *     responses:
 *       '200':
 *         description: Creator Card retrieved successfully
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
 *       '403':
 *         description: Access denied (private card without/with wrong access_code)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *         examples:
 *           access_code_required:
 *             summary: Private card needs access code
 *             value:
 *               status: error
 *               message: "This card is private. An access code is required"
 *               code: AC03
 *           invalid_access_code:
 *             summary: Wrong access code provided
 *             value:
 *               status: error
 *               message: "Invalid access code"
 *               code: AC04
 *       '404':
 *         description: Card not found or is a draft
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *         examples:
 *           not_found:
 *             summary: Card does not exist or was deleted
 *             value:
 *               status: error
 *               message: "Creator card not found"
 *               code: NF01
 *           draft:
 *             summary: Card exists but is a draft
 *             value:
 *               status: error
 *               message: "Creator card not found"
 *               code: NF02
 */
module.exports = createHandler({
  path: '/creator-cards/:slug',
  method: 'get',
  middlewares: [],
  async handler(rc, helpers) {
    const payload = {
      slug: rc.params.slug,
      access_code: rc.query.access_code ? rc.query.access_code.toUpperCase() : null,
    };

    const result = await retrieveCreatorCard(payload);

    return {
      status: helpers.http_statuses.HTTP_200_OK,
      message: CreatorCardMessages.CARD_RETRIEVED,
      data: result,
    };
  },
});