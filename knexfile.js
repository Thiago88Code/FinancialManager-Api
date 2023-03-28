module.exports = {
  test: {
    client: 'postgres',
    version: '8.9.0',
    connection: {
      host: 'localhost',
      user: 'postgres',
      database: 'db_test',
      password: 'Ideologia',
    },
    migrations: {
      directory: 'src/migrations',
    },
    seeds: {
      directory: 'src/seeds',
    },
  },
  prod: {
    client: 'postgres',
    version: '8.9.0',
    connection: {
      host: 'localhost',
      user: 'postgres',
      database: 'db_prod',
      password: 'Ideologia',
    },
    migrations: {
      directory: 'src/migrations',
    },
  },
};
