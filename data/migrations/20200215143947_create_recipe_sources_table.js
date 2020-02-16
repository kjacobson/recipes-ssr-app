exports.up = (knex) => {
    return knex.raw('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"').then(() => {
        return knex.schema.createTable('recipe_sources', table => {
            table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'))
            table.string('domain').unique()
            table.timestamp('created_at').defaultTo(knex.fn.now())
        })
    })
}

exports.down = (knex) => {
    return knex.schema.dropTableIfExists('recipe_sources')
}
