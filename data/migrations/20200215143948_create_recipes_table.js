exports.up = (knex) => {
    return knex.raw('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"').then(() => {
        return knex.schema.createTable('recipes', table => {
            table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'))
            table.string('title')
            table.uuid('user_id').references('id').inTable('users')
            table.uuid('source_id').references('id').inTable('recipe_sources')
            table.timestamp('date_added').defaultTo(knex.fn.now())
            table.jsonb('json')
        })
    })
}

exports.down = (knex) => {
    return knex.schema.dropTableIfExists('recipes')
}
