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
  Newspaper,
  LogOut,
  Upload,
} from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/updates", label: "Updates", icon: Newspaper },
  { href: "/directors", label: "Directors", icon: Users },
  { href: "/reels", label: "Reels", icon: Film },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
];

interface SidebarProps {
  user: {
    name?: string | null;
    email?: string | null;
    role?: string;
  };
}

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-64 bg-white border-r border-[#E8E8E3] flex flex-col z-40">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-[#E8E8E3]">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="w-7 h-7 bg-[#1A1A1A] rounded-md flex items-center justify-center">
            <span className="text-[10px] font-semibold text-white tracking-tight">F&F</span>
          </div>
          <div>
            <h1 className="text-sm font-medium text-[#1A1A1A] tracking-tight">
              Friends & Family
            </h1>
            <p className="text-[10px] text-[#999] uppercase tracking-[0.15em]">
              Reels
            </p>
          </div>
        </Link>
      </div>

      {/* Quick action */}
      <div className="px-3 pt-4 pb-2">
        <Link
          href="/directors?upload=true"
          className="flex items-center gap-2 px-3 py-2 bg-[#1A1A1A] hover:bg-[#333] rounded-lg text-xs font-medium transition-colors w-full text-white"
        >
          <Upload size={14} />
          Upload Spots
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-2 space-y-0.5">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                isActive
                  ? "bg-[#F7F6F3] text-[#1A1A1A] font-medium"
                  : "text-[#666] hover:text-[#1A1A1A] hover:bg-[#FAFAF8]"
              )}
            >
              <item.icon size={16} className={isActive ? "text-[#1A1A1A]" : "text-[#999]"} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div className="px-3 py-3 border-t border-[#E8E8E3]">
        <div className="flex items-center justify-between px-3 py-2">
          <div className="min-w-0">
            <p className="text-sm text-[#1A1A1A] truncate">
              {user.name ?? user.email}
            </p>
            <p className="text-[10px] text-[#999] capitalize">
              {user.role?.toLowerCase()}
            </p>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="text-[#ccc] hover:text-[#666] transition-colors p-1 rounded"
            title="Sign out"
          >
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </aside>
  );
}
