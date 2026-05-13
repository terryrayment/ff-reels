import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { Sidebar } from "@/components/layout/sidebar";
import { canAccessLeads } from "@/lib/leads-access";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
      "max-snippet": -1,
      "max-image-preview": "none",
      "max-video-preview": -1,
    },
  },
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const leadsEnabled = canAccessLeads(session.user);

  return (
    <div className="min-h-screen" style={{ background: 'var(--background)', color: 'var(--foreground)' }}>
      <Suspense>
        <Sidebar
          user={{
            name: session.user.name,
            email: session.user.email,
            role: session.user.role,
          }}
          leadsEnabled={leadsEnabled}
        />
      </Suspense>

      {/* Main content — responsive: full-width on mobile, offset on desktop */}
      <main className="md:ml-[220px] min-h-screen">
        <div className="px-4 pt-14 pb-8 md:px-12 lg:px-14 md:py-12 max-w-[1500px]">{children}</div>
      </main>
    </div>
  );
}
