import { Response } from 'express';
import { AuthRequest } from '../auth/auth.middleware';
import { Job } from '../content/job.model';
import { Content } from '../content/content.model';

export const getJobStatusController = async (req: AuthRequest, res: Response) => {
    try {
        const job = await Job.findById(req.params.jobId);
        if (!job || job.user.toString() !== req.userId!) {
            return res.status(404).json({ message: 'Job not found' });
        }

        let content = null;
        if (job.resultContent) {
            content = await Content.findById(job.resultContent);
        }

        return res.json({
            status: job.status,
            error: job.error,
            content,
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Internal server error' });
    }
};
