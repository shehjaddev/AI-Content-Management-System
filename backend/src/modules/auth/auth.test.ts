import { registerUser, loginUser } from './auth.service';
import { User } from './user.model';

jest.mock('./user.model');

const mockedUser = User as jest.Mocked<typeof User>;

describe('auth.service', () => {
    beforeEach(() => {
        jest.resetAllMocks();
    });

    it('registerUser throws if email missing', async () => {
        await expect(registerUser('', 'pass')).rejects.toThrow('Email and password are required');
    });

    it('loginUser throws if email missing', async () => {
        await expect(loginUser('', 'pass')).rejects.toThrow('Email and password are required');
    });

    it('registerUser creates new user when email not taken', async () => {
        (mockedUser.findOne as any).mockResolvedValue(null);
        (mockedUser.create as any).mockResolvedValue({ id: '123', email: 'test@example.com' });

        const result = await registerUser('test@example.com', 'password');
        expect(result).toEqual({ id: '123', email: 'test@example.com' });
    });

    it('loginUser throws if user not found', async () => {
        (mockedUser.findOne as any).mockResolvedValue(null);

        await expect(loginUser('missing@example.com', 'password')).rejects.toThrow('Invalid credentials');
    });

    it('loginUser throws if password invalid', async () => {
        (mockedUser.findOne as any).mockResolvedValue({
            id: '123',
            email: 'test@example.com',
            passwordHash: 'hashed',
        });

        jest.mock('bcryptjs', () => ({
            __esModule: true,
            default: {
                compare: jest.fn().mockResolvedValue(false),
            },
        }));

        await expect(loginUser('test@example.com', 'wrong')).rejects.toThrow('Invalid credentials');
    });
});
