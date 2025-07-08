const { handleError } = require('../helpers/error');

const errorHandler = (err, _req, res, _next) => {
    handleError(err, res);
};

module.exports = errorHandler;