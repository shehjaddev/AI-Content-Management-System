import { Job as BullJob, Worker } from 'bullmq';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { Content, ContentType } from './modules/content/content.model';
import { Job } from './modules/content/job.model';
import { GenerateJobData } from './queue/generateQueue';
import { analyzeSentiment, generateContent } from './services/aiService';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://mongo:27017/ai_content_db';
const REDIS_URL = process.env.REDIS_URL || 'redis://redis:6379';

mongoose
    .connect(MONGO_URI)
    .then(() => {
        console.log('Worker connected to MongoDB');
    })
    .catch((err) => {
        console.error('Worker MongoDB connection error', err);
    });

const worker = new Worker<GenerateJobData>(
    'generate-content',
    async (job: BullJob<GenerateJobData>) => {
        const { userId, prompt, contentType } = job.data;

        const dbJob = await Job.findById(job.id);
        if (dbJob) {
            dbJob.status = 'processing';
            await dbJob.save();
        }

        try {
            const generated = await generateContent(prompt, contentType as ContentType);
            const sentiment = await analyzeSentiment(generated.body);

            const content = await Content.create({
                user: userId,
                title: generated.title,
                type: contentType,
                prompt,
                body: generated.body,
                sentiment,
            });

            if (dbJob) {
                dbJob.status = 'completed';
                dbJob.resultContent = content._id;
                await dbJob.save();
            }
        } catch (err: any) {
            console.error('Worker job failed', err);
            if (dbJob) {
                dbJob.status = 'failed';
                dbJob.error = err?.message || 'Unknown error';
                await dbJob.save();
            }
        }
    },
    {
        connection: { url: REDIS_URL },
    }
);

worker.on('completed', (job) => {
    console.log(`Job ${job.id} completed`);
});

worker.on('failed', (job, err) => {
    console.error(`Job ${job?.id} failed`, err);
});
