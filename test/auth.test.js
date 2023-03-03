const request = require('supertest');

const app = require('../src/server');

it('Should be able an user signup', async () => {
  const response = await request(app).post('/auth/signup')
    .send({ name: 'teste', email: `${Date.now()}@gmail.com`, password: 'sei lá' });
  expect(response.status).toBe(201);
  // console.log(response.body);
});

it('Should be able an user signin then a token be generated', async () => {
  const email = `${Date.now()}@gmail.com`;
  const body = { name: 'teste', email, password: 'sei lá' };
  await app.services.user.save(body);
  const response = await request(app).post('/auth/signin')
    .send({ name: 'teste', email, password: 'sei lá' });
  expect(response.status).toBe(200);
  expect(response.body).toHaveProperty('token');
  // console.log(response.body);
});

it.skip('Should be able signin with wrong password', async () => {
  const email = `${Date.now()}@gmail.com`;
  const body = { name: 'teste de senha', email, password: 'senha' };
  await app.services.user.save(body);
  const response = await request(app).post('/auth/signin')
    .send({ name: 'teste de senha', email, password: 'senha errada' });
  expect(response.status).toBe(400);
  expect(response.body.error).toBe('Invalid password');
  expect(response.body).not.toHaveProperty('token');
  // console.log(response.body);
});
