export type ContentType = "blog_outline" | "product_description" | "social_caption";

export type SentimentType = "positive" | "neutral" | "negative";

export type JobStatusType = "pending" | "processing" | "completed" | "failed";

export interface ContentItem {
    _id: string;
    title: string;
    type: ContentType;
    prompt: string;
    body: string;
    sentiment?: SentimentType;
    createdAt?: string;
    updatedAt?: string;
}

export interface GenerateContentRequest {
    prompt: string;
    contentType: ContentType;
}

export interface GenerateContentResponse {
    jobId: string;
    delayMs: number;
    message: string;
}

export interface JobStatusResponse {
    status: JobStatusType;
    error?: string;
    content: ContentItem | null;
}
