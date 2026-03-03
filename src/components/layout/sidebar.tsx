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
    <aside className="fixed left-0 top-0 bottom-0 w-64 bg-zinc-900 border-r border-white/10 flex flex-col z-40">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-white/10">
        <h1 className="text-lg font-semibold tracking-tight">
          Friends & Family
        </h1>
        <p className="text-xs text-white/40 mt-0.5">Reel Platform</p>
      </div>

      {/* Quick action */}
      <div className="px-3 pt-4 pb-2">
        <Link
          href="/directors?upload=true"
          className="flex items-center gap-2 px-3 py-2 bg-white/10 hover:bg-white/15 rounded-lg text-sm font-medium transition-colors w-full"
        >
          <Upload size={16} />
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
                  ? "bg-white/10 text-white font-medium"
                  : "text-white/50 hover:text-white hover:bg-white/5"
              )}
            >
              <item.icon size={18} className={isActive ? "text-white" : "text-white/40"} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div className="px-3 py-3 border-t border-white/10">
        <div className="flex items-center justify-between px-3 py-2">
          <div className="min-w-0">
            <p className="text-sm truncate">
              {user.name ?? user.email}
            </p>
            <p className="text-xs text-white/40 capitalize">
              {user.role?.toLowerCase()}
            </p>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="text-white/30 hover:text-white transition-colors p-1 rounded"
            title="Sign out"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
}
