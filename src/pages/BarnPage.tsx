import { useFamily } from "@/context/FamilyContext";
import { getBabyInsight } from "@/lib/phaseData";
import { Baby as BabyIcon, Ruler, Brain, Eye, Smile, Hand, Moon } from "lucide-react";

export default function BarnPage() {
  const { profile, currentWeek, babyAgeWeeks, babyAgeMonths } = useFamily();

  if (profile.phase === "pregnant") return <PregnantBarnPage week={currentWeek} />;
  return <BornBarnPage ageWeeks={babyAgeWeeks} ageMonths={babyAgeMonths} />;
}

function PregnantBarnPage({ week }: { week: number }) {
  const tracks = [
    {
      emoji: "🌱", title: "Baby", sub: "Udvikling",
      color: "hsl(var(--sage) / 0.1)",
      items: [
        `Ca. ${Math.round(week * 1.25)} cm lang`,
        week >= 18 ? "Kan høre lyde udefra" : "Sanser under udvikling",
        "Nerve-forbindelser dannes",
      ],
    },
    {
      emoji: "🤰", title: "Mor", sub: "Krop & helbred",
      color: "hsl(var(--clay) / 0.1)",
      items: [
        week >= 20 ? "Maven er tydeligt synlig" : "Små ændringer i kroppen",
        "Husk daglig folsyre",
        week >= 16 ? "Mærker måske de første spark" : "Kvalme kan aftage snart",
      ],
    },
    {
      emoji: "👨", title: "Far", sub: "Støtte & forberedelse",
      color: "hsl(var(--sage) / 0.08)",
      items: [
        "Deltag i scanninger",
        "Undersøg barselsrettigheder",
        "Vær til stede og lyt",
      ],
    },
  ];

  return (
    <div className="space-y-5">
      <div className="section-fade-in">
        <h1 className="text-[1.9rem] font-normal">Jeres barn</h1>
        <p className="label-upper mt-1">UGE {week} — HVAD SKER DER</p>
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

      <div className="h-20 md:h-0" />
    </div>
  );
}

function BornBarnPage({ ageWeeks, ageMonths }: { ageWeeks: number; ageMonths: number }) {
  const insight = getBabyInsight(ageWeeks);
  const milestones = [
    { icon: Smile, label: "Socialt smil", age: "6 uger", reached: ageWeeks >= 6 },
    { icon: Hand, label: "Griber ting", age: "3-4 mdr", reached: ageMonths >= 3 },
    { icon: Moon, label: "Sover længere", age: "4-6 mdr", reached: ageMonths >= 4 },
  ];

  return (
    <div className="space-y-5">
      <div className="section-fade-in">
        <h1 className="text-[1.9rem] font-normal">Jeres barn</h1>
        <p className="label-upper mt-1">{insight.title} — HVAD SKER DER</p>
      </div>

      <div className="card-soft section-fade-in flex flex-col items-center text-center gap-3" style={{ animationDelay: "80ms" }}>
        <div className="w-16 h-16 rounded-full flex items-center justify-center"
          style={{ background: "linear-gradient(135deg, hsl(var(--clay-light)), hsl(var(--clay)))" }}>
          <BabyIcon className="w-8 h-8 text-white" />
        </div>
        <p className="text-[1.1rem] font-normal">{insight.title}</p>
        <p className="text-[0.8rem] text-muted-foreground max-w-xs leading-relaxed">{insight.insight}</p>
      </div>

      <div className="space-y-3">
        {milestones.map((m, i) => (
          <div key={m.label} className="card-soft flex items-center gap-4 section-fade-in" style={{ animationDelay: `${160 + i * 80}ms` }}>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${m.reached ? "bg-sage-light" : "bg-muted"}`}>
              <m.icon className={`w-5 h-5 ${m.reached ? "text-moss" : "text-muted-foreground"}`} />
            </div>
            <div className="flex-1">
              <p className="text-[0.85rem] font-normal">{m.label}</p>
              <p className="text-[0.68rem] text-muted-foreground">{m.age}</p>
            </div>
            {m.reached && (
              <span className="text-[0.6rem] tracking-[0.1em] uppercase px-2.5 py-0.5 rounded-full font-normal"
                style={{ background: "hsl(var(--sage) / 0.1)", color: "hsl(var(--moss))", border: "1px solid hsl(var(--sage) / 0.25)" }}>
                ✓ Nået
              </span>
            )}
          </div>
        ))}
      </div>

      <div className="h-20 md:h-0" />
    </div>
  );
}
