import { useFamily } from "@/context/FamilyContext";
import { Baby as BabyIcon, Ruler, Brain, Eye, Moon, Smile, Hand } from "lucide-react";
import { getBabyInsight } from "@/lib/phaseData";

export default function BarnPage() {
  const { profile, currentWeek, babyAgeWeeks, babyAgeMonths } = useFamily();

  if (profile.phase === "pregnant") {
    return <PregnantBarnPage week={currentWeek} />;
  }

  return <BornBarnPage ageWeeks={babyAgeWeeks} ageMonths={babyAgeMonths} />;
}

function PregnantBarnPage({ week }: { week: number }) {
  const developments = [
    { icon: Ruler, label: "Størrelse", value: `~${Math.round(week * 1.25)} cm`, detail: "Fra hoved til hale" },
    { icon: Brain, label: "Hjerne", value: "Udvikler sig", detail: "Nye nerve-forbindelser dannes" },
    { icon: Eye, label: "Sanser", value: week >= 18 ? "Hører lyde" : "Under udvikling", detail: week >= 18 ? "Reagerer på stemmer" : "Gradvis aktivering" },
  ];

  return (
    <div className="space-y-5">
      <div className="section-fade-in">
        <h1 className="text-2xl">Jeres barn</h1>
        <p className="text-sm text-muted-foreground mt-1">Uge {week} — hvad sker der lige nu</p>
      </div>

      <div className="card-soft section-fade-in flex flex-col items-center text-center gap-3" style={{ animationDelay: "100ms" }}>
        <div className="w-20 h-20 rounded-full bg-sage-light flex items-center justify-center">
          <BabyIcon className="w-10 h-10 text-sage" />
        </div>
        <h2 className="font-serif text-xl">
          {week >= 20 ? "Baby er halvvejs!" : `Uge ${week}`}
        </h2>
        <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
          Jeres lille en vokser dag for dag. Alt er som det skal være.
        </p>
      </div>

      <div className="space-y-3">
        {developments.map((dev, i) => (
          <div key={dev.label} className="card-soft flex items-center gap-4 section-fade-in" style={{ animationDelay: `${200 + i * 80}ms` }}>
            <div className="w-10 h-10 rounded-xl bg-sand-light flex items-center justify-center flex-shrink-0">
              <dev.icon className="w-5 h-5 text-foreground/60" />
            </div>
            <div className="flex-1">
              <div className="flex items-baseline justify-between">
                <p className="text-sm font-medium">{dev.label}</p>
                <p className="text-sm text-sage font-medium">{dev.value}</p>
              </div>
              <p className="text-xs text-muted-foreground">{dev.detail}</p>
            </div>
          </div>
        ))}
      </div>

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
        <h1 className="text-2xl">Jeres barn</h1>
        <p className="text-sm text-muted-foreground mt-1">{insight.title} — hvad sker der lige nu</p>
      </div>

      <div className="card-soft section-fade-in flex flex-col items-center text-center gap-3" style={{ animationDelay: "100ms" }}>
        <div className="w-20 h-20 rounded-full bg-clay-light flex items-center justify-center">
          <BabyIcon className="w-10 h-10 text-clay" />
        </div>
        <h2 className="font-serif text-xl">{insight.title}</h2>
        <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">{insight.insight}</p>
      </div>

      <div className="space-y-3">
        {milestones.map((m, i) => (
          <div key={m.label} className="card-soft flex items-center gap-4 section-fade-in" style={{ animationDelay: `${200 + i * 80}ms` }}>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${m.reached ? "bg-sage-light" : "bg-muted"}`}>
              <m.icon className={`w-5 h-5 ${m.reached ? "text-sage" : "text-muted-foreground"}`} />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">{m.label}</p>
              <p className="text-xs text-muted-foreground">{m.age}</p>
            </div>
            {m.reached && (
              <span className="text-xs bg-sage-light text-sage px-2 py-0.5 rounded-full font-medium">✓</span>
            )}
          </div>
        ))}
      </div>

      <div className="h-20 md:h-0" />
    </div>
  );
}
