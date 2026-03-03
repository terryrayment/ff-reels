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
  { href: "/directors", label: "Directors", roles: ["ADMIN"] },
  { href: "/reels", label: "Reels", roles: ["ADMIN", "REP"] },
  { href: "/treatments", label: "Treatments", roles: ["ADMIN", "REP"] },
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
    <aside className="fixed left-0 top-0 bottom-0 w-[220px] border-r border-[#EBEBEB] flex flex-col z-40">
      {/* Brand */}
      <div className="px-7 pt-8 pb-10">
        <Link href="/dashboard" className="block group">
          <h1 className="text-[20px] font-semibold tracking-tight-2 text-[#1A1A1A] leading-none">
            Friends &amp; Family
          </h1>
          <span className="block mt-1.5 text-[9px] text-[#999] uppercase tracking-[0.2em] font-normal">
            Reels
          </span>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-7 space-y-1">
        {visibleNav.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "block py-1.5 text-[13px] transition-colors duration-300",
                isActive
                  ? "text-[#1A1A1A] font-medium"
                  : "text-[#999] hover:text-[#1A1A1A]"
              )}
            >
              {item.label}
            </Link>
          );
        })}

        {/* Upload Spots -- ADMIN only, subtle text link */}
        {isAdmin && (
          <Link
            href="/directors?upload=true"
            className="block pt-4 mt-4 border-t border-[#EBEBEB] text-[13px] text-[#999] hover:text-[#1A1A1A] transition-colors duration-300"
          >
            Upload Spots
          </Link>
        )}
      </nav>

      {/* User */}
      <div className="px-7 py-6">
        <div className="flex items-center justify-between">
          <div className="min-w-0">
            <p className="text-[13px] text-[#1A1A1A] truncate font-medium leading-tight">
              {user.name ?? user.email}
            </p>
            <p className="text-[9px] text-[#999] uppercase tracking-[0.15em] mt-0.5">
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
              width="14"
              height="14"
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
