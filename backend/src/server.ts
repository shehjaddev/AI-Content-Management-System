import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { createServer } from 'http';
import { setupSocketAndQueueEvents } from './socket';
import authRouter from './modules/auth/auth.routes';
import contentRouter from './modules/content/content.routes';
import jobsRouter from './modules/jobs/job.routes';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.get('/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok' });
});

app.use('/api/auth', authRouter);
app.use('/api/content', contentRouter);
app.use('/api/jobs', jobsRouter);

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/ai_content_db';

mongoose
    .connect(MONGO_URI)
    .then(() => {
        console.log('Connected to MongoDB');
    })
    .catch((err) => {
        console.error('MongoDB connection error', err);
    });

if (process.env.NODE_ENV !== 'test') {
    const PORT = process.env.PORT || 4000;
    const httpServer = createServer(app);

    setupSocketAndQueueEvents(httpServer);

    httpServer.listen(PORT, () => {
        console.log(`Backend server listening on port ${PORT}`);
    });
}

export default app;
