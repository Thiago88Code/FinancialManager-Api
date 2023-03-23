const app = require('express')();
const consign = require('consign');
const knex = require('knex');
const knexfile = require('../knexfile');
// TODO
app.db = knex(knexfile.test);

consign({ cwd: 'src', verbose: false })
  .include('./config/passport.js')
  .then('./config/middlewares.js')
  .then('./services')
  .then('./routes')
  .then('./config/router.js')
  .into(app);

app.get('/', (req, res) => {
  res.status(200).send();
});

app.use((req, res) => {
  res.status(404).send('Not Found!');
});
// Middleware in charge of throwing the error according to Validaterror object
app.use((err, req, res, next) => {
  const { name, message, stack } = err;
  // console.log(err);
  if (name === 'validationError') res.status(400).json({ error: message });
  else res.status(500).json({ name, message, stack });
  next(err);
});

// logger
/*
app.db.on('query', (query) => {
  console.log({ sql: query.sql, bindings: query.bindings ? query.bindings.join(',') : '' });
})
  .on('query-response', (response) => console.log(response))
  .on('error', (error) => console.log(error));
*/
// app.listen(3001, () => console.log('Listening at'));

module.exports = app;
