import { useFamily } from "@/context/FamilyContext";
import { getKnowledgeCards } from "@/lib/phaseData";
import { useTranslation } from "react-i18next";

export default function RaadGuidesPage() {
  const { profile, babyAgeWeeks, currentWeek } = useFamily();
  const { t, i18n } = useTranslation();
  const childName = profile.children[0]?.name || "Baby";
  const isPregnant = profile.phase === "pregnant";
  const en = i18n.language === "en";

  const cards = isPregnant ? [
    { emoji: "🤰", category: en ? "Body" : "Krop", title: en ? "Listen to your body" : "Lyt til din krop", body: en ? "Rest when you need it. Pregnancy fatigue is real and biological — not laziness." : "Hvil når du har brug for det. Graviditetstræthed er reel og biologisk — ikke dovenskab.", color: "clay" },
    { emoji: "🥗", category: en ? "Nutrition" : "Kost", title: en ? "Folic acid matters" : "Folsyre er vigtigt", body: en ? "Folic acid helps with baby's neural tube development. 400 micrograms daily is recommended." : "Folsyre hjælper med babys neuralrørsudvikling. 400 mikrogram dagligt anbefales.", color: "sage" },
    { emoji: "🧘", category: en ? "Mental health" : "Mental sundhed", title: en ? "Worry is normal" : "Det er normalt at bekymre sig", body: en ? "Pregnancy anxiety affects many. Share your thoughts with your partner or midwife." : "Graviditetsangst rammer mange. Del dine tanker med din partner eller jordemoder.", color: "moss" },
    { emoji: "💑", category: en ? "Relationship" : "Parforhold", title: en ? "Keep talking" : "Bliv ved med at tale sammen", body: en ? "Expectations change. Talk openly about what you envision as parents." : "Forventninger ændrer sig. Tal åbent om hvad I forestiller jer som forældre.", color: "clay" },
  ] : getKnowledgeCards(babyAgeWeeks, childName);

  const morGuides = profile.role === "mor" ? [
    { emoji: "💪", title: en ? "Recovery after birth" : "Recovery efter fødsel", body: en ? "Your body did something incredible. Give yourself time — there's no deadline to 'bounce back'." : "Din krop har gjort noget utroligt. Giv dig selv tid — der er ingen deadline for at 'komme tilbage'." },
    { emoji: "🧠", title: en ? "Postpartum depression" : "Fødselsdepression", body: en ? "If you feel empty, tearful, or unable to feel joy for more than 2 weeks, reach out to your doctor. It's not weakness — it's chemistry." : "Hvis du føler dig tom, grædende eller ude af stand til at glæde dig i mere end 2 uger, så ræk ud til din læge. Det er ikke svaghed — det er kemi." },
    { emoji: "🤱", title: en ? "Breastfeeding takes time" : "Amning tager tid", body: en ? "It's normal for breastfeeding to be difficult at first. Ask your health visitor for help." : "Det er normalt at amning er svært i starten. Bed om hjælp fra sundhedsplejersken." },
  ] : [
    { emoji: "🤝", title: en ? "Your role matters" : "Din rolle er vigtig", body: en ? "You're not a 'helper' — you're a parent. Take initiative, don't ask permission." : "Du er ikke 'hjælper' — du er forælder. Tag initiativ, spørg ikke om lov." },
    { emoji: "👀", title: en ? "See what needs doing" : "Se hvad der skal gøres", body: en ? "Try to see the tasks without being asked. It greatly reduces the mental load." : "Prøv at se opgaverne uden at blive bedt om det. Det letter den mentale load enormt." },
    { emoji: "💬", title: en ? "Be specific" : "Spørg specifikt", body: en ? "Instead of 'can I help?' — say 'I'll do the dishes and fold laundry'." : "I stedet for 'kan jeg hjælpe?' — sig 'jeg tager opvasken og lægger tøj sammen'." },
  ];

  return (
    <div className="space-y-5">
      <div className="section-fade-in">
        <h1 className="text-[1.9rem] font-normal">{t("advice.title")}</h1>
        <p className="label-upper mt-1">{isPregnant ? t("advice.pregnancyKnowledge") : t("advice.adaptedForYou")}</p>
      </div>

      <div className="section-fade-in" style={{ animationDelay: "80ms" }}>
        <p className="label-upper mb-2">{profile.role === "mor" ? t("advice.forMom") : t("advice.forDad")}</p>
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

      <div className="section-fade-in" style={{ animationDelay: "160ms" }}>
        <p className="label-upper mb-2">{t("advice.didYouKnow")}</p>
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
