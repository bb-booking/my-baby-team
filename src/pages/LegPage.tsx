import { useFamily } from "@/context/FamilyContext";
import { getActiveLeap } from "@/lib/phaseData";
import { Sparkles, Clock, Star } from "lucide-react";
import { AIActivitySuggestions } from "@/components/AIActivitySuggestions";

interface Activity {
  title: string;
  description: string;
  why: string;
  duration: string;
  strengthens: string[];
  emoji: string;
}

function getActivities(ageWeeks: number, childName: string): Activity[] {
  const name = childName || "Baby";

  if (ageWeeks < 4) return [
    { title: "Hud-mod-hud", description: `Læg ${name} på dit bare bryst. Bare vær sammen.`, why: "Nyfødte regulerer temperatur og puls bedst ved hudkontakt.", duration: "15-30 min", strengthens: ["Tilknytning", "Tryghed"], emoji: "❤️" },
    { title: "Øjenkontakt", description: `Hold ${name} i armene og kig hinanden i øjnene. Smil, lav ansigtsudtryk.`, why: "Babyer kan fokusere 20-30 cm væk — perfekt afstand i dine arme.", duration: "5 min", strengthens: ["Kontakt", "Syn"], emoji: "👀" },
    { title: "Blid sang", description: `Syng en vuggevise. Din stemme er ${name}s favorit.`, why: "Stemmevariation aktiverer flere hjerneområder end tale.", duration: "5-10 min", strengthens: ["Sprog", "Tryghed"], emoji: "🎵" },
  ];

  if (ageWeeks < 8) return [
    { title: "Mavetid", description: `Læg ${name} på maven i korte intervaller — gerne efter bleskift.`, why: "Styrker nakke og ryg. Start med 2-3 minutter.", duration: "3-5 min", strengthens: ["Motorik", "Nakke"], emoji: "💪" },
    { title: "Spejlleg", description: `Hold et spejl foran ${name} og se reaktionen.`, why: `${name} genkender endnu ikke sig selv, men bliver fascineret af ansigtet.`, duration: "5 min", strengthens: ["Syn", "Nysgerrighed"], emoji: "🪞" },
    { title: "Kontrastbilleder", description: "Vis sort-hvide billeder eller mønstre i ca. 25 cm afstand.", why: "Nyfødte ser bedst i stærke kontraster.", duration: "5 min", strengthens: ["Syn", "Fokus"], emoji: "⬛" },
  ];

  if (ageWeeks < 16) return [
    { title: "Gribelegetøj", description: `Tilbyd lette rasler eller stoflegetøj ${name} kan nå og gribe.`, why: `${name} øver sig på koordination mellem øje og hånd.`, duration: "10 min", strengthens: ["Finmotorik", "Koordination"], emoji: "🤚" },
    { title: "Mavetid med spejl", description: "Læg et babysikret spejl foran under tummy time.", why: "Motivation til at løfte hovedet — og fascination af eget spejlbillede.", duration: "5-10 min", strengthens: ["Motorik", "Nysgerrighed"], emoji: "💪" },
    { title: "Sang og rytme", description: `Klap i hænderne, syng rytmisk. Brug ${name}s hænder og fødder.`, why: "Rytme bygger sproglige og musikalske forbindelser i hjernen.", duration: "5-10 min", strengthens: ["Sprog", "Motorik"], emoji: "🎶" },
  ];

  if (ageWeeks < 26) return [
    { title: "Sanseleg", description: `Lad ${name} mærke forskellige teksturer: glat, blødt, ru, koldt.`, why: "Taktil udforskning er fundamental for hjernens udvikling.", duration: "10 min", strengthens: ["Sanser", "Nysgerrighed"], emoji: "🧸" },
    { title: "Tittit-bansen", description: `Gem dit ansigt bag hænderne og vis det igen. ${name} elsker det!`, why: "Bygger forståelse af objektpermanens — at ting stadig eksisterer selvom man ikke kan se dem.", duration: "5 min", strengthens: ["Kognitiv", "Kontakt"], emoji: "🙈" },
    { title: "Rulleleg", description: `Hjælp ${name} med at rulle fra ryg til mave og omvendt.`, why: "Styrker hele kroppen og forbereder kravlefærdigheder.", duration: "5-10 min", strengthens: ["Motorik", "Balance"], emoji: "🔄" },
  ];

  return [
    { title: "Klodser og stable", description: `Lad ${name} stable, vælte, putte i og ud af bokse.`, why: "Øver rækkefølge, årsag-virkning og finmotorik.", duration: "10-15 min", strengthens: ["Finmotorik", "Kognitiv"], emoji: "🧱" },
    { title: "Pegebøger", description: "Læs bøger sammen og lad barnet pege på billeder.", why: "Bygger ordforråd og fælles opmærksomhed.", duration: "5-10 min", strengthens: ["Sprog", "Kontakt"], emoji: "📚" },
    { title: "Musik og dans", description: `Sæt musik på og dans med ${name}. Klap, stamp, drej.`, why: "Bevægelse til musik styrker balance, rytme og glæde.", duration: "10 min", strengthens: ["Motorik", "Glæde"], emoji: "💃" },
  ];
}

export default function LegPage() {
  const { profile, babyAgeWeeks, babyAgeMonths } = useFamily();
  const childName = profile.children?.[0]?.name || "Baby";

  if (profile.phase === "pregnant") {
    return (
      <div className="space-y-5">
        <div className="section-fade-in">
          <h1 className="text-[1.9rem] font-normal">Leg & aktiviteter</h1>
          <p className="label-upper mt-1">TILGÆNGELIG NÅR BARNET ER FØDT</p>
        </div>
        <div className="card-soft text-center py-12 section-fade-in" style={{ animationDelay: "80ms" }}>
          <span className="text-4xl mb-4 block">🎨</span>
          <p className="text-[1rem] font-normal mb-2">Leg venter forude</p>
          <p className="text-[0.8rem] text-muted-foreground max-w-xs mx-auto leading-relaxed">
            Når baby er født, får I aldersbaserede forslag til leg, stimulation og kontakt.
          </p>
        </div>
        <div className="h-20 md:h-0" />
      </div>
    );
  }

  const activities = getActivities(babyAgeWeeks, childName);
  const activeLeap = getActiveLeap(babyAgeWeeks);

  const ageLabel = babyAgeMonths >= 1 ? `${babyAgeMonths} MÅNEDER` : `${babyAgeWeeks} UGER`;

  return (
    <div className="space-y-5">
      <div className="section-fade-in">
        <h1 className="text-[1.9rem] font-normal">Leg & aktiviteter</h1>
        <p className="label-upper mt-1">{childName.toUpperCase()} · {ageLabel}</p>
      </div>

      {/* Intro */}
      <div className="card-soft section-fade-in" style={{ animationDelay: "60ms" }}>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "hsl(var(--sage-light))" }}>
            <Sparkles className="w-5 h-5" style={{ color: "hsl(var(--moss))" }} />
          </div>
          <div>
            <p className="text-[0.92rem] font-medium">Det her er særligt godt lige nu</p>
            <p className="text-[0.68rem] text-muted-foreground">Baseret på {childName}s alder og udvikling</p>
          </div>
        </div>
      </div>

      {/* Leap context */}
      {activeLeap && (
        <div className="rounded-2xl p-4 section-fade-in" style={{
          animationDelay: "100ms",
          background: "hsl(var(--cream))",
          border: "1px solid hsl(var(--clay) / 0.2)",
        }}>
          <p className="text-[0.6rem] tracking-[0.14em] uppercase text-muted-foreground mb-1">🐯 TIGERSPRING NU</p>
          <p className="text-[0.85rem] font-medium mb-1">{activeLeap.emoji} {activeLeap.title}</p>
          <p className="text-[0.75rem] text-foreground/70 leading-relaxed">
            I denne periode virker mange børn mere optagede af {activeLeap.title.toLowerCase()}. 
            Mange oplever også mere uro eller behov for nærhed — det er helt normalt og går over.
          </p>
        </div>
      )}

      {/* Activities */}
      <div className="space-y-3 section-fade-in" style={{ animationDelay: "140ms" }}>
        {activities.map((act, i) => (
          <div key={i} className="card-soft" style={{ animationDelay: `${160 + i * 60}ms` }}>
            <div className="flex items-start gap-3 mb-2">
              <span className="text-2xl flex-shrink-0">{act.emoji}</span>
              <div className="flex-1">
                <p className="text-[0.92rem] font-medium">{act.title}</p>
                <p className="text-[0.78rem] text-foreground/70 leading-relaxed mt-1">{act.description}</p>
              </div>
            </div>

            {/* Why */}
            <div className="rounded-xl px-3 py-2 mb-2" style={{ background: "hsl(var(--sage-light))" }}>
              <p className="text-[0.72rem] leading-relaxed">💡 {act.why}</p>
            </div>

            {/* Meta */}
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1 text-[0.62rem] text-muted-foreground">
                <Clock className="w-3 h-3" /> {act.duration}
              </span>
              <div className="flex gap-1.5">
                {act.strengthens.map(s => (
                  <span key={s} className="text-[0.58rem] px-2 py-0.5 rounded-full"
                    style={{ background: "hsl(var(--cream))", border: "1px solid hsl(var(--stone-lighter))" }}>
                    {s}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* AI-generated suggestions */}
      <AIActivitySuggestions />

      <div className="h-20 md:h-0" />
    </div>
  );
}
