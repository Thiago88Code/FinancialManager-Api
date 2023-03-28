module.exports = function ForbiddenError(message) {
  this.name = 'forbiddenError';
  this.message = message;
};
