"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("Invalid email or password");
    } else {
      router.push("/dashboard");
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F6F3] flex items-center justify-center">
      <div className="w-full max-w-xs">
        {/* Logo mark + wordmark */}
        <div className="flex flex-col items-center mb-12">
          <div className="w-12 h-12 bg-[#1A1A1A] rounded-sm flex items-center justify-center mb-5">
            <span className="text-sm font-semibold text-white tracking-tight">F&F</span>
          </div>
          <h1 className="text-lg font-semibold text-[#1A1A1A] tracking-tight">
            Friends & Family
          </h1>
          <p className="text-[10px] text-[#999] mt-1 uppercase tracking-[0.25em]">
            Reel Platform
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="email" className="block text-[10px] text-[#999] mb-1.5 uppercase tracking-wider font-semibold">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@friendsandfamily.tv"
              autoComplete="email"
              className="w-full px-4 py-3 bg-white border border-[#E8E8E3] rounded-sm text-[#1A1A1A] text-sm placeholder:text-[#ccc] focus:outline-none focus:ring-2 focus:ring-[#1A1A1A]/10 focus:border-[#1A1A1A]/20 transition-all"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-[10px] text-[#999] mb-1.5 uppercase tracking-wider font-semibold">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              className="w-full px-4 py-3 bg-white border border-[#E8E8E3] rounded-sm text-[#1A1A1A] text-sm placeholder:text-[#ccc] focus:outline-none focus:ring-2 focus:ring-[#1A1A1A]/10 focus:border-[#1A1A1A]/20 transition-all"
            />
          </div>

          {error && (
            <p className="text-xs text-red-500">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#1A1A1A] text-white text-sm font-semibold rounded-sm hover:bg-[#333] transition-all disabled:opacity-40 mt-1 uppercase tracking-wider"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <p className="text-center text-[10px] text-[#ccc] mt-12">
          friendsandfamily.tv
        </p>
      </div>
    </div>
  );
}
