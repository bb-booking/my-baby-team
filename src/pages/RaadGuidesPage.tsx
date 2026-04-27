import { useFamily } from "@/context/FamilyContext";
import { useDiary } from "@/context/DiaryContext";
import { getKnowledgeCards } from "@/lib/phaseData";
import { useTranslation } from "react-i18next";

// ── Personalized Mor section ──────────────────────────────────────────────────

function getMorCards(profile: any, babyAgeWeeks: number, nursingLogs: any[], checkIns: any[], sleepLogs: any[]): {
  expert: string; emoji: string; title: string; body: string; color: "clay" | "sage" | "neutral"
}[] {
  const birthType = profile.morHealth?.birthType;
  const feedingMethod = profile.morHealth?.feedingMethod;
  const cards: { expert: string; emoji: string; title: string; body: string; color: "clay" | "sage" | "neutral" }[] = [];

  // Mood-based (from today's check-in)
  const todayStr = new Date().toISOString().slice(0, 10);
  const todayMood = checkIns.find((c: any) => c.date === todayStr && c.role === "mor")?.mood;
  if (todayMood === "Svært" || todayMood === "Hard") {
    cards.push({
      expert: "Jordemoder",
      emoji: "🌊",
      title: "Det her er faktisk svært",
      body: "Det du mærker er ikke svaghed. Perioden med et nyfødt barn er biologisk og psykologisk en af de mest krævende, mennesker gennemgår. Din krop mangler søvn, hormonerne skifter dramatisk, og du skal lære et nyt menneske at kende på én gang. Det er normalt at have det hårdt.",
      color: "clay",
    });
    cards.push({
      expert: "Parterapeut",
      emoji: "💬",
      title: "Sig det højt",
      body: "Når du har det svært, så sig det præcist som det er — ikke 'jeg er lidt træt', men 'jeg har det rigtig svært i dag og har brug for hjælp'. Din partner kan ikke se det, og konkrete ord giver dem en chance for at møde dig.",
      color: "neutral",
    });
  }

  // Birth type — recovery
  if (birthType === "kejsersnit" && babyAgeWeeks < 12) {
    cards.push({
      expert: "Jordemoder",
      emoji: "🩹",
      title: "Kejsersnit-restitution",
      body: babyAgeWeeks < 6
        ? "Du har haft en stor maveoperation. Arret heler indefra ud — det tager 6 uger for det ydre, og op til et år for det dybe muskelvæv. Undgå at løfte mere end babyens vægt. Det er ikke dovenskab — det er medicinsk nødvendigt."
        : "Dit indre ar er stadig i gang med at hele. Du kan mærke træthed hurtigere end forventet — det er normalt. Bækkenbundstræning må du vente med til uge 12, og intens motion til minimum uge 12–16.",
      color: "clay",
    });
  } else if (birthType === "vaginal" && babyAgeWeeks < 8) {
    cards.push({
      expert: "Jordemoder",
      emoji: "🌸",
      title: "Din krop heler",
      body: babyAgeWeeks < 3
        ? "Eventuelle sting heler oftest inden 2 uger. Hold dem rene og tørre. Blødning i 4–6 uger er normalt. Advarselstegn: kraftig blødning (mere end en menstruation), feber, ubehagelig lugt."
        : "Bækkenbundstræning: start stille — 10 knib, hold 5 sek, 3× om dagen. Det forebygger inkontinens og støtter dit bækken. Du behøver ikke 'hoppe tilbage' — din krop er i gang.",
      color: "clay",
    });
  }

  // Sleep deprivation
  const last7DaysSleep = sleepLogs.filter((l: any) => {
    const start = new Date(l.startTime);
    const daysDiff = (Date.now() - start.getTime()) / (1000 * 60 * 60 * 24);
    return daysDiff < 7 && l.endTime;
  });
  const avgSleepMinsPerDay = last7DaysSleep.reduce((sum: number, l: any) => {
    return sum + (new Date(l.endTime).getTime() - new Date(l.startTime).getTime()) / 60000;
  }, 0) / 7;

  if (avgSleepMinsPerDay < 360 || babyAgeWeeks < 8) {
    cards.push({
      expert: "Sundhedsplejerske",
      emoji: "💤",
      title: "Søvnmangel er akkumulerende",
      body: "Søvnmangel er ikke bare træthed — det påvirker din kognition, dit humør og dit immunforsvar. 'Sov når baby sover' er svært, men selv 20 minutters lur reducerer kortisol markant. Bed din partner tage en hel nattevagt én gang om ugen — det giver din krop én sammenhængende søvncyklus.",
      color: "neutral",
    });
  }

  // Nursing-specific
  if (feedingMethod === "amning" || feedingMethod === "begge") {
    const recentNursing = nursingLogs.filter((l: any) => {
      const daysDiff = (Date.now() - new Date(l.timestamp).getTime()) / (1000 * 60 * 60 * 24);
      return daysDiff < 1 && l.side !== "bottle";
    });
    cards.push({
      expert: "Ammevejleder",
      emoji: "🤱",
      title: "Amning tager 4–6 uger at etablere",
      body: recentNursing.length > 0
        ? `Du har ammet ${recentNursing.length} gange i dag — godt klaret. Husk: smerter ved amning er ikke normalt efter de første uger. Hvis det stadig gør ondt, så tjek tilsætningen og bed om hjælp fra din sundhedsplejerske.`
        : "Amning er ikke instinktivt — det er en færdighed, der tager tid at lære for jer begge. Har du haft smerter? Tjek at babys mund dækker hele brystvorte-areolen, ikke kun spidsen. Kontakt din sundhedsplejerske hvis du er i tvivl.",
      color: "clay",
    });
  }

  if (feedingMethod === "flaske") {
    cards.push({
      expert: "Sundhedsplejerske",
      emoji: "🍼",
      title: "Flaske er et valg, ikke et nederlag",
      body: "En veltilpas og mæt baby er det vigtigste. Flaske giver jer mulighed for at dele nattefodringer ligeligt og sikrer at du ved præcist hvad baby får. Brug næstetip flasker og sørg for at baby sidder oprejst under fodring.",
      color: "neutral",
    });
  }

  // Postpartum mental health
  if (babyAgeWeeks >= 2 && babyAgeWeeks <= 16) {
    cards.push({
      expert: "Parterapeut",
      emoji: "🧠",
      title: "Identitet og moderrollen",
      body: "Det er normalt at savne sig selv — den version af dig der sov om natten, havde tid, var mere fri. Fødsel er også en psykologisk overgang (matrescence), og at sørge over den frihed er naturligt. Det er ikke utaknemlighed — det er en reel sorgproces.",
      color: "neutral",
    });
  }

  if (babyAgeWeeks >= 3) {
    cards.push({
      expert: "Parterapeut",
      emoji: "💑",
      title: "Om parforholdet nu",
      body: "Forskning viser at 67% af par oplever signifikant fald i tilfredshed med parforholdet i det første år. Det er ikke jer — det er biologien og logistikken. Én ting der hjælper: mindst ét dagligt moment af ægte kontakt — et blik, et kram, et 'tak'. Ikke en samtale om opgaver.",
      color: "sage",
    });
  }

  // Physical recovery
  if (babyAgeWeeks >= 6) {
    cards.push({
      expert: "Jordemoder",
      emoji: "💪",
      title: "Genstart din krop blidt",
      body: "6 uger er ikke en magisk grænse — det er et startpunkt. Gå en tur. Stræk kroppen. Bækkenbundstræning. Undgå mavebøjninger og tunge løft de første 3 måneder. Lyt til din krop fremfor en kalender.",
      color: "clay",
    });
  }

  // Always add a grounding card
  cards.push({
    expert: "Jordemoder",
    emoji: "🌿",
    title: "Du gør det godt",
    body: "Der er ingen eksamen i at være mor. Det eneste du skal er at være til stede — og det er du. Din baby behøver ikke perfekt — de behøver dig.",
    color: "clay",
  });

  return cards;
}

const expertColors: Record<string, string> = {
  "Jordemoder": "hsl(var(--clay))",
  "Ammevejleder": "hsl(var(--clay))",
  "Sundhedsplejerske": "hsl(var(--moss))",
  "Parterapeut": "hsl(var(--moss))",
};

const cardBg: Record<"clay" | "sage" | "neutral", string> = {
  clay: "hsl(var(--clay-light))",
  sage: "hsl(var(--sage-light))",
  neutral: "hsl(var(--cream))",
};

// ─────────────────────────────────────────────────────────────────────────────

export default function RaadGuidesPage() {
  const { profile, babyAgeWeeks, currentWeek, checkIns } = useFamily();
  const { nursingLogs, sleepLogs } = useDiary();
  const { t, i18n } = useTranslation();
  const childName = profile.children[0]?.name || "Baby";
  const isPregnant = profile.phase === "pregnant";
  const isMor = profile.role === "mor";
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

  const personalisedMorCards = isMor && !isPregnant
    ? getMorCards(profile, babyAgeWeeks, nursingLogs, checkIns, sleepLogs)
    : null;

  return (
    <div className="space-y-5">
      <div className="section-fade-in">
        <h1 className="text-[1.9rem] font-normal">{t("advice.title")}</h1>
        <p className="label-upper mt-1">{isPregnant ? t("advice.pregnancyKnowledge") : t("advice.adaptedForYou")}</p>
      </div>

      {/* ── Personalized Mor section ── */}
      {personalisedMorCards && (
        <div className="section-fade-in" style={{ animationDelay: "40ms" }}>
          <p className="label-upper mb-2">Til dig, {profile.parentName || "mor"}</p>
          <div className="space-y-2">
            {personalisedMorCards.map((card, i) => (
              <div key={i} className="card-soft" style={{ background: cardBg[card.color] }}>
                <div className="flex items-start gap-3">
                  <span className="text-xl flex-shrink-0">{card.emoji}</span>
                  <div>
                    <p className="text-[0.52rem] tracking-[0.16em] uppercase mb-0.5 font-semibold" style={{ color: expertColors[card.expert] || "hsl(var(--clay))" }}>
                      {card.expert}
                    </p>
                    <p className="text-[0.9rem] font-medium mb-1">{card.title}</p>
                    <p className="text-[0.78rem] text-muted-foreground leading-relaxed">{card.body}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

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


    </div>
  );
}
