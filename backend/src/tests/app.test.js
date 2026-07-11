const request = require('supertest');
const app = require('../app');

describe('GET /', () => {
  it('should return 200 and the "API Running" message', async () => {
    const response = await request(app).get('/');
    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      message: 'API Running'
    });
  });
});
