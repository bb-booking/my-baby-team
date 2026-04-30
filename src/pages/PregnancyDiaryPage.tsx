import { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, TrendingUp, Calendar, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  usePregnancyDiary,
  getPersonalizedAdvice,
  MOOD_OPTIONS,
  ENERGY_OPTIONS,
  SYMPTOMS,
  type DiaryEntry,
} from "@/hooks/usePregnancyDiary";
import { CheckInCard } from "@/components/PregnancyCheckIn";
import { useFamily } from "@/context/FamilyContext";

// ── Mood trend chart (simple bar chart) ───────────────────────────────────────
function MoodChart({ entries }: { entries: DiaryEntry[] }) {
  const last14 = entries.slice(0, 14).reverse();
  if (last14.length < 2) return null;

  return (
    <div className="rounded-2xl p-4 space-y-3" style={{ background: "hsl(var(--warm-white))", border: "1px solid hsl(var(--stone-light))" }}>
      <div className="flex items-center gap-2">
        <TrendingUp className="w-4 h-4" style={{ color: "hsl(var(--moss))" }} />
        <p className="text-[0.82rem] font-semibold">Dit humør de seneste dage</p>
      </div>
      <div className="flex items-end gap-1 h-16">
        {last14.map((e, i) => {
          const pct = (e.mood / 5) * 100;
          const moodEmoji = MOOD_OPTIONS.find(m => m.value === e.mood)?.emoji;
          return (
            <div key={e.id} className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full rounded-t-sm transition-all" style={{
                height: `${pct}%`,
                background: e.mood >= 4
                  ? "hsl(var(--moss))"
                  : e.mood === 3
                  ? "hsl(var(--sage))"
                  : "hsl(var(--clay))",
                minHeight: "4px",
              }} />
              <span className="text-[0.5rem] text-muted-foreground">
                {new Date(e.date).getDate()}
              </span>
            </div>
          );
        })}
      </div>
      <div className="flex items-center gap-3 text-[0.65rem] text-muted-foreground">
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full inline-block" style={{ background: "hsl(var(--moss))" }} /> God/Fantastisk</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full inline-block" style={{ background: "hsl(var(--sage))" }} /> Okay</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full inline-block" style={{ background: "hsl(var(--clay))" }} /> Svær</span>
      </div>
    </div>
  );
}

// ── Stats summary ─────────────────────────────────────────────────────────────
function StatsSummary({ entries }: { entries: DiaryEntry[] }) {
  if (entries.length < 3) return null;

  const avgMood = entries.reduce((s, e) => s + e.mood, 0) / entries.length;
  const avgEnergy = entries.reduce((s, e) => s + e.energy, 0) / entries.length;

  const symptomCounts: Record<string, number> = {};
  entries.forEach(e => e.symptoms.forEach(s => { symptomCounts[s] = (symptomCounts[s] || 0) + 1; }));
  const topSymptom = Object.entries(symptomCounts).sort((a, b) => b[1] - a[1])[0];
  const topSymptomInfo = topSymptom ? SYMPTOMS.find(s => s.key === topSymptom[0]) : null;

  const bestMoodDay = entries.reduce((best, e) => e.mood > best.mood ? e : best, entries[0]);
  const bestMoodEmoji = MOOD_OPTIONS.find(m => m.value === bestMoodDay.mood)?.emoji;

  return (
    <div className="grid grid-cols-3 gap-2">
      <div className="rounded-2xl p-3.5 text-center space-y-1" style={{ background: "hsl(var(--sage-light))" }}>
        <p className="text-2xl">{MOOD_OPTIONS.find(m => m.value === Math.round(avgMood))?.emoji || "😐"}</p>
        <p className="text-[0.72rem] font-semibold" style={{ color: "hsl(var(--moss))" }}>Gns. humør</p>
        <p className="text-[0.62rem] text-muted-foreground">{avgMood.toFixed(1)} / 5</p>
      </div>
      <div className="rounded-2xl p-3.5 text-center space-y-1" style={{ background: "hsl(var(--clay-light))" }}>
        <p className="text-2xl">{avgEnergy >= 2.5 ? "⚡" : avgEnergy >= 1.5 ? "🔋" : "😴"}</p>
        <p className="text-[0.72rem] font-semibold" style={{ color: "hsl(var(--bark))" }}>Gns. energi</p>
        <p className="text-[0.62rem] text-muted-foreground">{avgEnergy.toFixed(1)} / 3</p>
      </div>
      <div className="rounded-2xl p-3.5 text-center space-y-1" style={{ background: "hsl(var(--stone-lighter))" }}>
        <p className="text-2xl">{topSymptomInfo?.icon || "🌿"}</p>
        <p className="text-[0.72rem] font-semibold">Hyppigst</p>
        <p className="text-[0.62rem] text-muted-foreground leading-tight">{topSymptomInfo?.label || "Ingen"}</p>
      </div>
    </div>
  );
}

// ── Entry card ────────────────────────────────────────────────────────────────
function EntryCard({ entry, expanded, onToggle }: { entry: DiaryEntry; expanded: boolean; onToggle: () => void }) {
  const { currentWeek } = useFamily();
  const moodOpt = MOOD_OPTIONS.find(m => m.value === entry.mood);
  const energyOpt = ENERGY_OPTIONS.find(e => e.value === entry.energy);
  const advice = expanded ? getPersonalizedAdvice(entry.mood, entry.energy, entry.symptoms, entry.week) : [];

  const dateStr = new Date(entry.date).toLocaleDateString("da-DK", {
    weekday: "long", day: "numeric", month: "long",
  });

  return (
    <div
      className="rounded-2xl overflow-hidden transition-all"
      style={{ background: "hsl(var(--warm-white))", border: "1px solid hsl(var(--stone-light))" }}
    >
      <button onClick={onToggle} className="w-full flex items-center gap-3 px-4 py-3.5 text-left transition-all active:bg-[hsl(var(--stone-lighter))]">
        <div className="w-10 h-10 rounded-full flex items-center justify-center text-xl flex-shrink-0" style={{ background: "hsl(var(--stone-lighter))" }}>
          {moodOpt?.emoji}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[0.82rem] font-semibold capitalize">{dateStr}</p>
          <p className="text-[0.68rem] text-muted-foreground">
            {moodOpt?.label} · {energyOpt?.label} energi
            {entry.symptoms.length > 0 && ` · ${entry.symptoms.map(s => SYMPTOMS.find(sym => sym.key === s)?.icon).join("")}`}
          </p>
        </div>
        <span className="text-[0.65rem] px-2 py-0.5 rounded-full flex-shrink-0" style={{ background: "hsl(var(--stone-lighter))", color: "hsl(var(--muted-foreground))" }}>
          Uge {entry.week}
        </span>
      </button>

      {expanded && (
        <div className="px-4 pb-4 space-y-3 border-t" style={{ borderColor: "hsl(var(--stone-lighter))" }}>
          {/* Note */}
          {entry.note && (
            <div className="pt-3">
              <p className="text-[0.65rem] tracking-wide uppercase text-muted-foreground mb-1">Note</p>
              <p className="text-[0.78rem] leading-relaxed">{entry.note}</p>
            </div>
          )}
          {/* Cravings */}
          {entry.cravings && (
            <div>
              <p className="text-[0.65rem] tracking-wide uppercase text-muted-foreground mb-1">Cravings</p>
              <p className="text-[0.78rem]">🍕 {entry.cravings}</p>
            </div>
          )}
          {/* Symptoms */}
          {entry.symptoms.length > 0 && (
            <div>
              <p className="text-[0.65rem] tracking-wide uppercase text-muted-foreground mb-2">Symptomer</p>
              <div className="flex flex-wrap gap-1.5">
                {entry.symptoms.map(s => {
                  const sym = SYMPTOMS.find(sym => sym.key === s);
                  return sym ? (
                    <span key={s} className="text-[0.68rem] px-2.5 py-1 rounded-full flex items-center gap-1"
                      style={{ background: "hsl(var(--stone-lighter))" }}>
                      {sym.icon} {sym.label}
                    </span>
                  ) : null;
                })}
              </div>
            </div>
          )}
          {/* Advice */}
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <Sparkles className="w-3 h-3" style={{ color: "hsl(var(--moss))" }} />
              <p className="text-[0.65rem] tracking-wide uppercase text-muted-foreground">Råd til denne dag</p>
            </div>
            <div className="space-y-2">
              {advice.map((a, i) => (
                <div key={i} className="rounded-xl px-3 py-2.5 flex items-start gap-2" style={{ background: a.bg }}>
                  <span className="text-sm flex-shrink-0">{a.icon}</span>
                  <div>
                    <p className="text-[0.72rem] font-semibold">{a.title}</p>
                    <p className="text-[0.68rem] text-muted-foreground leading-snug mt-0.5">{a.text}</p>
                    {a.action && (
                      <Link to={a.action.path} className="text-[0.65rem] font-medium mt-1 inline-block" style={{ color: "hsl(var(--moss))" }}>
                        {a.action.label} →
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function PregnancyDiaryPage() {
  const { entries } = usePregnancyDiary();
  const [expandedId, setExpandedId] = useState<string | null>(entries[0]?.id ?? null);
  const [view, setView] = useState<"historik" | "tendenser">("historik");

  return (
    <div className="space-y-5 pb-6">
      {/* Header */}
      <div className="section-fade-in">
        <div className="flex items-center gap-3 mb-1">
          <Link to="/" className="w-8 h-8 flex items-center justify-center rounded-full transition-colors active:bg-[hsl(var(--stone-lighter))]">
            <ChevronLeft className="w-5 h-5 text-muted-foreground" />
          </Link>
          <div>
            <h1 className="text-[1.9rem] font-normal leading-tight">Din dagbog</h1>
            <p className="text-[0.72rem] text-muted-foreground">{entries.length} indlæg · under graviditeten</p>
          </div>
        </div>
      </div>

      {/* Today check-in */}
      <CheckInCard />

      {/* View toggle */}
      {entries.length > 0 && (
        <div className="flex p-1 rounded-xl gap-1 section-fade-in" style={{ background: "hsl(var(--stone-lighter))", animationDelay: "40ms" }}>
          <button
            onClick={() => setView("historik")}
            className={cn("flex-1 py-2 rounded-lg text-[0.72rem] font-medium transition-all flex items-center justify-center gap-1.5",
              view === "historik" ? "bg-background shadow-sm" : "text-muted-foreground")}
          >
            <Calendar className="w-3.5 h-3.5" /> Historik
          </button>
          <button
            onClick={() => setView("tendenser")}
            className={cn("flex-1 py-2 rounded-lg text-[0.72rem] font-medium transition-all flex items-center justify-center gap-1.5",
              view === "tendenser" ? "bg-background shadow-sm" : "text-muted-foreground")}
          >
            <TrendingUp className="w-3.5 h-3.5" /> Tendenser
          </button>
        </div>
      )}

      {entries.length === 0 && (
        <div className="text-center py-12 rounded-2xl section-fade-in" style={{ background: "hsl(var(--warm-white))", border: "1px solid hsl(var(--stone-light))" }}>
          <p className="text-3xl mb-3">🌿</p>
          <p className="text-[0.9rem] font-medium mb-1">Din dagbog er klar</p>
          <p className="text-[0.75rem] text-muted-foreground">Begynd med et dagligt tjek-in ovenfor</p>
        </div>
      )}

      {/* Tendenser view */}
      {view === "tendenser" && entries.length >= 2 && (
        <div className="space-y-4 section-fade-in">
          <StatsSummary entries={entries} />
          <MoodChart entries={entries} />
        </div>
      )}

      {/* Historik view */}
      {view === "historik" && entries.length > 0 && (
        <div className="space-y-2.5 section-fade-in" style={{ animationDelay: "60ms" }}>
          {entries.map(entry => (
            <EntryCard
              key={entry.id}
              entry={entry}
              expanded={expandedId === entry.id}
              onToggle={() => setExpandedId(expandedId === entry.id ? null : entry.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
