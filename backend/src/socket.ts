import { Server as SocketIOServer } from 'socket.io';
import type { Server as HttpServer } from 'http';
import { QueueEvents } from 'bullmq';

const REDIS_URL = process.env.REDIS_URL || 'redis://redis:6379';

export const setupSocketAndQueueEvents = (httpServer: HttpServer) => {
    const io = new SocketIOServer(httpServer, {
        cors: {
            origin: '*',
        },
    });

    const queueEvents = new QueueEvents('generate-content', {
        connection: { url: REDIS_URL },
    });

    queueEvents.on('completed', async ({ jobId }) => {
        console.log('Emitting jobUpdate for', jobId);
        io.emit('jobUpdate', { jobId, status: 'completed' });
    });

    queueEvents.on('failed', async ({ jobId, failedReason }) => {
        io.emit('jobUpdate', { jobId, status: 'failed', error: failedReason });
    });

    return io;
};
