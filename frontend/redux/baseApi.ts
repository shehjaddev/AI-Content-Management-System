"use client";

import {
    createApi,
    fetchBaseQuery,
    type BaseQueryFn,
    type FetchArgs,
    type FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react";
import type { RootState } from "./store";
import { clearAuth } from "./authSlice";

const API_BASE =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";

const rawBaseQuery = fetchBaseQuery({
    baseUrl: API_BASE,
    prepareHeaders: (headers, { getState }) => {
        const state = getState() as RootState;
        const token = state.auth?.token as string | undefined;
        if (token) {
            headers.set("Authorization", `Bearer ${token}`);
        }
        return headers;
    },
});

const baseQueryWithAuthHandling: BaseQueryFn<
    string | FetchArgs,
    unknown,
    FetchBaseQueryError
> = async (args, api, extraOptions) => {
    const result = await rawBaseQuery(args, api, extraOptions);

    if (result.error && result.error.status === 401) {
        api.dispatch(clearAuth());
        if (typeof window !== "undefined" && window.location.pathname !== "/login") {
            window.location.href = "/login";
        }
    }

    return result;
};

export const baseApi = createApi({
    reducerPath: "api",
    baseQuery: baseQueryWithAuthHandling,
    tagTypes: ["Content"],
    endpoints: () => ({}),
});
