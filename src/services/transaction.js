/* eslint-disable arrow-body-style */
/* eslint-disable brace-style */
/* eslint-disable no-trailing-spaces */

/* eslint-disable consistent-return */
// Queries

module.exports = (app) => {
  const find = (userId, filter = {}) => {
    return app.db('transactions')
      .join('accounts', 'accounts.id', 'acc_id')
      .where(filter)
      .andWhere('accounts.user_id', '=', userId)
      .select('*');
  };

  const findOne = (filter = {}) => {
    return app.db('transactions').where(filter).first();
  };
  const save = async (transaction) => {
    return app.db('transactions').insert(transaction, ['*']);
  };
  const update = (id, transaction) => app.db('transactions')
    .where({ tr_id: id })
    .update(transaction, '*');

  const remove = (id) => app.db('transactions').where({ tr_id: id }).del();
  
  return {
    find, save, findOne, update, remove,
  };
};
