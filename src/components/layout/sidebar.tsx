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
    <aside className="fixed left-0 top-0 bottom-0 w-60 bg-white border-r border-[#E8E8E3] flex flex-col z-40">
      {/* Logo */}
      <div className="px-4 py-4 border-b border-[#E8E8E3]">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div className="w-7 h-7 bg-[#1A1A1A] rounded flex items-center justify-center">
            <span className="text-[9px] font-bold text-white tracking-tight">F&F</span>
          </div>
          <div>
            <h1 className="text-[13px] font-semibold text-[#1A1A1A] tracking-tight leading-tight">
              Friends & Family
            </h1>
            <p className="text-[9px] text-[#bbb] uppercase tracking-[0.15em] leading-tight">
              Reels
            </p>
          </div>
        </Link>
      </div>

      {/* Quick action */}
      <div className="px-3 pt-3 pb-1.5">
        <Link
          href="/directors?upload=true"
          className="flex items-center gap-2 px-3 py-2 bg-[#1A1A1A] hover:bg-[#333] rounded text-[12px] font-medium transition-colors w-full text-white"
        >
          <Upload size={13} />
          Upload Spots
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-1.5 space-y-px">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2.5 px-3 py-1.5 rounded text-[13px] transition-colors",
                isActive
                  ? "bg-[#F7F6F3] text-[#1A1A1A] font-medium"
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
            <p className="text-[13px] text-[#1A1A1A] truncate font-medium">
              {user.name ?? user.email}
            </p>
            <p className="text-[10px] text-[#bbb] capitalize">
              {user.role?.toLowerCase()}
            </p>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="text-[#ddd] hover:text-[#666] transition-colors p-1 rounded"
            title="Sign out"
          >
            <LogOut size={13} />
          </button>
        </div>
      </div>
    </aside>
  );
}
