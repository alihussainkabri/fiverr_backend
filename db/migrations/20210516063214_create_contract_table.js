exports.up = function(knex) {
  return knex.schema.createTable('contracts',function(table){
      table.bigIncrements('id');
      table.uuid('uuid');
      table.string('title');
      table.text('description');
      table.string('price');
      table.date('delivery_date');
      table.string('creator_uuid');
      table.string('creator_name');
      table.string('creator_email');
      table.string('acceptor_uuid');
      table.string('acceptor_name');
      table.string('acceptor_email');
      table.datetime('accepted_at');
      table.datetime('rejected_at');
      table.datetime('completed_at');
      table.datetime('cancelled_at');
      table.text('reject_reason');
      table.text('cancelled_reason');
      table.text('completed_feedback');
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
  return knex.schema.dropTable('contracts')
};
