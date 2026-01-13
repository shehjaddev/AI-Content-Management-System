import { Response } from 'express';
import { AuthRequest } from '../auth/auth.middleware';
import {
    createContent,
    listContent,
    getContentById,
    updateContent,
    deleteContent,
    enqueueGenerateJob,
} from './content.service';

export const createContentController = async (req: AuthRequest, res: Response) => {
    try {
        const content = await createContent(req.userId!, req.body);
        return res.status(201).json(content);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

export const enqueueGenerateJobController = async (req: AuthRequest, res: Response) => {
    try {
        const { prompt, contentType } = req.body;
        if (!prompt || !contentType) {
            return res.status(400).json({ message: 'prompt and contentType are required' });
        }

        const { jobId, delayMs } = await enqueueGenerateJob(req.userId!, prompt, contentType);

        return res.status(202).json({ jobId, delayMs, message: 'Job queued' });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

export const listContentController = async (req: AuthRequest, res: Response) => {
    try {
        const q = typeof req.query.q === 'string' ? req.query.q : undefined;
        const items = await listContent(req.userId!, q);
        return res.json(items);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

export const getContentController = async (req: AuthRequest, res: Response) => {
    try {
        const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        const item = await getContentById(req.userId!, id);
        if (!item) return res.status(404).json({ message: 'Not found' });
        return res.json(item);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

export const updateContentController = async (req: AuthRequest, res: Response) => {
    try {
        const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        const updated = await updateContent(req.userId!, id, req.body);
        if (!updated) return res.status(404).json({ message: 'Not found' });
        return res.json(updated);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

export const deleteContentController = async (req: AuthRequest, res: Response) => {
    try {
        const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        const deleted = await deleteContent(req.userId!, id);
        if (!deleted) return res.status(404).json({ message: 'Not found' });
        return res.status(204).send();
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Internal server error' });
    }
};
