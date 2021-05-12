
exports.up = function(knex) {
    return knex.schema.createTable('certifications',function(table){
        table.bigIncrements('id');
        table.uuid('uuid');
        table.bigInteger('user_id');
        table.string('certificate_or_award');
        table.string('certified_from');
        table.string('year');
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
    return knex.schema.dropTable('certifications');
  };
  