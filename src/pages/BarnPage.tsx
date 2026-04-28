import { useState } from "react";
import { useFamily } from "@/context/FamilyContext";
import { useTranslation } from "react-i18next";
import { getBabyInsight, developmentalLeaps, getLeapStatus, getActiveLeap } from "@/lib/phaseData";
import { Baby as BabyIcon, Check, ChevronDown, ChevronUp, Smile, Hand, Moon, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import BabyMeasurements from "@/components/BabyMeasurements";
import { Link } from "react-router-dom";

export default function BarnPage() {
  const { profile, currentWeek, babyAgeWeeks, babyAgeMonths } = useFamily();

  if (profile.phase === "pregnant") return <PregnantBarnPage week={currentWeek} />;
  return <BornBarnPage ageWeeks={babyAgeWeeks} ageMonths={babyAgeMonths} />;
}

function PregnantBarnPage({ week }: { week: number }) {
  const { profile } = useFamily();
  const { t } = useTranslation();
  const isMor = profile.role === "mor";

  const tracks = [
    {
      emoji: "🌱", title: t("pregnancy.baby"), sub: t("pregnancy.development"),
      color: "hsl(var(--sage) / 0.1)",
      items: [
        t("barn.approxLength", { length: Math.round(week * 1.25) }),
        week >= 18
          ? (t === t ? "Kan høre lyde udefra" : "Can hear sounds from outside") // fallback
          : (t === t ? "Sanser under udvikling" : "Senses developing"),
        t === t ? "Nerve-forbindelser dannes" : "Neural connections forming",
      ],
    },
    ...(isMor ? [{
      emoji: "🤰", title: t("pregnancy.yourBody"), sub: t("pregnancy.bodyHealth"),
      color: "hsl(var(--clay) / 0.1)",
      items: [
        week >= 20 ? "Maven er tydeligt synlig" : "Små ændringer i kroppen",
        "Husk daglig folsyre",
        week >= 16 ? "Du mærker måske de første spark" : "Kvalme kan aftage snart",
      ],
    }] : [{
      emoji: "💪", title: t("pregnancy.yourRole"), sub: t("pregnancy.supportPrep"),
      color: "hsl(var(--sage) / 0.08)",
      items: [
        "Deltag i scanninger",
        "Undersøg barselsrettigheder",
        `Spørg ${profile.partnerName} hvad hun har brug for`,
      ],
    }]),
  ];

  return (
    <div className="space-y-5">
      <div className="section-fade-in">
        <h1 className="text-[1.9rem] font-normal">{t("pregnancy.yourChild")}</h1>
        <p className="label-upper mt-1">{t("pregnancy.weekWhat", { week })}</p>
      </div>

      {tracks.map((track, i) => (
        <div key={track.title} className="card-soft section-fade-in" style={{ animationDelay: `${(i + 1) * 80}ms` }}>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-full flex items-center justify-center text-xl" style={{ background: track.color }}>
              {track.emoji}
            </div>
            <div>
              <p className="text-[1.05rem] font-normal">{track.title}</p>
              <p className="text-[0.64rem] tracking-[0.1em] uppercase text-muted-foreground">{track.sub}</p>
            </div>
          </div>
          <ul className="space-y-2">
            {track.items.map((item, j) => (
              <li key={j} className="flex items-start gap-2.5 text-[0.82rem] text-foreground/70 leading-relaxed">
                <span className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0" style={{ background: "hsl(var(--sage))" }} />
                {item}
              </li>
            ))}
          </ul>
        </div>
      ))}


    </div>
  );
}

function BornBarnPage({ ageWeeks, ageMonths }: { ageWeeks: number; ageMonths: number }) {
  const { profile } = useFamily();
  const { t } = useTranslation();
  const childName = profile.children?.[0]?.name || "Baby";
  const insight = getBabyInsight(ageWeeks, childName);
  const activeLeap = getActiveLeap(ageWeeks);

  const [completedLeaps, setCompletedLeaps] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem("melo-achieved-leaps");
      return stored ? JSON.parse(stored) : [];
    } catch { return []; }
  });
  const [expandedLeap, setExpandedLeap] = useState<string | null>(null);

  const leaps = getLeapStatus(ageWeeks, completedLeaps);

  const toggleLeapCompleted = (id: string) => {
    setCompletedLeaps((prev) => {
      const next = prev.includes(id) ? prev.filter((l) => l !== id) : [...prev, id];
      localStorage.setItem("melo-achieved-leaps", JSON.stringify(next));
      return next;
    });
  };

  return (
    <div className="space-y-5">
      <div className="section-fade-in">
        <h1 className="text-[1.9rem] font-normal">{childName}</h1>
        <p className="label-upper mt-1">
          {ageMonths < 3 ? t("barn.weeksLabel", { weeks: ageWeeks }) : t("barn.monthsLabel", { months: ageMonths })} — {t("barn.developmentLeaps")}
        </p>
      </div>

      <div className="card-soft section-fade-in flex flex-col items-center text-center gap-3" style={{ animationDelay: "80ms" }}>
        <div className="w-14 h-14 rounded-full flex items-center justify-center"
          style={{ background: "linear-gradient(135deg, hsl(var(--clay-light)), hsl(var(--clay)))" }}>
          <BabyIcon className="w-7 h-7 text-white" />
        </div>
        <p className="text-[0.8rem] text-muted-foreground max-w-xs leading-relaxed">{insight.insight}</p>
        <div className="rounded-xl px-4 py-2.5 w-full" style={{ background: "hsl(var(--sage-light))" }}>
          <p className="text-[0.82rem]">💡 {insight.tip}</p>
        </div>
      </div>

      <div className="section-fade-in" style={{ animationDelay: "120ms" }}>
        <BabyMeasurements childName={childName} ageWeeks={ageWeeks} />
      </div>

      <Link to="/leg" className="block">
        <div className="rounded-2xl p-4 flex items-center gap-3 section-fade-in transition-all hover:shadow-sm active:scale-[0.98]" style={{
          animationDelay: "140ms",
          background: "linear-gradient(135deg, hsl(var(--sage) / 0.08), hsl(var(--sage) / 0.03))",
          border: "1px solid hsl(var(--sage) / 0.2)",
        }}>
          <span className="text-2xl">🎨</span>
          <div className="flex-1">
            <p className="text-[0.88rem] font-medium">{t("barn.playActivities")}</p>
            <p className="text-[0.68rem] text-muted-foreground">{t("barn.suggestionsForAge", { childName })}</p>
          </div>
          <span className="text-muted-foreground">→</span>
        </div>
      </Link>

      <div className="section-fade-in" style={{ animationDelay: "160ms" }}>
        <h2 className="text-[1rem] font-semibold mb-3">{t("barn.leaps")}</h2>
        <p className="text-[0.75rem] text-muted-foreground mb-4 leading-relaxed">
          {t("barn.leapsDesc", { childName })}
        </p>

        <div className="space-y-2">
          {leaps.map((leap) => {
            const isExpanded = expandedLeap === leap.id;
            const statusStyles: Record<string, { bg: string; border: string; dot: string }> = {
              completed: { bg: "hsl(var(--sage-light) / 0.5)", border: "hsl(var(--sage) / 0.2)", dot: "hsl(var(--sage))" },
              achieved: { bg: "hsl(var(--moss) / 0.08)", border: "hsl(var(--moss) / 0.3)", dot: "hsl(var(--moss))" },
              active: { bg: "hsl(var(--clay) / 0.08)", border: "hsl(var(--clay) / 0.3)", dot: "hsl(var(--clay))" },
              upcoming: { bg: "hsl(var(--warm-white))", border: "hsl(var(--stone-light))", dot: "hsl(var(--stone))" },
            };
            const s = statusStyles[leap.status];

            return (
              <div key={leap.id} className="rounded-2xl overflow-hidden transition-all" style={{ background: s.bg, border: `1px solid ${s.border}` }}>
                <button onClick={() => setExpandedLeap(isExpanded ? null : leap.id)} className="w-full flex items-center gap-3 px-4 py-3 text-left transition-all active:scale-[0.99]">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-lg" style={{ background: `${s.dot}20` }}>
                    {leap.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className={cn("text-[0.85rem] font-medium", leap.status === "upcoming" && "text-foreground/50")}>{leap.title}</p>
                      <span className="text-[0.55rem] tracking-[0.1em] uppercase text-muted-foreground">~{leap.weekStart} {t("common.weeks")}</span>
                    </div>
                    {leap.status === "active" && (
                      <p className="text-[0.65rem] mt-0.5" style={{ color: "hsl(var(--clay))" }}>{t("barn.happeningNow")}</p>
                    )}
                  </div>
                  {(leap.status === "completed" || leap.status === "achieved") && (
                    <span className="text-[0.55rem] tracking-[0.1em] uppercase px-2 py-0.5 rounded-full" style={{ background: "hsl(var(--sage) / 0.15)", color: "hsl(var(--moss))" }}>
                      ✓ {leap.achievedEarly ? t("barn.earlyReached") : t("barn.reached")}
                    </span>
                  )}
                  {isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                </button>

                {isExpanded && (
                  <div className="px-4 pb-4 space-y-3">
                    <p className="text-[0.78rem] text-foreground/70 leading-relaxed">{leap.description}</p>
                    <div>
                      <p className="text-[0.6rem] tracking-[0.14em] uppercase text-muted-foreground mb-1.5">{t("barn.signsToWatch")}</p>
                      <div className="flex flex-wrap gap-1.5">
                        {leap.signs.map((sign, i) => (
                          <span key={i} className="text-[0.68rem] px-2.5 py-1 rounded-full" style={{ background: "hsl(var(--warm-white))", border: "1px solid hsl(var(--stone-light))" }}>{sign}</span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-[0.6rem] tracking-[0.14em] uppercase text-muted-foreground mb-1.5">{t("barn.tips")}</p>
                      <ul className="space-y-1">
                        {leap.tips.map((tip, i) => (
                          <li key={i} className="flex items-start gap-2 text-[0.75rem] text-foreground/70">
                            <span className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ background: "hsl(var(--sage))" }} />{tip}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleLeapCompleted(leap.id); }}
                      className={cn(
                        "w-full mt-2 py-2.5 rounded-xl text-[0.72rem] tracking-[0.08em] uppercase font-medium transition-all active:scale-[0.98]",
                        completedLeaps.includes(leap.id)
                          ? "bg-[hsl(var(--moss))] text-white"
                          : "border border-[hsl(var(--stone-light))] hover:border-[hsl(var(--sage))] text-foreground/70"
                      )}
                    >
                      {completedLeaps.includes(leap.id) ? t("barn.childReached", { childName }) : t("barn.markReached")}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>


    </div>
  );
}
