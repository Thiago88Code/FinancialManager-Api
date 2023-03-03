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
      description: 'T2', type: 'O', date: new Date(), amount: 178, acc_id: account2.id,
    },
  ]);
  const res = await request(app).get(MAIN_ROUTE)
    .set('Authorization', `Bearer ${user1.token}`);
  console.log(res.body);
  expect(res.status).toBe(200);
  expect(res.body).toHaveLength(1);
  expect(res.body[0].description).toBe('T1');
});
