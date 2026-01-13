"use client";

import { baseApi } from "./baseApi";
import type {
    ContentItem,
    ContentType,
    GenerateContentRequest,
    GenerateContentResponse,
    JobStatusResponse,
    UpdateContentRequest,
} from "./contentTypes";

export interface CreateContentRequest {
    title: string;
    type: ContentType;
    prompt: string;
    body: string;
}

export const contentApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        listContent: builder.query<ContentItem[], { q?: string } | void>({
            query: (params) => ({
                url: "/api/content",
                method: "GET",
                params: params?.q ? { q: params.q } : undefined,
            }),
            providesTags: ["Content"],
        }),
        getContentById: builder.query<ContentItem, string>({
            query: (id) => ({ url: `/api/content/${id}`, method: "GET" }),
            providesTags: ["Content"],
        }),
        createContent: builder.mutation<ContentItem, CreateContentRequest>({
            query: (body) => ({
                url: "/api/content",
                method: "POST",
                body,
            }),
            invalidatesTags: ["Content"],
        }),
        updateContent: builder.mutation<ContentItem, { id: string; data: UpdateContentRequest }>({
            query: ({ id, data }) => ({
                url: `/api/content/${id}`,
                method: "PUT",
                body: data,
            }),
            invalidatesTags: ["Content"],
        }),
        deleteContent: builder.mutation<{ success: boolean } | void, string>({
            query: (id) => ({
                url: `/api/content/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["Content"],
        }),
        generateContent: builder.mutation<
            GenerateContentResponse,
            GenerateContentRequest
        >({
            query: (body) => ({
                url: "/api/content/generate",
                method: "POST",
                body,
            }),
            invalidatesTags: ["Content"],
        }),
        getJobStatus: builder.query<JobStatusResponse, string>({
            query: (jobId) => ({
                url: `/api/jobs/${jobId}/status`,
                method: "GET",
            }),
        }),
    }),
});

export const {
    useListContentQuery,
    useGetContentByIdQuery,
    useCreateContentMutation,
    useUpdateContentMutation,
    useDeleteContentMutation,
    useGenerateContentMutation,
    useGetJobStatusQuery,
} = contentApi;
