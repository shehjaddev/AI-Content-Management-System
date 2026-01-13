import { Request, Response } from 'express';
import { loginUser, registerUser } from './auth.service';

export const registerController = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;
        const result = await registerUser(email, password);
        return res.status(201).json(result);
    } catch (err: any) {
        const status = err.status || (err.message === 'Email and password are required' ? 400 : 500);
        const message = err.status ? err.message : 'Internal server error';
        console.error(err);
        return res.status(status).json({ message });
    }
};

export const loginController = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;
        const result = await loginUser(email, password);
        return res.json(result);
    } catch (err: any) {
        const status = err.status || (err.message === 'Email and password are required' ? 400 : 500);
        const message = err.status ? err.message : 'Internal server error';
        console.error(err);
        return res.status(status).json({ message });
    }
};
