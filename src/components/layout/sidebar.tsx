"use client";

import Link from "next/link";
import Image from "next/image";
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

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
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
    <aside className="fixed left-0 top-0 bottom-0 w-64 bg-[#111] border-r border-white/[0.06] flex flex-col z-40">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-white/[0.06]">
        <Link href="/dashboard" className="flex items-center gap-3">
          <Image
            src="/logo.png"
            alt="F&F"
            width={28}
            height={28}
            className="invert"
          />
          <div>
            <h1 className="text-sm font-light tracking-tight">
              Friends & Family
            </h1>
            <p className="text-[10px] text-white/25 uppercase tracking-[0.15em]">
              Reels
            </p>
          </div>
        </Link>
      </div>

      {/* Quick action */}
      <div className="px-3 pt-4 pb-2">
        <Link
          href="/directors?upload=true"
          className="flex items-center gap-2 px-3 py-2 bg-white/[0.06] hover:bg-white/10 rounded-lg text-xs font-medium transition-colors w-full text-white/60 hover:text-white"
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
                  ? "bg-white/[0.08] text-white"
                  : "text-white/40 hover:text-white/70 hover:bg-white/[0.04]"
              )}
            >
              <item.icon size={16} className={isActive ? "text-white/80" : "text-white/25"} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div className="px-3 py-3 border-t border-white/[0.06]">
        <div className="flex items-center justify-between px-3 py-2">
          <div className="min-w-0">
            <p className="text-sm text-white/60 truncate">
              {user.name ?? user.email}
            </p>
            <p className="text-[10px] text-white/25 capitalize">
              {user.role?.toLowerCase()}
            </p>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="text-white/20 hover:text-white/60 transition-colors p-1 rounded"
            title="Sign out"
          >
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </aside>
  );
}
