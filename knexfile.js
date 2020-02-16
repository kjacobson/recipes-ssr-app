module.exports = {
  development: {
    client: 'pg',
    connection: {
        database: 'recipes',
        user: 'me',
        host: 'localhost',
        password: 'password',
        port: 5432
    },
    migrations: {
      directory: './data/migrations'
    },
    seeds: { directory: './data/seeds' }
  },

  testing: {
    client: 'pg',
    connection: {
        database: 'recipes',
        user: 'me',
        host: 'localhost',
        password: 'password',
        port: 5432
    },
    migrations: {
      directory: './data/migrations'
    },
    seeds: { directory: './data/seeds' }
  },

  production: {
    client: 'pg',
    connection: {
        database: 'recipes',
        user: 'me',
        host: 'localhost',
        password: 'password',
        port: 5432
    },
    migrations: {
      directory: './data/migrations'
    },
    seeds: { directory: './data/seeds' }
  }
}
