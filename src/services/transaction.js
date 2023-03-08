const ValidationError = require('../errors/validationErrors');

// Queries

module.exports = (app) => {
  const find = (userId, filter = {}) => app.db('transactions')
    .join('accounts', 'accounts.id', 'acc_id')
    .where(filter)
    .andWhere('accounts.user_id', '=', userId)
    .select('*');

  const findOne = (filter = {}) => app.db('transactions').where(filter).first();
  const save = (transaction) => {
    if (!transaction.description) throw new ValidationError('Description is required');
    if (!transaction.type) throw new ValidationError('Type is required');
    if (transaction.type !== 'O' && transaction.type !== 'I') throw new ValidationError('Invalid type');
    if (!transaction.date) throw new ValidationError('Date is required');
    if (!transaction.amount) throw new ValidationError('Amount is required');
    if (!transaction.acc_id) throw new ValidationError('Acc_id is required');
    const newTransaction = { ...transaction };
    if ((transaction.type === 'I' && transaction.amount < 0)
     || (transaction.type === 'O' && transaction.amount > 0)) {
      newTransaction.amount *= -1;
    }
    return app.db('transactions').insert(newTransaction, ['*']);
  };
  const update = (id, transaction) => app.db('transactions')
    .where({ tr_id: id })
    .update(transaction, '*');

  const remove = (id) => app.db('transactions').where({ tr_id: id }).del();

  return {
    find, save, findOne, update, remove,
  };
};
