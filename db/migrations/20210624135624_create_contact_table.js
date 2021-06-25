
exports.up = function(knex) {
  return knex.schema.createTable('contacts',function(table){
      table.bigIncrements('id');
      table.uuid('uuid');
      table.string('name');
      table.string('email');
      table.text('message_text');
      table.integer('status').defaultTo(1);
      table.bigInteger('reply_by');
      table.datetime('reply_at');
      table.text('reply_reason');
      table.datetime('created_at');
      table.bigInteger('updated_by');
      table.datetime('updated_at');
      table.bigInteger('deleted_by');
      table.datetime('deleted_at');
  })
};

exports.down = function(knex) {
  return knex.schema.dropTable('contacts');
};
