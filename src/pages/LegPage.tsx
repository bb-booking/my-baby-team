import { useState } from "react";
import { useFamily } from "@/context/FamilyContext";
import { useTranslation } from "react-i18next";
import { getActiveLeap } from "@/lib/phaseData";
import { AIActivitySuggestions } from "@/components/AIActivitySuggestions";

const categoryIds = ["udenfor", "indenfor", "udviklende", "kreativitet", "naerhed", "social"] as const;
const categoryEmojis: Record<string, string> = {
  udenfor: "🌳", indenfor: "🛋️", udviklende: "💡", kreativitet: "🎨", naerhed: "❤️", social: "🤝",
};

export default function LegPage() {
  const { profile, babyAgeWeeks, babyAgeMonths } = useFamily();
  const { t } = useTranslation();
  const childName = profile.children?.[0]?.name || "Baby";
  const [activeCategory, setActiveCategory] = useState("indenfor");

  if (profile.phase === "pregnant") {
    return (
      <div className="space-y-5">
        <div className="section-fade-in">
          <h1 className="text-[1.9rem] font-normal">{t("play.title")}</h1>
          <p className="label-upper mt-1">{t("play.availableAfterBirth")}</p>
        </div>
        <div className="card-soft text-center py-12 section-fade-in" style={{ animationDelay: "80ms" }}>
          <span className="text-4xl mb-4 block">🎨</span>
          <p className="text-[1rem] font-normal mb-2">{t("play.playAhead")}</p>
          <p className="text-[0.8rem] text-muted-foreground max-w-xs mx-auto leading-relaxed">
            {t("play.playAheadDesc")}
          </p>
        </div>
        <div className="h-20 md:h-0" />
      </div>
    );
  }

  const activeLeap = getActiveLeap(babyAgeWeeks);

  return (
    <div className="space-y-5">
      <div className="section-fade-in">
        <h1 className="text-[1.9rem] font-normal">{t("play.title")}</h1>
        <p className="label-upper mt-1">
          {t("play.basedOnAge", { childName })}
        </p>
      </div>

      {/* Category pills */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-1 px-1 section-fade-in" style={{ animationDelay: "40ms", scrollbarWidth: "none" }}>
        {categoryIds.map(id => (
          <button
            key={id}
            onClick={() => setActiveCategory(id)}
            className={`flex-shrink-0 px-3 py-2 rounded-xl text-[0.75rem] border transition-all active:scale-[0.97] ${
              activeCategory === id
                ? "bg-[hsl(var(--sage-light))] border-[hsl(var(--sage))] font-semibold"
                : "border-[hsl(var(--stone-light))] text-muted-foreground"
            }`}
          >
            {categoryEmojis[id]} {t(`legCategories.${id}`)}
          </button>
        ))}
      </div>

      {/* Active leap banner */}
      {activeLeap && (
        <div className="rounded-2xl px-4 py-3 section-fade-in" style={{
          animationDelay: "60ms",
          background: "hsl(var(--clay) / 0.08)",
          border: "1px solid hsl(var(--clay) / 0.15)",
        }}>
          <p className="text-[0.55rem] tracking-[0.14em] uppercase text-muted-foreground mb-1">{t("play.leapNow")}</p>
          <p className="text-[0.82rem] font-medium">{activeLeap.emoji} {activeLeap.title}</p>
          <p className="text-[0.72rem] text-muted-foreground mt-0.5">{t("play.goodRightNow")}</p>
        </div>
      )}

      {/* AI suggestions */}
      <div className="section-fade-in" style={{ animationDelay: "80ms" }}>
        <AIActivitySuggestions
          childName={childName}
          ageWeeks={babyAgeWeeks}
          ageMonths={babyAgeMonths}
          category={activeCategory}
        />
      </div>

      <div className="h-20 md:h-0" />
    </div>
  );
}
