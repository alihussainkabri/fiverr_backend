exports.up = function(knex) {
    return knex.schema.createTable('countries',function(table){
        table.bigIncrements('id');
        table.uuid('uuid').notNullable();
        table.string('code');
        table.string('iso_code_3');
        table.string('name').notNullable();
        table.string('dial_code');
        table.integer('status_id').defaultTo(1).unsigned();
        table.bigInteger('created_by').unsigned();
        table.timestamp('created_at');
        table.bigInteger('updated_by').unsigned();
        table.timestamp('updated_at').nullable();
        table.bigInteger('deleted_by').unsigned();
        table.timestamp('deleted_at').nullable();
    })
};

exports.down = function(knex) {
  return knex.schema.dropTable('countries')
};
