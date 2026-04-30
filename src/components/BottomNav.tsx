import { useLocation, Link } from "react-router-dom";
import { useFamily } from "@/context/FamilyContext";
import { useDiary } from "@/context/DiaryContext";
import { useTranslation } from "react-i18next";
import { Home, Baby, Users, MessageCircle, Menu, Sparkles } from "lucide-react";

export function BottomNav() {
  const { pathname } = useLocation();
  const { profile } = useFamily();
  const { nursingLogs, diaperLogs, sleepLogs } = useDiary();
  const { t } = useTranslation();
  const isPregnant = profile.phase === "pregnant";

  const today = new Date().toDateString();
  const hasPartnerLogsToday =
    nursingLogs.some(l => l.fromPartner && new Date(l.timestamp).toDateString() === today) ||
    diaperLogs.some(l => l.fromPartner && new Date(l.timestamp).toDateString() === today) ||
    sleepLogs.some(l => l.fromPartner && new Date(l.startTime).toDateString() === today);

  const pregnantItems = [
    { label: "Hjem",        icon: Home,      path: "/",        center: false },
    { label: "Graviditet",  icon: Baby,      path: "/barn",    center: false },
    { label: "MELO",        icon: Sparkles,  path: "/chat",    center: true  },
    { label: "Samarbejde",  icon: Users,     path: "/samen",   center: false },
    { label: "Menu",        icon: Menu,      path: "/mere",    center: false },
  ];

  const babyItems = [
    { label: t("nav.home"),    icon: Home,          path: "/",      center: false },
    { label: t("nav.child"),   icon: Baby,          path: "/barn",  center: false },
    { label: t("nav.chat"),    icon: MessageCircle, path: "/chat",  center: false },
    { label: t("nav.together"),icon: Users,         path: "/samen", center: false },
    { label: "Mere",           icon: Menu,          path: "/mere",  center: false },
  ];

  const navItems = isPregnant ? pregnantItems : babyItems;

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 flex items-end justify-around"
      style={{
        background: "hsl(var(--warm-white))",
        borderTop: "1px solid hsl(var(--stone-light))",
        paddingTop: "8px",
        paddingBottom: "calc(10px + env(safe-area-inset-bottom, 0px))",
        paddingLeft: "env(safe-area-inset-left, 0px)",
        paddingRight: "env(safe-area-inset-right, 0px)",
      }}
    >
      {navItems.map((item) => {
        const active = item.path === "/"
          ? pathname === "/"
          : pathname.startsWith(item.path);

        if (item.center) {
          return (
            <Link
              key={item.path}
              to={item.path}
              className="flex flex-col items-center gap-0.5 -mt-5"
            >
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center shadow-md transition-transform active:scale-90"
                style={{ background: "hsl(var(--moss))" }}
              >
                <item.icon className="w-6 h-6 text-white" strokeWidth={1.8} />
              </div>
              <span
                className="text-[11px] mt-0.5"
                style={{
                  fontWeight: active ? 500 : 300,
                  color: active ? "hsl(var(--moss))" : "hsl(var(--muted-foreground))",
                }}
              >
                {item.label}
              </span>
            </Link>
          );
        }

        return (
          <Link
            key={item.path}
            to={item.path}
            className={`flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-xl transition-colors active:scale-95 ${
              active ? "text-moss" : "text-muted-foreground"
            }`}
          >
            <div className="relative">
              <item.icon className="w-5 h-5" strokeWidth={active ? 2.2 : 1.8} />
              {item.path === "/mere" && !active && hasPartnerLogsToday && (
                <span
                  className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full"
                  style={{ background: "hsl(var(--moss))" }}
                />
              )}
            </div>
            <span className="text-[11px]" style={{ fontWeight: active ? 500 : 300 }}>
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
