// Dynamic data based on pregnancy week or baby age

export interface BabySize {
  label: string;
  emoji: string;
}

export interface WeekInsightData {
  insight: string;
  milestone: string | null;
}

const pregnancySizes: Record<number, BabySize> = {
  4: { label: "Et valmuefrø", emoji: "🌱" },
  6: { label: "En linse", emoji: "🫘" },
  8: { label: "Et hindbær", emoji: "🫐" },
  10: { label: "En oliven", emoji: "🫒" },
  12: { label: "En lime", emoji: "🍋" },
  14: { label: "En citron", emoji: "🍋" },
  16: { label: "En avocado", emoji: "🥑" },
  18: { label: "En peberfrugt", emoji: "🫑" },
  20: { label: "En banan", emoji: "🍌" },
  22: { label: "En papaya", emoji: "🥭" },
  24: { label: "En majskolbe", emoji: "🌽" },
  26: { label: "En salathovede", emoji: "🥬" },
  28: { label: "En aubergine", emoji: "🍆" },
  30: { label: "En kokos", emoji: "🥥" },
  32: { label: "En ananas", emoji: "🍍" },
  34: { label: "En cantaloupe", emoji: "🍈" },
  36: { label: "En honeydew", emoji: "🍈" },
  38: { label: "En vandmelon", emoji: "🍉" },
  40: { label: "En lille græskar", emoji: "🎃" },
};

export function getBabySize(week: number): BabySize {
  // Find closest size
  const keys = Object.keys(pregnancySizes).map(Number).sort((a, b) => a - b);
  let closest = keys[0];
  for (const k of keys) {
    if (k <= week) closest = k;
  }
  return pregnancySizes[closest] || { label: "En lille mirakel", emoji: "✨" };
}

const pregnancyInsights: Record<number, WeekInsightData> = {
  8: { insight: "Babys hjerte slår nu med ca. 150 slag i minuttet. Alle vitale organer er ved at dannes.", milestone: "Hjertet slår! 💓" },
  12: { insight: "Første trimester er overstået! Risikoen for tidligt tab falder markant nu. Baby begynder at bevæge sig.", milestone: "Første trimester klaret ✓" },
  16: { insight: "Baby kan nu lave ansigtsudtryk og gribe med små hænder. Nogle mødre mærker de første spark.", milestone: null },
  20: { insight: "Baby kan nu høre lyde udefra. Tal, syng og læs højt — det styrker jeres bånd allerede nu.", milestone: "Halvvejs! 🎉" },
  24: { insight: "Baby reagerer på lys og har en regelmæssig søvnrytme. Lungerne udvikler sig.", milestone: "Levedygtighed nået" },
  28: { insight: "Tredje trimester! Baby kan åbne øjnene og drømmer måske allerede. Tid til at forberede hjemmet.", milestone: "Tredje trimester 🏠" },
  32: { insight: "Baby vender sig med hovedet nedad. I kan mærke tydelige spark og bevægelser.", milestone: null },
  36: { insight: "Baby er næsten klar! Alt er udviklet — nu handler det om at tage på i vægt. Pak hospitalstasken.", milestone: "Snart klar! 🧳" },
  40: { insight: "Termin! Baby kan komme når som helst. I er klar — stol på jeres krop og hinanden.", milestone: "Termin 🎉" },
};

export function getWeekInsight(week: number): WeekInsightData {
  const keys = Object.keys(pregnancyInsights).map(Number).sort((a, b) => a - b);
  let closest = keys[0];
  for (const k of keys) {
    if (k <= week) closest = k;
  }
  return pregnancyInsights[closest] || { insight: "Jeres baby vokser — I klarer det fantastisk.", milestone: null };
}

// Newborn / baby insights by age in weeks
export function getBabyInsight(ageWeeks: number): { title: string; insight: string; tip: string } {
  if (ageWeeks < 2) {
    return {
      title: "De første dage",
      insight: "Alt er nyt — for jer og for baby. Det er helt normalt at føle sig overvældet. Tag det én time ad gangen.",
      tip: "Hud-mod-hud kontakt er det bedste I kan gøre lige nu.",
    };
  }
  if (ageWeeks < 6) {
    return {
      title: `Uge ${ageWeeks}`,
      insight: "Baby begynder at være mere vågen og opmærksom. Øjenkontakt bliver stærkere.",
      tip: "Prøv at følge babys signaler for sult og søvn — I finder jeres rytme.",
    };
  }
  if (ageWeeks < 12) {
    return {
      title: `Uge ${ageWeeks}`,
      insight: "Baby smiler socialt og genkender jeres stemmer. Det er en magisk periode.",
      tip: "Tummy time i korte intervaller styrker nakken.",
    };
  }
  const months = Math.floor(ageWeeks / 4.33);
  if (months < 6) {
    return {
      title: `${months} måneder`,
      insight: "Baby opdager sine hænder og begynder at gribe efter ting. Alt skal i munden!",
      tip: "Introducér forskellige teksturer og farver.",
    };
  }
  if (months < 9) {
    return {
      title: `${months} måneder`,
      insight: "Baby begynder måske at sidde selv og viser interesse for mad. Klar til at smage?",
      tip: "Lad baby udforske mad i eget tempo — det er rodet, men vigtigt.",
    };
  }
  return {
    title: `${months} måneder`,
    insight: "Baby kravler, trækker sig op og opdager verden. Sikr hjemmet og nyd eventyret.",
    tip: "Følg barnets nysgerrighed — det er den bedste legetøjsbutik.",
  };
}

// Phase-specific tasks
export interface PhaseTask {
  id: string;
  title: string;
  assignee: "mor" | "far" | "fælles";
  category: "health" | "preparation" | "admin" | "relationship";
}

export function getTasksForPhase(phase: "pregnant" | "newborn" | "baby", week: number): PhaseTask[] {
  if (phase === "pregnant") {
    if (week <= 12) return [
      { id: "p1", title: "Book første scanning", assignee: "fælles", category: "health" },
      { id: "p2", title: "Vælg jordemoder", assignee: "mor", category: "health" },
      { id: "p3", title: "Fortæl nærmeste familie", assignee: "fælles", category: "relationship" },
    ];
    if (week <= 20) return [
      { id: "p4", title: "Book jordemoder-besøg", assignee: "mor", category: "health" },
      { id: "p5", title: "Undersøg barselsrettigheder", assignee: "far", category: "admin" },
      { id: "p6", title: "Køb barnevogn sammen", assignee: "fælles", category: "preparation" },
    ];
    if (week <= 30) return [
      { id: "p7", title: "Tilmeld fødselsforberedelse", assignee: "fælles", category: "health" },
      { id: "p8", title: "Indret babyværelset", assignee: "fælles", category: "preparation" },
      { id: "p9", title: "Lav fødeplan", assignee: "mor", category: "health" },
    ];
    return [
      { id: "p10", title: "Pak hospitalstasken", assignee: "mor", category: "preparation" },
      { id: "p11", title: "Installer autostol", assignee: "far", category: "preparation" },
      { id: "p12", title: "Frys mad ned til barslen", assignee: "fælles", category: "preparation" },
    ];
  }

  if (phase === "newborn") return [
    { id: "n1", title: "Registrér barnets CPR", assignee: "far", category: "admin" },
    { id: "n2", title: "Book sundhedsplejerske", assignee: "mor", category: "health" },
    { id: "n3", title: "Planlæg besøgstider", assignee: "fælles", category: "relationship" },
  ];

  return [
    { id: "b1", title: "Book 5-måneders undersøgelse", assignee: "fælles", category: "health" },
    { id: "b2", title: "Undersøg dagpleje/vuggestue", assignee: "fælles", category: "admin" },
    { id: "b3", title: "Planlæg en date night", assignee: "fælles", category: "relationship" },
  ];
}

export function getPartnerNudge(phase: "pregnant" | "newborn" | "baby", role: "mor" | "far"): { title: string; hint: string }[] {
  if (phase === "pregnant" && role === "far") return [
    { title: "Lav aftensmad i aften", hint: "Mor er ekstra træt — en lille ting gør en stor forskel." },
    { title: "Spørg hvordan hun har det", hint: "Ikke bare 'er du okay' — spørg specifikt." },
  ];
  if (phase === "pregnant" && role === "mor") return [
    { title: "Del hvad du har brug for", hint: "Far vil gerne hjælpe — sig det højt." },
    { title: "Planlæg en rolig aften", hint: "Kvalitetstid styrker jeres team inden baby kommer." },
  ];
  if (phase === "newborn") return [
    { title: "Tag en nattevagt", hint: "Delt søvn = stærkere team." },
    { title: "Sig 'du klarer det godt'", hint: "I har begge brug for at høre det." },
  ];
  return [
    { title: "Planlæg en date night", hint: "Også forældre har brug for parforhold." },
    { title: "Del en succeshistorie", hint: "Husk hvad I har klaret — det er imponerende." },
  ];
}

export function getMilestones(phase: "pregnant" | "newborn" | "baby", currentWeek: number, babyAgeWeeks: number) {
  if (phase === "pregnant") {
    return [
      { week: 8, label: "Hjertet slår", unlocked: currentWeek >= 8, active: currentWeek >= 8 && currentWeek < 12 },
      { week: 12, label: "1. trimester ✓", unlocked: currentWeek >= 12, active: currentWeek >= 12 && currentWeek < 20 },
      { week: 20, label: "Halvvejs!", unlocked: currentWeek >= 20, active: currentWeek >= 20 && currentWeek < 24 },
      { week: 24, label: "Levedygtig", unlocked: currentWeek >= 24, active: currentWeek >= 24 && currentWeek < 28 },
      { week: 28, label: "3. trimester", unlocked: currentWeek >= 28, active: currentWeek >= 28 && currentWeek < 36 },
      { week: 36, label: "Snart klar", unlocked: currentWeek >= 36, active: currentWeek >= 36 && currentWeek < 40 },
      { week: 40, label: "Termin 🎉", unlocked: currentWeek >= 40, active: currentWeek >= 40 },
    ];
  }
  // Born milestones
  return [
    { week: 1, label: "Første uge", unlocked: babyAgeWeeks >= 1, active: babyAgeWeeks >= 1 && babyAgeWeeks < 6 },
    { week: 6, label: "Første smil", unlocked: babyAgeWeeks >= 6, active: babyAgeWeeks >= 6 && babyAgeWeeks < 12 },
    { week: 12, label: "3 måneder", unlocked: babyAgeWeeks >= 12, active: babyAgeWeeks >= 12 && babyAgeWeeks < 20 },
    { week: 20, label: "Griber ting", unlocked: babyAgeWeeks >= 20, active: babyAgeWeeks >= 20 && babyAgeWeeks < 26 },
    { week: 26, label: "Første mad", unlocked: babyAgeWeeks >= 26, active: babyAgeWeeks >= 26 && babyAgeWeeks < 36 },
    { week: 36, label: "Kravler", unlocked: babyAgeWeeks >= 36, active: babyAgeWeeks >= 36 && babyAgeWeeks < 52 },
    { week: 52, label: "1 år! 🎉", unlocked: babyAgeWeeks >= 52, active: babyAgeWeeks >= 52 },
  ];
}
