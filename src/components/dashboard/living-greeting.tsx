"use client";

import { useState, useEffect } from "react";
import { Eye, Users, Forward, Flame, Sparkles, type LucideIcon } from "lucide-react";
import type { WelcomeHeadline } from "@/lib/dashboard/welcome-headline";

const ICONS: Record<string, LucideIcon> = {
  Eye,
  Users,
  Forward,
  Flame,
  Sparkles,
};

function greetingFor(hour: number): string {
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

/**
 * Time-aware login greeting + one prioritized live headline.
 * The greeting word is the viewer's LOCAL time, so it's resolved on the
 * client after mount (server render shows "Welcome" for one frame).
 */
export function LivingGreeting({
  firstName,
  headline,
  roleLabel,
}: {
  firstName: string;
  headline: WelcomeHeadline | null;
  roleLabel?: string;
}) {
  const [greeting, setGreeting] = useState("Welcome");

  useEffect(() => {
    setGreeting(greetingFor(new Date().getHours()));
  }, []);

  const Icon = headline && headline.icon ? ICONS[headline.icon] : null;

  return (
    <div className="min-w-0">
      <h1 className="text-[34px] md:text-[52px] font-semibold tracking-tight text-[#111] leading-[1.0]">
        {greeting}, {firstName}
      </h1>

      {headline && (
        <div className="mt-3 flex items-start gap-2.5 text-[13px] md:text-[14px] text-[#555] max-w-xl">
          {headline.isLive ? (
            <span className="relative mt-1 flex h-2.5 w-2.5 flex-shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-60" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-red-500" />
            </span>
          ) : Icon ? (
            <Icon size={15} className="mt-0.5 flex-shrink-0 text-[#aaa]" />
          ) : null}
          <span>{headline.text}</span>
        </div>
      )}

      {roleLabel && (
        <p className="mt-2 text-[10px] uppercase tracking-[0.16em] text-[#999]">
          {roleLabel}
        </p>
      )}
    </div>
  );
}
