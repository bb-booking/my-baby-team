import { useFamily } from "@/context/FamilyContext";
import { getKnowledgeCards } from "@/lib/phaseData";

export default function RaadGuidesPage() {
  const { profile, babyAgeWeeks, currentWeek } = useFamily();
  const childName = profile.children[0]?.name || "Baby";
  const isPregnant = profile.phase === "pregnant";

  const cards = isPregnant ? [
    { emoji: "🤰", category: "Krop", title: "Lyt til din krop", body: "Hvil når du har brug for det. Graviditetstræthed er reel og biologisk — ikke dovenskab.", color: "clay" },
    { emoji: "🥗", category: "Kost", title: "Folsyre er vigtigt", body: "Folsyre hjælper med babys neuralrørsudvikling. 400 mikrogram dagligt anbefales.", color: "sage" },
    { emoji: "🧘", category: "Mental sundhed", title: "Det er normalt at bekymre sig", body: "Graviditetsangst rammer mange. Del dine tanker med din partner eller jordemoder.", color: "moss" },
    { emoji: "💑", category: "Parforhold", title: "Bliv ved med at tale sammen", body: "Forventninger ændrer sig. Tal åbent om hvad I forestiller jer som forældre.", color: "clay" },
  ] : getKnowledgeCards(babyAgeWeeks, childName);

  // Mor-specific guides
  const morGuides = profile.role === "mor" ? [
    { emoji: "💪", title: "Recovery efter fødsel", body: "Din krop har gjort noget utroligt. Giv dig selv tid — der er ingen deadline for at 'komme tilbage'." },
    { emoji: "🧠", title: "Fødselsdepression", body: "Hvis du føler dig tom, grædende eller ude af stand til at glæde dig i mere end 2 uger, så ræk ud til din læge. Det er ikke svaghed — det er kemi." },
    { emoji: "🤱", title: "Amning tager tid", body: "Det er normalt at amning er svært i starten. Bed om hjælp fra sundhedsplejersken." },
  ] : [
    { emoji: "🤝", title: "Din rolle er vigtig", body: "Du er ikke 'hjælper' — du er forælder. Tag initiativ, spørg ikke om lov." },
    { emoji: "👀", title: "Se hvad der skal gøres", body: "Prøv at se opgaverne uden at blive bedt om det. Det letter den mentale load enormt." },
    { emoji: "💬", title: "Spørg specifikt", body: "I stedet for 'kan jeg hjælpe?' — sig 'jeg tager opvasken og lægger tøj sammen'." },
  ];

  return (
    <div className="space-y-5">
      <div className="section-fade-in">
        <h1 className="text-[1.9rem] font-normal">Råd & guides</h1>
        <p className="label-upper mt-1">{isPregnant ? "VIDEN TIL GRAVIDITETEN" : "TILPASSET TIL JER"}</p>
      </div>

      {/* Role-specific guides */}
      <div className="section-fade-in" style={{ animationDelay: "80ms" }}>
        <p className="label-upper mb-2">FOR {profile.role === "mor" ? "MOR" : "FAR"}</p>
        <div className="space-y-2">
          {morGuides.map((g, i) => (
            <div key={i} className="card-soft">
              <div className="flex items-start gap-3">
                <span className="text-xl flex-shrink-0">{g.emoji}</span>
                <div>
                  <p className="text-[0.9rem] font-medium mb-1">{g.title}</p>
                  <p className="text-[0.78rem] text-muted-foreground leading-relaxed">{g.body}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Knowledge cards */}
      <div className="section-fade-in" style={{ animationDelay: "160ms" }}>
        <p className="label-upper mb-2">VIDSTE DU?</p>
        <div className="space-y-2">
          {cards.map((card, i) => (
            <div key={i} className="card-soft">
              <div className="flex items-start gap-3">
                <span className="text-xl flex-shrink-0">{card.emoji}</span>
                <div>
                  <p className="text-[0.6rem] tracking-[0.14em] uppercase text-muted-foreground mb-0.5">{card.category}</p>
                  <p className="text-[0.9rem] font-medium mb-1">{card.title}</p>
                  <p className="text-[0.78rem] text-muted-foreground leading-relaxed">{card.body}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="h-20 md:h-0" />
    </div>
  );
}
