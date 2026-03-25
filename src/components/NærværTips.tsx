import { useState, useMemo } from "react";
import { Heart, RefreshCw, Clock, Sparkles } from "lucide-react";

interface NærværTip {
  title: string;
  description: string;
  duration: string;
  emoji: string;
  category: "micro" | "ritual" | "date" | "reconnect";
}

const tips: NærværTip[] = [
  // Micro-moments (< 5 min)
  {
    title: "10-sekunders kys",
    description: "Et langt kys udløser oxytocin og bryder autopiloten. Gør det ved døren, efter putning, eller bare nu.",
    duration: "10 sek",
    emoji: "💋",
    category: "micro",
  },
  {
    title: "Øjenkontakt ved overlevering",
    description: "Når I skifter 'vagt' — stop, se hinanden i øjnene, og sig tak. Det tager 3 sekunder og ændrer tonen.",
    duration: "3 sek",
    emoji: "👁️",
    category: "micro",
  },
  {
    title: "Send en besked midt på dagen",
    description: "Ikke om logistik. Bare 'Jeg tænker på dig' eller 'Du er en fantastisk forælder'. Det fylder mere end du tror.",
    duration: "30 sek",
    emoji: "💬",
    category: "micro",
  },
  {
    title: "Rør ved hinanden i forbifarten",
    description: "En hånd på ryggen, et klem om skulderen. Fysisk kontakt holder forbindelsen i live — også uden ord.",
    duration: "2 sek",
    emoji: "🤝",
    category: "micro",
  },

  // Rituals (5–15 min)
  {
    title: "Sofa-debrief efter putning",
    description: "Sæt jer ned i 10 minutter efter baby sover. Ingen skærme. Bare 'Hvordan har du det?' og lyt.",
    duration: "10 min",
    emoji: "🛋️",
    category: "ritual",
  },
  {
    title: "Morgenkaffe sammen",
    description: "Stå 5 minutter op før baby — eller drik kaffe side om side mens baby leger. Det er jeres stund.",
    duration: "5 min",
    emoji: "☕",
    category: "ritual",
  },
  {
    title: "Fælles aftenrutine",
    description: "Vælg én ting I gør sammen hver aften: rydde køkkenet, folde tøj, drikke te. Rutinen skaber forbindelse.",
    duration: "15 min",
    emoji: "🌙",
    category: "ritual",
  },
  {
    title: "Højdepunkt & lavpunkt",
    description: "Del dagens bedste og sværeste øjeblik med hinanden. Det skaber forståelse uden at det kræver løsninger.",
    duration: "5 min",
    emoji: "📊",
    category: "ritual",
  },

  // Date-ish (when possible)
  {
    title: "Sofadate efter kl. 20",
    description: "Tænd stearinlys, del en snack, sæt noget musik på. Det behøver ikke være fancy — bare intentionelt.",
    duration: "30+ min",
    emoji: "🕯️",
    category: "date",
  },
  {
    title: "Walk & talk med barnevognen",
    description: "En gåtur sammen er en date i forklædning. Frisk luft, bevægelse og uforstyrret samtale.",
    duration: "20+ min",
    emoji: "🚶",
    category: "date",
  },
  {
    title: "Bestil takeaway og spis sent",
    description: "Når baby sover: bestil noget godt, dæk op ordentligt, og spis sammen. Bare jer to.",
    duration: "45 min",
    emoji: "🍕",
    category: "date",
  },

  // Reconnect (deeper)
  {
    title: "Sig 'Jeg har brug for dig'",
    description: "Ikke som kritik, men som sårbarhed. At vise behov er styrke — og det inviterer til nærhed.",
    duration: "1 min",
    emoji: "🫶",
    category: "reconnect",
  },
  {
    title: "Anerkend det usynlige arbejde",
    description: "Sig specifikt hvad du ser: 'Tak for at du altid husker bleer' eller 'Jeg ser hvor meget du gør.'",
    duration: "30 sek",
    emoji: "✨",
    category: "reconnect",
  },
  {
    title: "Giv frirum uden at blive spurgt",
    description: "Sig 'Tag en time for dig selv — jeg har styr på det.' Det er kærlighed i handling.",
    duration: "—",
    emoji: "🎁",
    category: "reconnect",
  },
];

const categoryLabels: Record<NærværTip["category"], { label: string; color: string }> = {
  micro: { label: "Mikro-øjeblik", color: "clay" },
  ritual: { label: "Ritual", color: "sage" },
  date: { label: "Date", color: "clay" },
  reconnect: { label: "Forbindelse", color: "sage" },
};

export default function NærværTips() {
  // Show 2 random tips, rotatable
  const [seed, setSeed] = useState(() => Math.floor(Date.now() / (1000 * 60 * 60 * 6))); // changes every 6h

  const currentTips = useMemo(() => {
    const shuffled = [...tips].sort((a, b) => {
      const hashA = (seed * 31 + tips.indexOf(a) * 17) % 100;
      const hashB = (seed * 31 + tips.indexOf(b) * 17) % 100;
      return hashA - hashB;
    });
    return shuffled.slice(0, 2);
  }, [seed]);

  return (
    <div className="card-soft section-fade-in" style={{ animationDelay: "320ms" }}>
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <Heart className="w-4 h-4" style={{ color: "hsl(var(--clay))" }} />
          <p className="text-[1rem] font-normal">Nærvær i hverdagen</p>
        </div>
        <button
          onClick={() => setSeed(s => s + 1)}
          className="p-1.5 rounded-lg hover:bg-[hsl(var(--cream))] transition-colors active:scale-90"
          aria-label="Nye tips"
        >
          <RefreshCw className="w-3.5 h-3.5 text-muted-foreground" />
        </button>
      </div>
      <p className="text-[0.72rem] text-muted-foreground mb-4 leading-relaxed">
        Små handlinger der holder jer tæt — også når hverdagen er kaotisk.
      </p>

      <div className="space-y-3">
        {currentTips.map((tip, i) => {
          const cat = categoryLabels[tip.category];
          return (
            <div
              key={`${seed}-${i}`}
              className="rounded-2xl p-4 transition-all"
              style={{
                background: `linear-gradient(135deg, hsl(var(--${cat.color}-light) / 0.4), hsl(var(--${cat.color}-light) / 0.15))`,
                border: `1px solid hsl(var(--${cat.color}) / 0.2)`,
                animation: "fadeSlideIn 0.4s ease-out both",
                animationDelay: `${i * 80}ms`,
              }}
            >
              <div className="flex items-start gap-3">
                <span className="text-xl mt-0.5">{tip.emoji}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-[0.88rem] font-medium">{tip.title}</p>
                  </div>
                  <p className="text-[0.75rem] text-muted-foreground leading-relaxed mb-2">
                    {tip.description}
                  </p>
                  <div className="flex items-center gap-3">
                    <span
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[0.58rem] tracking-wide uppercase"
                      style={{
                        background: `hsl(var(--${cat.color}) / 0.15)`,
                        color: `hsl(var(--${cat.color === "clay" ? "bark" : "moss"}))`,
                      }}
                    >
                      <Sparkles className="w-2.5 h-2.5" />
                      {cat.label}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[0.6rem] text-muted-foreground">
                      <Clock className="w-2.5 h-2.5" />
                      {tip.duration}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <p className="text-[0.6rem] text-muted-foreground/50 mt-3 text-center">
        Nye forslag hver 6. time — eller tryk for at skifte 💛
      </p>
    </div>
  );
}
