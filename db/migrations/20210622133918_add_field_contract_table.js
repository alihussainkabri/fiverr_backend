
exports.up = function(knex) {
  return knex.schema.table('contracts',function(table){
      table.string('dispute_solved_by')
  })
};

exports.down = function(knex) {
  
};
