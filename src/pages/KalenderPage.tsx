import { useFamily } from "@/context/FamilyContext";
import { developmentalLeaps } from "@/lib/phaseData";
import { Calendar, Baby } from "lucide-react";

export default function KalenderPage() {
  const { profile, currentWeek, babyAgeWeeks } = useFamily();
  const isPregnant = profile.phase === "pregnant";

  const milestones = isPregnant
    ? [
        { week: 8, label: "Første scanning", emoji: "🩺" },
        { week: 12, label: "Nakkefoldsscanning", emoji: "🔬" },
        { week: 13, label: "1. trimester slut", emoji: "🎉" },
        { week: 20, label: "Misdannelsesscanning", emoji: "🩺" },
        { week: 28, label: "3. trimester start", emoji: "🏠" },
        { week: 32, label: "Fødselsforberedelse", emoji: "📚" },
        { week: 36, label: "Ugentlige tjek", emoji: "🩺" },
        { week: 37, label: "Fuldbåren", emoji: "✅" },
        { week: 40, label: "Terminsdato", emoji: "🎉" },
      ]
    : developmentalLeaps.map(l => ({
        week: l.weekStart,
        label: `Tigerspring: ${l.title}`,
        emoji: l.emoji,
      }));

  return (
    <div className="space-y-5">
      <div className="section-fade-in">
        <h1 className="text-[1.9rem] font-normal">Kalender</h1>
        <p className="label-upper mt-1">{isPregnant ? "MILEPÆLE I GRAVIDITETEN" : "UDVIKLING OG MILEPÆLE"}</p>
      </div>

      <div className="space-y-2">
        {milestones.map((m, i) => {
          const current = isPregnant ? currentWeek : babyAgeWeeks;
          const isPast = m.week <= current;
          const isCurrent = Math.abs(m.week - current) <= 1;
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
                  {isPregnant ? `Uge ${m.week}` : `Uge ${m.week}`}
                  {isPast ? " · ✓ Passeret" : isCurrent ? " · Nu" : ""}
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
