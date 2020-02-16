exports.up = (knex) => {
    return knex.raw('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"').then(() => {
        return knex.schema.createTable('users', table => {
            table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'))
            table.string('email').unique()
            table.timestamp('created_at').defaultTo(knex.fn.now())
        })
    })
}

exports.down = (knex) => {
    return knex.schema.dropTableIfExists('users')
}
