module.exports = {
  test: {
    client: 'postgres',
    version: '8.9.0',
    connection: {
      host: 'localhost',
      user: 'postgres',
      database: 'db',
      password: 'Ideologia',
    },
    migrations: {
      directory: 'src/migrations',
    },
    seeds: {
      directory: 'src/seeds',
    },
  },
};
