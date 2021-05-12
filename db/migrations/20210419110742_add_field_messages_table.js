
exports.up = function(knex) {
  return knex.schema.table('messages',function(table){
      table.integer('message_status').defaultTo(0).after('status');
      table.string('attachement_name').after('attachements');
  })
};

exports.down = function(knex) {
  
};
