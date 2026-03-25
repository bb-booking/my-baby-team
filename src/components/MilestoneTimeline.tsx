import { useFamily } from "@/context/FamilyContext";
import { getMilestones, type MilestoneLevel } from "@/lib/phaseData";
import { useState } from "react";
import { Lock, ChevronRight, Sparkles, X } from "lucide-react";

export function MilestoneTimeline() {
  const { profile, currentWeek, babyAgeWeeks } = useFamily();
  const milestones = getMilestones(profile.phase, currentWeek, babyAgeWeeks);
  const [selected, setSelected] = useState<MilestoneLevel | null>(null);
  const isMor = profile.role === "mor";
  const childName = profile.children?.[0]?.name || "Baby";

  const currentLevel = milestones.filter(m => m.unlocked).length;

  return (
    <>
      <div className="card-soft section-fade-in" style={{ animationDelay: "400ms" }}>
        {/* Header with level indicator */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-serif text-lg">Jeres rejse</h3>
            <p className="text-[0.65rem] text-muted-foreground mt-0.5">
              Level {currentLevel} af {milestones.length}
            </p>
          </div>
          <div
            className="px-3 py-1.5 rounded-full text-[0.7rem] font-medium flex items-center gap-1.5"
            style={{
              background: isMor ? "hsl(var(--clay-light))" : "hsl(var(--sage-light))",
              color: isMor ? "hsl(var(--bark))" : "hsl(var(--moss))",
            }}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Level {currentLevel}
          </div>
        </div>

        {/* Timeline dots */}
        <div className="flex items-center gap-1 overflow-x-auto pb-2 -mx-1 px-1">
          {milestones.map((m, i) => (
            <div key={m.week} className="flex items-center flex-shrink-0">
              <button
                onClick={() => m.unlocked ? setSelected(m) : null}
                className="flex flex-col items-center gap-1.5 group"
                disabled={!m.unlocked}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                    m.active
                      ? "ring-4 scale-110"
                      : m.unlocked
                      ? "hover:scale-105 cursor-pointer"
                      : "cursor-default"
                  }`}
                  style={{
                    background: m.active
                      ? (isMor ? "hsl(var(--clay))" : "hsl(var(--sage))")
                      : m.unlocked
                      ? (isMor ? "hsl(var(--clay) / 0.6)" : "hsl(var(--sage) / 0.6)")
                      : "hsl(var(--muted))",
                    color: m.unlocked ? "white" : "hsl(var(--muted-foreground))",
                    ringColor: m.active
                      ? (isMor ? "hsl(var(--clay-light))" : "hsl(var(--sage-light))")
                      : undefined,
                  }}
                >
                  {m.unlocked ? (
                    <span>{m.emoji}</span>
                  ) : (
                    <Lock className="w-3.5 h-3.5" />
                  )}
                </div>
                <div className="text-center w-[4.5rem]">
                  <span className={`text-[0.65rem] leading-tight block font-medium ${
                    m.active ? "text-foreground" : m.unlocked ? "text-foreground/70" : "text-muted-foreground"
                  }`}>
                    {m.label}
                  </span>
                  {m.unlocked && (
                    <span className="text-[0.55rem] text-muted-foreground flex items-center justify-center gap-0.5 mt-0.5">
                      Tryk for mere <ChevronRight className="w-2.5 h-2.5" />
                    </span>
                  )}
                </div>
              </button>
              {i < milestones.length - 1 && (
                <div
                  className="w-3 h-0.5 mx-0.5 mt-[-22px] rounded-full"
                  style={{
                    background: m.unlocked
                      ? (isMor ? "hsl(var(--clay) / 0.35)" : "hsl(var(--sage) / 0.35)")
                      : "hsl(var(--muted))",
                  }}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Expanded milestone detail */}
      {selected && (
        <MilestoneDetail
          milestone={selected}
          isMor={isMor}
          childName={childName}
          onClose={() => setSelected(null)}
        />
      )}
    </>
  );
}

function MilestoneDetail({
  milestone,
  isMor,
  childName,
  onClose,
}: {
  milestone: MilestoneLevel;
  isMor: boolean;
  childName: string;
  onClose: () => void;
}) {
  const suggestions = isMor ? milestone.momSuggestions : milestone.dadSuggestions;
  const relatable = isMor ? milestone.momRelatable : milestone.dadRelatable;
  const accentBg = isMor ? "hsl(var(--clay-light))" : "hsl(var(--sage-light))";
  const accentColor = isMor ? "hsl(var(--clay))" : "hsl(var(--moss))";
  const accentBark = isMor ? "hsl(var(--bark))" : "hsl(var(--moss))";

  return (
    <div className="rounded-2xl overflow-hidden section-fade-in" style={{
      border: `1.5px solid ${isMor ? "hsl(var(--clay) / 0.2)" : "hsl(var(--sage) / 0.2)"}`,
      background: "hsl(var(--card))",
    }}>
      {/* Header */}
      <div className="px-5 pt-5 pb-4 flex items-start gap-3" style={{
        background: `linear-gradient(145deg, ${isMor ? "hsl(var(--clay) / 0.08)" : "hsl(var(--sage) / 0.08)"}, transparent)`,
      }}>
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
          style={{ background: accentBg }}
        >
          {milestone.emoji}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-[0.6rem] font-semibold tracking-wider uppercase" style={{ color: accentColor }}>
              Level {milestone.level}
            </span>
            {milestone.active && (
              <span className="text-[0.55rem] px-2 py-0.5 rounded-full font-medium" style={{ background: accentBg, color: accentBark }}>
                Nu
              </span>
            )}
          </div>
          <h4 className="text-[1.05rem] font-semibold mt-0.5">{milestone.label}</h4>
          <p className="text-[0.78rem] text-muted-foreground mt-0.5 leading-relaxed">{milestone.description}</p>
        </div>
        <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted/50 transition-colors flex-shrink-0">
          <X className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>

      <div className="px-5 pb-5 space-y-4">
        {/* Activities */}
        <div>
          <p className="text-[0.65rem] tracking-wider uppercase font-medium text-muted-foreground mb-2">
            Gør med {childName}
          </p>
          <div className="space-y-1.5">
            {milestone.activities.map((a, i) => (
              <div key={i} className="flex items-start gap-2.5 px-3 py-2 rounded-xl" style={{ background: "hsl(var(--cream))" }}>
                <span className="text-[0.75rem] mt-0.5">✦</span>
                <span className="text-[0.82rem]">{a}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Role-specific suggestions */}
        <div>
          <p className="text-[0.65rem] tracking-wider uppercase font-medium text-muted-foreground mb-2">
            {isMor ? "Til dig, mor" : "Til dig, far"}
          </p>
          <div className="space-y-1.5">
            {suggestions.map((s, i) => (
              <div key={i} className="flex items-start gap-2.5 px-3 py-2 rounded-xl" style={{ background: accentBg }}>
                <span className="text-[0.75rem] mt-0.5">→</span>
                <span className="text-[0.82rem]" style={{ color: accentBark }}>{s}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Relatable quote */}
        <div
          className="rounded-xl px-4 py-3 text-center"
          style={{
            background: `linear-gradient(135deg, ${isMor ? "hsl(var(--clay) / 0.08)" : "hsl(var(--sage) / 0.08)"}, ${isMor ? "hsl(var(--clay) / 0.03)" : "hsl(var(--sage) / 0.03)"})`,
            borderLeft: `3px solid ${accentColor}`,
          }}
        >
          <p className="text-[0.82rem] italic leading-relaxed" style={{ color: accentBark }}>
            "{relatable}"
          </p>
        </div>
      </div>
    </div>
  );
}