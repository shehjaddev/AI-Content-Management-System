import { createContent, listContent, getContentById, updateContent, deleteContent } from './content.service';
import { Content } from './content.model';

jest.mock('./content.model');

const mockedContent = Content as jest.Mocked<typeof Content>;

describe('content.service', () => {
    const userId = 'user123';

    beforeEach(() => {
        jest.resetAllMocks();
    });

    it('createContent delegates to Content.create with userId', async () => {
        (mockedContent.create as any).mockResolvedValue({ id: 'c1', title: 'Title' });

        const result = await createContent(userId, {
            title: 'Title',
            type: 'blog_outline',
            prompt: 'Prompt',
            body: 'Body',
        });

        expect(mockedContent.create).toHaveBeenCalledWith({
            user: userId,
            title: 'Title',
            type: 'blog_outline',
            prompt: 'Prompt',
            body: 'Body',
        });
        expect(result).toEqual({ id: 'c1', title: 'Title' });
    });

    it('listContent builds filter with user and optional search', async () => {
        const mockFind = { sort: jest.fn().mockResolvedValue(['item']) } as any;
        (mockedContent.find as any).mockReturnValue(mockFind);

        const result = await listContent(userId, 'foo');

        expect(mockedContent.find).toHaveBeenCalledWith({
            user: userId,
            title: { $regex: 'foo', $options: 'i' },
        });
        expect(mockFind.sort).toHaveBeenCalledWith({ createdAt: -1 });
        expect(result).toEqual(['item']);
    });

    it('getContentById calls findOne with user and id', async () => {
        (mockedContent.findOne as any).mockResolvedValue('doc');

        const result = await getContentById(userId, 'cid');

        expect(mockedContent.findOne).toHaveBeenCalledWith({ _id: 'cid', user: userId });
        expect(result).toBe('doc');
    });

    it('updateContent calls findOneAndUpdate with correct query and data', async () => {
        (mockedContent.findOneAndUpdate as any).mockResolvedValue('updated');

        const result = await updateContent(userId, 'cid', {
            title: 'New',
            body: 'Body2',
        });

        expect(mockedContent.findOneAndUpdate).toHaveBeenCalledWith(
            { _id: 'cid', user: userId },
            { title: 'New', body: 'Body2' },
            { new: true }
        );
        expect(result).toBe('updated');
    });

    it('deleteContent calls findOneAndDelete with correct query', async () => {
        (mockedContent.findOneAndDelete as any).mockResolvedValue('deleted');

        const result = await deleteContent(userId, 'cid');

        expect(mockedContent.findOneAndDelete).toHaveBeenCalledWith({ _id: 'cid', user: userId });
        expect(result).toBe('deleted');
    });
});
