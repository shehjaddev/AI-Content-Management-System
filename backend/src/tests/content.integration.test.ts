import mongoose from 'mongoose';
import request from 'supertest';

jest.mock('bullmq', () => {
    const add = jest.fn().mockResolvedValue({ id: 'test-job-id' });
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

async function createUserAndToken() {
    const email = 'content-int@example.com';
    const password = 'password123';

    await request(app).post('/api/auth/register').send({ email, password });

    const loginRes = await request(app).post('/api/auth/login').send({ email, password });
    return loginRes.body.token as string;
}

describe('Integration: content endpoints', () => {
    it('creates, lists, fetches, updates and deletes content', async () => {
        const token = await createUserAndToken();

        const createRes = await request(app)
            .post('/api/content')
            .set('Authorization', `Bearer ${token}`)
            .send({
                title: 'My Title',
                type: 'blog_outline',
                prompt: 'Write an outline',
                body: 'Initial body',
            });

        expect(createRes.status).toBe(201);
        expect(createRes.body).toHaveProperty('_id');
        const contentId = createRes.body._id as string;

        const listRes = await request(app)
            .get('/api/content')
            .set('Authorization', `Bearer ${token}`);

        expect(listRes.status).toBe(200);
        expect(Array.isArray(listRes.body)).toBe(true);
        expect(listRes.body.length).toBe(1);

        const getRes = await request(app)
            .get(`/api/content/${contentId}`)
            .set('Authorization', `Bearer ${token}`);

        expect(getRes.status).toBe(200);
        expect(getRes.body).toHaveProperty('_id', contentId);

        const updateRes = await request(app)
            .put(`/api/content/${contentId}`)
            .set('Authorization', `Bearer ${token}`)
            .send({
                title: 'Updated Title',
                body: 'Updated body',
            });

        expect(updateRes.status).toBe(200);
        expect(updateRes.body).toHaveProperty('title', 'Updated Title');
        expect(updateRes.body).toHaveProperty('body', 'Updated body');

        const deleteRes = await request(app)
            .delete(`/api/content/${contentId}`)
            .set('Authorization', `Bearer ${token}`);

        expect(deleteRes.status).toBe(204);

        const getAfterDeleteRes = await request(app)
            .get(`/api/content/${contentId}`)
            .set('Authorization', `Bearer ${token}`);

        expect(getAfterDeleteRes.status).toBe(404);
    });

    it('enqueues generate job for content', async () => {
        const token = await createUserAndToken();

        const res = await request(app)
            .post('/api/content/generate')
            .set('Authorization', `Bearer ${token}`)
            .send({
                prompt: 'Generate something',
                contentType: 'blog_outline',
            });

        expect(res.status).toBe(202);
        expect(res.body).toHaveProperty('jobId');
        expect(res.body).toHaveProperty('delayMs');
        expect(res.body).toHaveProperty('message', 'Job queued');
    });
});
