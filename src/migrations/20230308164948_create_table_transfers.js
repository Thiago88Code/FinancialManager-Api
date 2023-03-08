/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = (knex) => Promise.all([
  knex.schema.createTable('transfers', (table) => {
    table.increments('id').primary();
    table.string('description').notNullable();
    table.date('date').notNullable();
    table.decimal('amount', 15, 2).notNullable();
    table.integer('from_acc_id')
      .references('id')
      .inTable('accounts')
      .notNullable();
    table.integer('to_acc_id')
      .references('id')
      .inTable('accounts')
      .notNullable();
    table.integer('user_id')
      .references('id')
      .inTable('users')
      .notNullable();
  }),
  knex.schema.table('transactions', (t) => {
    t.integer('transfer_id')
      .references('id')
      .inTable('transfers');
  }),
]);
/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = (knex) => Promise.all([
  knex.schema.table('transactions', (t) => {
    t.dropColumn('transfer_id');
  }),
  knex.schema.dropTable('transfers'),
]);
