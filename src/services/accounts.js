/* eslint-disable max-len */
/* eslint-disable no-trailing-spaces */
const ValidationError = require('../errors/validationErrors');

/* eslint-disable consistent-return */
// Queries
module.exports = (app) => {
  const findAll = (filter = {}) => app.db('accounts').where(filter).select('*');
  const find = (filter = {}) => app.db('accounts').where(filter).first();
  
  const save = async (account) => {
    if (!account.name || account.name == null) throw new ValidationError('Name of account is mandatory');
    const doubleName = await find({ name: account.name, user_id: account.user_id });
    if (doubleName) throw new ValidationError('Double-account-name');
    return app.db('accounts').insert(account, ['*']);
  };
  
  const update = (id, account) => app.db('accounts')
    .where({ id })
    .update(account, '*');
     
  const remove = async (id) => {
    const transaction = await app.services.transaction.findOne({ acc_id: id });
    if (transaction) throw new ValidationError('Account contains transactions');
    return app.db('accounts')
      .where({ id })
      .del();
  };
  return {
    save, findAll, update, remove, find,
  };
};
