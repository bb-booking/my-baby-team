import { useFamily, type ActiveNeed } from "@/context/FamilyContext";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import { useTranslation } from "react-i18next";

const NEED_KEYS: { key: string; emoji: string; tKey: string }[] = [
  { key: "air",   emoji: "🏃", tKey: "needs.air" },
  { key: "nap",   emoji: "💤", tKey: "needs.nap" },
  { key: "shower",emoji: "🚿", tKey: "needs.shower" },
  { key: "meal",  emoji: "🍽️", tKey: "needs.meal" },
  { key: "alone", emoji: "📵", tKey: "needs.alone" },
  { key: "hug",   emoji: "🤗", tKey: "needs.hug" },
];

export function NeedsCard() {
  const { profile, setNeed, morName, farName } = useFamily();
  const { t } = useTranslation();
  const { role } = profile;
  const partnerRole = role === "mor" ? "far" : "mor";
  const partnerName = role === "mor" ? farName : morName;

  const myNeed = profile.activeNeed?.[role];
  const partnerNeed = profile.activeNeed?.[partnerRole];

  const handleSelect = (key: string, emoji: string, label: string) => {
    if (myNeed?.key === key) {
      setNeed(null);
    } else {
      setNeed({ key, emoji, label, setAt: new Date().toISOString() });
    }
  };

  return (
    <div className="card-soft section-fade-in space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-[0.6rem] tracking-[0.16em] uppercase text-muted-foreground">{t("needs.title")}</p>
        {myNeed && (
          <button onClick={() => setNeed(null)} className="flex items-center gap-1 text-[0.6rem] text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-3 h-3" /> {t("needs.delete")}
          </button>
        )}
      </div>

      <div className="grid grid-cols-3 gap-2">
        {NEED_KEYS.map(n => {
          const label = t(n.tKey);
          return (
            <button
              key={n.key}
              onClick={() => handleSelect(n.key, n.emoji, label)}
              className={cn(
                "flex flex-col items-center gap-1.5 py-3 px-1 rounded-2xl border-[1.5px] text-[0.65rem] text-center transition-all active:scale-[0.96] leading-tight",
                myNeed?.key === n.key
                  ? "border-[hsl(var(--moss))] bg-[hsl(var(--sage-light))] font-medium"
                  : "border-[hsl(var(--stone-light))] bg-background text-muted-foreground"
              )}
            >
              <span className="text-xl">{n.emoji}</span>
              {label}
            </button>
          );
        })}
      </div>

      {/* Partner's need */}
      {partnerNeed && (
        <div className="flex items-center gap-2.5 rounded-xl px-3 py-2.5" style={{ background: "hsl(var(--cream))" }}>
          <span className="text-lg">{partnerNeed.emoji}</span>
          <div>
            <p className="text-[0.72rem] font-medium">{t("needs.partnerNeeds", { name: partnerName || "" })}</p>
            <p className="text-[0.7rem] text-muted-foreground">{partnerNeed.label}</p>
          </div>
        </div>
      )}
    </div>
  );
}
