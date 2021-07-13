
exports.up = function(knex) {
  return knex.schema.table('users',function(table){
      table.integer('is_admin').defaultTo(0);
  })
};

exports.down = function(knex) {
  
};
