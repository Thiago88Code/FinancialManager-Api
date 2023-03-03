/* eslint-disable arrow-body-style */
/* eslint-disable brace-style */
/* eslint-disable no-trailing-spaces */

/* eslint-disable consistent-return */
// Queries

module.exports = (app) => {
  const find = (userId, filter = {}) => {
    return app.db('transactions')
      .join('accounts', 'accounts.id', '=', 'acc_id')
      .where(filter)
      .andWhere('accounts.user_id', '=', userId)
      .select('*');
  };
  return { find };
};
