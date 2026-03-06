"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function SetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/users/set-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong");
        setLoading(false);
        return;
      }

      setDone(true);
      setTimeout(() => router.push("/login"), 2000);
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-[#F5F4F0] flex items-center justify-center px-6">
        <div className="text-center">
          <p className="text-[13px] text-[#999]">Invalid link.</p>
          <p className="text-[11px] text-[#ccc] mt-2">
            Ask your admin to send a new invite.
          </p>
        </div>
      </div>
    );
  }

  if (done) {
    return (
      <div className="min-h-screen bg-[#F5F4F0] flex items-center justify-center px-6">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-5">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <p className="text-[15px] text-[#1A1A1A] font-medium">Password set</p>
          <p className="text-[12px] text-[#999] mt-2">
            Redirecting to sign in...
          </p>
        </div>
      </div>
    );
  }

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
            Set Your Password
          </h1>
          <span className="block mt-2.5 text-[11px] text-[#999]">
            Choose a password to access Friends &amp; Family Reels
          </span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-7">
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
              placeholder="At least 8 characters"
              autoComplete="new-password"
              className="w-full px-0 py-3 bg-transparent border-0 border-b border-[#E0DDD8] text-[#1A1A1A] text-[15px] placeholder:text-[#ccc] focus:outline-none focus:border-[#1A1A1A] transition-colors duration-300"
            />
          </div>

          <div>
            <label
              htmlFor="confirm"
              className="block text-[10px] text-[#aaa] mb-2.5 uppercase tracking-[0.15em] font-medium"
            >
              Confirm Password
            </label>
            <input
              id="confirm"
              type="password"
              required
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              autoComplete="new-password"
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
            {loading ? "Setting password..." : "Set Password"}
          </button>
        </form>

        <p className="text-center text-[10px] text-[#ccc] mt-20 tracking-[0.05em]">
          friendsandfamily.tv
        </p>
      </div>
    </div>
  );
}

export default function SetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F5F4F0] flex items-center justify-center">
          <p className="text-[13px] text-[#999]">Loading...</p>
        </div>
      }
    >
      <SetPasswordForm />
    </Suspense>
  );
}
