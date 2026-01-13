"use client";

import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface AuthState {
    token: string | null;
    userId: string | null;
    userEmail: string | null;
}

const initialState: AuthState = {
    token:
        typeof window !== "undefined" ? localStorage.getItem("token") : null,
    userId:
        typeof window !== "undefined" ? localStorage.getItem("userId") : null,
    userEmail:
        typeof window !== "undefined" ? localStorage.getItem("userEmail") : null,
};

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        setAuth(
            state: AuthState,
            action: PayloadAction<{ token: string; userId: string; userEmail: string }>
        ) {
            state.token = action.payload.token;
            state.userId = action.payload.userId;
            state.userEmail = action.payload.userEmail;
            if (typeof window !== "undefined") {
                localStorage.setItem("token", action.payload.token);
                localStorage.setItem("userId", action.payload.userId);
                localStorage.setItem("userEmail", action.payload.userEmail);
            }
        },
        clearAuth(state: AuthState) {
            state.token = null;
            state.userId = null;
            state.userEmail = null;
            if (typeof window !== "undefined") {
                localStorage.removeItem("token");
                localStorage.removeItem("userId");
                localStorage.removeItem("userEmail");
            }
        },
    },
});

export const { setAuth, clearAuth } = authSlice.actions;
export default authSlice.reducer;
