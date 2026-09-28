import request from 'supertest';
import app from '../app';
import { setupTestDB } from './setup';

setupTestDB();

describe('Savings Goals & Contributions', () => {
  let cookie: string[];

  beforeEach(async () => {
    const reg = await request(app).post('/api/auth/register').send({
      fullName: 'Saver User',
      email: 'saver@example.com',
      password: 'password123',
      confirmPassword: 'password123',
    });
    cookie = reg.headers['set-cookie'] as unknown as string[];
  });

  it('should create a savings goal and add contributions until completed', async () => {
    // Create Goal: Emergency Fund $1000
    const createRes = await request(app)
      .post('/api/savings')
      .set('Cookie', cookie)
      .send({
        name: 'Emergency Fund',
        targetAmount: 1000,
        targetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        description: '3 months of reserves',
      });

    expect(createRes.status).toBe(201);
    const goalId = createRes.body.goal._id;
    expect(createRes.body.goal.isCompleted).toBe(false);

    // Contribute $400
    const c1 = await request(app)
      .post(`/api/savings/${goalId}/contribute`)
      .set('Cookie', cookie)
      .send({ amount: 400 });

    expect(c1.status).toBe(200);
    expect(c1.body.goal.currentAmount).toBe(400);
    expect(c1.body.goal.isCompleted).toBe(false);

    // Contribute $600 (Reaches $1000)
    const c2 = await request(app)
      .post(`/api/savings/${goalId}/contribute`)
      .set('Cookie', cookie)
      .send({ amount: 600 });

    expect(c2.status).toBe(200);
    expect(c2.body.goal.currentAmount).toBe(1000);
    expect(c2.body.goal.isCompleted).toBe(true);
  });
});
