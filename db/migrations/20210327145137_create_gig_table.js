
exports.up = function(knex) {
  return knex.schema.createTable('gigs',function(table){
      table.bigIncrements('id');
      table.uuid('uuid');
      table.string('title');
      table.bigInteger('user_id');
      table.integer('status');
      table.bigInteger('category_id');
      table.string('category_name');
      table.bigInteger('subcategory_id');
      table.string('subcategory_name');
      table.string('video_link');
      table.string('gig_photo_1');
      table.string('gig_photo_2');
      table.string('gig_photo_3');
      table.string('gig_audio_1');
      table.string('gig_audio_2');
      table.string('gig_audio_3');
      table.bigInteger('created_by');
      table.datetime('created_at');
      table.bigInteger('updated_by');
      table.datetime('updated_at');
      table.bigInteger('deleted_by');
      table.datetime('deleted_at');
  })
};

exports.down = function(knex) {
  return knex.schema.dropTable('gigs')
};
