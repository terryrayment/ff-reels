"use client";

import { useState } from "react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/users/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Something went wrong");
      } else {
        setSent(true);
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
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

        {sent ? (
          <div className="text-center space-y-4">
            <p className="text-[14px] text-[#1A1A1A]">Check your email</p>
            <p className="text-[12px] text-[#999] leading-relaxed">
              If an account exists for <strong className="text-[#666]">{email}</strong>,
              we&apos;ve sent a link to reset your password.
            </p>
            <a
              href="/login"
              className="inline-block mt-6 text-[12px] text-[#999] hover:text-[#666] transition-colors"
            >
              Back to sign in
            </a>
          </div>
        ) : (
          <>
            <p className="text-[12px] text-[#999] mb-8 text-center leading-relaxed">
              Enter your email and we&apos;ll send you a link to reset your password.
            </p>

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

              {error && (
                <p className="text-[13px] text-[#C44]">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 mt-3 bg-[#1A1A1A] text-white text-[13px] font-medium tracking-tight-2 rounded-xl hover:bg-[#333] active:bg-[#444] transition-colors duration-300 disabled:opacity-30"
              >
                {loading ? "Sending..." : "Send reset link"}
              </button>
            </form>

            <p className="text-center mt-8">
              <a
                href="/login"
                className="text-[11px] text-[#999] hover:text-[#666] transition-colors"
              >
                Back to sign in
              </a>
            </p>
          </>
        )}

        <p className="text-center text-[10px] text-[#ccc] mt-20 tracking-[0.05em]">
          friendsandfamily.tv
        </p>
      </div>
    </div>
  );
}
