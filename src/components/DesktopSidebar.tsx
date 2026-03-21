import { useLocation, Link } from "react-router-dom";
import { Home, Baby, Users, Settings, Heart } from "lucide-react";

const navItems = [
  { label: "Hjem", icon: Home, path: "/" },
  { label: "Barn", icon: Baby, path: "/barn" },
  { label: "Sammen", icon: Users, path: "/sammen" },
  { label: "Indstillinger", icon: Settings, path: "/mere" },
];

export function DesktopSidebar() {
  const { pathname } = useLocation();

  return (
    <aside className="hidden md:flex flex-col w-64 bg-card border-r min-h-screen p-6">
      <div className="flex items-center gap-2 mb-10">
        <div className="w-9 h-9 rounded-xl bg-sage flex items-center justify-center">
          <Heart className="w-4 h-4 text-primary-foreground" />
        </div>
        <span className="font-serif text-xl">Lille</span>
      </div>

      <nav className="flex flex-col gap-1 flex-1">
        {navItems.map((item) => {
          const active = pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all active:scale-[0.98] ${
                active
                  ? "bg-sage-light text-foreground"
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              }`}
            >
              <item.icon className="w-5 h-5" strokeWidth={active ? 2 : 1.8} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="bg-sand-light rounded-2xl p-4 mt-auto">
        <p className="text-xs text-muted-foreground">Uge 20 af 40</p>
        <div className="w-full h-2 rounded-full bg-muted mt-2 overflow-hidden">
          <div className="h-full bg-sage rounded-full transition-all duration-700" style={{ width: "50%" }} />
        </div>
      </div>
    </aside>
  );
}
