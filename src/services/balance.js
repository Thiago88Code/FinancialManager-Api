/* eslint-disable arrow-body-style */

module.exports = (app) => {
  const getBalance = (userId) => app.db('transactions')
    .sum('amount')
    .join('accounts', 'accounts.id', '=', 'acc_id')
    .where({ user_id: userId, status: true })
    .where('date', '<=', new Date())
    .select('accounts.id')
    .groupBy('accounts.id')
    .orderBy('accounts.id');
  return { getBalance };
};
