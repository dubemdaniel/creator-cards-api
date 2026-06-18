const { ModelSchema, SchemaTypes, DatabaseModel } = require('@app-core/mongoose');

const schemaConfig = {
  _id: { type: SchemaTypes.ULID, required: true },
  title: { type: String, required: true },
  description: { type: String },
  slug: { type: String, required: true, unique: true, index: true },
  creator_reference: { type: String, required: true },
  links: [
    {
      _id: false,
      title: { type: String, required: true },
      url: { type: String, required: true },
    },
  ],
  service_rates: {
    currency: { type: String },
    rates: [
      {
        _id: false,
        name: { type: String, required: true },
        description: { type: String },
        amount: { type: Number, required: true },
      },
    ],
  },
  status: { type: String, required: true, enum: ['draft', 'published'] },
  access_type: { type: String, enum: ['public', 'private'], default: 'public' },
  access_code: { type: String },
  created: { type: Number, required: true },
  updated: { type: Number, required: true },
  deleted: { type: Number, default: null },
};

const modelSchema = new ModelSchema(schemaConfig, { collection: 'creator_cards' });

module.exports = DatabaseModel.model('CreatorCard', modelSchema);
