const supertest = require('supertest');

const request = supertest('http://localhost:3001');

test.skip('Should respond at 3001 port', async () => {
  const response = await request.get('/');
  expect(response.status).toBe(200);
});
