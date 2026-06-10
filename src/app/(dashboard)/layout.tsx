import { SidebarNav, MobileNav } from "@/components/sidebar-nav";
import { AuthProvider } from "@/contexts/auth-context";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <div className="flex h-full min-h-screen">
        <SidebarNav />
        <main className="flex-1 overflow-auto pb-16 md:pb-0">
          <div className="p-6">{children}</div>
        </main>
        <MobileNav />
      </div>
    </AuthProvider>
  );
}
