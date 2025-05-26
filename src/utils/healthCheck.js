const logger = require('./logger');

const healthCheck = async (_req, res) => {
  logger.info('Server is starting');
  res.send('Server is working');
};

module.exports = {
  healthCheck
};
