const request = require('supertest');
const app = require('../src/app');

describe('Backend Health Check & Setup Test', () => {
  it('GET /health should return 200 UP status', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('status', 'UP');
    expect(res.body).toHaveProperty('service');
  });

  it('GET /api/invalid-route should return 404', async () => {
    const res = await request(app).get('/api/invalid-route');
    expect(res.statusCode).toEqual(404);
    expect(res.body.success).toBe(false);
  });
});
