import { Outlet, Navigate } from "react-router-dom";
import { BottomNav } from "@/components/BottomNav";
import { DesktopSidebar } from "@/components/DesktopSidebar";
import { useFamily } from "@/context/FamilyContext";

export default function AppLayout() {
  const { profile, profileLoading } = useFamily();

  if (profileLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[hsl(var(--moss))] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!profile.onboarded) {
    return <Navigate to="/onboarding" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col w-full bg-background overflow-x-hidden">
      {/* Desktop sidebar — hidden on mobile */}
      <DesktopSidebar open={false} onClose={() => {}} />

      <main className="flex-1 min-w-0 overflow-x-hidden">
        <div
          className="max-w-lg mx-auto px-4 md:max-w-2xl md:pt-10 md:pb-10"
          style={{
            paddingTop: "calc(1.5rem + env(safe-area-inset-top, 0px))",
            paddingBottom: "calc(5.5rem + env(safe-area-inset-bottom, 0px))",
          }}
        >
          <Outlet />
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
