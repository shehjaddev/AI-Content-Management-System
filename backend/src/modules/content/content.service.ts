import { Content } from './content.model';
import { Job } from './job.model';
import { generateQueue } from '../../queue/generateQueue';

export const createContent = async (userId: string, data: any) => {
    const { title, type, prompt, body } = data;
    return Content.create({ user: userId, title, type, prompt, body });
};

export const listContent = async (userId: string, q?: string) => {
    const filter: any = { user: userId };
    if (q) {
        filter.title = { $regex: q, $options: 'i' };
    }
    return Content.find(filter).sort({ createdAt: -1 });
};

export const getContentById = async (userId: string, id: string) => {
    return Content.findOne({ _id: id, user: userId });
};

export const updateContent = async (userId: string, id: string, data: any) => {
    const { title, body } = data;
    return Content.findOneAndUpdate(
        { _id: id, user: userId },
        { title, body },
        { new: true }
    );
};

export const deleteContent = async (userId: string, id: string) => {
    return Content.findOneAndDelete({ _id: id, user: userId });
};

export const enqueueGenerateJob = async (userId: string, prompt: string, contentType: string) => {
    const jobRecord = await Job.create({
        user: userId,
        contentType,
        prompt,
        status: 'pending',
    });

    const delayMs = 60000;

    const job = await generateQueue.add(
        'generate-content-job',
        { userId, prompt, contentType },
        { delay: delayMs, jobId: jobRecord.id }
    );

    return { jobId: job.id, delayMs };
};
