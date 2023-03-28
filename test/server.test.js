const request = require('supertest');
const app = require('../src/server');

it('Should create an account', async () => {
  const response = await request(app).post('/').send({ name: '#acc 1' });
  expect(response.status).toBe(404);
});
