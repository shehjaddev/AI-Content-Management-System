"use client";

import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type {
    LoginResponse,
    AuthCredentials,
    RegisterResponse,
} from "./authTypes";

const API_BASE =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";

export const authApi = createApi({
    reducerPath: "authApi",
    baseQuery: fetchBaseQuery({
        baseUrl: API_BASE,
        prepareHeaders: (
            headers: Headers,
            { getState }: { getState: () => unknown }
        ) => {
            const state = getState() as any;
            const token = state?.auth?.token as string | null;
            if (token) {
                headers.set("Authorization", `Bearer ${token}`);
            }
            return headers;
        },
    }),
    endpoints: (builder) => ({
        login: builder.mutation<LoginResponse, AuthCredentials>({
            query: (body) => ({
                url: "/api/auth/login",
                method: "POST",
                body,
            }),
        }),
        register: builder.mutation<RegisterResponse, AuthCredentials>({
            query: (body) => ({
                url: "/api/auth/register",
                method: "POST",
                body,
            }),
        }),
    }),
});

export const { useLoginMutation, useRegisterMutation } = authApi;
