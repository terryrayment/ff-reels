import Link from "next/link";
import { BarChart3, Clapperboard } from "lucide-react";

export function ReelsWorkspaceSwitch({
  active,
}: {
  active: "library" | "intelligence";
}) {
  const items = [
    {
      key: "library",
      label: "Library",
      href: "/reels",
      icon: Clapperboard,
    },
    {
      key: "intelligence",
      label: "Analytics",
      href: "/analytics",
      icon: BarChart3,
    },
  ] as const;

  return (
    <div className="inline-flex items-center rounded-lg border border-[#DEDDD7] bg-[#FAFAF7] p-1">
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = active === item.key;

        return (
          <Link
            key={item.key}
            href={item.href}
            className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] transition-colors ${
              isActive
                ? "bg-[#111] text-white"
                : "text-[#777] hover:bg-white hover:text-[#111]"
            }`}
            aria-current={isActive ? "page" : undefined}
          >
            <Icon size={12} />
            {item.label}
          </Link>
        );
      })}
    </div>
  );
}
