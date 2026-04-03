import { redirect } from "next/navigation";
import { Suspense } from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { Sidebar } from "@/components/layout/sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--background)', color: 'var(--foreground)' }}>
      <Suspense>
        <Sidebar
          user={{
            name: session.user.name,
            email: session.user.email,
            role: session.user.role,
          }}
        />
      </Suspense>

      {/* Main content — responsive: full-width on mobile, offset on desktop */}
      <main className="md:ml-[220px] min-h-screen">
        <div className="px-4 pt-14 pb-8 md:px-16 md:py-14 max-w-[1400px]">{children}</div>
      </main>
    </div>
  );
}
