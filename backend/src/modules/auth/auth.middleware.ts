import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
    userId?: string;
}

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ message: 'Missing Authorization header' });
    }

    const token = authHeader.replace('Bearer ', '');
    const secret = process.env.JWT_SECRET || 'dev_secret';

    try {
        const payload = jwt.verify(token, secret) as { sub: string };
        req.userId = payload.sub;
        next();
    } catch (_err) {
        return res.status(401).json({ message: 'Invalid token' });
    }
};
