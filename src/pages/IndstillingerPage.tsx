import { useFamily, type LifePhase } from "@/context/FamilyContext";
import { useTranslation } from "react-i18next";
import { useState, useEffect } from "react";
import { Globe, Sun, Moon, ChevronLeft, User, Calendar } from "lucide-react";
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

  const [yourName, setYourName] = useState(profile.parentName || "");
  const [partnerName, setPartnerName] = useState(profile.partnerName || "");
  const [babyName, setBabyName] = useState(profile.children?.[0]?.name || "");
  const [namesSaved, setNamesSaved] = useState(false);
  const [dateValue, setDateValue] = useState(profile.dueOrBirthDate || "");
  const [dateSaved, setDateSaved] = useState(false);

  const currentLang = profile.languages?.[profile.role] || "da";

  const switchLang = (lang: "da" | "en") => {
    const newLangs = { ...profile.languages, [profile.role]: lang } as { mor: "da" | "en"; far: "da" | "en" };
    setProfile({ ...profile, languages: newLangs });
    i18n.changeLanguage(lang);
  };

  const saveDate = () => {
    if (!dateValue) return;
    const date = new Date(dateValue);
    const now = new Date();
    const isFuture = date > now;
    const weeksOld = Math.max(0, Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24 * 7)));
    const monthsOld = Math.floor(weeksOld / 4.33);
    const newPhase: LifePhase = isFuture ? "pregnant" : monthsOld < 3 ? "newborn" : "baby";

    const updatedChildren = !isFuture && profile.children.length > 0
      ? [{ ...profile.children[0], birthDate: dateValue }]
      : profile.children;

    setProfile({ ...profile, dueOrBirthDate: dateValue, phase: newPhase, children: updatedChildren });
    setDateSaved(true);
    setTimeout(() => setDateSaved(false), 2000);
  };

  const saveNames = () => {
    const updatedChildren = babyName.trim() && profile.children?.length
      ? [{ ...profile.children[0], name: babyName.trim() }]
      : babyName.trim()
      ? [{ id: Math.random().toString(36).slice(2), name: babyName.trim(), birthDate: profile.dueOrBirthDate || "" }]
      : profile.children || [];

    setProfile({
      ...profile,
      parentName: yourName.trim(),
      partnerName: partnerName.trim(),
      children: updatedChildren,
    });
    setNamesSaved(true);
    setTimeout(() => setNamesSaved(false), 2000);
  };

  return (
    <div className="space-y-5">
      <div className="section-fade-in">
        <button onClick={() => navigate("/mere")} className="flex items-center gap-1 text-muted-foreground text-[0.78rem] mb-2 active:scale-95 transition-transform">
          <ChevronLeft className="w-4 h-4" /> {t("settingsPage.back")}
        </button>
        <h1 className="text-[1.9rem] font-normal">{t("settings.settingsMenu")}</h1>
      </div>

      {/* Due date / birth date */}
      <div className="card-soft section-fade-in">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="w-4 h-4" style={{ color: "hsl(var(--moss))" }} />
          <p className="text-[1rem] font-semibold">
            {profile.phase === "pregnant" ? "Termin" : "Fødselsdato"}
          </p>
        </div>
        <p className="text-[0.72rem] text-muted-foreground mb-3">
          {profile.phase === "pregnant"
            ? "Sæt datoen frem i tid for graviditets-interface, eller tilbage for baby-interface."
            : "Ændrer du datoen til en fremtidig dato, skifter appen til graviditets-interface."}
        </p>
        <input
          type="date"
          value={dateValue}
          onChange={e => setDateValue(e.target.value)}
          className="w-full rounded-xl border-[1.5px] border-[hsl(var(--stone-light))] bg-background px-4 py-2.5 text-[0.88rem] focus:outline-none focus:border-[hsl(var(--moss))] transition-colors mb-3"
        />
        {dateValue && dateValue !== profile.dueOrBirthDate && (
          <p className="text-[0.68rem] text-muted-foreground mb-3">
            {new Date(dateValue) > new Date()
              ? "📅 Dato er i fremtiden — appen skifter til graviditets-interface"
              : "👶 Dato er i fortiden — appen skifter til baby-interface"}
          </p>
        )}
        <button
          onClick={saveDate}
          disabled={!dateValue}
          className="w-full py-2.5 rounded-full text-[0.82rem] font-semibold transition-all active:scale-[0.98] disabled:opacity-40"
          style={{ background: dateSaved ? "hsl(var(--sage-light))" : "hsl(var(--moss))", color: dateSaved ? "hsl(var(--moss))" : "white" }}
        >
          {dateSaved ? "✓ Gemt" : "Gem dato"}
        </button>
      </div>

      {/* Names */}
      <div className="card-soft section-fade-in">
        <div className="flex items-center gap-2 mb-4">
          <User className="w-4 h-4" style={{ color: "hsl(var(--moss))" }} />
          <p className="text-[1rem] font-semibold">Navne</p>
        </div>
        <div className="space-y-3">
          <div>
            <label className="text-[0.62rem] tracking-[0.16em] uppercase text-muted-foreground mb-1 block">Dit navn</label>
            <input
              type="text" value={yourName} onChange={e => setYourName(e.target.value)}
              className="w-full rounded-xl border-[1.5px] border-[hsl(var(--stone-light))] bg-background px-4 py-2.5 text-[0.88rem] focus:outline-none focus:border-[hsl(var(--moss))] transition-colors"
            />
          </div>
          {profile.hasPartner !== false && (
            <div>
              <label className="text-[0.62rem] tracking-[0.16em] uppercase text-muted-foreground mb-1 block">Partners navn</label>
              <input
                type="text" value={partnerName} onChange={e => setPartnerName(e.target.value)}
                className="w-full rounded-xl border-[1.5px] border-[hsl(var(--stone-light))] bg-background px-4 py-2.5 text-[0.88rem] focus:outline-none focus:border-[hsl(var(--moss))] transition-colors"
              />
            </div>
          )}
          <div>
            <label className="text-[0.62rem] tracking-[0.16em] uppercase text-muted-foreground mb-1 block">Barnets navn</label>
            <input
              type="text" value={babyName} onChange={e => setBabyName(e.target.value)}
              className="w-full rounded-xl border-[1.5px] border-[hsl(var(--stone-light))] bg-background px-4 py-2.5 text-[0.88rem] focus:outline-none focus:border-[hsl(var(--moss))] transition-colors"
            />
          </div>
          <button
            onClick={saveNames}
            className="w-full py-2.5 rounded-full text-[0.82rem] font-semibold transition-all active:scale-[0.98]"
            style={{ background: namesSaved ? "hsl(var(--sage-light))" : "hsl(var(--moss))", color: namesSaved ? "hsl(var(--moss))" : "white" }}
          >
            {namesSaved ? "✓ Gemt" : "Gem navne"}
          </button>
        </div>
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


    </div>
  );
}
