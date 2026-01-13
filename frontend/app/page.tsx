"use client";

import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { clearAuth } from "@/redux/authSlice";
import { useRouter } from "next/navigation";

export default function Home() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const userId = useAppSelector((state) => state.auth.userId);
  const email = useAppSelector((state) => state.auth.userEmail);

  const handleLogout = () => {
    dispatch(clearAuth());
    router.push("/login");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-black">
      <main className="w-full max-w-3xl rounded-md bg-white dark:bg-zinc-900 p-8 shadow-sm">
        <h1 className="text-2xl font-semibold mb-4 text-black dark:text-zinc-50">
          Dashboard
        </h1>
        <p className="text-sm text-zinc-700 dark:text-zinc-300 mb-2">
          You are logged in.
        </p>
        {userId && (
          <p className="text-xs text-zinc-500 mb-1">User ID: {userId}</p>
        )}
        {email && <p className="text-xs text-zinc-500 mb-4">Email: {email}</p>}
        <button
          type="button"
          onClick={handleLogout}
          className="mt-2 inline-flex items-center rounded bg-red-600 px-3 py-1 text-xs font-medium text-white hover:bg-red-700 cursor-pointer"
        >
          Logout
        </button>
      </main>
    </div>
  );
}
