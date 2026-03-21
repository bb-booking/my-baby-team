import { Users, CheckCircle2, TrendingUp, MessageCircle } from "lucide-react";

const sharedStats = [
  { label: "Opgaver udført", morValue: 8, farValue: 6 },
  { label: "Denne uge", morValue: 2, farValue: 1 },
];

export default function SammenPage() {
  return (
    <div className="space-y-5">
      <div className="section-fade-in">
        <h1 className="text-2xl">Sammen</h1>
        <p className="text-sm text-muted-foreground mt-1">Jeres fælles overblik</p>
      </div>

      {/* Team progress */}
      <div className="card-soft section-fade-in flex items-center gap-4" style={{ animationDelay: "100ms" }}>
        <div className="w-12 h-12 rounded-2xl bg-sage-light flex items-center justify-center">
          <Users className="w-6 h-6 text-sage" />
        </div>
        <div>
          <h2 className="font-serif text-lg">I klarer det godt!</h2>
          <p className="text-sm text-muted-foreground">14 opgaver fuldført sammen</p>
        </div>
      </div>

      {/* Balance */}
      <div className="card-soft section-fade-in" style={{ animationDelay: "200ms" }}>
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-4 h-4 text-sage" />
          <h3 className="font-serif text-lg">Balance</h3>
        </div>
        {sharedStats.map((stat) => (
          <div key={stat.label} className="mb-3 last:mb-0">
            <p className="text-xs text-muted-foreground mb-1.5">{stat.label}</p>
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium w-8 text-clay">Mor</span>
              <div className="flex-1 flex h-3 rounded-full overflow-hidden bg-muted">
                <div
                  className="bg-clay/70 rounded-l-full transition-all duration-500"
                  style={{ width: `${(stat.morValue / (stat.morValue + stat.farValue)) * 100}%` }}
                />
                <div
                  className="bg-sage/70 rounded-r-full transition-all duration-500"
                  style={{ width: `${(stat.farValue / (stat.morValue + stat.farValue)) * 100}%` }}
                />
              </div>
              <span className="text-xs font-medium w-8 text-right text-sage">Far</span>
            </div>
          </div>
        ))}
      </div>

      {/* Conversation starters */}
      <div className="card-soft section-fade-in" style={{ animationDelay: "300ms" }}>
        <div className="flex items-center gap-2 mb-3">
          <MessageCircle className="w-4 h-4 text-clay" />
          <h3 className="font-serif text-lg">Tal om det</h3>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">
          "Hvad er du mest spændt på ved at blive forældre?"
        </p>
        <p className="text-xs text-muted-foreground/60 mt-2">Samtalestart — for at styrke jeres bånd</p>
      </div>

      <div className="h-20 md:h-0" />
    </div>
  );
}
