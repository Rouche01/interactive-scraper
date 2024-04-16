const { handleErrorResponse } = require("../utils/error");

const errorHandler = (err, _req, res, _next) => {
  console.log("in error handler");
  handleErrorResponse(err, res);
};

module.exports = { errorHandler };
