/* eslint-disable object-curly-newline */
/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async (knex) => {
  await knex('users').insert([
    { id: 1100, name: 'user #3', email: 'user3@example.com', password: '123' },
    { id: 1101, name: 'user #4', email: 'user4@example.com', password: '123' },
  ]);
  await knex('accounts').insert([
    { id: 2100, name: 'Acc main balance', user_id: 1100 },
    { id: 2101, name: 'Acc secundary balance', user_id: 1100 },
    { id: 2102, name: 'Acc alternative 1', user_id: 1101 },
    { id: 2103, name: 'AccD alternative 2', user_id: 1101 },
  ]);
};
