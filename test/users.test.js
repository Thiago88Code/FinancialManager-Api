const request = require('supertest');
const jwt = require('jwt-simple');
const app = require('../src/server');

const email = `${Date.now()}@gmail.com`;

let user;

const MAIN_ROUTE = '/v1/users';

beforeAll(async () => {
  const response = await app.services.user.save({ name: 'user account', email: Date.now(), password: 'qqcoisa' });
  // Destructuring the response.body to access the id
  user = { ...response[0] };
  user.token = jwt.encode(user, 'secret');
});

it('Should get all users', async () => {
  await request(app).get(MAIN_ROUTE)
    .set('Authorization', `Bearer ${user.token}`)
    .then((response) => {
      expect(response.status).toBe(200);
      expect(response.body).not.toHaveProperty('password');
      // console.log(response.body);
    });
});

// Admin
it('Should create an user', async () => {
  await request(app).post(MAIN_ROUTE).send({ name: 'Janaina', email: Date.now(), password: 'k' })
    .set('Authorization', `Bearer ${user.token}`)
    .then((response) => {
      expect(response.status).toBe(201);
      // console.log(response.body);
    });
});

it('Should create an encrypted password', async () => {
  const response = await request(app).post(MAIN_ROUTE).send({ name: 'Janaina', email: Date.now(), password: 'k' })
    .set('Authorization', `Bearer ${user.token}`);
  expect(response.status).toBe(201);
  const { id } = response.body;
  const userDB = await app.services.user.findOne({ id });
  expect(userDB.password).not.toBe(undefined);
  // console.log(userDB);
});

it('Should not be able to create an null user', async () => {
  await request(app).post(MAIN_ROUTE).send({ name: null, email: Date.now(), password: 'k' })
    .set('Authorization', `Bearer ${user.token}`)
    .then((response) => {
      expect(response.status).toBe(400);
      expect(response.body.error).toBe('"Name" attribute is mandatory');
      // console.log(response.body.error);
    });
});

it('Should not be able to create an user without "name"', async () => {
  await request(app).post(MAIN_ROUTE).send({ email: Date.now(), password: 'k' })
    .set('Authorization', `Bearer ${user.token}`)
    .then((response) => {
      expect(response.status).toBe(400);
      expect(response.body.error).toBe('"Name" attribute is mandatory');
      // console.log(response.body);
    });
});

it('Should not be able to create an user without "email"', async () => {
  await request(app).post(MAIN_ROUTE).send({ name: 'Thiago', password: 'k' })
    .set('Authorization', `Bearer ${user.token}`)
    .then((response) => {
      expect(response.status).toBe(400);
      expect(response.body.error).toBe('"Email" attribute is mandatory');
      // console.log(response.body);
    });
});

it('Should not be able to create an user without "password"', async () => {
  const response = await request(app).post(MAIN_ROUTE).send({ name: 'Thiago', email: Date.now() })
    .set('Authorization', `Bearer ${user.token}`);
  expect(response.status).toBe(400);
  expect(response.body.error).toBe('"Password" attribute is mandatory');
  // console.log(response.body.error);
});

it('Should not be able to create an user with an existent "email"', async () => {
  await app.services.user.save({ name: 'Thiago', email, password: 'k' });
  const response = await request(app).post(MAIN_ROUTE).send({ name: 'Thiago', email, password: 'k' })
    .set('Authorization', `Bearer ${user.token}`);
  expect(response.status).toBe(400);
  expect(response.body.error).toBe('This "Email" already exists');
  // console.log(response.body.error);
});
