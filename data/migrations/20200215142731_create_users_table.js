exports.up = (knex) => {
    return Promise.all([
        knex.schema.createTable('users', table => {
            table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'))
            table.string('email').unique()
            table.timestamp('created_at').defaultTo(knex.fn.now())
        })
    ])
}

exports.down = (knex) => {
    return Promise.all([
        knex.schema.dropTableIfExists('users')
    ])
}
