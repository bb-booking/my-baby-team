import { useLocation, Link } from "react-router-dom";
import { useFamily, type ParentRole } from "@/context/FamilyContext";
import { useTranslation } from "react-i18next";
import {
  Home, Baby, Users, Settings, BookOpen, Calendar, CheckSquare,
  Lightbulb, Heart, Moon, ShoppingBag, Circle, Droplet,
  MessageCircle, PuzzleIcon, ArrowLeftRight
} from "lucide-react";

interface NavItem {
  label: string;
  icon: typeof Home;
  path: string;
  badge?: number;
}

interface NavSection {
  label: string;
  items: NavItem[];
}

function getNavSections(phase: "pregnant" | "newborn" | "baby", role: "mor" | "far", t: (key: string) => string): NavSection[] {
  const isPregnant = phase === "pregnant";

  const sections: NavSection[] = [
    {
      label: t("sidebarSections.overview"),
      items: [
        { label: t("nav.home"), icon: Home, path: "/" },
        ...(isPregnant ? [{ label: t("nav.pregnancy"), icon: Baby, path: "/barn" }] : [{ label: t("nav.child"), icon: Baby, path: "/barn" }]),
      ],
    },
  ];

  sections.push({
    label: t("sidebarSections.ask"),
    items: [{ label: t("chat.title"), icon: MessageCircle, path: "/chat" }],
  });

  if (isPregnant) {
    sections.push({
      label: t("sidebarSections.name"),
      items: [{ label: t("sidebar.babyNames"), icon: Heart, path: "/babynavne" }],
    });
  } else {
    sections.push({
      label: t("sidebarSections.family"),
      items: [
        { label: t("together.title"), icon: Users, path: "/sammen" },
        { label: t("play.title"), icon: PuzzleIcon, path: "/leg" },
      ],
    });
    sections.push({
      label: t("sidebarSections.diary"),
      items: [
        { label: t("sidebarSections.nursing"), icon: Circle, path: "/dagbog?tab=amning" },
        { label: t("sidebarSections.diaper"), icon: Droplet, path: "/dagbog?tab=ble" },
        { label: t("sidebar.sleep"), icon: Moon, path: "/sovn" },
      ],
    });
  }

  sections.push({
    label: t("sidebarSections.plan"),
    items: [
      { label: t("sidebar.checklist"), icon: CheckSquare, path: "/tjekliste" },
      { label: t("sidebar.calendar"), icon: Calendar, path: "/kalender" },
    ],
  });

  if (!isPregnant) {
    sections.push({
      label: t("sidebarSections.shop"),
      items: [{ label: t("shop.title"), icon: ShoppingBag, path: "/shop" }],
    });
  }

  sections.push({
    label: t("sidebarSections.forYou"),
    items: [
      { label: t("sidebar.advice"), icon: Lightbulb, path: "/raad" },
    ],
  });

  sections.push({
    label: t("sidebarSections.settings"),
    items: [{ label: t("settings.settingsMenu"), icon: Settings, path: "/mere" }],
  });

  return sections;
}

interface DesktopSidebarProps {
  open: boolean;
  onClose: () => void;
}

export function DesktopSidebar({ open, onClose }: DesktopSidebarProps) {
  const { pathname } = useLocation();
  const { profile, setProfile, morName, farName, phaseLabel } = useFamily();
  const { t } = useTranslation();
  const sections = getNavSections(profile.phase, profile.role, t);

  const otherRole: ParentRole = profile.role === "mor" ? "far" : "mor";
  const otherName = otherRole === "mor" ? morName : farName;
  const otherEmoji = otherRole === "mor" ? "👩" : "👨";

  const switchRole = (role: ParentRole) => {
    const newProfile = {
      ...profile,
      role,
      parentName: role === "mor" ? morName : farName,
      partnerName: role === "mor" ? farName : morName,
    };
    setProfile(newProfile);
  };

  const phaseTagLabel = profile.phase === "pregnant"
    ? t("sidebarSections.pregnant")
    : t("sidebarSections.onLeave");

  const roleLabel = profile.role === "mor" ? t("settings.mom") : t("settings.dad");

  return (
    <aside
      className={`
        fixed top-16 z-50 h-[calc(100vh-4rem)] w-64 flex flex-col
        transition-transform duration-300 ease-out
        md:sticky md:top-16 md:z-auto md:translate-x-0
        ${open ? "translate-x-0" : "-translate-x-full"}
      `}
      style={{
        background: "hsl(var(--cream))",
        borderRight: "1px solid hsl(var(--stone-light))",
      }}
    >
      {/* Family header */}
      <div className="px-5 py-4 border-b border-stone-light">
        <div className="flex items-center gap-2.5 mb-3">
          <div className="flex -space-x-2">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs border-2 border-cream"
              style={{ background: "linear-gradient(135deg, hsl(var(--clay-light)), hsl(var(--clay)))", color: "white" }}>
              {profile.parentName?.[0] || "?"}
            </div>
            {profile.partnerName && (
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs border-2 border-cream"
                style={{ background: "linear-gradient(135deg, hsl(var(--sage-light)), hsl(var(--sage)))", color: "white" }}>
                {profile.partnerName[0]}
              </div>
            )}
            {profile.children.map(c => (
              <div key={c.id} className="w-8 h-8 rounded-full flex items-center justify-center text-xs border-2 border-cream"
                style={{ background: "linear-gradient(135deg, hsl(var(--sand-light)), hsl(var(--sand)))", color: "white" }}>
                {c.name[0]}
              </div>
            ))}
          </div>
          <div>
            <p className="text-[0.78rem]">{t("sidebarSections.familyLabel")}</p>
            <p className="text-[0.6rem] text-muted-foreground">{profile.parentName}</p>
          </div>
        </div>

        {/* User card */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg"
            style={{ background: profile.role === "mor" ? "hsl(var(--clay-light))" : "hsl(var(--sage-light))" }}>
            {profile.role === "mor" ? "👩" : "👨"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[0.85rem] font-medium truncate">{profile.parentName}</p>
            <p className="text-[0.58rem] tracking-[0.14em] uppercase text-muted-foreground">
              {roleLabel} · {phaseTagLabel}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="py-2 flex-1 overflow-y-auto min-h-0">
        {sections.map((section) => (
          <div key={section.label}>
            <p className="text-[0.52rem] tracking-[0.22em] uppercase text-muted-foreground px-5 pt-4 pb-1">
              {section.label}
            </p>
            {section.items.map((item) => {
              const isActive = item.path.includes("?")
                ? pathname === item.path.split("?")[0]
                : pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={onClose}
                  className={`flex items-center gap-2.5 px-5 py-2 text-[0.82rem] border-l-[3px] transition-all active:scale-[0.98] ${
                    isActive
                      ? "border-l-[hsl(var(--sage))] text-[hsl(var(--moss))] bg-[hsl(var(--sage))]/8 font-medium"
                      : "border-l-transparent text-muted-foreground hover:text-[hsl(var(--moss))] hover:bg-[hsl(var(--sage))]/5"
                  }`}
                >
                  <item.icon className="w-4 h-4 opacity-70" />
                  {item.label}
                  {item.badge && (
                    <span className="ml-auto w-5 h-5 rounded-full text-[0.6rem] flex items-center justify-center text-white"
                      style={{ background: "hsl(var(--clay))" }}>
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Profile switcher at bottom */}
      <div className="mt-auto border-t border-stone-light px-4 py-3">
        <p className="text-[0.52rem] tracking-[0.2em] uppercase text-muted-foreground mb-2">
          {t("sidebarSections.switchUser")}
        </p>
        <button
          onClick={() => switchRole(otherRole)}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl transition-colors hover:bg-muted/50 active:scale-[0.98]"
        >
          <span className="text-lg">{otherEmoji}</span>
          <div className="flex-1 text-left">
            <p className="text-[0.82rem] font-medium">{otherName || (otherRole === "mor" ? t("settings.mom") : t("settings.dad"))}</p>
            <p className="text-[0.58rem] text-muted-foreground uppercase tracking-wider">
              {t("sidebarSections.switchTo", { role: otherRole === "mor" ? t("settings.mom").toLowerCase() : t("settings.dad").toLowerCase() })}
            </p>
          </div>
          <ArrowLeftRight className="w-3.5 h-3.5 text-muted-foreground" />
        </button>
      </div>
    </aside>
  );
}
