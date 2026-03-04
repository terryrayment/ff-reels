"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";

interface NavItem {
  href: string;
  label: string;
  roles: string[];
}

const navItems: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", roles: ["ADMIN", "REP"] },
  { href: "/reels", label: "Reels", roles: ["ADMIN", "REP"] },
  { href: "/directors", label: "Directors", roles: ["ADMIN"] },
  { href: "/treatments", label: "Treatments", roles: ["ADMIN", "REP"] },
  { href: "/industry", label: "Industry", roles: ["ADMIN", "REP"] },
  { href: "/analytics", label: "Analytics", roles: ["ADMIN", "REP"] },
];

function getRoleDisplayName(role: string): string {
  switch (role) {
    case "ADMIN":
      return "Producer";
    case "REP":
      return "Sales Rep";
    default:
      return role.toLowerCase();
  }
}

interface SidebarProps {
  user: {
    name?: string | null;
    email?: string | null;
    role?: string;
  };
}

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();
  const role = user.role || "VIEWER";
  const isAdmin = role === "ADMIN";
  const visibleNav = navItems.filter((item) => item.roles.includes(role));

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-[220px] bg-white/50 backdrop-blur-2xl border-r border-white/60 flex flex-col z-40">
      {/* Brand */}
      <div className="px-7 pt-8 pb-10">
        <Link href="/dashboard" className="block group">
          <div className="flex items-center gap-3">
            {/* F&F monogram */}
            <div className="w-[26px] h-[26px] rounded-md bg-[#1A1A1A] group-hover:bg-[#000] transition-colors flex items-center justify-center flex-shrink-0">
              <span className="text-[11px] font-bold text-white tracking-tight leading-none">FF</span>
            </div>
            <div>
              <h1 className="text-[15px] font-semibold tracking-tight-2 text-[#1A1A1A] leading-none group-hover:text-[#000] transition-colors">
                Friends &amp; Family
              </h1>
              <span className="block mt-1 text-[9px] text-[#bbb] uppercase tracking-[0.2em] font-normal group-hover:text-[#999] transition-colors">
                Reels
              </span>
            </div>
          </div>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-4 space-y-1">
        {visibleNav.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "block px-3 py-2.5 text-[13px] rounded-xl transition-all duration-300",
                isActive
                  ? "text-[#1A1A1A] font-medium bg-white/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)]"
                  : "text-[#999] hover:text-[#1A1A1A] hover:bg-white/40"
              )}
            >
              {item.label}
            </Link>
          );
        })}

        {/* Upload Spots -- ADMIN only */}
        {isAdmin && (
          <div className="pt-3 mt-3 border-t border-[#E8E7E3]/30 mx-3">
            <Link
              href="/upload"
              className="block py-1.5 text-[13px] text-[#bbb] hover:text-[#1A1A1A] transition-colors duration-300"
            >
              Upload Spots
            </Link>
          </div>
        )}
      </nav>

      {/* User */}
      <div className="px-4 py-5">
        <div className="flex items-center justify-between px-3 py-3 rounded-xl bg-white/50">
          <div className="min-w-0">
            <p className="text-[12px] text-[#1A1A1A] truncate font-medium leading-tight">
              {user.name ?? user.email}
            </p>
            <p className="text-[9px] text-[#bbb] uppercase tracking-[0.15em] mt-0.5">
              {getRoleDisplayName(role)}
            </p>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="text-[#ccc] hover:text-[#666] transition-colors duration-300 ml-3 shrink-0"
            title="Sign out"
            aria-label="Sign out"
          >
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </button>
        </div>
      </div>
    </aside>
  );
}
