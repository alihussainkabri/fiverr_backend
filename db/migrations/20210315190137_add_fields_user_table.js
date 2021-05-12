
exports.up = function(knex) {
  return knex.schema.table('users',function(table){
      table.string('story_line').after('description');
  })
};

exports.down = function(knex) {
  
};
