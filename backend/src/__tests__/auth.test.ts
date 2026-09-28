import request from 'supertest';
import app from '../app';
import { setupTestDB } from './setup';

setupTestDB();

describe('Auth Endpoints', () => {
  const testUser = {
    fullName: 'Jane Doe',
    email: 'jane@example.com',
    password: 'Password123!',
    confirmPassword: 'Password123!',
  };

  it('should successfully register a new user and set cookie', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send(testUser);

    expect(res.status).toBe(201);
    expect(res.body.user).toBeDefined();
    expect(res.body.user.email).toBe('jane@example.com');
    expect(res.body.user.password).toBeUndefined();
    expect(res.headers['set-cookie']).toBeDefined();
  });

  it('should fail registration when passwords do not match', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        ...testUser,
        confirmPassword: 'wrongPassword',
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toContain('Validation failed');
  });

  it('should fail registration for duplicate email', async () => {
    await request(app).post('/api/auth/register').send(testUser);

    const res = await request(app)
      .post('/api/auth/register')
      .send(testUser);

    expect(res.status).toBe(400);
    expect(res.body.message).toContain('already exists');
  });

  it('should login an existing user with valid credentials', async () => {
    await request(app).post('/api/auth/register').send(testUser);

    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: testUser.email,
        password: testUser.password,
      });

    expect(res.status).toBe(200);
    expect(res.body.user).toBeDefined();
    expect(res.headers['set-cookie']).toBeDefined();
  });

  it('should reject login with wrong password', async () => {
    await request(app).post('/api/auth/register').send(testUser);

    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: testUser.email,
        password: 'wrongpassword',
      });

    expect(res.status).toBe(401);
    expect(res.body.message).toBe('Invalid email or password.');
  });

  it('should fetch current authenticated user session', async () => {
    const regRes = await request(app).post('/api/auth/register').send(testUser);
    const cookies = regRes.headers['set-cookie'] as unknown as string[];

    const res = await request(app)
      .get('/api/auth/me')
      .set('Cookie', cookies);

    expect(res.status).toBe(200);
    expect(res.body.user.fullName).toBe('Jane Doe');
  });

  it('should logout user and clear cookie', async () => {
    const regRes = await request(app).post('/api/auth/register').send(testUser);
    const cookies = regRes.headers['set-cookie'] as unknown as string[];

    const res = await request(app)
      .post('/api/auth/logout')
      .set('Cookie', cookies);

    expect(res.status).toBe(200);
    expect((res.headers['set-cookie'] as unknown as string[])[0]).toContain('Expires=Thu, 01 Jan 1970');
  });
});
