"use client";

import { useRouter, useSearchParams } from "next/navigation";

export function MyActivityToggle() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isMine = searchParams.get("mine") === "true";

  const toggle = () => {
    const params = new URLSearchParams(searchParams.toString());
    if (isMine) {
      params.delete("mine");
    } else {
      params.set("mine", "true");
    }
    const qs = params.toString();
    router.push(`/dashboard${qs ? `?${qs}` : ""}`);
  };

  return (
    <button
      onClick={toggle}
      className={`text-[11px] uppercase tracking-[0.12em] px-4 py-2 rounded-xl border transition-all duration-300 ${
        isMine
          ? "bg-[#1A1A1A] text-white border-[#1A1A1A] shadow-[0_2px_6px_rgba(0,0,0,0.12)]"
          : "bg-white/60 text-[#999] border-white/80 hover:border-[#ccc] hover:text-[#666] hover:bg-white/80"
      }`}
    >
      {isMine ? "My Activity" : "All Activity"}
    </button>
  );
}
