import { Outlet } from "react-router-dom";
import { BottomNav } from "@/components/BottomNav";
import { DesktopSidebar } from "@/components/DesktopSidebar";

export default function AppLayout() {
  return (
    <div className="min-h-screen flex w-full bg-background">
      <DesktopSidebar />
      <main className="flex-1 min-w-0">
        <div className="max-w-lg mx-auto px-5 py-6 md:max-w-2xl md:py-10">
          <Outlet />
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
