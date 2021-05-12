
exports.up = function (knex) {
    return knex.schema.createTable('gig_pricing', function (table) {
        table.bigIncrements('id');
        table.uuid('uuid');
        table.string('type')  // Basic, standards and premium
        table.string('package_name');
        table.text('package_description');
        table.string('delivery_time');
        table.string('revision');
        table.bigInteger('price');
        table.bigInteger('gig_id');
        table.integer('status');
        table.bigInteger('user_id');
        table.bigInteger('created_by');
        table.datetime('created_at');
        table.bigInteger('updated_by');
        table.datetime('updated_at');
        table.bigInteger('deleted_by');
        table.datetime('deleted_at');
    })
};

exports.down = function (knex) {
    return knex.schema.dropTable('gig_pricing');
};
