import { useFamily } from "@/context/FamilyContext";
import { getBabyInsight } from "@/lib/phaseData";
import { Moon, Baby, Droplets, Sparkles } from "lucide-react";

export function NewbornDashboard() {
  const { babyAgeWeeks, babyAgeMonths } = useFamily();
  const insight = getBabyInsight(babyAgeWeeks);

  return (
    <>
      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-3 section-fade-in">
        <QuickStat icon={Moon} label="Søvn" value="—" color="sage" />
        <QuickStat icon={Baby} label="Amning" value="—" color="clay" />
        <QuickStat icon={Droplets} label="Bleer" value="—" color="sand" />
      </div>

      {/* Insight */}
      <div className="card-soft section-fade-in" style={{ animationDelay: "100ms" }}>
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-clay-light flex items-center justify-center flex-shrink-0 mt-0.5">
            <Sparkles className="w-4 h-4 text-clay" />
          </div>
          <div>
            <h3 className="font-serif text-lg mb-1">{insight.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{insight.insight}</p>
          </div>
        </div>
        <div className="mt-4 bg-sage-light rounded-xl px-4 py-3">
          <p className="text-sm font-medium text-foreground">💡 {insight.tip}</p>
        </div>
      </div>
    </>
  );
}

function QuickStat({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: typeof Moon;
  label: string;
  value: string;
  color: "sage" | "clay" | "sand";
}) {
  const bgMap = { sage: "bg-sage-light", clay: "bg-clay-light", sand: "bg-sand-light" };
  const textMap = { sage: "text-sage", clay: "text-clay", sand: "text-foreground/60" };

  return (
    <div className="card-soft flex flex-col items-center gap-2 py-4">
      <div className={`w-9 h-9 rounded-xl ${bgMap[color]} flex items-center justify-center`}>
        <Icon className={`w-4 h-4 ${textMap[color]}`} />
      </div>
      <div className="text-center">
        <p className="text-lg font-medium">{value}</p>
        <p className="text-[11px] text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}
