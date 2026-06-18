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
    created: card.created,
    updated: card.updated,
    deleted: card.deleted,
  };
}

async function retrieveCreatorCard(serviceData) {
  let response;

  const { slug, access_code } = serviceData;

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

  if (card.status === 'draft') {
    throwAppError(CreatorCardMessages.DRAFT_NOT_FOUND, ERROR_CODE.DRAFTNOTFOUND);
  }

  if (card.access_type === 'private') {
    if (!access_code) {
      throwAppError(CreatorCardMessages.ACCESS_CODE_REQUIRED_VIEW, ERROR_CODE.PRIVATECARD);
    }

    if (access_code !== card.access_code) {
      throwAppError(CreatorCardMessages.INVALID_ACCESS_CODE, ERROR_CODE.WRONGACCESSCODE);
    }
  }

  response = formatCard(card);
  return response;
}

module.exports = retrieveCreatorCard;
