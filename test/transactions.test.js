/* eslint-disable no-multi-assign */
const request = require('supertest');
const jwt = require('jwt-simple');
const app = require('../src/server');

let user;
let user2;
let account;
let account2;

const MAIN_ROUTE = '/v1/transactions';

beforeAll(async () => {
  const response = await app.services.user.save({ name: 'user1', email: Date.now(), password: 'qqcoisa' });
  // Destructuring the response.body to access the id
  user = { ...response[0] };
  user.token = jwt.encode(user, 'secret');
  console.log(user);

  const response2 = await app.services.user.save({ name: 'user2', email: Date.now() * 5, password: 'qqcoisa' });
  // Destructuring the response.body to access the id
  user2 = { ...response2[0] };
  user2.token = jwt.encode(user2, 'secret');
  console.log(user2);

  const accounts = await app.db('accounts').insert([
    { name: '#acc 1', user_id: user.id },
    { name: '#acc 2', user_id: user2.id },
  ], '*');
  [account, account2] = accounts;
  console.log(accounts[0]);
});

it(' Should an account of an user return just they own transactions', async () => {
  await app.db('transactions').insert([
    {
      description: 'T1', type: 'I', date: new Date(), amount: 100, acc_id: account.id,
    },
    {
      description: 'T1', type: 'I', date: new Date(), amount: 55, acc_id: account2.id,
    },
  ]);
  const res = await request(app).get(MAIN_ROUTE)
    .set('Authorization', `Bearer ${user.token}`);
  expect(res.status).toBe(200);
  expect(res.body).toHaveLength(1);
  expect(res.body[0].description).toBe('T1');
});

it('Should create a transaction successfully', async () => {
  const res = await request(app).post(MAIN_ROUTE)
    .set('Authorization', `Bearer ${user.token}`)
    .send({
      description: 'T3',
      type: 'O',
      date: new Date(),
      amount: 255,
      acc_id: account.id,
    });
  expect(res.status).toBe(201);
});

it('Should get a specific transaction by id', async () => {
  const response = await app.db('transactions').insert({
    description: 'VTNC',
    type: 'O',
    date: new Date(),
    amount: 255,
    acc_id: account.id,
  }, ['tr_id']);

  // console.log(response[0].tr_id);
  const res = await request(app).get(`${MAIN_ROUTE}/${response[0].tr_id}`)
    .set('Authorization', `Bearer ${user.token}`);
  expect(res.status).toBe(200);
  expect(res.body.tr_id).toBe(response[0].tr_id);
  // console.log(res.body);
});

it('Should update a transaction successfully', async () => {
  const response = await app.db('transactions').insert({
    description: 'VTNC',
    type: 'O',
    date: new Date(),
    amount: 255,
    acc_id: account.id,
  }, ['*']);

  // console.log(response[0].tr_id);
  const res = await request(app).put(`${MAIN_ROUTE}/${response[0].tr_id}`)
    .set('Authorization', `Bearer ${user.token}`)
    .send({
      description: 'Updated',
      amount: 17,
    });
  expect(res.status).toBe(200);
  expect(res.body[0].description).toBe('Updated');
  expect(res.body[0].amount).toBe('17.00');
  // console.log(res.body);
});

it('Should delete a transaction successfully', async () => {
  const response = await app.db('transactions').insert({
    description: 'VTNC',
    type: 'O',
    date: new Date(),
    amount: 255,
    acc_id: account.id,
  }, ['*']);

  const res = await request(app).delete(`${MAIN_ROUTE}/${response[0].tr_id}`)
    .set('Authorization', `Bearer ${user.token}`);
  expect(res.status).toBe(204);
});

it('Should not be able to manipulate other-user-transaction', async () => {
  const response = await app.db('transactions').insert([
    {
      description: 'T1', type: 'I', date: new Date(), amount: 1050, acc_id: account.id,
    },
  ], ['*']);
    // console.log(response[0]);

  const res = await request(app).get(`${MAIN_ROUTE}/${response[0].tr_id}`)
    .set('Authorization', `Bearer ${user2.token}`);
  expect(res.status).toBe(403);
  expect(res.body.message).toBe('not authorized');
});

it('Type of transactions = "I" should have a positive amount', async () => {
  const res = await request(app).post(MAIN_ROUTE)
    .set('Authorization', `Bearer ${user2.token}`)
    .send({
      description: 'T3',
      type: 'I',
      date: new Date(),
      amount: -255,
      acc_id: account.id,
    });
  expect(res.status).toBe(201);
  expect(res.body[0].amount).toBe('255.00');
});

it('Type of transactions = "O" should have a negative amount', async () => {
  const res = await request(app).post(MAIN_ROUTE)
    .set('Authorization', `Bearer ${user.token}`)
    .send({
      description: 'T3',
      type: 'O',
      date: new Date(),
      amount: 255,
      acc_id: account.id,
    });
  expect(res.status).toBe(201);
  expect(res.body[0].amount).toBe('-255.00');
});

it('Should not be possible delete an account that contains transactions', async () => {
  const response = await app.db('transactions').insert({
    description: 'to delete',
    type: 'O',
    date: new Date(),
    amount: 255,
    acc_id: account.id,
  }, ['*']);
  console.log(response[0]);
  console.log(response[0].acc_id);
  const res = await request(app).delete(`/v1/accounts/${response[0].acc_id}`)
    .set('Authorization', `Bearer ${user.token}`);
  expect(res.status).toBe(400);
  expect(res.body.error).toBe('Account contains transactions');
});

describe('Should not be possible insert an ivalid transaction', () => {
  const testTemplate = async (newBody, errorMessage) => {
    const body = {
      description: 'T3',
      type: 'O',
      date: new Date(),
      amount: 255,
      acc_id: account2.id,
    };
    const res = await request(app).post(MAIN_ROUTE)
      .set('Authorization', `Bearer ${user2.token}`)
      .send({ ...body, ...newBody });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe(errorMessage);
  };
  it('Should not be possible insert a transaction without a description', () => {
    testTemplate({ description: null }, 'Description is required');
  });
  it('Should not be possible insert a transaction without a type', () => {
    testTemplate({ type: null }, 'Type is required');
  });
  it('Should not be possible insert a transaction without a date', () => {
    testTemplate({ date: null }, 'Date is required');
  });
  it('Should not be possible insert a transaction without a amount', () => {
    testTemplate({ amount: null }, 'Amount is required');
  });
  it('Should not be possible insert a transaction without a acc_id', () => {
    testTemplate({ acc_id: null }, 'Acc_id is required');
  });
  it('Should not be possible insert a transaction with an invalid type', () => {
    testTemplate({ type: 'A' }, 'Invalid type');
  });
});
