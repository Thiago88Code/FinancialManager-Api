/* eslint-disable no-multi-assign */
const request = require('supertest');
const app = require('../src/server');

const MAIN_ROUTE = '/v1/transfers';
const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTAwMCwibmFtZSI6InVzZXIxIiwiZW1haWwiOiJ1c2VyMUBleGFtcGxlLmNvbSJ9.MbcNM2y8BzMqkIGXD6qTb05WwYddAS4kx5u4jSX_Hpc';

// CREATE
it('Should return just transfers that belong to an user', async () => {
  const response = await request(app).get(MAIN_ROUTE)
    .set('Authorization', `Bearer ${TOKEN}`);
  // console.log(response.body);
  expect(response.status).toBe(200);
  expect(response.body.length).toBeGreaterThan(0);
});

describe('Should make a transfer and transactions successfully...', () => {
  let transferId;
  let fromAccountId;
  let toAccountId;
  let amount;

  it('Should make a transfer successfully', async () => {
    const response = await request(app).post(MAIN_ROUTE)
      .set('Authorization', `Bearer ${TOKEN}`)
      .send({
        description: 'New Transfer',
        date: new Date(),
        amount: 235,
        from_acc_id: 2000,
        to_acc_id: 2001,
        user_id: 1000,
      });

    expect(response.status).toBe(201);
    expect(response.body[0].description).toBe('New Transfer');
    transferId = response.body[0].id;
    fromAccountId = response.body[0].from_acc_id;
    toAccountId = response.body[0].to_acc_id;
    amount = response.body[0].amount;
    // console.log(transferId);
  });

  it('The transactions should be created from the transfer above', async () => {
    const response = await app.db('transactions').where({ transfer_id: transferId }).orderBy('amount', 'asc');
    expect(response).toHaveLength(2);
    console.log(response);
  });

  it('The outcome transaction must have: description: "Transfer to (destination account); negative amount; type "O"; acc_id (source account); transfer_id (id of transfer) ', async () => {
    const response = await app.db('transactions').where({ transfer_id: transferId }).orderBy('amount', 'asc');
    expect(response[0].description).toBe(`Transfer to ${toAccountId}`);
    expect(response[0].amount).toBe(`-${amount}`);
    expect(response[0].type).toBe('O');
    expect(response[0].acc_id).toBe(fromAccountId);
    expect(response[0].transfer_id).toBe(transferId);
    console.log(response[0]);
  });
  it('The income transaction must have: description: "Transfer from (source account); positive amount; type "I"; acc_id (destination account); transfer_id (id of transfer) ', async () => {
    const response = await app.db('transactions').where({ transfer_id: transferId }).orderBy('amount', 'asc');
    expect(response[1].description).toBe(`Transfer from ${fromAccountId}`);
    expect(response[1].amount).toBe(amount);
    expect(response[1].type).toBe('I');
    expect(response[1].acc_id).toBe(toAccountId);
    expect(response[1].transfer_id).toBe(transferId);
    console.log(response[1]);
  });
});

describe('Should not be possible do a invalid transfer', () => {
  const toAccId = 2001;
  const userId = 1000;
  const testTemplate = async (newBody, errorMessage) => {
    const body = {
      description: 'New Transfer',
      date: new Date(),
      amount: 235,
      from_acc_id: 2000,
      to_acc_id: toAccId,
      user_id: 1000,
    };
    const res = await request(app).post(MAIN_ROUTE)
      .set('Authorization', `Bearer ${TOKEN}`)
      .send({ ...body, ...newBody });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe(errorMessage);
  };
  it('Should not be possible do a transfer without a description', () => {
    testTemplate({ description: null }, 'Transfer description is mandatory');
  });
  it('Should not be possible do a transfer without a date', () => {
    testTemplate({ date: undefined }, 'Transfer date is mandatory');
  });
  it('Should not be possible do a transfer without an amount', () => {
    testTemplate({ amount: null }, 'Transfer amount is mandatory');
  });
  it('Should not be possible do a transfer without a source account(from_acc_id)', () => {
    testTemplate({ from_acc_id: null }, 'Transfer source account is mandatory');
  });
  it('Should not be possible do a transfer without a destiny account(to_acc_id)', () => {
    testTemplate({ to_acc_id: null }, 'Transfer destiny account is mandatory');
  });
  it('Should not be possible do a transfer without an account user owner(user_id)', () => {
    testTemplate({ user_id: null }, 'An account user owner is mandatory');
  });
  it('Should not be possible do a transfer to the same account', () => {
    testTemplate({ from_acc_id: toAccId }, 'Do a transfer to the same source account is forbidden');
  });
  it('Should not be possible do a transfer with other user_id', async () => {
    const otherUser = await app.db('users').whereNot({ id: userId }).first(['id']);
    console.log(otherUser);
    testTemplate({ user_id: otherUser }, 'Do a transfer to the same source account is forbidden');
  });
});

// GET
it('Should return a transfer by id', async () => {
  const transfer = await app.db('transfers').where({ user_id: 1000 }).first(['id']);
  const response = await request(app).get(`${MAIN_ROUTE}/${transfer.id}`)
    .set('Authorization', `Bearer ${TOKEN}`);
  expect(response.status).toBe(200);
});

// UPDATE
describe('Should update a transfer and generate updated transactions successfully...', () => {
  let transferId;
  let fromAccountId;
  let toAccountId;
  let amount;

  it('Should update a transfer successfully', async () => {
    transferId = await app.db('transfers').where({ user_id: 1000 }).first(['id']);
    const response = await request(app).put(`${MAIN_ROUTE}/${transferId.id}`)
      .set('Authorization', `Bearer ${TOKEN}`)
      .send({
        description: 'Updated Transfer',
        date: new Date(),
        amount: '750',
        from_acc_id: 2000,
        to_acc_id: 2001,
        user_id: 1000,
      });
    toAccountId = response.body[0].to_acc_id;
    fromAccountId = response.body[0].from_acc_id;
    amount = response.body[0].amount;
    expect(response.status).toBe(200);
    expect(response.body[0].amount).toBe('750.00');
    expect(response.body[0].description).toBe('Updated Transfer');
  });

  it('The transactions should be created from the transfer above', async () => {
    console.log(transferId);
    const response = await app.db('transactions').where({ transfer_id: transferId.id }).orderBy('amount', 'asc');
    expect(response).toHaveLength(2);
    console.log(response);
  });

  it('The outcome transaction must have: description: "Transfer to (destination account); negative amount; type "O"; acc_id (source account); transfer_id (id of transfer) ', async () => {
    const response = await app.db('transactions').where({ transfer_id: transferId.id }).orderBy('amount', 'asc');
    expect(response[0].description).toBe(`Updated transfer to ${toAccountId}`);
    expect(response[0].amount).toBe(`-${amount}`);
    expect(response[0].type).toBe('O');
    expect(response[0].acc_id).toBe(fromAccountId);
    expect(response[0].transfer_id).toBe(transferId.id);
    console.log(response[0]);
  });
  it('The income transaction must have: description: "Transfer from (source account); positive amount; type "I"; acc_id (destination account); transfer_id (id of transfer) ', async () => {
    const response = await app.db('transactions').where({ transfer_id: transferId.id }).orderBy('amount', 'asc');
    expect(response[1].description).toBe(`Updated transfer from ${fromAccountId}`);
    expect(response[1].amount).toBe(amount);
    expect(response[1].type).toBe('I');
    expect(response[1].acc_id).toBe(toAccountId);
    expect(response[1].transfer_id).toBe(transferId.id);
    console.log(response[1]);
  });
});
// Update 2
describe('Should not be possible update transfer inserting invalid fields', () => {
  const toAccId = 2001;
  const userId = 1000;
  // let transferId;

  const testTemplate = async (newBody, errorMessage) => {
    // transferId = await app.db('transfers').where({ user_id: 1000 }).first(['id']);
    const body = {
      description: 'New Transfer',
      date: new Date(),
      amount: 235,
      from_acc_id: 2000,
      to_acc_id: toAccId,
      user_id: 1000,
    };
    const result = await app.db('transfers').insert(body, '*');
    // console.log(result[0].id);
    const res = await request(app).put(`${MAIN_ROUTE}/${result[0].id}`)
      .set('Authorization', `Bearer ${TOKEN}`)
      .send({ ...body, ...newBody });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe(errorMessage);
  };
  it('Should not be possible do a transfer without a description', () => {
    testTemplate({ description: null }, 'Transfer description is mandatory');
  });
  it('Should not be possible do a transfer without a date', () => {
    testTemplate({ date: undefined }, 'Transfer date is mandatory');
  });
  it('Should not be possible do a transfer without an amount', () => {
    testTemplate({ amount: null }, 'Transfer amount is mandatory');
  });
  it('Should not be possible do a transfer without a source account(from_acc_id)', () => {
    testTemplate({ from_acc_id: null }, 'Transfer source account is mandatory');
  });
  it('Should not be possible do a transfer without a destiny account(to_acc_id)', () => {
    testTemplate({ to_acc_id: null }, 'Transfer destiny account is mandatory');
  });
  it('Should not be possible do a transfer without an account user owner(user_id)', () => {
    testTemplate({ user_id: null }, 'An account user owner is mandatory');
  });
  it('Should not be possible do a transfer to the same account', () => {
    testTemplate({ from_acc_id: toAccId }, 'Do a transfer to the same source account is forbidden');
  });
  it('Should not be possible do a transfer with other user_id', async () => {
    const otherUser = await app.db('users').whereNot({ id: userId }).first(['id']);
    console.log(otherUser);
    testTemplate({ user_id: otherUser }, 'Do a transfer to the same source account is forbidden');
  });
});

// DELETE
/* it('Should delete a transfer successfully', async () => {
  const response = await request(app).post(MAIN_ROUTE)
    .set('Authorization', `Bearer ${TOKEN}`)
    .send({
      description: 'delete Transfer',
      date: new Date(),
      amount: 235,
      from_acc_id: 2000,
      to_acc_id: 2001,
      user_id: 1000,
    });
  console.log(response.body[0].id);
  const res = await request(app).delete(`${MAIN_ROUTE}/${response.body[0].id}`)
    .set('Authorization', `Bearer ${TOKEN}`);
  console.log(res.body[0]);
  expect(res.status).toBe(204);
}); */
