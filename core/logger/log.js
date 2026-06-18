const logClient = require('./log-client');
const { LOG_TYPE } = require('./constants');

function _log(type, data, optionalKey = 'APP-LOG', options = {}) {
  logClient[type](data, String(optionalKey));
}

const logger = (data, optionalKey, options) => _log(LOG_TYPE.LOG, data, optionalKey, options);

logger.info = (data, optionalKey, options) => _log(LOG_TYPE.INFO, data, optionalKey, options);

logger.warn = (data, optionalKey, options) => _log(LOG_TYPE.WARN, data, optionalKey, options);

logger.error = (data, optionalKey, options) => _log(LOG_TYPE.ERROR, data, optionalKey, options);

logger.errorX = (data, optionalKey, options) =>
  _log(
    LOG_TYPE.ERROR,
    { errorMessage: data.message, errorStack: data.stack, _raw: data },
    optionalKey,
    options
  );

module.exports = logger;
