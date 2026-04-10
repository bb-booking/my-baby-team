import { useFamily, type ActiveNeed } from "@/context/FamilyContext";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

const NEEDS: Omit<ActiveNeed, "setAt">[] = [
  { key: "air",       emoji: "🏃", label: "Lidt frisk luft alene" },
  { key: "nap",       emoji: "💤", label: "En uforstyrret lur" },
  { key: "shower",    emoji: "🚿", label: "Et langt varmt bad" },
  { key: "meal",      emoji: "🍽️",  label: "Et måltid i fred" },
  { key: "alone",     emoji: "📵", label: "30 min uden ansvar" },
  { key: "hug",       emoji: "🤗", label: "Et kram" },
];

export function NeedsCard() {
  const { profile, setNeed, morName, farName } = useFamily();
  const { role } = profile;
  const partnerRole = role === "mor" ? "far" : "mor";
  const partnerName = role === "mor" ? farName : morName;

  const myNeed = profile.activeNeed?.[role];
  const partnerNeed = profile.activeNeed?.[partnerRole];

  const handleSelect = (n: Omit<ActiveNeed, "setAt">) => {
    if (myNeed?.key === n.key) {
      setNeed(null);
    } else {
      setNeed({ ...n, setAt: new Date().toISOString() });
    }
  };

  return (
    <div className="card-soft section-fade-in space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-[0.6rem] tracking-[0.16em] uppercase text-muted-foreground">Hvad har du brug for?</p>
        {myNeed && (
          <button onClick={() => setNeed(null)} className="flex items-center gap-1 text-[0.6rem] text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-3 h-3" /> Slet
          </button>
        )}
      </div>

      <div className="grid grid-cols-3 gap-2">
        {NEEDS.map(n => (
          <button
            key={n.key}
            onClick={() => handleSelect(n)}
            className={cn(
              "flex flex-col items-center gap-1.5 py-3 px-1 rounded-2xl border-[1.5px] text-[0.65rem] text-center transition-all active:scale-[0.96] leading-tight",
              myNeed?.key === n.key
                ? "border-[hsl(var(--moss))] bg-[hsl(var(--sage-light))] font-medium"
                : "border-[hsl(var(--stone-light))] bg-background text-muted-foreground"
            )}
          >
            <span className="text-xl">{n.emoji}</span>
            {n.label}
          </button>
        ))}
      </div>

      {/* Partner's need */}
      {partnerNeed && (
        <div className="flex items-center gap-2.5 rounded-xl px-3 py-2.5" style={{ background: "hsl(var(--cream))" }}>
          <span className="text-lg">{partnerNeed.emoji}</span>
          <div>
            <p className="text-[0.72rem] font-medium">{partnerName || "Din partner"} har brug for:</p>
            <p className="text-[0.7rem] text-muted-foreground">{partnerNeed.label}</p>
          </div>
        </div>
      )}
    </div>
  );
}
