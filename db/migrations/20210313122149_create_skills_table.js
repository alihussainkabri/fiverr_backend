
exports.up = function(knex) {
    return knex.schema.createTable('skills',function(table){
        table.bigIncrements('id');
        table.uuid('uuid');
        table.string('name');
        table.integer('status');
        table.bigInteger('approved_by');
        table.datetime('approved_at');
        table.bigInteger('rejected_by');
        table.datetime('rejected_at');
        table.text('rejected_reason')
        table.bigInteger('created_by');
        table.datetime('created_at');
        table.bigInteger('updated_by');
        table.datetime('updated_at');
        table.bigInteger('deleted_by');
        table.datetime('deleted_at');
    })
  };
  
  exports.down = function(knex) {
    return knex.schema.dropTable('skills');
  };
  