import { useState } from "react";
import { useFamily } from "@/context/FamilyContext";
import { getBabyInsight } from "@/lib/phaseData";
import { Moon, Baby, Droplets, FileText, Play, Square } from "lucide-react";

export function NewbornDashboard() {
  const { babyAgeWeeks } = useFamily();
  const insight = getBabyInsight(babyAgeWeeks);

  return (
    <>
      {/* Auto-sleep banner */}
      <AutoSleepBanner />

      {/* Quick log buttons */}
      <QuickLogCard />

      {/* Insight */}
      <div className="card-soft section-fade-in" style={{ animationDelay: "160ms" }}>
        <p className="label-upper mb-3">DENNE UGE</p>
        <p className="text-[1.05rem] font-normal mb-1.5">{insight.title}</p>
        <p className="text-[0.8rem] text-muted-foreground leading-relaxed">{insight.insight}</p>
        <div className="mt-3 rounded-xl px-4 py-2.5" style={{ background: "hsl(var(--sage-light))" }}>
          <p className="text-[0.82rem]">💡 {insight.tip}</p>
        </div>
      </div>
    </>
  );
}

function AutoSleepBanner() {
  const [sleeping, setSleeping] = useState(true);

  if (!sleeping) return null;

  return (
    <div
      className="rounded-2xl px-5 py-4 flex items-center gap-4 relative overflow-hidden section-fade-in"
      style={{
        background: "linear-gradient(135deg, #dce8e0 0%, #c8ddd0 100%)",
        border: "1px solid hsl(var(--sage) / 0.25)",
      }}
    >
      <span className="text-2xl flex-shrink-0 relative z-10">🌙</span>
      <div className="flex-1 relative z-10">
        <p className="text-[0.95rem] font-semibold" style={{ color: "#2a4a38" }}>
          Baby sover
        </p>
        <p className="text-[0.72rem]" style={{ color: "#5a7a6a" }}>
          Automatisk tracking aktiv
        </p>
      </div>
      <div
        className="w-2 h-2 rounded-full flex-shrink-0 relative z-10"
        style={{
          background: "#3a8a5a",
          animation: "livePulse 2s infinite",
        }}
      />
      <span className="text-xl font-light relative z-10" style={{ color: "#1a3a28" }}>
        1t 23m
      </span>
    </div>
  );
}

function QuickLogCard() {
  const logButtons = [
    { icon: "🍼", label: "Amning", last: "12:30" },
    { icon: "👶", label: "Ble", last: "11:45" },
    { icon: "😴", label: "Søvn", last: "10:00" },
    { icon: "📝", label: "Note", last: null },
  ];

  return (
    <div
      className="rounded-2xl px-5 py-4 section-fade-in"
      style={{
        background: "linear-gradient(135deg, #fdf8f0 0%, #f8f0e4 100%)",
        border: "1px solid hsl(var(--clay) / 0.3)",
        animationDelay: "80ms",
      }}
    >
      <p className="label-upper mb-3" style={{ color: "hsl(var(--bark))" }}>
        HURTIG LOG
      </p>
      <div className="grid grid-cols-4 gap-2 mb-3">
        {logButtons.map((btn) => (
          <button
            key={btn.label}
            className="flex flex-col items-center gap-1 py-3 px-1.5 rounded-xl border border-stone-light bg-background transition-all active:scale-95 hover:-translate-y-0.5 hover:shadow-md"
          >
            <span className="text-xl">{btn.icon}</span>
            <span className="text-[0.62rem] tracking-[0.06em] uppercase text-muted-foreground">
              {btn.label}
            </span>
            {btn.last && (
              <span className="text-[0.58rem]" style={{ color: "hsl(var(--sage-dark))" }}>
                {btn.last}
              </span>
            )}
          </button>
        ))}
      </div>
      <p className="text-center text-[0.68rem] tracking-[0.1em] uppercase cursor-pointer transition-colors"
        style={{ color: "hsl(var(--sage-dark))" }}
      >
        Se dagbog →
      </p>
    </div>
  );
}
