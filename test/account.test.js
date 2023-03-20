const request = require('supertest');
const jwt = require('jwt-simple');
const app = require('../src/server');

let user;
let user2;

const MAIN_ROUTE = '/v1/accounts/';

beforeAll(async () => {
  const response = await app.services.user.save({ name: 'user account', email: Date.now(), password: 'qqcoisa' });
  // Destructuring the response.body to access the id
  user = { ...response[0] };
  user.token = jwt.encode(user, 'secret');
  const response2 = await app.services.user.save({ name: 'user account 2', email: Date.now(), password: 'qqcoisa' });
  // Destructuring the response.body to access the id
  user2 = { ...response2[0] };
});

it('Should create an account', async () => {
  const response = await request(app).post(MAIN_ROUTE).send({ name: '#acc 1' })
    .set('Authorization', `Bearer ${user.token}`);
  expect(response.status).toBe(201);
  expect(response.body[0].name).toBe('#acc 1');
});

it('An user just could be access to own accounts', async () => {
  /* await app.db('transactions').del();
  await app.db('accounts').del(); */
  await app.db('accounts').insert([
    { name: '#acc 1/2', user_id: user.id },
    { name: '#acc 2', user_id: user2.id },
  ]);

  const res = await request(app).get(MAIN_ROUTE)
    .set('Authorization', `Bearer ${user.token}`);
  expect(res.status).toBe(200);
  console.log(res.body);
  // expect(res.body.length).toBe(1);
});

it('Should not to be possible create an account without a name', async () => {
  const response = await request(app).post(MAIN_ROUTE)
    .send({})
    .set('Authorization', `Bearer ${user.token}`);
  expect(response.status).toBe(400);
  // console.log(response.body.error);
});

it('Should get an account by id', async () => {
  const response = await app.db('accounts').insert({ name: '#acc qqcoisa', user_id: user.id }, ['id']);
  const res = await request(app).get(`${MAIN_ROUTE}/${response[0].id}`)
    .set('Authorization', `Bearer ${user.token}`);
  expect(res.status).toBe(200);
  // console.log(response.body);
});

it('Should not be possible create a double-account-name to the same user', async () => {
  await app.db('accounts').insert({ name: 'double-account-name', user_id: user.id });
  const response = await request(app).post(MAIN_ROUTE)
    .set('Authorization', `Bearer ${user.token}`)
    .send({ name: 'double-account-name' });
  expect(response.status).toBe(400);
});

it('Should update an account', async () => {
  const response = await app.services.accounts.save({ name: '#acc ', user_id: user.id });

  const res = await request(app).put(`${MAIN_ROUTE}/${response[0].id}`)
    .set('Authorization', `Bearer ${user.token}`)
    .send({ name: '#acc 666' });
  expect(res.status).toBe(200);
  expect(res.body[0].name).toBe('#acc 666');
});

it('Should delete an account', async () => {
  const response = await app.services.accounts.save({ name: '#acc delete', user_id: user.id });
  const res = await request(app).delete(`${MAIN_ROUTE}/${response[0].id}`)
    .set('Authorization', `Bearer ${user.token}`);
  console.log(res.body);
  expect(res.status).toBe(200);
});

it('Should not be possible return an account of a diferent user', async () => {
  const response = await app.db('accounts').insert({ name: '#acc user 1', user_id: user2.id }, ['id']);
  const res = await request(app).get(`${MAIN_ROUTE}/${response[0].id}`)
    .set('Authorization', `Bearer ${user.token}`);
  expect(res.status).toBe(403);
});

it('Should not be possible update and remove of a diferent user', async () => {
  const response = await app.db('accounts').insert({ name: '#acc user 1', user_id: user2.id }, ['id']);
  const res = await request(app).put(`${MAIN_ROUTE}/${response[0].id}`)
    .set('Authorization', `Bearer ${user.token}`)
    .send({ name: 'kkk' });
  expect(res.status).toBe(403);
});
