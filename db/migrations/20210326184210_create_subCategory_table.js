
exports.up = function(knex) {
    return knex.schema.createTable('sub_categories',function(table){
        table.bigIncrements('id');
        table.uuid('uuid');
        table.string('subcategory_name');
        table.bigInteger('category_id');
        table.string('category_name')
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
    return knex.schema.dropTable('sub_categories')
  };
  