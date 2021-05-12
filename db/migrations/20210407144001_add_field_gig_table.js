
exports.up = function(knex) {
  return knex.schema.table('gigs',function(table){
      table.integer('stage').defaultTo(1).after('status');
  })
};

exports.down = function(knex) {
  
};
