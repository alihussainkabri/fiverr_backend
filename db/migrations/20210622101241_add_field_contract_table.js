
exports.up = function(knex) {
  return knex.schema.table('contracts',function(table){
      table.integer('is_dispute_raised').defaultTo(0);
      table.datetime('dispute_raised_at');
      table.string('dispute_raised_by');
      table.text('dispute_description');
      table.integer('is_dispute_solved').defaultTo(0);
      table.text('dispute_solved_description');
      table.datetime('dispute_solved_at');
      table.string('cancelled_by');
      table.dropColumn('completed_at');
    })
};

exports.down = function(knex) {
  
};
