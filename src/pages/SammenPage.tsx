import { useFamily } from "@/context/FamilyContext";
import { Users, TrendingUp, MessageCircle } from "lucide-react";

export default function SammenPage() {
  const { profile } = useFamily();

  const sharedStats = [
    { label: "Opgaver udført", morValue: 8, farValue: 6 },
    { label: "Denne uge", morValue: 2, farValue: 1 },
  ];

  return (
    <div className="space-y-5">
      <div className="section-fade-in">
        <h1 className="text-[1.9rem] font-normal">Samarbejde</h1>
        <p className="label-upper mt-1">JERES FÆLLES OVERBLIK</p>
      </div>

      {/* Duty strip */}
      <div className="flex gap-2.5 section-fade-in" style={{ animationDelay: "80ms" }}>
        <div className="flex-1 rounded-2xl p-4 flex items-center gap-3"
          style={{ background: "linear-gradient(135deg, hsl(var(--clay) / 0.13), hsl(var(--clay) / 0.06))", border: "1px solid hsl(var(--clay) / 0.3)" }}>
          <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg"
            style={{ background: "linear-gradient(135deg, hsl(var(--clay-light)), hsl(var(--clay)))" }}>
            {profile.role === "mor" ? profile.parentName[0] : profile.partnerName[0]}
          </div>
          <div>
            <p className="text-[0.9rem] font-normal">{profile.role === "mor" ? profile.parentName : profile.partnerName}</p>
            <p className="text-[0.58rem] tracking-[0.14em] uppercase text-muted-foreground">Mor</p>
          </div>
        </div>
        <div className="flex-1 rounded-2xl p-4 flex items-center gap-3"
          style={{ background: "linear-gradient(135deg, hsl(var(--sage) / 0.13), hsl(var(--sage) / 0.06))", border: "1px solid hsl(var(--sage) / 0.3)" }}>
          <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg"
            style={{ background: "linear-gradient(135deg, hsl(var(--sage-light)), hsl(var(--sage)))" }}>
            {profile.role === "far" ? profile.parentName[0] : profile.partnerName[0]}
          </div>
          <div>
            <p className="text-[0.9rem] font-normal">{profile.role === "far" ? profile.parentName : profile.partnerName}</p>
            <p className="text-[0.58rem] tracking-[0.14em] uppercase text-muted-foreground">Far</p>
          </div>
        </div>
      </div>

      {/* Team progress */}
      <div className="card-soft section-fade-in flex items-center gap-4" style={{ animationDelay: "160ms" }}>
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: "hsl(var(--sage-light))" }}>
          <Users className="w-6 h-6 text-moss" />
        </div>
        <div>
          <p className="text-[1.05rem] font-normal">I klarer det godt!</p>
          <p className="text-[0.8rem] text-muted-foreground">14 opgaver fuldført sammen</p>
        </div>
      </div>

      {/* Balance */}
      <div className="card-soft section-fade-in" style={{ animationDelay: "240ms" }}>
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-4 h-4 text-moss" />
          <p className="text-[1rem] font-normal">Balance</p>
        </div>
        {sharedStats.map((stat) => (
          <div key={stat.label} className="mb-3 last:mb-0">
            <p className="text-[0.68rem] text-muted-foreground mb-1.5">{stat.label}</p>
            <div className="flex items-center gap-2">
              <span className="text-[0.6rem] tracking-[0.1em] uppercase w-8" style={{ color: "hsl(var(--bark))" }}>Mor</span>
              <div className="flex-1 flex h-2.5 rounded-full overflow-hidden bg-muted">
                <div
                  className="rounded-l-full transition-all duration-500"
                  style={{ width: `${(stat.morValue / (stat.morValue + stat.farValue)) * 100}%`, background: "hsl(var(--clay) / 0.7)" }}
                />
                <div
                  className="rounded-r-full transition-all duration-500"
                  style={{ width: `${(stat.farValue / (stat.morValue + stat.farValue)) * 100}%`, background: "hsl(var(--sage) / 0.7)" }}
                />
              </div>
              <span className="text-[0.6rem] tracking-[0.1em] uppercase w-8 text-right" style={{ color: "hsl(var(--sage-dark))" }}>Far</span>
            </div>
          </div>
        ))}
      </div>

      {/* Conversation starters */}
      <div className="card-soft section-fade-in" style={{ animationDelay: "320ms" }}>
        <div className="flex items-center gap-2 mb-3">
          <MessageCircle className="w-4 h-4" style={{ color: "hsl(var(--clay))" }} />
          <p className="text-[1rem] font-normal">Tal om det</p>
        </div>
        <p className="text-[0.82rem] text-muted-foreground leading-relaxed italic">
          "Hvad er du mest spændt på ved at blive forældre?"
        </p>
        <p className="text-[0.68rem] text-muted-foreground/60 mt-2">Samtalestart — for at styrke jeres bånd</p>
      </div>

      <div className="h-20 md:h-0" />
    </div>
  );
}
