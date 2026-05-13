"use client";

import { useState } from "react";

const PROJECT_TYPES = [
  "Commercial",
  "Branded content",
  "Music video",
  "Short film",
  "Other",
];

export function ContactForm() {
  const [status, setStatus] = useState<"idle" | "submitting" | "sent" | "error">(
    "idle",
  );
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");
    setErrorMsg(null);

    const formData = new FormData(e.currentTarget);
    const payload = Object.fromEntries(formData.entries());

    try {
      const res = await fetch("/api/marketing/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Something went wrong");
      }
      setStatus("sent");
      e.currentTarget.reset();
    } catch (err) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Failed to send");
    }
  }

  if (status === "sent") {
    return (
      <div className="border-t border-[#E8E7E3] py-12">
        <p className="text-[20px] tracking-tight-2 text-[#1A1A1A]">
          Thanks &mdash; we&rsquo;ll be in touch.
        </p>
        <p className="mt-2 text-[14px] text-[#666]">
          For anything urgent, email{" "}
          <a href="mailto:scott@friendsandfamily.tv" className="underline">
            scott@friendsandfamily.tv
          </a>
          .
        </p>
      </div>
    );
  }

  const labelCls =
    "block text-[11px] uppercase tracking-[0.12em] text-[#666] mb-2";
  const inputCls =
    "w-full bg-transparent border-b border-[#1A1A1A]/15 focus:border-[#1A1A1A] outline-none px-0 py-2 text-[15px] tracking-tight-2 placeholder:text-[#999] transition-colors";

  return (
    <form onSubmit={onSubmit} className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">
        <div>
          <label htmlFor="name" className={labelCls}>
            Name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            autoComplete="name"
            className={inputCls}
          />
        </div>
        <div>
          <label htmlFor="company" className={labelCls}>
            Company / Agency
          </label>
          <input
            id="company"
            name="company"
            type="text"
            autoComplete="organization"
            className={inputCls}
          />
        </div>
        <div>
          <label htmlFor="email" className={labelCls}>
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            className={inputCls}
          />
        </div>
        <div>
          <label htmlFor="projectType" className={labelCls}>
            Project type
          </label>
          <select
            id="projectType"
            name="projectType"
            className={inputCls}
            defaultValue=""
          >
            <option value="" disabled>
              Select
            </option>
            {PROJECT_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
        <div className="md:col-span-2">
          <label htmlFor="timing" className={labelCls}>
            Timing
          </label>
          <input
            id="timing"
            name="timing"
            type="text"
            placeholder="Shoot window, deadline, etc."
            className={inputCls}
          />
        </div>
        <div className="md:col-span-2">
          <label htmlFor="message" className={labelCls}>
            Message
          </label>
          <textarea
            id="message"
            name="message"
            required
            rows={5}
            className={`${inputCls} resize-none`}
          />
        </div>
      </div>

      <div className="flex items-center justify-between gap-6 pt-2">
        {status === "error" && errorMsg && (
          <p className="text-[13px] text-red-600">{errorMsg}</p>
        )}
        <button
          type="submit"
          disabled={status === "submitting"}
          className="ml-auto px-6 py-3 bg-[#1A1A1A] text-white text-[12px] uppercase tracking-[0.14em] hover:bg-[#333] transition-colors disabled:opacity-50"
        >
          {status === "submitting" ? "Sending…" : "Send inquiry"}
        </button>
      </div>
    </form>
  );
}
