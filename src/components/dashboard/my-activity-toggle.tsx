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
      className={`text-[11px] uppercase tracking-[0.12em] px-3 py-1.5 rounded-lg border transition-all duration-200 ${
        isMine
          ? "bg-[#1A1A1A] text-white border-[#1A1A1A]"
          : "bg-transparent text-[#999] border-[#E0E0E0] hover:border-[#999] hover:text-[#666]"
      }`}
    >
      {isMine ? "My Activity" : "All Activity"}
    </button>
  );
}
