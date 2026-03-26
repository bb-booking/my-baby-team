import { useState } from "react";
import { useFamily } from "@/context/FamilyContext";
import { getActiveLeap } from "@/lib/phaseData";
import { AIActivitySuggestions } from "@/components/AIActivitySuggestions";

const categories = [
  { id: "udenfor", emoji: "🌳", label: "Udenfor" },
  { id: "indenfor", emoji: "🛋️", label: "Indenfor" },
  { id: "udviklende", emoji: "💡", label: "Udviklende" },
  { id: "kreativitet", emoji: "🎨", label: "Kreativitet" },
  { id: "naerhed", emoji: "❤️", label: "Nærhed & ro" },
  { id: "social", emoji: "🤝", label: "Med andre" },
];

export default function LegPage() {
  const { profile, babyAgeWeeks, babyAgeMonths } = useFamily();
  const childName = profile.children?.[0]?.name || "Baby";
  const [activeCategory, setActiveCategory] = useState("indenfor");

  if (profile.phase === "pregnant") {
    return (
      <div className="space-y-5">
        <div className="section-fade-in">
          <h1 className="text-[1.9rem] font-normal">Leg & aktiviteter</h1>
          <p className="label-upper mt-1">TILGÆNGELIG NÅR BARNET ER FØDT</p>
        </div>
        <div className="card-soft text-center py-12 section-fade-in" style={{ animationDelay: "80ms" }}>
          <span className="text-4xl mb-4 block">🎨</span>
          <p className="text-[1rem] font-normal mb-2">Leg venter forude</p>
          <p className="text-[0.8rem] text-muted-foreground max-w-xs mx-auto leading-relaxed">
            Når baby er født, får I aldersbaserede forslag til leg, stimulation og kontakt.
          </p>
        </div>
        <div className="h-20 md:h-0" />
      </div>
    );
  }

  const activeLeap = getActiveLeap(babyAgeWeeks);
  const ageLabel = babyAgeMonths >= 1 ? `${babyAgeMonths} MÅNEDER` : `${babyAgeWeeks} UGER`;

  return (
    <div className="space-y-5">
      <div className="section-fade-in">
        <h1 className="text-[1.9rem] font-normal">Leg & aktiviteter</h1>
        <p className="label-upper mt-1">{childName.toUpperCase()} · {ageLabel}</p>
      </div>

      {/* Leap context */}
      {activeLeap && (
        <div className="rounded-2xl p-4 section-fade-in" style={{
          animationDelay: "60ms",
          background: "hsl(var(--cream))",
          border: "1px solid hsl(var(--clay) / 0.2)",
        }}>
          <p className="text-[0.6rem] tracking-[0.14em] uppercase text-muted-foreground mb-1">🐯 TIGERSPRING NU</p>
          <p className="text-[0.85rem] font-medium mb-1">{activeLeap.emoji} {activeLeap.title}</p>
          <p className="text-[0.75rem] text-foreground/70 leading-relaxed">
            Aktiviteterne er tilpasset {childName}s aktuelle udviklingsfase.
          </p>
        </div>
      )}

      {/* Category pills */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide section-fade-in" style={{ animationDelay: "100ms" }}>
        {categories.map(cat => {
          const isActive = cat.id === activeCategory;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-[0.78rem] font-medium whitespace-nowrap transition-all shrink-0"
              style={{
                background: isActive ? "hsl(var(--sage-light))" : "hsl(var(--cream))",
                border: `1.5px solid ${isActive ? "hsl(var(--moss) / 0.4)" : "hsl(var(--stone-lighter))"}`,
                color: isActive ? "hsl(var(--moss))" : "hsl(var(--foreground) / 0.7)",
              }}
            >
              <span className="text-base">{cat.emoji}</span>
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* AI-generated activities for selected category */}
      <div className="section-fade-in" style={{ animationDelay: "140ms" }}>
        <AIActivitySuggestions key={activeCategory} category={activeCategory} />
      </div>

      <div className="h-20 md:h-0" />
    </div>
  );
}
