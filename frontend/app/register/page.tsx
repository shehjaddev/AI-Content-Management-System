"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { useRegisterMutation } from "@/redux/authApi";

export default function RegisterPage() {
  const router = useRouter();
  const [registerUser] = useRegisterMutation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await registerUser({ email, password }).unwrap();
      setSuccess("Registration successful. You can now log in.");
      setTimeout(() => router.push("/login"), 800);
    } catch (err: any) {
      setError(err?.data?.message || err?.message || "Registration failed");
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
        <h1 className="text-xl font-semibold">Register</h1>
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
        {success && <p className="text-sm text-green-600">{success}</p>}
        <button
          type="submit"
          className="w-full bg-black text-white rounded py-2 text-sm disabled:opacity-60 cursor-pointer"
          disabled={loading}
        >
          {loading ? "Registering..." : "Register"}
        </button>
        <p className="text-xs text-gray-600">
          Already have an account?{" "}
          <button
            type="button"
            className="underline cursor-pointer"
            onClick={() => router.push("/login")}
          >
            Log in
          </button>
        </p>
      </form>
    </div>
  );
}
