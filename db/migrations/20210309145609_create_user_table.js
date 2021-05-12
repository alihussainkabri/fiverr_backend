
exports.up = function (knex) {
    return knex.schema.createTable('users', function (table) {
        table.bigIncrements('id');
        table.uuid('uuid');
        table.string('username');
        table.string('email');
        table.string('password');
        table.integer('status').defaultTo(1);
        table.string('email_verification_token');
        table.string('forgot_password_token');
        table.datetime('created_at');
        table.bigInteger('updated_by');
        table.datetime('updated_at');
        table.bigInteger('deleted_by');
        table.datetime('deleted_at');
    })
};

exports.down = function (knex) {
    return knex.schema.dropTable('users');
};
