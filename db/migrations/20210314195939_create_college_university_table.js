
exports.up = function(knex) {
    return knex.schema.createTable('college_universities',function(table){
        table.bigIncrements('id');
        table.uuid('uuid');
        table.string('name');
        table.bigInteger('country_id');
        table.bigInteger('country_name');
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
    return knex.schema.dropTable('college_universities');
  };
  