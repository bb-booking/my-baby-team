import { useLocation, Link } from "react-router-dom";
import { useFamily } from "@/context/FamilyContext";
import { Home, Baby, Users, Settings, BookOpen, Calendar } from "lucide-react";

const navSections = [
  {
    label: "OVERBLIK",
    items: [
      { label: "Hjem", icon: Home, path: "/" },
      { label: "Barn", icon: Baby, path: "/barn" },
    ],
  },
  {
    label: "HVERDAG",
    items: [
      { label: "Dagbog", icon: BookOpen, path: "/dagbog" },
      { label: "Kalender", icon: Calendar, path: "/kalender" },
    ],
  },
  {
    label: "FAMILIE",
    items: [
      { label: "Samarbejde", icon: Users, path: "/sammen" },
      { label: "Indstillinger", icon: Settings, path: "/mere" },
    ],
  },
];

interface DesktopSidebarProps {
  open: boolean;
  onClose: () => void;
}

export function DesktopSidebar({ open, onClose }: DesktopSidebarProps) {
  const { pathname } = useLocation();
  const { profile, phaseLabel } = useFamily();

  return (
    <aside
      className={`
        fixed top-16 z-50 h-[calc(100vh-4rem)] w-64 flex flex-col overflow-y-auto
        transition-transform duration-300 ease-out
        md:sticky md:top-16 md:z-auto md:translate-x-0
        ${open ? "translate-x-0" : "-translate-x-full"}
      `}
      style={{
        background: "hsl(var(--cream))",
        borderRight: "1px solid hsl(var(--stone-light))",
      }}
    >
      {/* Family pill */}
      <div className="flex items-center gap-2.5 px-7 py-4 border-b border-stone-light">
        <div className="flex">
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs border-2 border-cream"
            style={{ background: "linear-gradient(135deg, hsl(var(--clay-light)), hsl(var(--clay)))", color: "white" }}>
            {profile.parentName[0]}
          </div>
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs border-2 border-cream -ml-2"
            style={{ background: "linear-gradient(135deg, hsl(var(--sage-light)), hsl(var(--sage)))", color: "white" }}>
            {profile.partnerName[0]}
          </div>
        </div>
        <div>
          <p className="text-[0.82rem] text-foreground/70">{profile.parentName} & {profile.partnerName}</p>
          <p className="text-[0.62rem] text-muted-foreground">{phaseLabel}</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="py-3 flex-1">
        {navSections.map((section) => (
          <div key={section.label}>
            <p className="text-[0.58rem] tracking-[0.2em] uppercase text-muted-foreground px-7 pt-2.5 pb-1">
              {section.label}
            </p>
            {section.items.map((item) => {
              const active = pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={onClose}
                  className={`flex items-center gap-2.5 px-7 py-2.5 text-[0.83rem] border-l-2 transition-all active:scale-[0.98] ${
                    active
                      ? "border-l-sage text-moss bg-sage/10 font-normal"
                      : "border-l-transparent text-muted-foreground hover:text-moss hover:bg-sage/5"
                  }`}
                >
                  <item.icon className="w-4 h-4 opacity-70" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>
    </aside>
  );
}
