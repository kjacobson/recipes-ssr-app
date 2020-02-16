exports.up = (knex) => {
    return Promise.all([
        knex.schema.createTable('recipe_sources', table => {
            table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'))
            table.string('domain').unique()
            table.timestamp('created_at').defaultTo(knex.fn.now())
        })
    ])
}

exports.down = (knex) => {
    return Promise.all([
        knex.schema.dropTableIfExists('recipe_sources')
    ])
}
