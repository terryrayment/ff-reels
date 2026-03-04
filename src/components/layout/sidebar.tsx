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
    <aside className="fixed left-0 top-0 bottom-0 w-[220px] bg-white/40 backdrop-blur-xl border-r border-[#E8E7E3]/60 flex flex-col z-40">
      {/* Brand */}
      <div className="px-7 pt-8 pb-10">
        <Link href="/dashboard" className="block group">
          <div className="flex items-center gap-3">
            {/* F&F houndstooth mark */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 48 56"
              fill="currentColor"
              className="w-[22px] h-auto text-[#1A1A1A] group-hover:text-[#000] transition-colors flex-shrink-0"
            >
              <path d="M8,8 L16,0 L32,0 L32,8 L20,8 L20,16 L8,16Z"/>
              <path d="M32,0 L32,8 L36,8 L36,16 L48,16 L48,8 L40,0Z"/>
              <path d="M20,16 L28,16 L28,20 L32,16 L36,16 L36,28 L32,28 L32,24 L20,24Z"/>
              <path d="M36,16 L48,16 L48,28 L40,28 L40,36 L48,36 L48,28"/>
              <path d="M0,20 L8,16 L8,28 L20,28 L20,40 L12,40 L12,48 L20,48 L20,40"/>
              <path d="M0,20 L0,40 L8,48 L12,48 L12,40 L8,40 L8,28 L0,28Z"/>
              <path d="M20,28 L32,28 L32,40 L20,40Z"/>
              <path d="M32,28 L40,28 L40,36 L48,36 L48,48 L40,56 L32,56 L32,40 L20,40 L20,48 L32,48 L32,56"/>
              <path d="M32,40 L48,40 L48,48 L40,56 L32,56Z"/>
            </svg>
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
      <nav className="flex-1 px-4 space-y-0.5">
        {visibleNav.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "block px-3 py-2 text-[13px] rounded-lg transition-all duration-300",
                isActive
                  ? "text-[#1A1A1A] font-medium bg-[#1A1A1A]/[0.04]"
                  : "text-[#999] hover:text-[#1A1A1A] hover:bg-[#1A1A1A]/[0.02]"
              )}
            >
              {item.label}
            </Link>
          );
        })}

        {/* Upload Spots -- ADMIN only */}
        {isAdmin && (
          <div className="pt-3 mt-3 border-t border-[#E8E7E3]/60 mx-3">
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
        <div className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-[#1A1A1A]/[0.02]">
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
