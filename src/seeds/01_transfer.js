/* eslint-disable object-curly-newline */
/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async (knex) => {
  // Deletes ALL existing entries
  await knex('transactions').del();
  await knex('transfers').del();
  await knex('accounts').del();
  await knex('users').del();
  await knex('users').insert([
    { id: 1000, name: 'user1', email: 'user1@example.com', password: '123' },
    { id: 1001, name: 'user2', email: 'user2@example.com', password: '123' },
  ]);
  await knex('accounts').insert([
    { id: 2000, name: 'AccO #1', user_id: 1000 },
    { id: 2001, name: 'AccD #1', user_id: 1000 },
    { id: 2002, name: 'AccO #2', user_id: 1001 },
    { id: 2003, name: 'AccD #2', user_id: 1001 },
  ]);
  await knex('transfers').insert([
    { id: 3000, description: 'Transfer #1', date: new Date(), amount: 100, from_acc_id: 2000, to_acc_id: 2001, user_id: 1000 },
    { id: 3001, description: 'Transfer #2', date: new Date(), amount: 100, from_acc_id: 2002, to_acc_id: 2003, user_id: 1001 },
  ]);
  await knex('transactions').insert([
    { description: 'Transfer from AccO #1', date: new Date(), amount: 100, type: 'I', acc_id: 2000, transfer_id: 3000 },
    { description: 'Transfer from AccO #1', date: new Date(), amount: -100, type: 'O', acc_id: 2001, transfer_id: 3000 },
    { description: 'Transfer from AccO #1', date: new Date(), amount: 100, type: 'I', acc_id: 2002, transfer_id: 3001 },
    { description: 'Transfer from AccO #1', date: new Date(), amount: -100, type: 'O', acc_id: 2003, transfer_id: 3001 },
  ]);
};
