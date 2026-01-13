import { GoogleGenAI } from '@google/genai';
import { ContentType, SentimentType } from '../modules/content/content.model';

export interface GeneratedContent {
    title: string;
    body: string;
}

export type Sentiment = SentimentType;

export const generateContent = async (
    prompt: string,
    type: ContentType
): Promise<GeneratedContent> => {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        throw new Error('GEMINI_API_KEY is not configured');
    }

    const typeLabel =
        type === 'blog_outline'
            ? 'Blog Post Outline'
            : type === 'product_description'
                ? 'Product Description'
                : 'Social Media Caption';

    const fullPrompt = `Generate a ${typeLabel}.

User prompt: ${prompt}

Respond with a clear title on the first line and the full content after a blank line.`;

    try {
        const ai = new GoogleGenAI({ apiKey, apiVersion: 'v1' });
        const result = await ai.models.generateContent({
            model: 'gemini-2.5-flash-lite',
            contents: [
                {
                    role: 'user',
                    parts: [{ text: fullPrompt }],
                },
            ],
        });

        const text =
            result.candidates?.[0]?.content?.parts
                ?.map((p: { text?: unknown }) => (typeof p.text === 'string' ? p.text : ''))
                .join('') || 'No content generated.';

        const [firstLine, ...rest] = text.split('\n');
        const title = firstLine.trim() || `${prompt} - ${typeLabel}`;
        const body = rest.join('\n').trim() || text;

        return { title, body };
    } catch (err: unknown) {
        console.error('Gemini generation failed', err);
        throw err;
    }
};

export const analyzeSentiment = async (text: string): Promise<Sentiment> => {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        throw new Error('GEMINI_API_KEY is not configured');
    }

    const ai = new GoogleGenAI({ apiKey, apiVersion: 'v1' });

    const prompt = `You are a sentiment analysis model.

Classify the overall sentiment of the following text as exactly one of:
- positive
- neutral
- negative

Reply with a single word: positive, neutral, or negative.

Text:
${text}`;

    try {
        const result = await ai.models.generateContent({
            model: 'gemini-2.5-flash-lite',
            contents: [
                {
                    role: 'user',
                    parts: [{ text: prompt }],
                },
            ],
        });

        const raw =
            result.candidates?.[0]?.content?.parts
                ?.map((p: { text?: unknown }) => (typeof p.text === 'string' ? p.text : ''))
                .join('')
                .trim()
                .toLowerCase() || 'neutral';

        if (raw.includes('positive')) return 'positive';
        if (raw.includes('negative')) return 'negative';
        return 'neutral';
    } catch (err: unknown) {
        console.error('Gemini sentiment analysis failed', err);
        throw err;
    }
};
