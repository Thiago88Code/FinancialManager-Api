const ValidationError = require('../errors/validationErrors');

// Queries

module.exports = (app) => {
  const findAll = (filter = {}) => app.db('transfers').where(filter).select('*');
  const find = (filter = {}) => app.db('transfers').where(filter).first();
  const remove = async (id) => {
    await app.db('transactions').where({ transfer_id: id }).del();
    return app.db('transfers').where({ id }).del();
  };
  const validate = async (transfer) => {
    if (!transfer.description) throw new ValidationError('Transfer description is mandatory');
    if (!transfer.date) throw new ValidationError('Transfer date is mandatory');
    if (!transfer.amount) throw new ValidationError('Transfer amount is mandatory');
    if (!transfer.from_acc_id) throw new ValidationError('Transfer source account is mandatory');
    if (!transfer.to_acc_id) throw new ValidationError('Transfer destiny account is mandatory');
    if (!transfer.user_id) throw new ValidationError('An account user owner is mandatory');
    if (transfer.from_acc_id === transfer.to_acc_id) throw new ValidationError('Do a transfer to the same source account is forbidden');
  };

  const save = async (transfer) => {
    await validate(transfer);
    const result = await app.db('transfers').insert(transfer, '*');
    console.log(result[0].id);
    const transactions = [{

      description: `Transfer to ${transfer.to_acc_id}`,
      type: 'O',
      date: transfer.date,
      amount: transfer.amount * -1,
      acc_id: transfer.from_acc_id,
      transfer_id: result[0].id,

    }, {

      description: `Transfer from ${transfer.from_acc_id}`,
      type: 'I',
      date: transfer.date,
      amount: transfer.amount,
      acc_id: transfer.to_acc_id,
      transfer_id: result[0].id,

    }];

    await app.db('transactions').insert(transactions);
    return result;
  };

  const update = async (id, transfer) => {
    await validate(transfer);
    const result = await app.db('transfers')
      .where({ id })
      .update(transfer, '*');

    const transactions = [{

      description: `Updated transfer to ${transfer.to_acc_id}`,
      type: 'O',
      date: transfer.date,
      amount: transfer.amount * -1,
      acc_id: transfer.from_acc_id,
      transfer_id: result[0].id,

    }, {

      description: `Updated transfer from ${transfer.from_acc_id}`,
      type: 'I',
      date: transfer.date,
      amount: transfer.amount,
      acc_id: transfer.to_acc_id,
      transfer_id: result[0].id,

    }];
    await app.db('transactions').where({ transfer_id: id }).del();
    await app.db('transactions').insert(transactions);
    return result;
  };
  return {
    findAll, save, find, update, validate, remove,
  };
};
