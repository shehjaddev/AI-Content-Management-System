import mongoose, { Document, Schema } from 'mongoose';

export const CONTENT_TYPES = ['blog_outline', 'product_description', 'social_caption'] as const;
export type ContentType = (typeof CONTENT_TYPES)[number];

export const SENTIMENT_TYPES = ['positive', 'neutral', 'negative'] as const;
export type SentimentType = (typeof SENTIMENT_TYPES)[number];

export interface IContent extends Document {
    user: mongoose.Types.ObjectId;
    title: string;
    type: ContentType;
    prompt: string;
    body: string;
    sentiment?: SentimentType;
}

const ContentSchema = new Schema<IContent>(
    {
        user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        title: { type: String, required: true },
        type: { type: String, required: true, enum: CONTENT_TYPES },
        prompt: { type: String, required: true },
        body: { type: String, required: true },
        sentiment: { type: String, enum: SENTIMENT_TYPES, required: false },
    },
    { timestamps: true }
);

export const Content = mongoose.model<IContent>('Content', ContentSchema);
