
exports.up = function(knex) {
  return knex.schema.table('users',function(table){
      table.integer('online_status').defaultTo(0).after('status')
  })
};

exports.down = function(knex) {
  
};
