import { useState } from "react";
import { useFamily } from "@/context/FamilyContext";
import { pregnancyAppointments } from "@/lib/phaseData";
import { Check } from "lucide-react";
import { useTranslation } from "react-i18next";

function loadDone(): string[] {
  try { return JSON.parse(localStorage.getItem("melo-appt-done") || "[]"); } catch { return []; }
}
function saveDone(ids: string[]) {
  localStorage.setItem("melo-appt-done", JSON.stringify(ids));
}

const typeColors: Record<string, string> = {
  scan:   "hsl(var(--sage-light))",
  test:   "hsl(var(--clay-light))",
  visit:  "hsl(var(--cream))",
  course: "hsl(var(--stone-lighter))",
};

export function PregnancyAppointments() {
  const { currentWeek } = useFamily();
  const [done, setDone] = useState<string[]>(loadDone);
  const { t } = useTranslation();
  const typeLabels: Record<string, string> = {
    scan: t("appt.typeScan"), test: t("appt.typeTest"), visit: t("appt.typeVisit"), course: t("appt.typeCourse"),
  };

  const toggle = (id: string) => {
    const next = done.includes(id) ? done.filter(d => d !== id) : [...done, id];
    setDone(next);
    saveDone(next);
  };

  // Show: upcoming (not done) within next 8 weeks + already done in last 2 weeks
  const upcoming = pregnancyAppointments.filter(a =>
    !done.includes(a.id) && a.week >= currentWeek - 1 && a.week <= currentWeek + 8
  );
  const next = upcoming[0] || null;
  const later = upcoming.slice(1, 3);

  if (!next && later.length === 0) return null;

  return (
    <div className="card-soft section-fade-in space-y-3" style={{ animationDelay: "100ms" }}>
      <p className="text-[0.55rem] tracking-[0.18em] uppercase text-muted-foreground">{t("appt.upcoming")}</p>

      {next && (
        <div className="rounded-xl px-3 py-3 space-y-1.5" style={{ background: typeColors[next.type], border: "1px solid hsl(var(--stone-light))" }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-lg">{next.emoji}</span>
              <div>
                <p className="text-[0.82rem] font-semibold">{next.title}</p>
                <p className="text-[0.6rem] tracking-[0.1em] uppercase text-muted-foreground">{t("appt.week", { week: next.week })} · {typeLabels[next.type]}</p>
              </div>
            </div>
            <button
              onClick={() => toggle(next.id)}
              className="w-7 h-7 rounded-full flex items-center justify-center transition-all active:scale-90"
              style={{ background: "hsl(var(--stone-lighter))", border: "1.5px solid hsl(var(--stone-light))" }}
            >
              {done.includes(next.id) && <Check className="w-3.5 h-3.5" style={{ color: "hsl(var(--moss))" }} />}
            </button>
          </div>
          <p className="text-[0.75rem] text-muted-foreground leading-relaxed">{next.description}</p>
        </div>
      )}

      {later.map(a => (
        <div key={a.id} className="flex items-center gap-3 px-1">
          <span className="text-base w-6 text-center">{a.emoji}</span>
          <div className="flex-1">
            <p className="text-[0.78rem] font-medium">{a.title}</p>
            <p className="text-[0.62rem] text-muted-foreground">{t("appt.week", { week: a.week })}</p>
          </div>
          <button onClick={() => toggle(a.id)} className="w-6 h-6 rounded-full flex items-center justify-center transition-all" style={{ background: done.includes(a.id) ? "hsl(var(--moss))" : "hsl(var(--stone-lighter))", border: "1.5px solid hsl(var(--stone-light))" }}>
            {done.includes(a.id) && <Check className="w-3 h-3 text-white" />}
          </button>
        </div>
      ))}
    </div>
  );
}
