const models = require('@app/models');

let modelReference = models;

/**
 * Retrieves a model based on the provided model name.
 * @template {keyof typeof models} T
 * @param {T | (typeof models)[T]>} modelOrName - The name of the model to retrieve or the model itself.
 * @returns {typeof models[T]} The requested model.
 * @throws {Error} If no model name is provided.
 */
function getModel(modelOrName) {
  if (typeof modelOrName === 'string') {
    const model = modelReference[modelOrName];
    if (!model) {
      throw new Error(`Model not found for name: ${modelOrName}`);
    }
    return model;
  }
  return modelOrName;
}

module.exports = getModel;
