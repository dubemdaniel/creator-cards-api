const validator = require('@app-core/validator');
const { throwAppError, ERROR_CODE } = require('@app-core/errors');
const { CreatorCardMessages } = require('@app/messages');
const { CreatorCardRepository } = require('@app/repository');

const spec = `root {
  title string<trim|lengthBetween:3,100>
  description? string<trim|maxLength:500>
  slug? string<trim|lowercase|lengthBetween:5,50>
  creator_reference string<trim|length:20>
  links[]? {
    title string<trim|lengthBetween:1,100>
    url string<trim|maxLength:200>
  }
  service_rates? {
    currency string(NGN|USD|GBP|GHS)
    rates[] {
      name string<trim|lengthBetween:3,100>
      description? string<trim|maxLength:250>
      amount number<min:1>
    }
  }
  status string(draft|published)
  access_type? string(public|private)
  access_code? string<trim|uppercase|length:6>
}`;

const parsedSpec = validator.parse(spec);

function generateSlug(title) {
  let slug = title
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9_-]/g, '');

  return slug;
}

function generateSuffix() {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let suffix = '';
  for (let i = 0; i < 6; i++) {
    suffix += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return suffix;
}

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

async function createCreatorCard(serviceData) {
  let response;

  const data = validator.validate(serviceData, parsedSpec);

  const {
    title,
    description,
    slug: providedSlug,
    creator_reference,
    links,
    service_rates,
    status,
    access_type = 'public',
    access_code,
  } = data;

  if (links && links.length > 0) {
    for (const link of links) {
      if (!link.url.startsWith('http://') && !link.url.startsWith('https://')) {
        throwAppError('url must start with http:// or https://', ERROR_CODE.INVLDDATA);
      }
    }
  }

  if (service_rates) {
    if (!service_rates.rates || service_rates.rates.length === 0) {
      throwAppError('service_rates.rates must be a non-empty array', ERROR_CODE.INVLDDATA);
    }

    for (const rate of service_rates.rates) {
      if (!Number.isInteger(rate.amount) || rate.amount <= 0) {
        throwAppError('amount must be a positive integer', ERROR_CODE.INVLDDATA);
      }
    }
  }

  let slug = providedSlug;

  if (slug) {
    const slugRegex = /^[a-z0-9_-]+$/;
    if (!slugRegex.test(slug)) {
      throwAppError('slug can only contain letters, numbers, hyphens and underscores', ERROR_CODE.INVLDDATA);
    }

    const existing = await CreatorCardRepository.findOne({
      query: { slug, deleted: null },
      projections: { _id: 1 },
    });

    if (existing) {
      throwAppError(CreatorCardMessages.SLUG_TAKEN, ERROR_CODE.SLUGTAKEN);
    }
  } else {
    slug = generateSlug(title);

    const existing = await CreatorCardRepository.findOne({
      query: { slug, deleted: null },
      projections: { _id: 1 },
    });

    if (slug.length < 5 || existing) {
      slug = `${slug}-${generateSuffix()}`;
    }
  }

  if (access_type === 'private') {
    if (!access_code) {
      throwAppError(CreatorCardMessages.ACCESS_CODE_REQUIRED, ERROR_CODE.ACCESSCODEREQ);
    }
  } else if (access_code) {
    throwAppError(CreatorCardMessages.ACCESS_CODE_NOT_ALLOWED, ERROR_CODE.ACCESSCODENOTALLOWED);
  }

  if (access_code) {
    const alphanumericRegex = /^[a-zA-Z0-9]{6}$/;
    if (!alphanumericRegex.test(access_code)) {
      throwAppError('access_code must be exactly 6 alphanumeric characters', ERROR_CODE.INVLDDATA);
    }
  }

  const now = Date.now();

  const cardData = {
    title,
    description: description || null,
    slug,
    creator_reference,
    links: links || [],
    service_rates: service_rates || null,
    status,
    access_type,
    access_code: access_type === 'private' ? access_code : null,
    created: now,
    updated: now,
    deleted: null,
  };

  const created = await CreatorCardRepository.create(cardData);

  response = formatCard(created);
  return response;
}

module.exports = createCreatorCard;
