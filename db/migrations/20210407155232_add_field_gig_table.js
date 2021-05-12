
exports.up = function(knex) {
  return knex.schema.table('gigs',function(table){
      table.text('description').after('stage');
  })
};

exports.down = function(knex) {
  
};
