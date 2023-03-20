/* eslint-disable arrow-body-style */

module.exports = (app) => {
  const getBalance = (userId) => app.db('transactions')
    .where({ status: true })
    .join('accounts', 'accounts.id', '=', 'acc_id')
    .where({ user_id: userId })
    .where('date', '<=', new Date())
    // .orWhere('date', '=', new Date())
    .select('accounts.id')
    .sum('amount')
    .groupBy('accounts.id')
    .orderBy('accounts.id');
  return { getBalance };
};
