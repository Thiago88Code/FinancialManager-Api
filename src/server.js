const app = require('express')();
const consign = require('consign');
const knex = require('knex');
const winston = require('winston');
const { v4: uuidv4 } = require('uuid');

const knexfile = require('../knexfile');

app.db = knex(knexfile[process.env.NODE_ENV]);

// setting to hide complete 500 error messages from the user
app.log = winston.createLogger({
  level: 'debug',
  transports: [
    new winston.transports.Console({ format: winston.format.json({ space: 1 }) }),
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'warn',
      format: winston.format.combine(winston.format.timestamp(), winston.format.json({ space: 1 })),
    }),
  ],
});

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
  if (name === 'validationError') res.status(400).json({ error: message, stack });
  else {
    const id = uuidv4();
    app.log.error({
      id, name, message, stack,
    });
    res.status(500).json({ id, error: 'Internal server error' });
  }
  next();
});

// app.listen(3001, () => console.log('Listening at'));

module.exports = app;
