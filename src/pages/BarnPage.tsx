import { Baby as BabyIcon, Ruler, Brain, Eye } from "lucide-react";

const developments = [
  { icon: Ruler, label: "Størrelse", value: "~25 cm", detail: "Fra hoved til hale" },
  { icon: Brain, label: "Hjerne", value: "Udvikler sig hurtigt", detail: "Nerve-forbindelser dannes" },
  { icon: Eye, label: "Sanser", value: "Hører lyde", detail: "Reagerer på stemmer" },
];

export default function BarnPage() {
  return (
    <div className="space-y-5">
      <div className="section-fade-in">
        <h1 className="text-2xl">Jeres barn</h1>
        <p className="text-sm text-muted-foreground mt-1">Uge 20 — hvad sker der lige nu</p>
      </div>

      <div className="card-soft section-fade-in flex flex-col items-center text-center gap-3" style={{ animationDelay: "100ms" }}>
        <div className="w-20 h-20 rounded-full bg-sage-light flex items-center justify-center">
          <BabyIcon className="w-10 h-10 text-sage" />
        </div>
        <h2 className="font-serif text-xl">Baby er halvvejs!</h2>
        <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
          Jeres lille en vejer nu ca. 300g og kan mærke bevægelser. Prøv at tale til maven — baby kan høre jer.
        </p>
      </div>

      <div className="space-y-3">
        {developments.map((dev, i) => (
          <div
            key={dev.label}
            className="card-soft flex items-center gap-4 section-fade-in"
            style={{ animationDelay: `${200 + i * 80}ms` }}
          >
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
