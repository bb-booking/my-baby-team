import { useState } from "react";
import { useFamily } from "@/context/FamilyContext";
import { developmentalLeaps, type DevelopmentalLeap } from "@/lib/phaseData";
import { Check, ChevronRight, ChevronLeft, AlertCircle, Lightbulb, Trophy, Star, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import confetti from "canvas-confetti";

const STORAGE_KEY = "lille-completed-leaps";

function useCompletedLeaps() {
  const [completed, setCompleted] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch { return []; }
  });

  const markCompleted = (id: string) => {
    setCompleted(prev => {
      if (prev.includes(id)) return prev;
      const next = [...prev, id];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      confetti({
        particleCount: 80, spread: 70, origin: { y: 0.5 },
        colors: ["#5a7a50", "#c4a97d", "#8fae7e", "#d4c4a8", "#e8dfd0"],
        scalar: 0.9, gravity: 0.8,
      });
      return next;
    });
  };

  return { completed, markCompleted };
}

function getLeapStatus(ageWeeks: number, completedLeaps: string[], leap: DevelopmentalLeap) {
  if (completedLeaps.includes(leap.id)) return "completed";
  if (ageWeeks >= leap.weekStart - 1 && ageWeeks <= leap.weekEnd + 2) return "active";
  if (ageWeeks > leap.weekEnd + 2) return "completed";
  return "upcoming";
}

// Color palette per leap for visual distinctiveness
const leapColors = [
  { bg: "hsl(var(--clay-light))", accent: "hsl(var(--clay))", gradient: "linear-gradient(135deg, hsl(var(--clay-light)), hsl(var(--cream)))" },
  { bg: "hsl(var(--sage-light))", accent: "hsl(var(--sage))", gradient: "linear-gradient(135deg, hsl(var(--sage-light)), hsl(var(--cream)))" },
  { bg: "hsl(var(--sand-light))", accent: "hsl(var(--sand))", gradient: "linear-gradient(135deg, hsl(var(--sand-light)), hsl(var(--cream)))" },
  { bg: "hsl(var(--clay-light))", accent: "hsl(var(--bark))", gradient: "linear-gradient(135deg, hsl(var(--clay-light)), hsl(var(--sand-light)))" },
  { bg: "hsl(var(--sage-light))", accent: "hsl(var(--moss))", gradient: "linear-gradient(135deg, hsl(var(--sage-light)), hsl(var(--sand-light)))" },
  { bg: "hsl(var(--cream))", accent: "hsl(var(--clay))", gradient: "linear-gradient(135deg, hsl(var(--cream)), hsl(var(--clay-light)))" },
  { bg: "hsl(var(--sand-light))", accent: "hsl(var(--sage))", gradient: "linear-gradient(135deg, hsl(var(--sand-light)), hsl(var(--sage-light)))" },
  { bg: "hsl(var(--sage-light))", accent: "hsl(var(--sage))", gradient: "linear-gradient(135deg, hsl(var(--sage-light)), hsl(var(--cream)))" },
];

function LeapCard({ leap, index, status, onMarkCompleted, ageWeeks }: {
  leap: DevelopmentalLeap;
  index: number;
  status: "completed" | "active" | "upcoming";
  onMarkCompleted: () => void;
  ageWeeks: number;
}) {
  const color = leapColors[index % leapColors.length];
  const isActive = status === "active";
  const isCompleted = status === "completed";
  const isUpcoming = status === "upcoming";
  const weeksUntil = leap.weekStart - ageWeeks;

  return (
    <div className="space-y-4">
      {/* Main card */}
      <div
        className="rounded-3xl overflow-hidden"
        style={{
          background: color.gradient,
          border: isActive ? `2px solid ${color.accent}` : "1px solid hsl(var(--stone-lighter))",
        }}
      >
        {/* Header */}
        <div className="px-5 pt-5 pb-3">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{leap.emoji}</span>
              <div>
                <p className="text-[0.58rem] tracking-[0.16em] uppercase text-muted-foreground">
                  {isActive ? "AKTIVT TIGERSPRING" : isCompleted ? "GENNEMFØRT" : `OM ${weeksUntil} UGER`}
                </p>
                <h2 className="text-[1.3rem] font-semibold leading-tight">{leap.title}</h2>
              </div>
            </div>
            {isCompleted && (
              <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: "hsl(var(--sage))" }}>
                <Check className="w-4 h-4 text-white" />
              </div>
            )}
          </div>

          <p className="text-[0.6rem] tracking-[0.1em] uppercase text-muted-foreground mb-1">
            Uge {leap.weekStart}–{leap.weekEnd}
          </p>
        </div>

        {/* Description */}
        <div className="px-5 pb-4">
          <p className="text-[0.88rem] leading-relaxed text-foreground/80">
            {leap.description}
          </p>
        </div>

        {/* Signs */}
        <div className="px-5 pb-4">
          <div className="flex items-center gap-1.5 mb-2">
            <AlertCircle className="w-3.5 h-3.5 text-muted-foreground" />
            <p className="text-[0.62rem] tracking-[0.14em] uppercase font-medium text-muted-foreground">Tegn at det er i gang</p>
          </div>
          <div className="space-y-1.5">
            {leap.signs.map((sign, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: color.accent }} />
                <p className="text-[0.82rem] text-foreground/70">{sign}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Tips */}
        <div className="px-5 pb-5">
          <div className="flex items-center gap-1.5 mb-2">
            <Lightbulb className="w-3.5 h-3.5 text-muted-foreground" />
            <p className="text-[0.62rem] tracking-[0.14em] uppercase font-medium text-muted-foreground">Gode råd</p>
          </div>
          <div className="space-y-2">
            {leap.tips.map((tip, i) => (
              <div key={i} className="rounded-xl px-3 py-2.5" style={{ background: "hsl(var(--warm-white) / 0.7)" }}>
                <p className="text-[0.82rem] leading-snug text-foreground/80">💡 {tip}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Mark as completed */}
        {!isCompleted && (
          <div className="px-5 pb-5">
            <button
              onClick={onMarkCompleted}
              className="w-full py-3 rounded-2xl text-[0.85rem] font-medium transition-all active:scale-[0.97]"
              style={{
                background: isActive ? "hsl(var(--moss))" : "hsl(var(--stone-lighter))",
                color: isActive ? "white" : "hsl(var(--bark))",
              }}
            >
              {isActive ? "✨ Markér som opnået" : "Markér som opnået tidligt"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function KalenderPage() {
  const { profile, currentWeek, babyAgeWeeks } = useFamily();
  const isPregnant = profile.phase === "pregnant";
  const { completed, markCompleted } = useCompletedLeaps();

  // Find current/next leap index
  const getCurrentLeapIndex = () => {
    for (let i = 0; i < developmentalLeaps.length; i++) {
      const status = getLeapStatus(babyAgeWeeks, completed, developmentalLeaps[i]);
      if (status === "active") return i;
      if (status === "upcoming") return i;
    }
    return developmentalLeaps.length - 1;
  };

  const [viewIndex, setViewIndex] = useState(getCurrentLeapIndex);
  const [showTimeline, setShowTimeline] = useState(false);

  const canPrev = viewIndex > 0;
  const canNext = viewIndex < developmentalLeaps.length - 1;

  if (isPregnant) {
    const milestones = [
      { week: 8, label: "Første scanning", emoji: "🩺" },
      { week: 12, label: "Nakkefoldsscanning", emoji: "🔬" },
      { week: 13, label: "1. trimester slut", emoji: "🎉" },
      { week: 20, label: "Misdannelsesscanning", emoji: "🩺" },
      { week: 28, label: "3. trimester start", emoji: "🏠" },
      { week: 32, label: "Fødselsforberedelse", emoji: "📚" },
      { week: 36, label: "Ugentlige tjek", emoji: "🩺" },
      { week: 37, label: "Fuldbåren", emoji: "✅" },
      { week: 40, label: "Terminsdato", emoji: "🎉" },
    ];

    return (
      <div className="space-y-5">
        <div className="section-fade-in">
          <h1 className="text-[1.9rem] font-normal">Kalender</h1>
          <p className="label-upper mt-1">MILEPÆLE I GRAVIDITETEN</p>
        </div>
        <div className="space-y-2">
          {milestones.map((m, i) => {
            const isPast = m.week <= currentWeek;
            const isCurrent = Math.abs(m.week - currentWeek) <= 1;
            return (
              <div key={i}
                className={`card-soft flex items-center gap-3 section-fade-in ${isCurrent ? "border-l-4" : ""}`}
                style={{
                  animationDelay: `${i * 60}ms`,
                  opacity: isPast && !isCurrent ? 0.6 : 1,
                  borderLeftColor: isCurrent ? "hsl(var(--moss))" : undefined,
                }}
              >
                <span className="text-xl flex-shrink-0">{m.emoji}</span>
                <div className="flex-1">
                  <p className="text-[0.85rem] font-medium">{m.label}</p>
                  <p className="text-[0.65rem] text-muted-foreground">
                    Uge {m.week}{isPast ? " · ✓ Passeret" : isCurrent ? " · Nu" : ""}
                  </p>
                </div>
                {isPast && <span className="text-[0.7rem]" style={{ color: "hsl(var(--moss))" }}>✓</span>}
              </div>
            );
          })}
        </div>
        <div className="h-20 md:h-0" />
      </div>
    );
  }

  // Baby phase — tigerspring focus
  const currentLeap = developmentalLeaps[viewIndex];
  const currentStatus = getLeapStatus(babyAgeWeeks, completed, currentLeap);

  // Progress dots
  const leapStatuses = developmentalLeaps.map(l => getLeapStatus(babyAgeWeeks, completed, l));

  const completedCount = leapStatuses.filter(s => s === "completed").length;
  const totalLeaps = developmentalLeaps.length;
  const progressPct = Math.round((completedCount / totalLeaps) * 100);
  const [showTimeline, setShowTimeline] = useState(false);

  // XP system
  const xpPerLeap = 125;
  const totalXP = completedCount * xpPerLeap;
  const maxXP = totalLeaps * xpPerLeap;
  const level = completedCount === 0 ? 1 : completedCount <= 2 ? 2 : completedCount <= 4 ? 3 : completedCount <= 6 ? 4 : 5;
  const levelTitles = ["", "Ny forælder", "Rutineret", "Erfaren", "Veteran", "Mester"];

  return (
    <div className="space-y-5">
      <div className="section-fade-in">
        <h1 className="text-[1.9rem] font-normal">Tigerspring</h1>
        <p className="label-upper mt-1">UDVIKLING OG MILEPÆLE</p>
      </div>

      {/* Gamification banner */}
      <div
        className="rounded-2xl p-4 section-fade-in"
        style={{ animationDelay: "30ms", background: "linear-gradient(135deg, hsl(var(--sage-light)), hsl(var(--cream)))" }}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "hsl(var(--moss))" }}>
              <Trophy className="w-4.5 h-4.5 text-white" />
            </div>
            <div>
              <p className="text-[0.72rem] font-semibold">Level {level} · {levelTitles[level]}</p>
              <p className="text-[0.6rem] text-muted-foreground">{totalXP} / {maxXP} XP</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[1.1rem] font-bold" style={{ color: "hsl(var(--moss))" }}>{completedCount}/{totalLeaps}</p>
            <p className="text-[0.55rem] text-muted-foreground uppercase tracking-wider">Opnået</p>
          </div>
        </div>

        {/* XP bar */}
        <div className="w-full h-2.5 rounded-full overflow-hidden" style={{ background: "hsl(var(--stone-lighter))" }}>
          <div
            className="h-full rounded-full transition-all duration-700 ease-out"
            style={{ width: `${progressPct}%`, background: "linear-gradient(90deg, hsl(var(--sage)), hsl(var(--moss)))" }}
          />
        </div>

        {/* Toggle timeline */}
        <button
          onClick={() => setShowTimeline(v => !v)}
          className="w-full flex items-center justify-center gap-1 mt-3 text-[0.72rem] font-medium transition-colors"
          style={{ color: "hsl(var(--moss))" }}
        >
          {showTimeline ? "Skjul tidslinje" : "Se alle tigerspring"}
          {showTimeline ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Timeline */}
      {showTimeline && (
        <div className="rounded-2xl p-4 space-y-0 section-fade-in" style={{ background: "hsl(var(--warm-white))" }}>
          {developmentalLeaps.map((leap, i) => {
            const status = leapStatuses[i];
            const isLast = i === totalLeaps - 1;
            const color = leapColors[i % leapColors.length];
            return (
              <button
                key={leap.id}
                onClick={() => { setViewIndex(i); setShowTimeline(false); }}
                className="w-full flex items-start gap-3 text-left group"
              >
                {/* Vertical line + node */}
                <div className="flex flex-col items-center flex-shrink-0">
                  <div
                    className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center transition-all border-2",
                      status === "completed" ? "border-transparent" : status === "active" ? "border-current animate-pulse" : "border-transparent"
                    )}
                    style={{
                      background: status === "completed"
                        ? "hsl(var(--sage))"
                        : status === "active"
                          ? color.bg
                          : "hsl(var(--stone-lighter))",
                      color: status === "active" ? color.accent : undefined,
                    }}
                  >
                    {status === "completed" ? (
                      <Check className="w-3.5 h-3.5 text-white" />
                    ) : status === "active" ? (
                      <Star className="w-3.5 h-3.5" style={{ color: color.accent }} />
                    ) : (
                      <span className="text-[0.65rem]">{leap.emoji}</span>
                    )}
                  </div>
                  {!isLast && (
                    <div
                      className="w-0.5 h-8 my-0.5"
                      style={{
                        background: status === "completed" ? "hsl(var(--sage))" : "hsl(var(--stone-lighter))",
                      }}
                    />
                  )}
                </div>

                {/* Content */}
                <div className={cn("pb-4 pt-1", !isLast && "border-b-0")}>
                  <div className="flex items-center gap-2">
                    <p className={cn(
                      "text-[0.82rem] font-medium leading-tight",
                      status === "upcoming" && "text-muted-foreground"
                    )}>
                      {leap.title}
                    </p>
                    {status === "completed" && (
                      <span className="text-[0.55rem] px-1.5 py-0.5 rounded-full font-medium" style={{ background: "hsl(var(--sage-light))", color: "hsl(var(--moss))" }}>
                        +{xpPerLeap} XP
                      </span>
                    )}
                  </div>
                  <p className="text-[0.65rem] text-muted-foreground mt-0.5">
                    Uge {leap.weekStart}–{leap.weekEnd}
                    {status === "active" && " · Aktivt nu"}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between section-fade-in" style={{ animationDelay: "40ms" }}>
        <button
          onClick={() => canPrev && setViewIndex(v => v - 1)}
          disabled={!canPrev}
          className="p-2 rounded-xl hover:bg-[hsl(var(--stone-lighter))] transition-colors active:scale-95 disabled:opacity-30"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {/* Dots */}
        <div className="flex gap-1.5">
          {developmentalLeaps.map((_, i) => (
            <button
              key={i}
              onClick={() => setViewIndex(i)}
              className={cn(
                "w-2.5 h-2.5 rounded-full transition-all",
                i === viewIndex ? "scale-125" : "hover:scale-110"
              )}
              style={{
                background: i === viewIndex
                  ? "hsl(var(--moss))"
                  : leapStatuses[i] === "completed"
                    ? "hsl(var(--sage))"
                    : "hsl(var(--stone-lighter))",
              }}
            />
          ))}
        </div>

        <button
          onClick={() => canNext && setViewIndex(v => v + 1)}
          disabled={!canNext}
          className="p-2 rounded-xl hover:bg-[hsl(var(--stone-lighter))] transition-colors active:scale-95 disabled:opacity-30"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Leap Card */}
      <div className="section-fade-in" style={{ animationDelay: "80ms" }}>
        <LeapCard
          leap={currentLeap}
          index={viewIndex}
          status={currentStatus}
          onMarkCompleted={() => markCompleted(currentLeap.id)}
          ageWeeks={babyAgeWeeks}
        />
      </div>

      {/* Peek at next */}
      {canNext && (
        <button
          onClick={() => setViewIndex(v => v + 1)}
          className="w-full card-soft flex items-center gap-3 transition-all active:scale-[0.98] section-fade-in"
          style={{ animationDelay: "120ms" }}
        >
          <span className="text-xl">{developmentalLeaps[viewIndex + 1].emoji}</span>
          <div className="flex-1 text-left">
            <p className="text-[0.6rem] tracking-[0.12em] uppercase text-muted-foreground">Næste tigerspring</p>
            <p className="text-[0.85rem] font-medium">{developmentalLeaps[viewIndex + 1].title}</p>
            <p className="text-[0.65rem] text-muted-foreground">Uge {developmentalLeaps[viewIndex + 1].weekStart}</p>
          </div>
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        </button>
      )}

      <div className="h-20 md:h-0" />
    </div>
  );
}
