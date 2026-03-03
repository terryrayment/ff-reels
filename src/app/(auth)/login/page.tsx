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
    <div className="min-h-screen bg-[#F7F6F3] flex items-center justify-center px-6">
      <div className="w-full max-w-[320px]">
        {/* Brand */}
        <div className="text-center mb-16">
          <h1 className="text-[28px] font-light tracking-tight-2 text-[#1A1A1A] leading-none">
            Friends &amp; Family
          </h1>
          <span className="block mt-2 text-[9px] text-[#999] uppercase tracking-[0.25em]">
            Reels
          </span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="email"
              className="block text-[10px] text-[#999] mb-2 uppercase tracking-[0.12em]"
            >
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
              className="w-full px-0 py-3 bg-transparent border-0 border-b border-[#DDDDD8] text-[#1A1A1A] text-[14px] placeholder:text-[#C8C8C4] focus:outline-none focus:border-[#1A1A1A] transition-colors duration-300"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-[10px] text-[#999] mb-2 uppercase tracking-[0.12em]"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              className="w-full px-0 py-3 bg-transparent border-0 border-b border-[#DDDDD8] text-[#1A1A1A] text-[14px] placeholder:text-[#C8C8C4] focus:outline-none focus:border-[#1A1A1A] transition-colors duration-300"
            />
          </div>

          {error && (
            <p className="text-[13px] text-[#C44]">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 mt-2 bg-[#1A1A1A] text-white text-[13px] font-medium tracking-tight-2 hover:bg-[#333] transition-colors duration-300 disabled:opacity-30"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <p className="text-center text-[10px] text-[#C8C8C4] mt-20 tracking-[0.05em]">
          friendsandfamily.tv
        </p>
      </div>
    </div>
  );
}
