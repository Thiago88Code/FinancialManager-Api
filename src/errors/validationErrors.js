/* eslint-disable import/prefer-default-export */
module.exports = function ValidationError(message) {
  this.name = 'validationError';
  this.message = message;
};
