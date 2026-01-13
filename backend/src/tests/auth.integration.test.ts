import mongoose from 'mongoose';
import request from 'supertest';

jest.mock('bullmq', () => {
    const add = jest.fn();
    const close = jest.fn();

    return {
        Queue: jest.fn().mockImplementation(() => ({
            add,
            close,
        })),
    };
});

process.env.NODE_ENV = 'test';
process.env.MONGO_URI = process.env.MONGO_URI_TEST || 'mongodb://localhost:27017/ai_content_test_db';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test_secret';

import app from '../server';

const TEST_MONGO_URI = process.env.MONGO_URI as string;

beforeAll(async () => {
    await mongoose.connect(TEST_MONGO_URI);
    if (mongoose.connection.db) {
        await mongoose.connection.db.dropDatabase();
    }
});

afterEach(async () => {
    if (mongoose.connection.db) {
        await mongoose.connection.db.dropDatabase();
    }
});

afterAll(async () => {
    await mongoose.connection.close();
});

describe('Integration: health endpoint', () => {
    it('returns ok status', async () => {
        const res = await request(app).get('/health');
        expect(res.status).toBe(200);
        expect(res.body).toEqual({ status: 'ok' });
    });
});

describe('Integration: auth endpoints', () => {
    const email = 'integration@example.com';
    const password = 'password123';

    it('registers a new user', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send({ email, password });

        expect(res.status).toBe(201);
        expect(res.body).toHaveProperty('id');
        expect(res.body).toHaveProperty('email', email);
    });

    it('logs in an existing user and returns a token', async () => {
        await request(app).post('/api/auth/register').send({ email, password });

        const res = await request(app)
            .post('/api/auth/login')
            .send({ email, password });

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('token');
        expect(res.body).toHaveProperty('user');
        expect(res.body.user).toHaveProperty('email', email);
    });
});
