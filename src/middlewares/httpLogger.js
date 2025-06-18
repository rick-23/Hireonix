const morgan = require('morgan');
const logger = require('../utils/logger');

const stream = {
  write: (message) => logger.info(message),
};

// Build the morgan middleware
const morganMiddleware = morgan('combined', { stream });

module.exports = morganMiddleware;
