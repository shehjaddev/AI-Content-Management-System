import { Router } from 'express';
import { authMiddleware } from '../auth/auth.middleware';
import { getJobStatusController } from './job.controller';

const router = Router();

router.get('/:jobId/status', authMiddleware, getJobStatusController);

export default router;
