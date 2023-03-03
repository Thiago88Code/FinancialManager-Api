/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = (knex) => knex.schema.createTable('transactions', (table) => {
  table.increments('tr_id').primary();
  table.string('description').notNullable();
  table.enu('type', ['I', 'O']).notNullable();
  table.date('date').notNullable();
  table.decimal('amount', 15, 2).notNullable();
  table.boolean('status').defaultTo(false).notNullable();
  table.integer('acc_id')
    .references('id')
    .inTable('accounts')
    .notNullable();
});

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = (knex) => knex.schema.dropTable('transactions');
