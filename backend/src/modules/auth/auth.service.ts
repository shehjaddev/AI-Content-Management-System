import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from './user.model';

export const registerUser = async (email: string, password: string) => {
    if (!email || !password) {
        throw new Error('Email and password are required');
    }

    const existing = await User.findOne({ email });
    if (existing) {
        const err: any = new Error('User already exists');
        err.status = 409;
        throw err;
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ email, passwordHash });
    return { id: user.id, email: user.email };
};

export const loginUser = async (email: string, password: string) => {
    if (!email || !password) {
        throw new Error('Email and password are required');
    }

    const user = await User.findOne({ email });
    if (!user) {
        const err: any = new Error('Invalid credentials');
        err.status = 401;
        throw err;
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
        const err: any = new Error('Invalid credentials');
        err.status = 401;
        throw err;
    }

    const secret = process.env.JWT_SECRET || 'dev_secret';
    const token = jwt.sign({ sub: user.id }, secret, { expiresIn: '1h' });

    return {
        token,
        user: {
            id: user.id,
            email: user.email,
        },
    };
};
