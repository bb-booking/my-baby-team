import { useState } from "react";
import { Outlet, Navigate } from "react-router-dom";
import { BottomNav } from "@/components/BottomNav";
import { DesktopSidebar } from "@/components/DesktopSidebar";
import { AppHeader } from "@/components/AppHeader";
import { useFamily } from "@/context/FamilyContext";

export default function AppLayout() {
  const { profile } = useFamily();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!profile.onboarded) {
    return <Navigate to="/onboarding" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col w-full bg-background">
      <AppHeader onBurgerClick={() => setSidebarOpen(!sidebarOpen)} />

      <div className="flex flex-1 pt-16">
        <DesktopSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {/* Mobile overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 top-16 z-40 bg-night/30 backdrop-blur-sm md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <main className="flex-1 min-w-0">
          <div className="max-w-lg mx-auto px-4 py-6 md:max-w-2xl md:py-10">
            <Outlet />
          </div>
        </main>
      </div>

      <BottomNav />
    </div>
  );
}
