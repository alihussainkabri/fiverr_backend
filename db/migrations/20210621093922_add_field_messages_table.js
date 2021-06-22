
exports.up = function(knex) {
  return knex.schema.table('messages',function(table){
      table.integer('is_contract');
      table.string('contract_uuid');
  })
};

exports.down = function(knex) {
  
};
