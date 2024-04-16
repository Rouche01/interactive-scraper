/**
 * CustomError class represents a custom error with a status code and a message.
 *
 * @class
 * @extends Error
 * @memberof Errors
 */
class CustomError extends Error {
  /**
   * Creates a new instance of CustomError.
   *
   * @constructor
   * @param {number} statusCode - The HTTP status code associated with the error.
   * @param {string} message - The error message.
   */
  constructor(statusCode, message) {
    super();

    /**
     * The HTTP status code associated with the error.
     *
     * @type {number}
     */
    this.statusCode = statusCode;

    /**
     * The error message.
     *
     * @type {string}
     */
    this.message = message;
  }
}

/**
 * ValidationError class represents an error for validation failures.
 *
 * @class
 * @extends Error
 * @memberof Errors
 */
class ValidationError extends Error {
  statusCode = 400;

  /**
   * Creates a new instance of ValidationError.
   *
   * @constructor
   * @param {Array<Object>} errors - An array of error objects representing validation failures.
   * @param {string} message - The error message.
   */
  constructor(errors, message) {
    super();

    /**
     * An array of error objects representing validation failures.
     *
     * @type {Array<Object>}
     */
    this.errors = errors;

    /**
     * The error message.
     *
     * @type {string}
     */
    this.message = message;
  }

  /**
   * Formats validation errors into an array of objects with paths and corresponding messages.
   *
   * @method
   * @returns {Array<Object>} An array of objects where each object represents a validation error with its path and message.
   */
  formatErrors() {
    return this.errors.map((err) => ({ [err.path]: err.msg }));
  }
}

module.exports = { CustomError, ValidationError };
