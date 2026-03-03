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
    <div className="min-h-screen bg-[#0e0e0e] flex items-center justify-center">
      <div className="w-full max-w-xs">
        {/* Logo — matches main site */}
        <div className="text-center mb-10">
          <h1 className="text-xl font-light text-white tracking-tight">
            Friends & Family
          </h1>
          <p className="text-[11px] text-white/25 mt-1.5 uppercase tracking-[0.2em]">
            Reel Platform
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="email" className="block text-[11px] text-white/40 mb-1.5 uppercase tracking-wider">
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
              className="w-full px-4 py-3 bg-white/[0.04] border border-white/[0.06] rounded-lg text-white text-sm placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-white/15 focus:border-white/15 transition-all"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-[11px] text-white/40 mb-1.5 uppercase tracking-wider">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder=""
              autoComplete="current-password"
              className="w-full px-4 py-3 bg-white/[0.04] border border-white/[0.06] rounded-lg text-white text-sm placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-white/15 focus:border-white/15 transition-all"
            />
          </div>

          {error && (
            <p className="text-xs text-red-400/80">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-white text-[#0e0e0e] text-sm font-medium rounded-lg hover:bg-white/90 transition-all disabled:opacity-40 mt-2"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <p className="text-center text-[10px] text-white/15 mt-10">
          friendsandfamily.tv
        </p>
      </div>
    </div>
  );
}
