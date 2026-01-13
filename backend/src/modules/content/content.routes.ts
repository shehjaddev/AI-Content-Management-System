import { Router } from 'express';
import { authMiddleware } from '../auth/auth.middleware';
import {
    createContentController,
    listContentController,
    getContentController,
    updateContentController,
    deleteContentController,
} from './content.controller';

const router = Router();

router.post('/', authMiddleware, createContentController);
router.get('/', authMiddleware, listContentController);
router.get('/:id', authMiddleware, getContentController);
router.put('/:id', authMiddleware, updateContentController);
router.delete('/:id', authMiddleware, deleteContentController);

export default router;
