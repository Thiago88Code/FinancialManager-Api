/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = (knex) => knex.schema.createTable('accounts', (table) => {
  table.increments('id').primary();
  table.string('name').notNullable();
  table.integer('user_id')
    .references('id')
    .inTable('users')
    .notNullable();
});

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTableIfExists('accounts');
};
