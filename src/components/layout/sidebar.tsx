"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  Film,
  BarChart3,
  LogOut,
  Upload,
} from "lucide-react";

interface NavItem {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  roles: string[];
}

const navItems: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, roles: ["ADMIN", "REP"] },
  { href: "/directors", label: "Directors", icon: Users, roles: ["ADMIN"] },
  { href: "/reels", label: "Reels", icon: Film, roles: ["ADMIN", "REP"] },
  { href: "/analytics", label: "Analytics", icon: BarChart3, roles: ["ADMIN", "REP"] },
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
    <aside className="fixed left-0 top-0 bottom-0 w-60 bg-white border-r border-[#E8E8E3] flex flex-col z-40">
      {/* Logo */}
      <div className="px-4 py-4 border-b border-[#E8E8E3]">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div className="w-7 h-7 bg-[#1A1A1A] rounded-sm flex items-center justify-center">
            <span className="text-[9px] font-bold text-white tracking-tight">F&F</span>
          </div>
          <div>
            <h1 className="text-[13px] font-bold text-[#1A1A1A] tracking-tight leading-tight">
              Friends & Family
            </h1>
            <p className="text-[9px] text-[#bbb] uppercase tracking-[0.15em] leading-tight">
              Reels
            </p>
          </div>
        </Link>
      </div>

      {/* Quick action — ADMIN only */}
      {isAdmin && (
        <div className="px-3 pt-3 pb-1.5">
          <Link
            href="/directors?upload=true"
            className="flex items-center gap-2 px-3 py-2 bg-[#1A1A1A] hover:bg-[#333] rounded-sm text-[12px] font-bold transition-colors w-full text-white uppercase tracking-wider"
          >
            <Upload size={13} />
            Upload Spots
          </Link>
        </div>
      )}

      {/* Section label */}
      <div className="px-6 pt-4 pb-1">
        <span className="text-[9px] font-bold text-[#bbb] uppercase tracking-wider">
          Navigation
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-1 space-y-px">
        {visibleNav.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2.5 px-3 py-1.5 rounded-sm text-[13px] font-medium transition-colors",
                isActive
                  ? "bg-[#F7F6F3] text-[#1A1A1A]"
                  : "text-[#888] hover:text-[#1A1A1A] hover:bg-[#FAFAF8]"
              )}
            >
              <item.icon size={15} className={isActive ? "text-[#1A1A1A]" : "text-[#bbb]"} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div className="px-3 py-2.5 border-t border-[#E8E8E3]">
        <div className="flex items-center justify-between px-3 py-1.5">
          <div className="min-w-0">
            <p className="text-[13px] text-[#1A1A1A] truncate font-bold">
              {user.name ?? user.email}
            </p>
            <p className="text-[9px] text-[#bbb] uppercase tracking-wider">
              {getRoleDisplayName(role)}
            </p>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="text-[#ddd] hover:text-[#666] transition-colors p-1 rounded-sm"
            title="Sign out"
          >
            <LogOut size={13} />
          </button>
        </div>
      </div>
    </aside>
  );
}
