import request from 'supertest';
import app from '../app';
import { setupTestDB } from './setup';

setupTestDB();

describe('Budgets & Calculation Logic', () => {
  let cookie: string[];
  let categoryId: string;

  beforeEach(async () => {
    const reg = await request(app).post('/api/auth/register').send({
      fullName: 'Budget User',
      email: 'budget@example.com',
      password: 'password123',
      confirmPassword: 'password123',
    });
    cookie = reg.headers['set-cookie'] as unknown as string[];

    const catRes = await request(app).get('/api/categories').set('Cookie', cookie);
    categoryId = catRes.body.categories.find((c: any) => c.type === 'expense')._id;
  });

  it('should create budget and calculate dynamic spent amount from transactions', async () => {
    const currentPeriod = new Date().toISOString().slice(0, 7); // 'YYYY-MM'

    // Create budget of $500
    const budgetRes = await request(app)
      .post('/api/budgets')
      .set('Cookie', cookie)
      .send({
        name: 'Food Budget',
        amount: 500,
        categoryId,
        period: currentPeriod,
      });

    expect(budgetRes.status).toBe(201);

    // Create expense transaction of $320 in the current period
    await request(app)
      .post('/api/transactions')
      .set('Cookie', cookie)
      .send({
        type: 'expense',
        amount: 320,
        categoryId,
        date: new Date(),
        description: 'Groceries',
      });

    // Fetch budgets
    const listRes = await request(app)
      .get(`/api/budgets?period=${currentPeriod}`)
      .set('Cookie', cookie);

    expect(listRes.status).toBe(200);
    const budget = listRes.body.budgets[0];
    expect(budget.spentAmount).toBe(320);
    expect(budget.remainingAmount).toBe(180);
    expect(budget.percentageUsed).toBe(64);
  });
});
