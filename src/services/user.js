/* eslint-disable no-trailing-spaces */
const bcrypt = require('bcrypt');
const ValidationError = require('../errors/validationErrors');

// Queries
module.exports = (app) => {
  const findAll = () => app.db('users').select(['id', 'name', 'email']);
  // eslint-disable-next-line consistent-return

  // DANGER! findOne is insecure because show password return
  const findOne = (filter = {}) => app.db('users').where(filter).first();

  const passwordHash = (pass) => {
    const salt = bcrypt.genSaltSync(10);
    return bcrypt.hashSync(pass, salt);
  };

  const save = async (user) => {
    if (!user.name || user.name == null) throw new ValidationError('"Name" attribute is mandatory');
    if (!user.email) throw new ValidationError('"Email" attribute is mandatory');
    if (!user.password || user.password == null) throw new ValidationError('"Password" attribute is mandatory');
    const repeatedEmail = await findOne({ email: user.email });
    if (repeatedEmail) throw new ValidationError('This "Email" already exists');
    // eslint-disable-next-line no-param-reassign
    user.password = passwordHash(user.password);
    return app.db('users').insert(user, ['id', 'name', 'email']);
  };
  return { findAll, save, findOne };
};
