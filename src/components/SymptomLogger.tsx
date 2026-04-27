import { useState } from "react";
import { useFamily } from "@/context/FamilyContext";
import { useTranslation } from "react-i18next";

const SYMPTOM_KEYS = [
  { key: "nausea",    tKey: "symptomLogger.nausea",    emoji: "🤢" },
  { key: "tired",     tKey: "symptomLogger.tired",     emoji: "😴" },
  { key: "back",      tKey: "symptomLogger.back",      emoji: "🔙" },
  { key: "heartburn", tKey: "symptomLogger.heartburn", emoji: "🔥" },
  { key: "movement",  tKey: "symptomLogger.movement",  emoji: "🦋" },
  { key: "mood",      tKey: "symptomLogger.mood",      emoji: "🌊" },
  { key: "swelling",  tKey: "symptomLogger.swelling",  emoji: "💧" },
  { key: "good",      tKey: "symptomLogger.goodDay",   emoji: "☀️" },
];

function getTodayKey() {
  return `melo-symptoms-${new Date().toISOString().slice(0, 10)}`;
}

function loadToday(): string[] {
  try { return JSON.parse(localStorage.getItem(getTodayKey()) || "[]"); } catch { return []; }
}

function saveToday(symptoms: string[]) {
  localStorage.setItem(getTodayKey(), JSON.stringify(symptoms));
}

export function SymptomLogger() {
  const { profile } = useFamily();
  const isMor = profile.role === "mor";
  const [active, setActive] = useState<string[]>(loadToday);
  const { t } = useTranslation();

  if (!isMor) return null;

  const toggle = (key: string) => {
    const next = active.includes(key) ? active.filter(k => k !== key) : [...active, key];
    setActive(next);
    saveToday(next);
  };

  return (
    <div className="card-soft section-fade-in" style={{ animationDelay: "80ms" }}>
      <p className="text-[0.55rem] tracking-[0.18em] uppercase text-muted-foreground mb-3">{t("symptomLogger.howFeeling")}</p>
      <div className="grid grid-cols-4 gap-2">
        {SYMPTOM_KEYS.map(s => {
          const on = active.includes(s.key);
          return (
            <button
              key={s.key}
              onClick={() => toggle(s.key)}
              className="flex flex-col items-center gap-1 py-2.5 rounded-xl transition-all active:scale-95"
              style={{
                background: on ? "hsl(var(--clay-light))" : "hsl(var(--stone-lighter))",
                border: on ? "1.5px solid hsl(var(--clay) / 0.4)" : "1.5px solid transparent",
              }}
            >
              <span className="text-lg">{s.emoji}</span>
              <span className="text-[0.55rem] text-center leading-tight text-muted-foreground">{t(s.tKey)}</span>
            </button>
          );
        })}
      </div>
      {active.length > 0 && (
        <p className="text-[0.68rem] text-muted-foreground mt-2 text-center">
          {active.length === 1 ? t("symptomLogger.noted1") : t("symptomLogger.notedMany", { count: active.length })}
        </p>
      )}
    </div>
  );
}
