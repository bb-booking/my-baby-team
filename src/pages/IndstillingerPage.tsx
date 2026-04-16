import { useFamily } from "@/context/FamilyContext";
import { useTranslation } from "react-i18next";
import { useState, useEffect } from "react";
import { Globe, Sun, Moon, ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { FamilyLinkCard } from "@/components/FamilyLinkCard";

type Theme = "light" | "dark";

function useTheme() {
  const [theme, setThemeState] = useState<Theme>(() => {
    try {
      return (localStorage.getItem("melo-theme") as Theme) || "light";
    } catch {
      return "light";
    }
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem("melo-theme", theme);
  }, [theme]);

  return { theme, setTheme: setThemeState };
}

export default function IndstillingerPage() {
  const { profile, setProfile } = useFamily();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();

  const currentLang = profile.languages?.[profile.role] || "da";

  const switchLang = (lang: "da" | "en") => {
    const newLangs = { ...profile.languages, [profile.role]: lang } as { mor: "da" | "en"; far: "da" | "en" };
    setProfile({ ...profile, languages: newLangs });
    i18n.changeLanguage(lang);
  };

  return (
    <div className="space-y-5">
      <div className="section-fade-in">
        <button onClick={() => navigate("/mere")} className="flex items-center gap-1 text-muted-foreground text-[0.78rem] mb-2 active:scale-95 transition-transform">
          <ChevronLeft className="w-4 h-4" /> {t("settingsPage.back")}
        </button>
        <h1 className="text-[1.9rem] font-normal">{t("settings.settingsMenu")}</h1>
      </div>

      {/* Language */}
      <div className="card-soft section-fade-in" style={{ animationDelay: "40ms" }}>
        <div className="flex items-center gap-2 mb-4">
          <Globe className="w-4 h-4" style={{ color: "hsl(var(--moss))" }} />
          <p className="text-[1rem] font-semibold">{t("settings.language")}</p>
        </div>
        <p className="text-[0.72rem] text-muted-foreground mb-3">
          {t("settingsPage.languagePerRole")}
        </p>
        <div className="flex gap-2">
          {([
            { code: "da" as const, label: `🇩🇰 ${t("settings.danish")}` },
            { code: "en" as const, label: `🇬🇧 ${t("settings.english")}` },
          ]).map(lang => (
            <button
              key={lang.code}
              onClick={() => switchLang(lang.code)}
              className={cn(
                "flex-1 py-3 rounded-xl text-[0.85rem] border transition-all active:scale-[0.97]",
                currentLang === lang.code
                  ? "bg-[hsl(var(--sage-light))] border-[hsl(var(--sage))] font-semibold"
                  : "border-[hsl(var(--stone-light))] text-muted-foreground"
              )}
            >
              {lang.label}
            </button>
          ))}
        </div>
      </div>

      {/* Theme */}
      <div className="card-soft section-fade-in" style={{ animationDelay: "80ms" }}>
        <div className="flex items-center gap-2 mb-4">
          {theme === "dark" ? (
            <Moon className="w-4 h-4" style={{ color: "hsl(var(--moss))" }} />
          ) : (
            <Sun className="w-4 h-4" style={{ color: "hsl(var(--moss))" }} />
          )}
          <p className="text-[1rem] font-semibold">{t("settingsPage.theme")}</p>
        </div>
        <p className="text-[0.72rem] text-muted-foreground mb-3">
          {t("settingsPage.themeDesc")}
        </p>
        <div className="flex gap-2">
          {([
            { code: "light" as Theme, label: t("settingsPage.light") },
            { code: "dark" as Theme, label: t("settingsPage.dark") },
          ]).map(th => (
            <button
              key={th.code}
              onClick={() => setTheme(th.code)}
              className={cn(
                "flex-1 py-3 rounded-xl text-[0.85rem] border transition-all active:scale-[0.97]",
                theme === th.code
                  ? "bg-[hsl(var(--sage-light))] border-[hsl(var(--sage))] font-semibold"
                  : "border-[hsl(var(--stone-light))] text-muted-foreground"
              )}
            >
              {th.label}
            </button>
          ))}
        </div>
      </div>

      {/* Partner linking */}
      {profile.hasPartner !== false && (
        <div style={{ animationDelay: "120ms" }}>
          <FamilyLinkCard />
        </div>
      )}

      <div className="h-20 md:h-0" />
    </div>
  );
}
