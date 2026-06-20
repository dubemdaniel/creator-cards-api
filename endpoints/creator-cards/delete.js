const { createHandler } = require('@app-core/server');
const { deleteCreatorCard } = require('@app/services');
const { CreatorCardMessages } = require('@app/messages');

/**
 * @swagger
 * /creator-cards/{slug}:
 *   delete:
 *     summary: Delete a Creator Card
 *     description: Soft-deletes a Creator Card by setting the deleted timestamp. Requires creator_reference to verify ownership.
 *     tags: [Creator Cards]
 *     parameters:
 *       - name: slug
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: The public identifier of the card to delete
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - creator_reference
 *             properties:
 *               creator_reference:
 *                 type: string
 *                 length: 20
 *                 example: "crt_8f2k1m9x4p7w3q5z"
 *     responses:
 *       '200':
 *         description: Creator Card deleted successfully
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
 *       '404':
 *         description: Card not found or already deleted
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *         examples:
 *           not_found:
 *             summary: Card does not exist or already deleted
 *             value:
 *               status: error
 *               message: "Creator card not found"
 *               code: NF01
 */
module.exports = createHandler({
  path: '/creator-cards/:slug',
  method: 'delete',
  middlewares: [],
  async handler(rc, helpers) {
    const payload = {
      slug: rc.params.slug,
      creator_reference: rc.body.creator_reference,
    };

    const result = await deleteCreatorCard(payload);

    return {
      status: helpers.http_statuses.HTTP_200_OK,
      message: CreatorCardMessages.CARD_DELETED,
      data: result,
    };
  },
});