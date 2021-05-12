
exports.up = function(knex) {
  return knex.schema.createTable('messages',function(table){
      table.bigIncrements('id');
      table.uuid('uuid');
      table.string('chat_uuid');
      table.text('message');
      table.string('attachements');
      table.string('sender_uuid');
      table.string('sender_name');
      table.string('reciever_uuid');
      table.string('reciever_name');
      table.integer('status').defaultTo(1);
      table.bigInteger('created_by');
      table.datetime('created_at');
      table.bigInteger('updated_by');
      table.datetime('updated_at');
      table.bigInteger('deleted_by');
      table.datetime('deleted_at');
  })
};

exports.down = function(knex) {
  return knex.schema.dropTable('messages')
};
