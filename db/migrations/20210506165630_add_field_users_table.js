
exports.up = function(knex) {
  return knex.schema.table('users',function(table){
    table.string('ip_address');
    table.string('country_name');
    table.string('region_name');
  })
};

exports.down = function(knex) {
  
};
