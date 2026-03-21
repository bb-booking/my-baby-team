import { useLocation, Link } from "react-router-dom";
import { Home, Baby, Users, BookOpen } from "lucide-react";

const navItems = [
  { label: "Hjem", icon: Home, path: "/" },
  { label: "Barn", icon: Baby, path: "/barn" },
  { label: "Dagbog", icon: BookOpen, path: "/dagbog" },
  { label: "Sammen", icon: Users, path: "/sammen" },
];

export function BottomNav() {
  const { pathname } = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around md:hidden"
      style={{
        background: "hsl(var(--warm-white))",
        borderTop: "1px solid hsl(var(--stone-light))",
        padding: "8px 0 calc(8px + env(safe-area-inset-bottom))",
      }}
    >
      {navItems.map((item) => {
        const active = pathname === item.path;
        return (
          <Link
            key={item.path}
            to={item.path}
            className={`flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-xl transition-colors active:scale-95 ${
              active ? "text-moss" : "text-muted-foreground"
            }`}
          >
            <item.icon className="w-5 h-5" strokeWidth={active ? 2.2 : 1.8} />
            <span className="text-[11px]" style={{ fontWeight: active ? 500 : 300 }}>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
