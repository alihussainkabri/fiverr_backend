
exports.up = function(knex) {
    return knex.schema.createTable('collegeUniversity_user',function(table){
        table.bigIncrements('id');
        table.uuid('uuid');
        table.bigInteger('user_id');
        table.bigInteger('college_university_id');
        table.string('college_university_name');
        table.string('major');
        table.string('title');
        table.string('graduation_year');
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
    return knex.schema.dropTable('collegeUniversity_user');
  };
  