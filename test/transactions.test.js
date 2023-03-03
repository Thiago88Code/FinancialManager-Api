const request = require('supertest');
const jwt = require('jwt-simple');
const app = require('../src/server');

let user1;
let user2;
let account1;
let account2;

const MAIN_ROUTE = '/v1/transactions/';

beforeAll(async () => {
  await app.db('transactions').del();
  await app.db('accounts').del();
  await app.db('users').del();
  const users = await app.db('users').insert([
    { name: 'user 1', email: 'user1@example.com', password: '123' },
    { name: 'user 2', email: 'user2@example.com', password: '456' },
  ], '*');
  [user1, user2] = users;
  user1.token = jwt.encode(user1, 'secret');
  user2.token = jwt.encode(user2, 'secret');
  const accounts = await app.db('accounts').insert([
    { name: '#acc 1', user_id: user1.id },
    { name: '#acc 2', user_id: user2.id },
  ], '*');
  [account1, account2] = accounts;
});

it(' Should an account of an user return just they own transactions', async () => {
  await app.db('transactions').insert([
    {
      description: 'T1', type: 'I', date: new Date(), amount: 100, acc_id: account1.id,
    },
    {
      description: 'T1', type: 'I', date: new Date(), amount: 55, acc_id: account2.id,
    },
  ]);
  const res = await request(app).get(MAIN_ROUTE)
    .set('Authorization', `Bearer ${user1.token}`);
  // console.log(res.body);
  expect(res.status).toBe(200);
  expect(res.body).toHaveLength(1);
  expect(res.body[0].description).toBe('T1');
});

it('Should create a transaction successfully', async () => {
  const res = await request(app).post(MAIN_ROUTE)
    .set('Authorization', `Bearer ${user1.token}`)
    .send({
      description: 'T3',
      type: 'O',
      date: new Date(),
      amount: 255,
      acc_id: account1.id,
    });
  expect(res.status).toBe(201);
});

it('Should get a specific transaction by id', async () => {
  const response = await app.db('transactions').insert({
    description: 'VTNC',
    type: 'O',
    date: new Date(),
    amount: 255,
    acc_id: account1.id,
  }, ['tr_id']);

  // console.log(response[0].tr_id);
  const res = await request(app).get(`${MAIN_ROUTE}/${response[0].tr_id}`)
    .set('Authorization', `Bearer ${user1.token}`);
  expect(res.status).toBe(200);
  expect(res.body.tr_id).toBe(response[0].tr_id);
  console.log(res.body);
});

it('Should update a transaction successfully', async () => {
  const response = await app.db('transactions').insert({
    description: 'VTNC',
    type: 'O',
    date: new Date(),
    amount: 255,
    acc_id: account1.id,
  }, ['*']);

  console.log(response[0].tr_id);
  const res = await request(app).put(`${MAIN_ROUTE}/${response[0].tr_id}`)
    .set('Authorization', `Bearer ${user1.token}`)
    .send({
      description: 'Updated',
      amount: 17,
    });
  expect(res.status).toBe(200);
  expect(res.body[0].description).toBe('Updated');
  expect(res.body[0].amount).toBe('17.00');
  console.log(res.body);
});

it('Should delete a transaction successfully', async () => {
  const response = await app.db('transactions').insert({
    description: 'VTNC',
    type: 'O',
    date: new Date(),
    amount: 255,
    acc_id: account1.id,
  }, ['*']);

  const res = await request(app).delete(`${MAIN_ROUTE}/${response[0].tr_id}`)
    .set('Authorization', `Bearer ${user1.token}`);
  expect(res.status).toBe(204);
});

it('Should not be able to manipulate other-user-transaction', async () => {
  const response = await app.db('transactions').insert([
    {
      description: 'T1', type: 'I', date: new Date(), amount: 1050, acc_id: account1.id,
    },
  ], ['*']);
  console.log(response[0]);

  const res = await request(app).get(`${MAIN_ROUTE}/${response[0].tr_id}`)
    .set('Authorization', `Bearer ${user2.token}`);
  expect(res.status).toBe(403);
  expect(res.body.message).toBe('not authorized');
});
