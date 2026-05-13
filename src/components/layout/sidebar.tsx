"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import {
  BarChart3,
  BookOpen,
  Briefcase,
  Clapperboard,
  FileText,
  Home,
  Menu,
  Search,
  Send,
  UserCog,
  Users,
  X,
  Eye,
  ArrowLeft,
  type LucideIcon,
} from "lucide-react";
import { ThemeToggle } from "./theme-toggle";

interface NavItem {
  href: string;
  label: string;
  roles: string[];
  icon: LucideIcon;
}

const navItems: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", roles: ["ADMIN", "PRODUCER", "REP"], icon: Home },
  { href: "/reels", label: "Reels", roles: ["ADMIN", "PRODUCER", "REP"], icon: Clapperboard },
  { href: "/analytics", label: "Analytics", roles: ["ADMIN", "PRODUCER", "REP"], icon: BarChart3 },
  { href: "/leads", label: "Leads", roles: ["ADMIN", "PRODUCER", "REP"], icon: Search },
  { href: "/directors", label: "Directors", roles: ["ADMIN", "PRODUCER"], icon: Users },
  { href: "/photographers", label: "Photographers", roles: ["ADMIN", "PRODUCER", "REP"], icon: Briefcase },
  { href: "/treatments", label: "Treatments", roles: ["ADMIN", "PRODUCER", "REP"], icon: FileText },
  { href: "/users", label: "Users", roles: ["ADMIN"], icon: UserCog },
  // Director-only pages
  { href: "/portfolio", label: "Portfolio", roles: ["DIRECTOR"], icon: BookOpen },
  { href: "/my-reels", label: "My Reels", roles: ["DIRECTOR"], icon: Clapperboard },
  { href: "/my-stats", label: "My Stats", roles: ["DIRECTOR"], icon: BarChart3 },
];

function getRoleDisplayName(role: string): string {
  switch (role) {
    case "ADMIN":
      return "Admin";
    case "PRODUCER":
      return "Producer";
    case "REP":
      return "Sales Rep";
    case "DIRECTOR":
      return "Director";
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
  leadsEnabled?: boolean;
}

export function Sidebar({ user, leadsEnabled = false }: SidebarProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const role = user.role || "VIEWER";
  const [mobileOpen, setMobileOpen] = useState(false);

  // Admin preview mode: when ?preview=directorId is in the URL
  const previewDirectorId = role === "ADMIN" ? searchParams.get("preview") : null;
  const isPreview = !!previewDirectorId;

  // In preview mode, show director nav items with the preview param
  const previewSuffix = isPreview ? `?preview=${previewDirectorId}` : "";
  const visibleNav = isPreview
    ? navItems.filter((item) => item.roles.includes("DIRECTOR")).map((item) => ({
        ...item,
        href: `${item.href}${previewSuffix}`,
      }))
    : navItems
        .filter((item) => item.roles.includes(role))
        .filter((item) => item.href !== "/leads" || leadsEnabled);
  const canUpload = !isPreview && (role === "ADMIN" || role === "PRODUCER");

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
      <div className="px-5 pt-6 pb-8">
        <Link href={isPreview ? `/portfolio${previewSuffix}` : "/dashboard"} className="block group">
          <div className="flex items-center gap-3">
            <img
              src="/logo.svg"
              alt="FF"
              className="w-[26px] h-[26px] object-contain flex-shrink-0"
            />
            <div>
              <span className="block text-[11px] text-[#111] uppercase tracking-[0.08em] font-semibold leading-none group-hover:text-black transition-colors">
                Reels
              </span>
            </div>
          </div>
        </Link>
      </div>

      {/* Preview mode indicator */}
      {isPreview && (
        <div className="px-4 -mt-6 mb-4">
          <div className="px-3 py-2 bg-amber-50/80 border border-amber-200/40 rounded-xl">
            <div className="flex items-center gap-1.5 mb-1.5">
              <Eye size={10} className="text-amber-500" />
              <span className="text-[9px] uppercase tracking-[0.12em] text-amber-600 font-semibold">Director Preview</span>
            </div>
            <Link
              href={`/directors/${previewDirectorId}`}
              className="flex items-center gap-1 text-[11px] text-amber-600 hover:text-amber-800 transition-colors font-medium"
            >
              <ArrowLeft size={10} />
              Exit Preview
            </Link>
          </div>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 px-4 space-y-1">
        {visibleNav.map((item) => {
          const Icon = item.icon;
          // Strip query params for active check
          const itemPath = item.href.split("?")[0];
          const isActive =
            pathname === itemPath || pathname.startsWith(itemPath + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative flex items-center gap-2.5 rounded-lg px-3 py-2 text-[14px] transition-colors duration-200",
                isActive
                  ? "text-[#111] font-medium bg-[#EDEDEA]"
                  : "text-[#7B7B76] hover:text-[#111] hover:bg-[#EDEDEA]/55"
              )}
            >
              <Icon
                size={18}
                strokeWidth={1.9}
                className={cn(
                  "shrink-0",
                  isActive ? "text-[#111]" : "text-[#8C8C86]"
                )}
              />
              <span className="truncate leading-none">{item.label}</span>
            </Link>
          );
        })}

        {/* Upload Spots -- ADMIN + PRODUCER */}
        {canUpload && (
          <div className="pt-3 mt-3 border-t border-[#DEDDD7] mx-2">
            <Link
              href="/upload"
              className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-[14px] text-[#7B7B76] hover:text-[#111] hover:bg-[#EDEDEA]/55 transition-colors duration-200"
            >
              <Send size={18} strokeWidth={1.9} className="text-[#8C8C86]" />
              <span className="leading-none">Upload Spots</span>
            </Link>
          </div>
        )}
      </nav>

      {/* User */}
      <div className="px-3 py-4">
        <div className="flex items-center justify-between px-3 py-3 rounded-lg bg-white border border-[#DEDDD7]">
          <div className="min-w-0">
            <p className="text-[12px] text-[#111] truncate font-medium leading-tight">
              {user.name ?? user.email}
            </p>
            <p className="text-[9px] text-[#8A8983] uppercase tracking-[0.14em] mt-0.5">
              {isPreview ? "Previewing" : getRoleDisplayName(role)}
            </p>
          </div>
          <div className="flex items-center gap-1 ml-3 shrink-0">
            <ThemeToggle />
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="text-[#9A9993] hover:text-[#111] transition-colors duration-200 p-1"
              title="Sign out"
              aria-label="Sign out"
            >
            <svg
              width="18"
              height="18"
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
      </div>
    </>
  );

  return (
    <>
      {/* Mobile hamburger — fixed top-left */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed top-4 left-4 z-50 md:hidden p-3 rounded-lg bg-white border border-[#DEDDD7] shadow-sm"
        aria-label="Open menu"
      >
        <Menu size={18} className="text-[#1A1A1A]" />
      </button>

      {/* Desktop sidebar — hidden on mobile */}
      <aside className="hidden md:flex fixed left-0 top-0 bottom-0 w-[220px] flex-col z-40" style={{ background: 'var(--surface-nav)', borderRight: '1px solid var(--border)' }}>
        {sidebarContent}
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 md:hidden"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="fixed left-0 top-0 bottom-0 w-[260px] bg-[#F7F7F4] shadow-2xl flex flex-col z-50 md:hidden">
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
