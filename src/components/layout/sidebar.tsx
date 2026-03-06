"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";

interface NavItem {
  href: string;
  label: string;
  roles: string[];
}

const navItems: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", roles: ["ADMIN", "PRODUCER", "REP"] },
  { href: "/reels", label: "Reels", roles: ["ADMIN", "PRODUCER", "REP"] },
  { href: "/analytics", label: "Analytics", roles: ["ADMIN", "PRODUCER", "REP"] },
  { href: "/contacts", label: "Contacts", roles: ["ADMIN", "PRODUCER", "REP"] },
  { href: "/directors", label: "Directors", roles: ["ADMIN", "PRODUCER"] },
  { href: "/treatments", label: "Treatments", roles: ["ADMIN", "PRODUCER", "REP"] },
  { href: "/industry", label: "Industry", roles: ["ADMIN", "PRODUCER", "REP"] },
];

function getRoleDisplayName(role: string): string {
  switch (role) {
    case "ADMIN":
      return "Admin";
    case "PRODUCER":
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
  const canUpload = role === "ADMIN" || role === "PRODUCER";
  const visibleNav = navItems.filter((item) => item.roles.includes(role));
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close mobile sidebar on navigation
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Prevent body scroll when mobile sidebar open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  const sidebarContent = (
    <>
      {/* Brand */}
      <div className="px-7 pt-8 pb-12">
        <Link href="/dashboard" className="block group">
          <div className="flex items-center gap-3.5">
            <img
              src="/logo.svg"
              alt="FF"
              className="w-[30px] h-[30px] object-contain flex-shrink-0"
            />
            <div>
              <h1 className="text-[15px] font-semibold tracking-tight-2 text-[#1A1A1A] leading-none group-hover:text-[#000] transition-colors">
                Friends &amp; Family
              </h1>
              <span className="block mt-1.5 text-[9px] text-[#bbb] uppercase tracking-[0.2em] font-normal group-hover:text-[#999] transition-colors">
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
                "block px-3 py-2.5 text-[13px] rounded-xl transition-all duration-300",
                isActive
                  ? "text-[#1A1A1A] font-medium bg-white/60 backdrop-blur-lg shadow-[0_1px_4px_rgba(0,0,0,0.03),0_0.5px_0_rgba(255,255,255,0.5)_inset]"
                  : "text-[#999] hover:text-[#1A1A1A] hover:bg-white/35"
              )}
            >
              {item.label}
            </Link>
          );
        })}

        {/* Upload Spots -- ADMIN + PRODUCER */}
        {canUpload && (
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
        <div className="flex items-center justify-between px-3 py-3 rounded-2xl bg-white/40 backdrop-blur-lg">
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
    </>
  );

  return (
    <>
      {/* Mobile hamburger — fixed top-left */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed top-4 left-4 z-50 md:hidden p-2.5 rounded-xl bg-white/80 backdrop-blur-lg border border-[#E8E7E3]/60 shadow-sm"
        aria-label="Open menu"
      >
        <Menu size={18} className="text-[#1A1A1A]" />
      </button>

      {/* Desktop sidebar — hidden on mobile */}
      <aside className="hidden md:flex fixed left-0 top-0 bottom-0 w-[220px] bg-white/35 backdrop-blur-3xl border-r border-white/20 flex-col z-40" style={{ boxShadow: '1px 0 12px rgba(0,0,0,0.015), 0 0.5px 0 rgba(255,255,255,0.3) inset' }}>
        {sidebarContent}
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 md:hidden"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="fixed left-0 top-0 bottom-0 w-[280px] bg-[#F7F6F3] backdrop-blur-2xl shadow-2xl flex flex-col z-50 md:hidden">
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-4 right-4 p-2 text-[#999] hover:text-[#1A1A1A] transition-colors"
              aria-label="Close menu"
            >
              <X size={18} />
            </button>
            {sidebarContent}
          </aside>
        </>
      )}
    </>
  );
}
