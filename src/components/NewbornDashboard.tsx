import { useRef } from "react";
import { useFamily } from "@/context/FamilyContext";
import { getBabyInsight, getKnowledgeCards, getActiveLeap, getNextLeap } from "@/lib/phaseData";
import { Moon, ChevronRight, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function NewbornDashboard() {
  const { babyAgeWeeks, babyAgeMonths, profile } = useFamily();
  const childName = profile.children?.[0]?.name || "Baby";
  const insight = getBabyInsight(babyAgeWeeks, childName);
  const navigate = useNavigate();

  return (
    <>
      <SleepBanner childName={childName} />
      <QuickStatsStrip babyAgeWeeks={babyAgeWeeks} babyAgeMonths={babyAgeMonths} childName={childName} />
      <KnowledgeCarousel ageWeeks={babyAgeWeeks} childName={childName} />
      <QuickLogCard onNavigate={() => navigate("/dagbog")} />
      <LeapBanner ageWeeks={babyAgeWeeks} childName={childName} />

      {/* Insight */}
      <div className="card-soft section-fade-in" style={{ animationDelay: "280ms" }}>
        <p className="label-upper mb-1">
          <span className="inline-block w-2 h-2 rounded-full mr-1.5" style={{ background: "hsl(var(--sage))" }} />
          {babyAgeMonths < 3 ? `${babyAgeWeeks} UGER` : `${babyAgeMonths} MÅNEDER`} · {childName.toUpperCase()}
        </p>
        <p className="text-[1.05rem] font-semibold mb-1.5 mt-2">{insight.title.includes("·") ? insight.title.split("·")[1]?.trim() : insight.title}</p>
        <p className="text-[0.8rem] text-muted-foreground leading-relaxed">{insight.insight}</p>
        <div className="mt-3 rounded-xl px-4 py-2.5" style={{ background: "hsl(var(--sage-light))" }}>
          <p className="text-[0.82rem]">💡 {insight.tip}</p>
        </div>
        <p className="text-[0.65rem] text-muted-foreground/50 mt-3 italic">
          Alle børn udvikler sig i eget tempo. Disse tips er baseret på gennemsnit — ikke forventninger.
        </p>
      </div>
    </>
  );
}

function SleepBanner({ childName }: { childName: string }) {
  return (
    <div
      className="rounded-2xl px-5 py-4 flex items-center gap-4 relative overflow-hidden section-fade-in"
      style={{
        background: "linear-gradient(135deg, hsl(var(--sage-light)), hsl(var(--sage) / 0.35))",
        border: "1px solid hsl(var(--sage) / 0.25)",
      }}
    >
      <span className="text-2xl flex-shrink-0 relative z-10">🌙</span>
      <div className="flex-1 relative z-10">
        <p className="text-[0.95rem] font-semibold" style={{ color: "hsl(var(--moss))" }}>
          {childName} sover
        </p>
        <p className="text-[0.7rem]" style={{ color: "hsl(var(--sage-dark))" }}>
          Startede kl. 22:18 · Dyb søvnfase
        </p>
      </div>
      <div
        className="w-2 h-2 rounded-full flex-shrink-0 relative z-10"
        style={{
          background: "hsl(var(--moss))",
          animation: "livePulse 2s infinite",
        }}
      />
      <span className="text-xl font-light relative z-10" style={{ color: "hsl(var(--moss))" }}>
        9t 24m
      </span>
    </div>
  );
}

function QuickStatsStrip({ babyAgeWeeks, babyAgeMonths, childName }: { babyAgeWeeks: number; babyAgeMonths: number; childName: string }) {
  const ageLabel = babyAgeMonths >= 1 ? `${babyAgeMonths} mdr.` : `${babyAgeWeeks} uger`;

  const stats = [
    { emoji: "🌙", value: "9t 24m", label: "Søvn i nat" },
    { emoji: "☀️", value: "2 lure", label: "I dag" },
    { emoji: "🍼", value: "6×", label: "Amning" },
    { emoji: "👶", value: ageLabel, label: childName },
  ];

  return (
    <div
      className="rounded-2xl border overflow-hidden section-fade-in"
      style={{ borderColor: "hsl(var(--stone-light))", animationDelay: "60ms" }}
    >
      <div className="grid grid-cols-4 divide-x divide-[hsl(var(--stone-lighter))]">
        {stats.map((s) => (
          <div key={s.label} className="flex flex-col items-center py-3 px-1.5 gap-0.5">
            <span className="text-base">{s.emoji}</span>
            <span className="text-[0.88rem] font-semibold">{s.value}</span>
            <span className="text-[0.52rem] tracking-[0.12em] uppercase text-muted-foreground">{s.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function KnowledgeCarousel({ ageWeeks, childName }: { ageWeeks: number; childName: string }) {
  const cards = getKnowledgeCards(ageWeeks, childName);
  const scrollRef = useRef<HTMLDivElement>(null);

  const colorMap: Record<string, { bg: string; border: string }> = {
    sage: { bg: "hsl(var(--sage-light))", border: "hsl(var(--sage) / 0.2)" },
    clay: { bg: "hsl(var(--clay-light))", border: "hsl(var(--clay) / 0.2)" },
    moss: { bg: "hsl(var(--cream))", border: "hsl(var(--sage) / 0.15)" },
  };

  return (
    <div className="section-fade-in" style={{ animationDelay: "120ms" }}>
      <p className="text-[1rem] font-semibold mb-3">Vidste du? 🧠</p>
      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 snap-x snap-mandatory scrollbar-hide"
        style={{ scrollbarWidth: "none" }}
      >
        {cards.map((card, i) => {
          const colors = colorMap[card.color] || colorMap.sage;
          return (
            <div
              key={i}
              className="flex-shrink-0 w-[240px] rounded-2xl p-4 snap-start"
              style={{ background: colors.bg, border: `1px solid ${colors.border}` }}
            >
              <span className="text-2xl block mb-2">{card.emoji}</span>
              <p className="text-[0.56rem] tracking-[0.14em] uppercase text-muted-foreground mb-1">{card.category}</p>
              <p className="text-[0.88rem] font-semibold mb-1.5 leading-snug">{card.title}</p>
              <p className="text-[0.75rem] text-foreground/70 leading-relaxed">{card.body}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function QuickLogCard({ onNavigate }: { onNavigate: () => void }) {
  const logButtons = [
    { icon: "🤱", label: "Amning" },
    { icon: "🧷", label: "Ble" },
    { icon: "😴", label: "Søvn" },
    { icon: "💛", label: "Råd" },
  ];

  return (
    <div className="section-fade-in" style={{ animationDelay: "200ms" }}>
      <p className="text-[1rem] font-semibold mb-3">Hurtig log</p>
      <div className="grid grid-cols-4 gap-2.5">
        {logButtons.map((btn) => (
          <button
            key={btn.label}
            onClick={onNavigate}
            className="flex flex-col items-center gap-1.5 py-4 px-2 rounded-2xl border transition-all active:scale-95 hover:-translate-y-0.5 hover:shadow-md"
            style={{ borderColor: "hsl(var(--stone-light))", background: "hsl(var(--warm-white))" }}
          >
            <span className="text-2xl">{btn.icon}</span>
            <span className="text-[0.62rem] tracking-[0.06em] uppercase text-muted-foreground">{btn.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function LeapBanner({ ageWeeks, childName }: { ageWeeks: number; childName: string }) {
  const activeLeap = getActiveLeap(ageWeeks);
  const nextLeap = getNextLeap(ageWeeks);

  if (activeLeap) {
    return (
      <div
        className="rounded-2xl p-4 section-fade-in"
        style={{
          background: "linear-gradient(135deg, hsl(var(--clay) / 0.12), hsl(var(--clay) / 0.04))",
          border: "1px solid hsl(var(--clay) / 0.25)",
          animationDelay: "240ms",
        }}
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "hsl(var(--clay-light))" }}>
            <Zap className="w-5 h-5" style={{ color: "hsl(var(--clay))" }} />
          </div>
          <div>
            <p className="text-[0.58rem] tracking-[0.14em] uppercase" style={{ color: "hsl(var(--bark))" }}>Tigerspring nu</p>
            <p className="text-[0.92rem] font-semibold">{activeLeap.emoji} {activeLeap.title}</p>
          </div>
        </div>
        <p className="text-[0.78rem] text-foreground/70 leading-relaxed mb-2">{activeLeap.description}</p>
        <div className="flex flex-wrap gap-1.5">
          {activeLeap.signs.map((s, i) => (
            <span
              key={i}
              className="text-[0.62rem] px-2 py-0.5 rounded-full"
              style={{ background: "hsl(var(--clay) / 0.12)", color: "hsl(var(--bark))" }}
            >
              {s}
            </span>
          ))}
        </div>
      </div>
    );
  }

  if (nextLeap) {
    const weeksUntil = nextLeap.weekStart - ageWeeks;
    return (
      <div
        className="rounded-2xl p-4 flex items-center gap-3 section-fade-in"
        style={{
          background: "hsl(var(--cream))",
          border: "1px solid hsl(var(--stone-light))",
          animationDelay: "240ms",
        }}
      >
        <span className="text-xl">{nextLeap.emoji}</span>
        <div className="flex-1">
          <p className="text-[0.82rem] font-medium">Næste tigerspring: {nextLeap.title}</p>
          <p className="text-[0.68rem] text-muted-foreground">Om ca. {weeksUntil} {weeksUntil === 1 ? "uge" : "uger"}</p>
        </div>
        <ChevronRight className="w-4 h-4 text-muted-foreground" />
      </div>
    );
  }

  return null;
}
