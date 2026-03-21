import { useLocation, Link } from "react-router-dom";
import { Home, Baby, Users, MoreHorizontal } from "lucide-react";

const navItems = [
  { label: "Hjem", icon: Home, path: "/" },
  { label: "Barn", icon: Baby, path: "/barn" },
  { label: "Sammen", icon: Users, path: "/sammen" },
  { label: "Mere", icon: MoreHorizontal, path: "/mere" },
];

export function BottomNav() {
  const { pathname } = useLocation();

  return (
    <nav className="bottom-nav md:hidden">
      {navItems.map((item) => {
        const active = pathname === item.path;
        return (
          <Link
            key={item.path}
            to={item.path}
            className={`flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-xl transition-colors active:scale-95 ${
              active ? "text-sage" : "text-muted-foreground"
            }`}
          >
            <item.icon className="w-5 h-5" strokeWidth={active ? 2.2 : 1.8} />
            <span className="text-[11px] font-medium">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
