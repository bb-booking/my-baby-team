import { useFamily } from "@/context/FamilyContext";
import { getMilestones, developmentalLeaps, type MilestoneLevel } from "@/lib/phaseData";
import { useState, useEffect, useCallback } from "react";
import { Lock, ChevronRight, Sparkles, X, Check, Zap } from "lucide-react";
import confetti from "canvas-confetti";
import { useTranslation } from "react-i18next";

// ── Achievement persistence ──
function getAchievedLeaps(): string[] {
  try {
    const s = localStorage.getItem("melo-achieved-leaps");
    return s ? JSON.parse(s) : [];
  } catch {
    return [];
  }
}

function saveAchievedLeaps(leaps: string[]) {
  localStorage.setItem("melo-achieved-leaps", JSON.stringify(leaps));
}

// ── Level-up encouragement messages ──
function getLevelUpMessages(name: string, en: boolean): Record<number, { title: string; body: string }> {
  if (en) return {
    1: { title: "First leap complete!", body: "You've navigated the first sensory impressions together. That takes courage." },
    2: { title: "Patterns unlocked!", body: `${name} sees the world in patterns now — and you are the most beautiful pattern.` },
    3: { title: "Leap 3 — smooth transitions!", body: "Movements flow. You've found a rhythm together." },
    4: { title: "Events understood!", body: `${name} understands cause and effect. You are the reason for all that safety.` },
    5: { title: "Connections cracked!", body: `${name} knows you can leave — and trusts that you'll come back. ❤️` },
    6: { title: "Categories in place!", body: `The world is being sorted. ${name} is a little researcher with you as the lab.` },
    7: { title: "Sequences mastered!", body: `${name} understands sequences. You've built a foundation of trust.` },
    8: { title: "All leaps complete!", body: "You've made it through all 8 leaps. You are legendary parents. 🏆" },
  };
  return {
    1: { title: "Første spring klaret!", body: "I har navigeret de første sanseindtryk sammen. Det kræver mod." },
    2: { title: "Mønstre unlocked!", body: `${name} ser verden i mønstre nu — og I er det smukkeste mønster.` },
    3: { title: "Spring 3 — bløde overgange!", body: "Bevægelser flyder. I har fundet en rytme sammen." },
    4: { title: "Begivenheder forstået!", body: `${name} forstår årsag og virkning. I er årsagen til al den tryghed.` },
    5: { title: "Sammenhænge knækket!", body: `${name} ved I kan gå — og stoler på at I kommer tilbage. ❤️` },
    6: { title: "Kategorier på plads!", body: `Verden sorteres. ${name} er en lille forsker med jer som laboratorium.` },
    7: { title: "Rækkefølge mestret!", body: `${name} forstår sekvenser. I har bygget et fundament af tillid.` },
    8: { title: "Alle spring gennemført!", body: "I har klaret alle 8 tigerspring. I er legendariske forældre. 🏆" },
  };
}

function fireLevelUpConfetti() {
  const defaults = { gravity: 0.6, scalar: 1.2, ticks: 150 };
  confetti({ ...defaults, particleCount: 80, spread: 90, origin: { x: 0.15, y: 0.4 }, colors: ["#FFD700", "#FFA500", "#588157", "#A3B18A"], angle: 60 });
  confetti({ ...defaults, particleCount: 80, spread: 90, origin: { x: 0.85, y: 0.4 }, colors: ["#FFD700", "#FFA500", "#588157", "#A3B18A"], angle: 120 });
  setTimeout(() => {
    confetti({ particleCount: 50, spread: 140, origin: { y: 0.45 }, colors: ["#FFD700", "#FFFFFF", "#c4a97d", "#588157"], shapes: ["star" as any], scalar: 1.4, gravity: 0.4 });
  }, 400);
}

// ── Level-Up Overlay ──
function LevelUpOverlay({
  level,
  emoji,
  childName,
  onDismiss,
}: {
  level: number;
  emoji: string;
  childName: string;
  onDismiss: () => void;
}) {
  const { t, i18n } = useTranslation();
  const en = i18n.language === "en";
  const msg = getLevelUpMessages(childName, en)[level] || {
    title: en ? `Leap ${level} reached!` : `Spring ${level} opnået!`,
    body: en ? "You're doing fantastically." : "I klarer det fantastisk.",
  };

  useEffect(() => {
    fireLevelUpConfetti();
    const t = setTimeout(() => fireLevelUpConfetti(), 1200);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-6"
      style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)" }}
      onClick={onDismiss}
    >
      <div
        className="relative w-full max-w-sm rounded-3xl overflow-hidden text-center levelup-pop"
        style={{ background: "hsl(var(--card))" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow header */}
        <div className="pt-10 pb-6 px-6" style={{
          background: "linear-gradient(180deg, hsl(var(--moss) / 0.15), transparent)",
        }}>
          <div className="levelup-emoji mx-auto w-20 h-20 rounded-full flex items-center justify-center text-4xl mb-4"
            style={{ background: "hsl(var(--moss) / 0.12)", boxShadow: "0 0 40px hsl(var(--moss) / 0.2)" }}>
            {emoji}
          </div>
          <p className="text-[0.6rem] tracking-[0.25em] uppercase font-semibold mb-1" style={{ color: "hsl(var(--moss))" }}>
            {t("milestone.springOfTotal", { level, total: 8 })}
          </p>
          <h2 className="text-[1.4rem] font-bold leading-tight mb-2">{msg.title}</h2>
          <p className="text-[0.85rem] text-muted-foreground leading-relaxed">{msg.body}</p>
        </div>

        <div className="px-6 pb-8">
          <p className="text-[0.75rem] text-muted-foreground mb-4">
            {t("milestone.growing", { childName })}
          </p>
          <button
            onClick={onDismiss}
            className="w-full py-3.5 rounded-full text-[0.88rem] font-semibold transition-all active:scale-[0.97]"
            style={{ background: "hsl(var(--moss))", color: "white" }}
          >
            {t("milestone.continue")}
          </button>
        </div>
      </div>
    </div>
  );
}

export function MilestoneTimeline() {
  const { profile, currentWeek, babyAgeWeeks } = useFamily();
  const { t } = useTranslation();
  const [achievedLeaps, setAchievedLeaps] = useState<string[]>(getAchievedLeaps);
  const [selected, setSelected] = useState<MilestoneLevel | null>(null);
  const [levelUp, setLevelUp] = useState<{ level: number; emoji: string } | null>(null);
  const isMor = profile.role === "mor";
  const childName = profile.children?.[0]?.name || "Baby";
  const isPregnant = profile.phase === "pregnant";

  const milestones = getMilestones(profile.phase, currentWeek, babyAgeWeeks, achievedLeaps);
  const achievedCount = milestones.filter(m => m.unlocked).length;

  // Find the "next" upcoming leap (first non-unlocked)
  const nextUpIndex = milestones.findIndex(m => !m.unlocked);

  useEffect(() => {
    saveAchievedLeaps(achievedLeaps);
  }, [achievedLeaps]);

  const handleAchieve = useCallback((leapId: string) => {
    if (!leapId || achievedLeaps.includes(leapId)) return;
    setAchievedLeaps(prev => [...prev, leapId]);

    // Find the leap to get its level and emoji
    const leap = developmentalLeaps.find(l => l.id === leapId);
    if (leap) {
      setLevelUp({ level: leap.level, emoji: leap.emoji });
    }
  }, [achievedLeaps]);

  return (
    <>
      {/* Level-up overlay */}
      {levelUp && (
        <LevelUpOverlay
          level={levelUp.level}
          emoji={levelUp.emoji}
          childName={childName}
          onDismiss={() => setLevelUp(null)}
        />
      )}

      <div className="card-soft section-fade-in" style={{ animationDelay: "400ms" }}>
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-serif text-lg">{t(isPregnant ? "milestone.yourJourney" : "milestone.leaps")}</h3>
            <p className="text-[0.65rem] text-muted-foreground mt-0.5">
              {isPregnant
                ? t("milestone.level", { level: achievedCount, total: milestones.length })
                : t("milestone.springs", { count: achievedCount, total: milestones.length })}
            </p>
          </div>
          <div
            className="px-3 py-1.5 rounded-full text-[0.7rem] font-medium flex items-center gap-1.5"
            style={{
              background: isMor ? "hsl(var(--clay-light))" : "hsl(var(--sage-light))",
              color: isMor ? "hsl(var(--bark))" : "hsl(var(--moss))",
            }}
          >
            {isPregnant ? <Sparkles className="w-3.5 h-3.5" /> : <Zap className="w-3.5 h-3.5" />}
            {isPregnant ? t("milestone.levelBadge", { level: achievedCount }) : t("milestone.spring", { count: achievedCount })}
          </div>
        </div>

        {/* Timeline dots */}
        <div className="flex items-center gap-1 overflow-x-auto pb-2 -mx-1 px-1">
          {milestones.map((m, i) => {
            const isAchieved = m.leapId && achievedLeaps.includes(m.leapId);
            const isNextUp = i === nextUpIndex && !isPregnant;

            return (
              <div key={m.leapId || m.week} className="flex items-center flex-shrink-0">
                <button
                  onClick={() => m.unlocked ? setSelected(m) : null}
                  className={`flex flex-col items-center gap-1.5 group ${isNextUp ? "next-leap-teaser" : ""}`}
                  disabled={!m.unlocked}
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                      m.active
                        ? "ring-4 scale-110"
                        : m.unlocked
                        ? "hover:scale-105 cursor-pointer"
                        : isNextUp
                        ? "next-leap-dot"
                        : "cursor-default"
                    }`}
                    style={{
                      background: isAchieved
                        ? "hsl(var(--moss))"
                        : m.active
                        ? (isMor ? "hsl(var(--clay))" : "hsl(var(--sage))")
                        : m.unlocked
                        ? (isMor ? "hsl(var(--clay) / 0.6)" : "hsl(var(--sage) / 0.6)")
                        : isNextUp
                        ? (isMor ? "hsl(var(--clay) / 0.2)" : "hsl(var(--sage) / 0.2)")
                        : "hsl(var(--muted))",
                      color: m.unlocked
                        ? "white"
                        : isNextUp
                        ? (isMor ? "hsl(var(--clay) / 0.6)" : "hsl(var(--sage) / 0.6)")
                        : "hsl(var(--muted-foreground))",
                      ...(m.active ? { boxShadow: `0 0 0 4px ${isMor ? "hsl(var(--clay-light))" : "hsl(var(--sage-light))"}` } : {}),
                      ...(isNextUp ? {
                        border: `2px dashed ${isMor ? "hsl(var(--clay) / 0.4)" : "hsl(var(--sage) / 0.4)"}`,
                        backgroundImage: `repeating-linear-gradient(
                          45deg,
                          transparent,
                          transparent 3px,
                          ${isMor ? "hsl(var(--clay) / 0.06)" : "hsl(var(--sage) / 0.06)"} 3px,
                          ${isMor ? "hsl(var(--clay) / 0.06)" : "hsl(var(--sage) / 0.06)"} 6px
                        )`,
                      } : {}),
                    }}
                  >
                    {isAchieved ? (
                      <Check className="w-4 h-4" />
                    ) : m.unlocked ? (
                      <span>{m.emoji}</span>
                    ) : isNextUp ? (
                      <span className="opacity-60">{m.emoji}</span>
                    ) : (
                      <Lock className="w-3.5 h-3.5" />
                    )}
                  </div>
                  <div className="text-center w-[4.5rem]">
                    <span className={`text-[0.65rem] leading-tight block font-medium ${
                      m.active ? "text-foreground"
                      : m.unlocked ? "text-foreground/70"
                      : isNextUp ? "text-foreground/50"
                      : "text-muted-foreground"
                    }`}>
                      {m.label}
                    </span>
                    {m.active && !isAchieved && !isPregnant && (
                      <span className="text-[0.5rem] uppercase tracking-wider font-semibold" style={{ color: isMor ? "hsl(var(--clay))" : "hsl(var(--moss))" }}>
                        {t("milestone.now")}
                      </span>
                    )}
                    {isNextUp && (
                      <span className="text-[0.5rem] uppercase tracking-wider font-medium" style={{ color: isMor ? "hsl(var(--clay) / 0.6)" : "hsl(var(--sage) / 0.7)" }}>
                        {t("milestone.soon")}
                      </span>
                    )}
                    {m.unlocked && !m.active && (
                      <span className="text-[0.55rem] text-muted-foreground flex items-center justify-center gap-0.5 mt-0.5">
                        {t("milestone.press")} <ChevronRight className="w-2.5 h-2.5" />
                      </span>
                    )}
                  </div>
                </button>
                {i < milestones.length - 1 && (
                  <div
                    className="w-3 h-0.5 mx-0.5 mt-[-22px] rounded-full"
                    style={{
                      background: m.unlocked
                        ? (isAchieved ? "hsl(var(--moss) / 0.5)" : isMor ? "hsl(var(--clay) / 0.35)" : "hsl(var(--sage) / 0.35)")
                        : isNextUp
                        ? (isMor ? "hsl(var(--clay) / 0.15)" : "hsl(var(--sage) / 0.15)")
                        : "hsl(var(--muted))",
                    }}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Expanded detail */}
      {selected && (
        <LeapDetail
          milestone={selected}
          isMor={isMor}
          childName={childName}
          isPregnant={isPregnant}
          isAchieved={!!(selected.leapId && achievedLeaps.includes(selected.leapId))}
          babyAgeWeeks={babyAgeWeeks}
          onAchieve={() => selected.leapId && handleAchieve(selected.leapId)}
          onClose={() => setSelected(null)}
        />
      )}
    </>
  );
}

function LeapDetail({
  milestone,
  isMor,
  childName,
  isPregnant,
  isAchieved,
  babyAgeWeeks,
  onAchieve,
  onClose,
}: {
  milestone: MilestoneLevel;
  isMor: boolean;
  childName: string;
  isPregnant: boolean;
  isAchieved: boolean;
  babyAgeWeeks: number;
  onAchieve: () => void;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const suggestions = isMor ? milestone.momSuggestions : milestone.dadSuggestions;
  const relatable = isMor ? milestone.momRelatable : milestone.dadRelatable;
  const accentBg = isMor ? "hsl(var(--clay-light))" : "hsl(var(--sage-light))";
  const accentColor = isMor ? "hsl(var(--clay))" : "hsl(var(--moss))";
  const accentBark = isMor ? "hsl(var(--bark))" : "hsl(var(--moss))";
  const isEarly = milestone.leapId && babyAgeWeeks < milestone.week;
  const canAchieve = !isPregnant && milestone.leapId && !isAchieved;

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
          style={{ background: isAchieved ? "hsl(var(--moss) / 0.15)" : accentBg }}
        >
          {isAchieved ? <Check className="w-6 h-6" style={{ color: "hsl(var(--moss))" }} /> : milestone.emoji}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[0.6rem] font-semibold tracking-wider uppercase" style={{ color: accentColor }}>
              {t("milestone.spring", { count: milestone.level })}
            </span>
            {milestone.active && !isAchieved && (
              <span className="text-[0.55rem] px-2 py-0.5 rounded-full font-medium" style={{ background: accentBg, color: accentBark }}>
                {t("milestone.now")}
              </span>
            )}
            {isAchieved && (
              <span className="text-[0.55rem] px-2 py-0.5 rounded-full font-medium" style={{ background: "hsl(var(--moss) / 0.12)", color: "hsl(var(--moss))" }}>
                {isEarly ? t("milestone.achievedEarly") : t("milestone.achieved")}
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
        {/* Signs (leap-specific) */}
        {milestone.signs && milestone.signs.length > 0 && (
          <div>
            <p className="text-[0.65rem] tracking-wider uppercase font-medium text-muted-foreground mb-2">
              {t("milestone.signsInProgress")}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {milestone.signs.map((s, i) => (
                <span key={i} className="text-[0.72rem] px-2.5 py-1 rounded-full" style={{
                  background: "hsl(var(--clay) / 0.1)",
                  color: "hsl(var(--bark))",
                }}>
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Activities */}
        <div>
          <p className="text-[0.65rem] tracking-wider uppercase font-medium text-muted-foreground mb-2">
            {t("milestone.doWith", { childName })}
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
            {t(isMor ? "milestone.forMom" : "milestone.forDad")}
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

        {/* Achievement button */}
        {canAchieve && (
          <button
            onClick={() => { onAchieve(); onClose(); }}
            className="w-full py-3 rounded-full text-[0.85rem] font-semibold transition-all active:scale-[0.97] flex items-center justify-center gap-2"
            style={{
              background: "hsl(var(--moss))",
              color: "white",
            }}
          >
            <Zap className="w-4 h-4" />
            {isEarly ? t("milestone.earlyAchieved", { childName }) : t("milestone.markAchieved")}
          </button>
        )}
      </div>
    </div>
  );
}
