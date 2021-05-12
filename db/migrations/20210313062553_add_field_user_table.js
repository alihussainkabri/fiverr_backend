
exports.up = function(knex) {
  return knex.schema.table('users',function(table){
      table.string('profile_image');
      table.text('description');
      table.string('skills_id');
      table.text('skills');
      table.string('language_id');
      table.string('language_name');
  })
};

exports.down = function(knex) {
  
};
