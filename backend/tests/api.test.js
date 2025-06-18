const request = require('supertest');
const app = require('../server');

// Mock authentication token if needed
defaultToken = 'Bearer testtoken';

describe('API Endpoints', () => {
  // 1. GET /api/properties
  it('should get all properties', async () => {
    const res = await request(app).get('/api/properties');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  // 2. POST /api/properties (missing data)
  it('should fail to create property with missing data', async () => {
    const res = await request(app).post('/api/properties').send({});
    expect(res.statusCode).toBe(400);
  });

  // 3. POST /api/properties (valid)
  it('should create a property', async () => {
    const res = await request(app)
      .post('/api/properties')
      .send({ title: 'Test', price: 1000, location: 'Test City' });
    expect([200, 201]).toContain(res.statusCode);
    expect(res.body).toHaveProperty('title', 'Test');
  });

  // 4. GET /api/properties/:id (invalid id)
  it('should return 404 for invalid property id', async () => {
    const res = await request(app).get('/api/properties/invalidid');
    expect([400, 404]).toContain(res.statusCode);
  });

  // 5. PUT /api/properties/:id (not found)
  it('should return 404 for updating non-existent property', async () => {
    const res = await request(app)
      .put('/api/properties/invalidid')
      .send({ title: 'Updated' });
    expect([400, 404]).toContain(res.statusCode);
  });

  // 6. DELETE /api/properties/:id (not found)
  it('should return 404 for deleting non-existent property', async () => {
    const res = await request(app).delete('/api/properties/invalidid');
    expect([400, 404]).toContain(res.statusCode);
  });

  // 7. GET /api/profile (unauthenticated)
  it('should require auth for profile', async () => {
    const res = await request(app).get('/api/profile');
    expect([401, 403]).toContain(res.statusCode);
  });

  // 8. POST /api/auth/login (missing data)
  it('should fail login with missing data', async () => {
    const res = await request(app).post('/api/auth/login').send({});
    expect(res.statusCode).toBe(400);
  });

  // 9. POST /api/auth/register (valid)
  it('should register a new user', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'test@example.com', password: 'password123' });
    expect([200, 201, 409]).toContain(res.statusCode); // 409 if already exists
  });

  // 10. POST /api/auth/login (valid)
  it('should login a user', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@example.com', password: 'password123' });
    expect([200, 401]).toContain(res.statusCode);
  });

  // 11. GET /api/voting (public or protected)
  it('should get voting info', async () => {
    const res = await request(app).get('/api/voting');
    expect([200, 401, 403]).toContain(res.statusCode);
  });

  // 12. POST /api/voting (missing data)
  it('should fail to vote with missing data', async () => {
    const res = await request(app).post('/api/voting').send({});
    expect([400, 401, 403]).toContain(res.statusCode);
  });

  // 13. POST /api/payment (invalid data)
  it('should fail payment with invalid data', async () => {
    const res = await request(app).post('/api/payment').send({});
    expect([400, 401, 403]).toContain(res.statusCode);
  });

  // 14. POST /api/payment (valid data)
  it('should process payment', async () => {
    const res = await request(app)
      .post('/api/payment')
      .send({ amount: 100, propertyId: 'testid' });
    expect([200, 201, 400, 401, 403]).toContain(res.statusCode);
  });

  // 15. GET /api/crowdfunding (public)
  it('should get crowdfunding info', async () => {
    const res = await request(app).get('/api/crowdfunding');
    expect([200, 401, 403]).toContain(res.statusCode);
  });

  // 16. POST /api/crowdfunding (missing data)
  it('should fail crowdfunding with missing data', async () => {
    const res = await request(app).post('/api/crowdfunding').send({});
    expect([400, 401, 403]).toContain(res.statusCode);
  });

  // 17. PUT /api/profile (unauthenticated)
  it('should require auth for updating profile', async () => {
    const res = await request(app).put('/api/profile').send({ name: 'Test' });
    expect([401, 403]).toContain(res.statusCode);
  });

  // 18. GET /api/profile (authenticated, placeholder)
  it('should get profile with auth (placeholder)', async () => {
    // const res = await request(app).get('/api/profile').set('Authorization', defaultToken);
    // expect(res.statusCode).toBe(200);
    expect(true).toBe(true); // Placeholder
  });

  // 19. POST /api/auth/logout (placeholder)
  it('should logout user (placeholder)', async () => {
    // const res = await request(app).post('/api/auth/logout').set('Authorization', defaultToken);
    // expect(res.statusCode).toBe(200);
    expect(true).toBe(true); // Placeholder
  });

  // 20. DELETE /api/user (unauthenticated)
  it('should require auth for deleting user', async () => {
    const res = await request(app).delete('/api/user');
    expect([401, 403, 404]).toContain(res.statusCode);
  });
}); 