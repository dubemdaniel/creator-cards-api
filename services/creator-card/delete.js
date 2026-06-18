const { throwAppError, ERROR_CODE } = require('@app-core/errors');
const { CreatorCardMessages } = require('@app/messages');
const { CreatorCardRepository } = require('@app/repository');

function cleanSubdocIds(obj) {
  if (Array.isArray(obj)) {
    return obj.map((item) => cleanSubdocIds(item));
  }
  if (obj && typeof obj === 'object') {
    const { _id, ...rest } = obj;
    return rest;
  }
  return obj;
}

function formatCard(card) {
  return {
    id: card._id,
    title: card.title,
    description: card.description,
    slug: card.slug,
    creator_reference: card.creator_reference,
    links: card.links ? cleanSubdocIds(card.links) : [],
    service_rates: card.service_rates
      ? { ...card.service_rates, rates: card.service_rates.rates ? cleanSubdocIds(card.service_rates.rates) : [] }
      : null,
    status: card.status,
    access_type: card.access_type,
    access_code: card.access_code,
    created: card.created,
    updated: card.updated,
    deleted: card.deleted,
  };
}

async function deleteCreatorCard(serviceData) {
  let response;

  const { slug, creator_reference } = serviceData;

  if (!creator_reference || creator_reference.length !== 20) {
    throwAppError('creator_reference must be exactly 20 characters', ERROR_CODE.INVLDDATA);
  }

  const card = await CreatorCardRepository.findOne({
    query: { slug },
    projections: {
      _id: 1, title: 1, description: 1, slug: 1, creator_reference: 1,
      links: 1, service_rates: 1, status: 1, access_type: 1,
      access_code: 1, created: 1, updated: 1, deleted: 1,
    },
  });

  if (!card || card.deleted !== null) {
    throwAppError(CreatorCardMessages.CARD_NOT_FOUND, ERROR_CODE.CARDNOTFOUND);
  }

  if (card.creator_reference !== creator_reference) {
    throwAppError('creator_reference does not match the card owner', ERROR_CODE.INVLDDATA);
  }

  const now = Date.now();

  await CreatorCardRepository.updateOne({
    query: { _id: card._id },
    updateValues: { deleted: now, updated: now },
  });

  const deletedCard = { ...card, updated: now, deleted: now };

  response = formatCard(deletedCard);
  return response;
}

module.exports = deleteCreatorCard;
