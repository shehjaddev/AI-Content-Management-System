import mongoose, { Document, Schema } from 'mongoose';
import { ContentType, CONTENT_TYPES } from './content.model';

export const JOB_STATUSES = ['pending', 'processing', 'completed', 'failed'] as const;
export type JobStatus = (typeof JOB_STATUSES)[number];

export interface IJob extends Document {
    user: mongoose.Types.ObjectId;
    prompt: string;
    contentType: ContentType;
    status: JobStatus;
    error?: string;
    resultContent?: mongoose.Types.ObjectId;
}

const JobSchema = new Schema<IJob>(
    {
        user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        prompt: { type: String, required: true },
        contentType: { type: String, required: true, enum: CONTENT_TYPES },
        status: { type: String, required: true, default: 'pending', enum: JOB_STATUSES },
        error: { type: String },
        resultContent: { type: Schema.Types.ObjectId, ref: 'Content' },
    },
    { timestamps: true }
);

export const Job = mongoose.model<IJob>('Job', JobSchema);
