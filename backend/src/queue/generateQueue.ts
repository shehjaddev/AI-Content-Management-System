import { Queue } from 'bullmq';

const REDIS_URL = process.env.REDIS_URL || 'redis://redis:6379';

export interface GenerateJobData {
    userId: string;
    prompt: string;
    contentType: string;
}

export const generateQueue = new Queue<GenerateJobData>('generate-content', {
    connection: { url: REDIS_URL },
});

export const closeQueue = async () => {
    await generateQueue.close();
};
