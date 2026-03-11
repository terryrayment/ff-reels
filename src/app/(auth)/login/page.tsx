"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
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
      rememberMe: String(rememberMe),
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
    <div className="min-h-screen bg-[#F5F4F0] flex items-center justify-center px-6">
      <div className="w-full max-w-[340px]">
        {/* Brand */}
        <div className="flex flex-col items-center mb-16">
          <img
            src="/logo.svg"
            alt="Friends & Family"
            className="w-12 h-12 object-contain mb-5"
          />
          <h1 className="text-[32px] font-extralight tracking-tight-3 text-[#1A1A1A] leading-none">
            Friends &amp; Family
          </h1>
          <span className="block mt-2.5 text-[9px] text-[#bbb] uppercase tracking-[0.25em]">
            Reels
          </span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-7">
          <div>
            <label
              htmlFor="email"
              className="block text-[10px] text-[#aaa] mb-2.5 uppercase tracking-[0.15em] font-medium"
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
              className="w-full px-0 py-3 bg-transparent border-0 border-b border-[#E0DDD8] text-[#1A1A1A] text-[15px] placeholder:text-[#ccc] focus:outline-none focus:border-[#1A1A1A] transition-colors duration-300"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-[10px] text-[#aaa] mb-2.5 uppercase tracking-[0.15em] font-medium"
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
              className="w-full px-0 py-3 bg-transparent border-0 border-b border-[#E0DDD8] text-[#1A1A1A] text-[15px] placeholder:text-[#ccc] focus:outline-none focus:border-[#1A1A1A] transition-colors duration-300"
            />
          </div>

          <label className="flex items-center gap-2.5 cursor-pointer select-none">
            <div
              onClick={() => setRememberMe(!rememberMe)}
              className={`w-4 h-4 rounded border flex items-center justify-center transition-colors duration-200 ${
                rememberMe
                  ? "bg-[#1A1A1A] border-[#1A1A1A]"
                  : "bg-transparent border-[#C8C5C0]"
              }`}
            >
              {rememberMe && (
                <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
                  <path d="M1 3.5L3.5 6L8 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </div>
            <span
              onClick={() => setRememberMe(!rememberMe)}
              className="text-[11px] text-[#999] tracking-[0.05em]"
            >
              Stay signed in
            </span>
          </label>

          {error && (
            <p className="text-[13px] text-[#C44]">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 mt-3 bg-[#1A1A1A] text-white text-[13px] font-medium tracking-tight-2 rounded-xl hover:bg-[#333] active:bg-[#444] transition-colors duration-300 disabled:opacity-30"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <p className="text-center text-[10px] text-[#ccc] mt-20 tracking-[0.05em]">
          friendsandfamily.tv
        </p>
      </div>
    </div>
  );
}
