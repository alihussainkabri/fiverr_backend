
exports.up = function(knex) {
  return knex.schema.createTable('languages',function(table){
      table.bigIncrements('id');
      table.uuid('uuid');
      table.string('english_name');
      table.string('regional_name');
      table.integer('status');
      table.bigInteger('created_by');
      table.datetime('created_at');
      table.bigInteger('updated_by');
      table.datetime('updated_at');
      table.bigInteger('deleted_by');
      table.datetime('deleted_at');
  })
};

exports.down = function(knex) {
  return knex.schema.dropTable('languages');
};
