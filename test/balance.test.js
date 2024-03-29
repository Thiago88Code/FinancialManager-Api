const request = require('supertest');
const jwt = require('jwt-simple');
const moment = require('moment');
const app = require('../src/server');

const MAIN_ROUTE = '/v1/balance';
const ROUTE_TRANSACTION = '/v1/transactions';
const ROUTE_TRANSFER = '/v1/transfers';
let user;
let user2;
let account;
let account2;

beforeAll(async () => {
  await app.db.seed.run();
  user = await app.services.user.find({ id: 1100 });
  user = { ...user[0] };
  user.token = jwt.encode(user, 'secret');

  user2 = await app.services.user.find({ id: 1101 });
  user2 = { ...user2[0] };
  user2.token = jwt.encode(user2, 'secret');

  const accounts = await app.services.accounts.findAll({ user_id: 1100 });
  account = { ...accounts[0] };
  account2 = { ...accounts[1] };
});
describe('When calculate the balance...', () => {
  it('Should just get an account having at least one transaction ', async () => {
    const response = await request(app).get(MAIN_ROUTE)
      .set('Authorization', `Bearer ${user.token}`);
    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(0);
  });
  it('Should add income values ', async () => {
    await request(app).post(ROUTE_TRANSACTION)
      .set('Authorization', `Bearer ${user.token}`)
      .send({
        description: '1',
        type: 'I',
        date: new Date(),
        status: true,
        amount: 100,
        acc_id: account.id,
      });
    const response = await request(app).get(MAIN_ROUTE)
      .set('Authorization', `Bearer ${user.token}`);
    expect(response.status).toBe(200);
    expect(response.body[0].id).toBe(account.id);
    expect(response.body[0].sum).toBe('100.00');
  });

  it('Should deduct outcome values ', async () => {
    await request(app).post(ROUTE_TRANSACTION)
      .set('Authorization', `Bearer ${user.token}`)
      .send({
        description: '1',
        type: 'O',
        date: new Date(),
        status: true,
        amount: 100,
        acc_id: account.id,
      });
    const response = await request(app).get(MAIN_ROUTE)
      .set('Authorization', `Bearer ${user.token}`);
    expect(response.status).toBe(200);
    expect(response.body[0].id).toBe(account.id);
    expect(response.body[0].sum).toBe('0.00');
  });
  it('Should not consider pendents transactions (status: false)', async () => {
    await request(app).post(ROUTE_TRANSACTION)
      .set('Authorization', `Bearer ${user.token}`)
      .send({
        description: '1',
        type: 'I',
        date: new Date(),
        status: false,
        amount: 157,
        acc_id: account.id,
      });
    const response = await request(app).get(MAIN_ROUTE)
      .set('Authorization', `Bearer ${user.token}`);
    expect(response.status).toBe(200);
    expect(response.body[0].id).toBe(account.id);
    expect(response.body[0].sum).toBe('0.00');
  });
  it('Should not return a balance from a diferent account', async () => {
    await request(app).post(ROUTE_TRANSACTION)
      .set('Authorization', `Bearer ${user.token}`)
      .send({
        description: '1',
        type: 'I',
        date: new Date(),
        status: true,
        amount: 100,
        acc_id: account.id,
      });
    await request(app).post(ROUTE_TRANSACTION)
      .set('Authorization', `Bearer ${user.token}`)
      .send({
        description: '1',
        type: 'I',
        date: new Date(),
        status: true,
        amount: 10,
        acc_id: account2.id,
      });
    const response = await request(app).get(MAIN_ROUTE)
      .set('Authorization', `Bearer ${user.token}`);
    expect(response.status).toBe(200);
    expect(response.body[0].id).toBe(account.id);
    expect(response.body[0].sum).toBe('100.00');
    expect(response.body[1].id).toBe(account2.id);
    expect(response.body[1].sum).toBe('10.00');
  });

  it('Should not return a balance from a diferent user-account', async () => {
    await request(app).post(ROUTE_TRANSACTION)
      .set('Authorization', `Bearer ${user2.token}`)
      .send({
        description: '2',
        type: 'I',
        date: new Date(),
        status: true,
        amount: 70,
        acc_id: account.id,
      });
    const response = await request(app).get(MAIN_ROUTE)
      .set('Authorization', `Bearer ${user.token}`);
    expect(response.status).toBe(200);
    expect(response.body[0].id).toBe(account.id);
    expect(response.body[0].sum).toBe('170.00');
    expect(response.body[1].id).toBe(account2.id);
    expect(response.body[1].sum).toBe('10.00');
  });

  it('Should consider transaction from the past', async () => {
    await request(app).post(ROUTE_TRANSACTION)
      .set('Authorization', `Bearer ${user.token}`)
      .send({
        description: '1',
        type: 'O',
        date: moment().subtract({ days: 3 }),
        status: true,
        amount: 70,
        acc_id: account.id,
      });
    const response = await request(app).get(MAIN_ROUTE)
      .set('Authorization', `Bearer ${user.token}`);
    expect(response.status).toBe(200);
    expect(response.body[0].id).toBe(account.id);
    expect(response.body[0].sum).toBe('100.00');
  });
  it('Should not consider future transaction', async () => {
    await request(app).post(ROUTE_TRANSACTION)
      .set('Authorization', `Bearer ${user.token}`)
      .send({
        description: '1',
        type: 'I',
        date: moment().add({ days: 5 }),
        status: true,
        amount: 350,
        acc_id: account.id,
      });
    const response = await request(app).get(MAIN_ROUTE)
      .set('Authorization', `Bearer ${user.token}`);
    expect(response.status).toBe(200);
    expect(response.body[0].id).toBe(account.id);
    expect(response.body[0].sum).toBe('100.00');
  });
  it('Should consider transfers', async () => {
    const res = await request(app).post(ROUTE_TRANSFER)
      .set('Authorization', `Bearer ${user.token}`)
      .send({
        description: 'New Transfer',
        date: new Date(),
        amount: 110,
        from_acc_id: account.id,
        to_acc_id: account2.id,
        user_id: user.id,
      });
    expect(res.status).toBe(201);
    const response = await request(app).get(MAIN_ROUTE)
      .set('Authorization', `Bearer ${user.token}`);
    expect(response.status).toBe(200);
    expect(response.body[0].id).toBe(account.id);
    expect(response.body[0].sum).toBe('-10.00');
    expect(response.body[1].id).toBe(account2.id);
    expect(response.body[1].sum).toBe('120.00');
  });
});
