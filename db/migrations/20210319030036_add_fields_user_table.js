
exports.up = function(knex) {
  return knex.schema.table('users',function(table){
      table.string('first_name');
      table.string('last_name');
      table.string('personal_website');
      table.string('linkedin_url');
      table.string('phone_number');
      table.string('phone_number_verification_code');
      table.string('phone_number_verification_status').defaultTo(0);
      table.string('profile_complete_percent');
  })
};

exports.down = function(knex) {
  
};
