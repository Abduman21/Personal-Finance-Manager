import request from 'supertest';
import app from '../app';
import { setupTestDB } from './setup';

setupTestDB();

describe('Transactions & Security Authorization Isolation', () => {
  let user1Cookie: string[];
  let user2Cookie: string[];
  let categoryIdUser1: string;

  beforeEach(async () => {
    // Register User 1
    const res1 = await request(app).post('/api/auth/register').send({
      fullName: 'User One',
      email: 'user1@example.com',
      password: 'password123',
      confirmPassword: 'password123',
    });
    user1Cookie = res1.headers['set-cookie'] as unknown as string[];

    // Get categories for User 1
    const catRes = await request(app)
      .get('/api/categories')
      .set('Cookie', user1Cookie);
    categoryIdUser1 = catRes.body.categories[0]._id;

    // Register User 2
    const res2 = await request(app).post('/api/auth/register').send({
      fullName: 'User Two',
      email: 'user2@example.com',
      password: 'password123',
      confirmPassword: 'password123',
    });
    user2Cookie = res2.headers['set-cookie'] as unknown as string[];
  });

  it('should allow user to create a transaction', async () => {
    const res = await request(app)
      .post('/api/transactions')
      .set('Cookie', user1Cookie)
      .send({
        type: 'income',
        amount: 1500,
        categoryId: categoryIdUser1,
        date: new Date(),
        description: 'Monthly Salary',
        merchant: 'Acme Corp',
      });

    expect(res.status).toBe(201);
    expect(res.body.transaction).toBeDefined();
    expect(res.body.transaction.amount).toBe(1500);
  });

  it('PREVENT CROSS-USER ACCESS: User 2 cannot access or modify User 1 transaction', async () => {
    // User 1 creates transaction
    const createRes = await request(app)
      .post('/api/transactions')
      .set('Cookie', user1Cookie)
      .send({
        type: 'expense',
        amount: 50,
        categoryId: categoryIdUser1,
        date: new Date(),
        description: 'Private Expense',
      });

    const txId = createRes.body.transaction._id;

    // User 2 attempts GET
    const getRes = await request(app)
      .get(`/api/transactions/${txId}`)
      .set('Cookie', user2Cookie);
    expect(getRes.status).toBe(404);

    // User 2 attempts PUT
    const putRes = await request(app)
      .put(`/api/transactions/${txId}`)
      .set('Cookie', user2Cookie)
      .send({ amount: 9999 });
    expect(putRes.status).toBe(404);

    // User 2 attempts DELETE
    const delRes = await request(app)
      .delete(`/api/transactions/${txId}`)
      .set('Cookie', user2Cookie);
    expect(delRes.status).toBe(404);

    // User 2 lists transactions - should receive empty list
    const listRes = await request(app)
      .get('/api/transactions')
      .set('Cookie', user2Cookie);
    expect(listRes.body.transactions).toHaveLength(0);
  });
});
