"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch } from "@/redux/hooks";
import { setAuth } from "@/redux/authSlice";
import { useLoginMutation } from "@/redux/authApi";

export default function LoginPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [login] = useLoginMutation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const data = await login({ email, password }).unwrap();
      dispatch(
        setAuth({
          token: data.token,
          userId: data.user.id,
          userEmail: data.user.email,
        })
      );
      router.push("/");
    } catch (err: any) {
      setError(err?.data?.message || err?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm space-y-4 border rounded-md p-6 shadow-sm"
      >
        <h1 className="text-xl font-semibold">Login</h1>
        <div className="space-y-1">
          <label className="block text-sm">Email</label>
          <input
            type="email"
            className="w-full border rounded px-2 py-1 text-sm"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="space-y-1">
          <label className="block text-sm">Password</label>
          <input
            type="password"
            className="w-full border rounded px-2 py-1 text-sm"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <div className="flex justify-center">
          <button
            type="submit"
            className="rounded px-4 py-1 text-sm border disabled:opacity-60 cursor-pointer"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </div>
        <p className="text-xs text-gray-600">
          Need an account?{" "}
          <button
            type="button"
            className="underline cursor-pointer"
            onClick={() => router.push("/register")}
          >
            Register
          </button>
        </p>
      </form>
    </div>
  );
}
