// Dynamic data based on pregnancy week or baby age

export interface BabySize {
  label: string;
  emoji: string;
  lengthCm: string;
  weightG: string;
}

export interface WeekInsightData {
  insight: string;
  milestone: string | null;
}

const pregnancySizes: Record<number, BabySize> = {
  4: { label: "Et valmuefrø", emoji: "🌱", lengthCm: "0.1", weightG: "<1" },
  6: { label: "En linse", emoji: "🫘", lengthCm: "0.5", weightG: "<1" },
  8: { label: "Et hindbær", emoji: "🫐", lengthCm: "1.6", weightG: "1" },
  10: { label: "En oliven", emoji: "🫒", lengthCm: "3", weightG: "4" },
  12: { label: "En lime", emoji: "🍋", lengthCm: "5.4", weightG: "14" },
  14: { label: "En citron", emoji: "🍋", lengthCm: "8.7", weightG: "43" },
  16: { label: "En avocado", emoji: "🥑", lengthCm: "11.6", weightG: "100" },
  18: { label: "En peberfrugt", emoji: "🫑", lengthCm: "14.2", weightG: "190" },
  20: { label: "En banan", emoji: "🍌", lengthCm: "25", weightG: "300" },
  22: { label: "En papaya", emoji: "🥭", lengthCm: "27.8", weightG: "430" },
  24: { label: "En majskolbe", emoji: "🌽", lengthCm: "30", weightG: "600" },
  26: { label: "Et salathovede", emoji: "🥬", lengthCm: "35.6", weightG: "760" },
  28: { label: "En aubergine", emoji: "🍆", lengthCm: "37.6", weightG: "1000" },
  30: { label: "En kokos", emoji: "🥥", lengthCm: "39.9", weightG: "1300" },
  32: { label: "En ananas", emoji: "🍍", lengthCm: "42.4", weightG: "1700" },
  34: { label: "En cantaloupe", emoji: "🍈", lengthCm: "45", weightG: "2100" },
  36: { label: "En honeydew", emoji: "🍈", lengthCm: "47.4", weightG: "2600" },
  38: { label: "En vandmelon", emoji: "🍉", lengthCm: "49.8", weightG: "3100" },
  40: { label: "Et lille græskar", emoji: "🎃", lengthCm: "51", weightG: "3400" },
};

export function getBabySize(week: number): BabySize {
  const keys = Object.keys(pregnancySizes).map(Number).sort((a, b) => a - b);
  let closest = keys[0];
  for (const k of keys) {
    if (k <= week) closest = k;
  }
  return pregnancySizes[closest] || { label: "En lille mirakel", emoji: "✨", lengthCm: "?", weightG: "?" };
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

// ── Knowledge cards for "Vidste du?" carousel ──
export interface KnowledgeCard {
  emoji: string;
  category: string;
  title: string;
  body: string;
  color: string; // CSS token name
}

export function getKnowledgeCards(ageWeeks: number, childName: string): KnowledgeCard[] {
  const name = childName || "Baby";

  if (ageWeeks < 4) return [
    { emoji: "💤", category: "Søvn", title: "Søvncyklus = 45 min", body: `Babyer har kortere søvncyklusser end voksne. Vågner ${name} efter 45 min er det helt normalt — ikke et problem der skal løses.`, color: "sage" },
    { emoji: "❤️", category: "Tilknytning", title: "Hud mod hud", body: `Hud-mod-hud kontakt regulerer ${name}s temperatur, puls og stressniveau. Det er den bedste gave du kan give lige nu.`, color: "clay" },
    { emoji: "🧠", category: "Udvikling", title: "Se mig i øjnene", body: `Nyfødte kan fokusere 20-30 cm — præcis afstanden til dit ansigt under amning. ${name} lærer dit ansigt udenad.`, color: "sage" },
    { emoji: "🌿", category: "Mental sundhed", title: "\"Godt nok\" er faktisk godt", body: "Forskning viser at børn ikke har brug for perfekte forældre — de har brug for forældre der er til stede og reparerer fejl. Du gør det godt.", color: "moss" },
  ];

  if (ageWeeks < 8) return [
    { emoji: "💤", category: "Søvn", title: "Dag og nat forvirring", body: `${name} kender endnu ikke forskel på dag og nat. Hold dagene lyse og aktive, nætterne mørke og rolige.`, color: "sage" },
    { emoji: "😊", category: "Tilknytning", title: "Det første smil nærmer sig", body: `Omkring uge 6 kommer det sociale smil. Når ${name} smiler til dig, er det ikke gas — det er ægte kærlighed.`, color: "clay" },
    { emoji: "🎵", category: "Udvikling", title: "Sang = sprog", body: `At synge for ${name} — selv falsk — aktiverer 3× så mange hjerneområder som almindelig tale. Sangstemmens variationer er magiske.`, color: "sage" },
    { emoji: "🤗", category: "Videnskab", title: "Kram mod cortisol", body: "Kram og hudkontakt sænker stresshormonet cortisol og styrker immunforsvaret. Kramsene tæller.", color: "moss" },
  ];

  if (ageWeeks < 16) return [
    { emoji: "👀", category: "Tilknytning", title: "Øjenkontakt > legetøj", body: `De første 3 måneder er øjenkontakt den absolut foretrukne stimulation. Dit ansigt er bedre end ethvert legetøj.`, color: "clay" },
    { emoji: "💪", category: "Udvikling", title: "Tummy time virker", body: `Bare 3-5 minutter tummy time ad gangen styrker ${name}s nakke og ryg. Gør det efter bleskift — det bliver en vane.`, color: "sage" },
    { emoji: "💤", category: "Søvn", title: "4-måneders regression", body: "Omkring 4 måneder ændres søvnmønstret permanent. Det er ikke en regression — det er en modning. Det går over.", color: "sage" },
    { emoji: "🌿", category: "Mental sundhed", title: "Det er okay at sætte fra", body: "Hvis du føler dig overvældet, er det okay at lægge baby sikkert ned og trække vejret i 2 minutter. Det gør dig til en bedre forælder.", color: "moss" },
  ];

  if (ageWeeks < 26) return [
    { emoji: "🤚", category: "Udvikling", title: "Greb = hjernekraft", body: `${name} øver sig på at gribe ting. Hver gang en genstand holdes fast, dannes nye nerve-forbindelser. Lad ${name} udforske.`, color: "sage" },
    { emoji: "😂", category: "Tilknytning", title: "Latter er socialt lim", body: `${name} begynder at grine højt. Det er ikke bare sødt — det er et socialt signal: "Jeg stoler på dig, gør det igen."`, color: "clay" },
    { emoji: "🍎", category: "Kost", title: "Klar til smag?", body: `Omkring 6 måneder er de fleste babyer klar til fast føde. Tegn: kan sidde med støtte, griber efter mad, har mistet tungetrykningsrefleksen.`, color: "clay" },
    { emoji: "🎵", category: "Udvikling", title: "Babling er sprog", body: `Når ${name} babler, er det tidlig sprogøvelse. Svar som i en samtale — det bygger sprogets fundament.`, color: "sage" },
  ];

  return [
    { emoji: "🥄", category: "Kost", title: "Mad er leg", body: `Lad ${name} udforske mad i eget tempo. Rodet mad = aktiv læring. Tving aldrig — tillid til mad bygges langsomt.`, color: "clay" },
    { emoji: "🧠", category: "Udvikling", title: "Objektpermanens", body: `${name} forstår nu at ting eksisterer selvom de er skjult. Derfor er tittit-bansen pludselig det bedste i verden.`, color: "sage" },
    { emoji: "🚶", category: "Motorik", title: "I eget tempo", body: `Alle børn udvikler sig i eget tempo. Nogle kravler, andre ruller eller bum-shuffler. Alle veje er rigtige.`, color: "sage" },
    { emoji: "💤", category: "Søvn", title: "Rutine > rigiditet", body: `En blød aftensrutine (bad → bog → godnat) signalerer søvn uden stramme skemaer. ${name} lærer mønstret.`, color: "moss" },
  ];
}

// ── Developmental leaps / Tigerspring ──
export interface DevelopmentalLeap {
  id: string;
  weekStart: number; // age in weeks when it typically begins
  weekEnd: number;
  title: string;
  emoji: string;
  description: string;
  signs: string[];
  tips: string[];
}

export const developmentalLeaps: DevelopmentalLeap[] = [
  {
    id: "leap1",
    weekStart: 5,
    weekEnd: 6,
    title: "Sanseindtryk",
    emoji: "👁️",
    description: "Baby opdager verden gennem sanserne for første gang. Alt føles nyt og intenst.",
    signs: ["Mere urolig og grædende", "Vil holdes mere", "Ændret søvnmønster"],
    tips: ["Ekstra hud-mod-hud", "Rolige omgivelser", "Tålmodighed — det går over om 1-2 uger"],
  },
  {
    id: "leap2",
    weekStart: 8,
    weekEnd: 9,
    title: "Mønstre",
    emoji: "🔄",
    description: "Baby begynder at se mønstre — i ansigter, lyde og bevægelser. Det sociale smil kommer!",
    signs: ["Mere opmærksom på omgivelser", "Socialt smil", "Følger ting med øjnene"],
    tips: ["Smil og snak meget", "Vis ansigtsudtryk", "Brug kontrastfarver"],
  },
  {
    id: "leap3",
    weekStart: 12,
    weekEnd: 13,
    title: "Bløde overgange",
    emoji: "🌊",
    description: "Baby opdager at bevægelser kan være flydende — ikke kun ryk. Griber mere bevidst efter ting.",
    signs: ["Griber efter ting", "Drejer hovedet mod lyde", "Mere vokal"],
    tips: ["Tilbyd gribelegetøj", "Tummy time dagligt", "Tal i varierede toner"],
  },
  {
    id: "leap4",
    weekStart: 19,
    weekEnd: 20,
    title: "Begivenheder",
    emoji: "🎯",
    description: "Baby forstår nu at ting har en rækkefølge — bold ruller, ting falder ned, lyde følger handlinger.",
    signs: ["Tester årsag-virkning", "Kaster ting gentagne gange", "Kan virke utålmodig"],
    tips: ["Leg med simple årsag-virkning legetøj", "Vær tålmodig med gentagelser", "Navngiv det baby gør"],
  },
  {
    id: "leap5",
    weekStart: 26,
    weekEnd: 27,
    title: "Sammenhænge",
    emoji: "🧩",
    description: "Baby forstår afstand og relationer. Separationsangst begynder — baby ved nu at I kan gå væk.",
    signs: ["Klynger sig til forældre", "Fremmedangst", "Undersøger ting grundigt"],
    tips: ["Leg tittit-bansen (bygger tillid)", "Kort adskillelse, altid sig farvel", "Anerkend følelserne"],
  },
  {
    id: "leap6",
    weekStart: 37,
    weekEnd: 38,
    title: "Kategorier",
    emoji: "📦",
    description: "Baby begynder at sortere verden: dyr, mad, mennesker. Peger og 'fortæller' hvad tingene er.",
    signs: ["Peger på ting", "Sorterer legetøj", "Imiterer lyde og handlinger"],
    tips: ["Navngiv alt baby peger på", "Læs billedbøger", "Besøg nye steder"],
  },
  {
    id: "leap7",
    weekStart: 46,
    weekEnd: 47,
    title: "Rækkefølge",
    emoji: "📋",
    description: "Baby forstår at handlinger har en rækkefølge — stablelegetøj, putte ting i og ud, følge simple instrukser.",
    signs: ["Stabler klodser", "Putter ting i bokse", "Forsøger at hjælpe med rutiner"],
    tips: ["Involver baby i daglige rutiner", "Stabling og sortering", "Ros indsatsen, ikke resultatet"],
  },
  {
    id: "leap8",
    weekStart: 55,
    weekEnd: 56,
    title: "Programmer",
    emoji: "⚙️",
    description: "Barnet forstår nu regler og kan planlægge simple handlinger. 'Nej' bliver et yndlingsord — det er autonomi!",
    signs: ["Siger nej (selvstændighed)", "Leger rolleleg", "Tester grænser"],
    tips: ["Tilbyd valg (den røde eller blå?)", "Enkle, tydelige grænser", "Anerkend viljen — redirect handlingen"],
  },
];

export function getActiveLeap(ageWeeks: number): DevelopmentalLeap | null {
  return developmentalLeaps.find(
    (l) => ageWeeks >= l.weekStart - 1 && ageWeeks <= l.weekEnd + 1
  ) || null;
}

export function getNextLeap(ageWeeks: number): DevelopmentalLeap | null {
  return developmentalLeaps.find((l) => l.weekStart > ageWeeks) || null;
}

export function getLeapStatus(ageWeeks: number, completedLeaps: string[]): Array<DevelopmentalLeap & { status: "completed" | "active" | "upcoming" }> {
  return developmentalLeaps.map((leap) => {
    if (completedLeaps.includes(leap.id)) return { ...leap, status: "completed" as const };
    if (ageWeeks >= leap.weekStart - 1 && ageWeeks <= leap.weekEnd + 2) return { ...leap, status: "active" as const };
    if (ageWeeks > leap.weekEnd + 2) return { ...leap, status: "completed" as const };
    return { ...leap, status: "upcoming" as const };
  });
}

// ── Baby insights by age ──
export function getBabyInsight(ageWeeks: number, childName?: string): { title: string; insight: string; tip: string } {
  const name = childName || "Baby";

  if (ageWeeks < 2) return {
    title: "De første dage",
    insight: `Alt er nyt — for jer og for ${name}. Det er helt normalt at føle sig overvældet. Tag det én time ad gangen.`,
    tip: "Hud-mod-hud kontakt er det bedste I kan gøre lige nu.",
  };
  if (ageWeeks < 6) return {
    title: `${name} · ${ageWeeks} uger`,
    insight: `${name} begynder at være mere vågen og opmærksom. Øjenkontakt bliver stærkere, og de første smil nærmer sig.`,
    tip: "Følg babys signaler for sult og søvn — I finder jeres rytme.",
  };
  if (ageWeeks < 12) return {
    title: `${name} · ${ageWeeks} uger`,
    insight: `${name} smiler socialt og genkender jeres stemmer. Det er en magisk periode for tilknytning.`,
    tip: "Tummy time i korte intervaller styrker nakken.",
  };
  const months = Math.floor(ageWeeks / 4.33);
  if (months < 6) return {
    title: `${name} · ${months} måneder`,
    insight: `${name} opdager sine hænder og begynder at gribe efter ting. Alt skal i munden — det er sanseudforskning!`,
    tip: "Introducér forskellige teksturer og farver.",
  };
  if (months < 9) return {
    title: `${name} · ${months} måneder`,
    insight: `${name} begynder måske at sidde selv og viser interesse for mad. Verden begynder at give mening.`,
    tip: "Lad baby udforske mad i eget tempo — det er rodet, men vigtigt.",
  };
  return {
    title: `${name} · ${months} måneder`,
    insight: `${name} kravler, trækker sig op og opdager verden med enorm nysgerrighed. Sikr hjemmet og nyd eventyret.`,
    tip: "Følg barnets nysgerrighed — det er den bedste legetøjsbutik.",
  };
}

// ── Phase tasks ──
export interface PhaseTask {
  id: string;
  title: string;
  assignee: "mor" | "far" | "fælles";
  category: "health" | "preparation" | "admin" | "relationship" | "custom";
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
    { id: "n4", title: "Tummy time · 5 min × 3", assignee: "fælles", category: "health" },
    { id: "n5", title: "Bestil D-vitamin dråber", assignee: "far", category: "health" },
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
    { title: "Tag en nattevagt", hint: "Delt søvn = stærkere team. Husk: du kan sagtens putte — det kræver nærhed, ikke amning." },
    { title: "Sig 'du klarer det godt'", hint: "I har begge brug for at høre det." },
  ];
  return [
    { title: "Planlæg en date night", hint: "Også forældre har brug for parforhold." },
    { title: "Del en succeshistorie", hint: "Husk hvad I har klaret — det er imponerende." },
  ];
}

export interface MilestoneLevel {
  week: number;
  label: string;
  emoji: string;
  level: number;
  unlocked: boolean;
  active: boolean;
  description: string;
  activities: string[];
  dadSuggestions: string[];
  dadRelatable: string;
  momSuggestions: string[];
  momRelatable: string;
}

export function getMilestones(phase: "pregnant" | "newborn" | "baby", currentWeek: number, babyAgeWeeks: number): MilestoneLevel[] {
  if (phase === "pregnant") {
    const pMilestones: Omit<MilestoneLevel, "unlocked" | "active">[] = [
      { week: 8, label: "Hjertet slår", emoji: "💓", level: 1, description: "Jeres baby har et bankende hjerte.", activities: ["Lyt til hjertelyden ved scanning", "Start fotodagbog"], dadSuggestions: ["Kom med til scanningen", "Køb en lille gave til mor"], dadRelatable: "Du kan ikke se noget endnu, men dit hjerte banker lidt hurtigere nu.", momSuggestions: ["Mærk øjeblikket — det er magisk", "Del nyheden når I er klar"], momRelatable: "Den der bølge af følelser? Helt normalt. Alt på én gang." },
      { week: 12, label: "Første trimester klaret", emoji: "🏆", level: 2, description: "Den sværeste del er overstået!", activities: ["Fejr med en date", "Del nyheden med flere"], dadSuggestions: ["Planlæg en fejring for jer to", "Spørg hvad mor har brug for"], dadRelatable: "Tillykke — du har overlevet 3 måneder med hemmeligheder og bekymringer.", momSuggestions: ["Tag en velfortjent pause", "Forkæl dig selv med noget småt"], momRelatable: "Du har holdt alt sammen i 12 uger. Du er en kriger." },
      { week: 20, label: "Halvvejs!", emoji: "🎯", level: 3, description: "I er halvvejs! Baby sparker og kan høre jer.", activities: ["Tal til maven", "Syng en sang", "Vælg navne"], dadSuggestions: ["Læg hånden på maven og vent på spark", "Start en 'far-playlist' til baby"], dadRelatable: "Halvvejs. Du kan stadig ikke se dine tæer… vent, det er mor der ikke kan.", momSuggestions: ["Nyd sparkene — de er bare for dig lige nu", "Skriv brev til baby"], momRelatable: "Halvvejs. Du har skabt et helt menneske med øjenvipper. Tænk over det." },
      { week: 28, label: "Tredje trimester", emoji: "🏠", level: 4, description: "Indret, forbered, og nyd de sidste uger.", activities: ["Indret babyværelset", "Pak hospitalstasken", "Frys mad ned"], dadSuggestions: ["Saml møbler — dit nye speciale", "Lav en 'go-bag' til hospitalet"], dadRelatable: "Du samler en tremmeseng kl. 23 og føler dig som en helt. Det er du også.", momSuggestions: ["Sænk tempoet — kroppen arbejder hårdt", "Hvil når du kan"], momRelatable: "Alt gør ondt og du skal tisse igen. Du er næsten i mål. ❤️" },
      { week: 36, label: "Snart klar", emoji: "🧳", level: 5, description: "Baby kan komme når som helst!", activities: ["Dobbelttjek hospitalstasken", "Installer autostol", "Øv vejrtrækningsøvelser"], dadSuggestions: ["Kør ruten til hospitalet", "Sørg for at telefonen altid er opladet"], dadRelatable: "Du tjekker telefonen 47 gange om dagen. Det er helt normalt nu.", momSuggestions: ["Stol på din krop — den ved hvad den gør", "Hvil, hvil, hvil"], momRelatable: "Du er en superhelt i slowmotion. Snart møder du dit mirakel." },
      { week: 40, label: "Termin!", emoji: "🎉", level: 6, description: "I er klar. Stol på hinanden.", activities: ["Nyd de sidste stunder som to", "Vær tålmodige — baby bestemmer"], dadSuggestions: ["Vær til stede — det er det vigtigste", "Hold hendes hånd"], dadRelatable: "Dit eneste job nu: vær der. Mere behøver du ikke.", momSuggestions: ["Lad andre hjælpe dig", "Husk at trække vejret"], momRelatable: "Du har båret et helt menneske i 9 måneder. Du er klar. ❤️" },
    ];
    return pMilestones.map(m => ({
      ...m,
      unlocked: currentWeek >= m.week,
      active: currentWeek >= m.week && (m.week === 40 || currentWeek < (pMilestones[pMilestones.indexOf(m) + 1]?.week ?? 999)),
    }));
  }

  const bMilestones: Omit<MilestoneLevel, "unlocked" | "active">[] = [
    { week: 1, label: "Nyfødt ninja", emoji: "🥒", level: 1, description: "Alt er nyt. I lærer hinanden at kende.", activities: ["Hud-mod-hud så meget som muligt", "Øv amning/flaske", "Lær babysignaler"], dadSuggestions: ["Tag baby på brystet — hud-mod-hud er også for far", "Lær at svøbe som en pro"], dadRelatable: "Baby vejer ca. 3,5 kg. Det er en halv kettlebell. Bare med mere lyd.", momSuggestions: ["Lad andre holde baby mens du sover", "Drik vand som var det dit job"], momRelatable: "Du har lige lavet det sværeste du nogensinde har gjort. Vær sød ved dig selv." },
    { week: 6, label: "Smilemonster", emoji: "😊", level: 2, description: "Det første sociale smil! Baby genkender jer.", activities: ["Smil og lav grimasser", "Syng og tal i varierede toner", "Brug kontrastbilleder"], dadSuggestions: ["Lav dit bedste fjollede ansigt — baby elsker det", "20 min alene med baby = bonding-boost"], dadRelatable: "Det første smil direkte til dig. Stærkere end enhver like du nogensinde har fået.", momSuggestions: ["Nyd smilet — det er ægte kærlighed", "Det er okay at græde af glæde"], momRelatable: "6 uger. Du har overlevet. Og nu smiler baby til dig. Alt var det værd." },
    { week: 12, label: "Grinebansen", emoji: "😂", level: 3, description: "Baby griner højt og 'snakker' med jer.", activities: ["Leg 'tittit-bansen'", "Tummy time 5 min x 3", "Lad baby gribe din finger"], dadSuggestions: ["Tummy time er bedst med far som bane — læg baby på dit bryst", "Lav flyveren"], dadRelatable: "Baby griner af dig. Ikke med dig, AF dig. Og det er det bedste i verden.", momSuggestions: ["3 måneder — den hårdeste del er bag jer", "Forkæl dig med noget du savner"], momRelatable: "Du har fundet en rytme. Det tog tid, men se dig — du er en naturkraft." },
    { week: 20, label: "Lille opdager", emoji: "🔍", level: 4, description: "Baby griber, undersøger og putter alt i munden.", activities: ["Tilbyd forskellige teksturer", "Rangle og bide-legetøj", "Læs billedbøger med farver"], dadSuggestions: ["Byg en 'sansebane' af puder og tæpper", "Lad baby undersøge sikre køkkenting"], dadRelatable: "Alt. Går. I. Munden. Dine nøgler, din telefon, din næse. Velkommen til level 4.", momSuggestions: ["Babysikring af hjemmet — det er tid", "Lad baby udforske i eget tempo"], momRelatable: "Din baby opdager verden. Og ja, din hårpisk er det mest spændende legetøj." },
    { week: 26, label: "Madentusiast", emoji: "🥄", level: 5, description: "Baby er klar til at smage verden!", activities: ["Introducer grøntsager først", "Lad baby spise med fingrene", "Spis sammen som familie"], dadSuggestions: ["Lav fars signaturmos — det bliver en tradition", "Dokumentér det roligste ansigt nogensinde"], dadRelatable: "Baby smager broccoli for første gang. Ansigtsudtrykket er Oscar-værdigt.", momSuggestions: ["Mad er leg, ikke pligt", "Det er normalt at 90% havner på gulvet"], momRelatable: "Ja, det er rodet. Nej, de sulter ikke. De lærer. Og du gør det rigtigt." },
    { week: 36, label: "Eventyrer", emoji: "🚀", level: 6, description: "Baby kravler, trækker sig op og udforsker alt.", activities: ["Lav en sikker udforskningszone", "Stabling og sortering", "Dans og musik"], dadSuggestions: ["Byg en pudde-forhindringsbane", "Kravl med — baby synes det er vildt sjovt"], dadRelatable: "Baby kravler hurtigere end du kan løbe. Cardio-niveauet er: forælder.", momSuggestions: ["Følg baby rundt — de viser vej", "Lad rodet ligge, nyd eventyret"], momRelatable: "Dit hjem ligner et slagmark. Men dit barn er en opdagelsesrejsende. Stærkt." },
    { week: 52, label: "1 år — Legend!", emoji: "🎂", level: 7, description: "I har klaret et helt år. I er legendariske.", activities: ["Fejr med kage og kaos", "Lav en fotocollage af året", "Skriv brev til jeres fremtidige selv"], dadSuggestions: ["Planlæg festen — du er eventmanager nu", "Skriv et brev til baby om deres første år"], dadRelatable: "1 år. Du har skiftet ca. 2.500 bleer. Du er en legende.", momSuggestions: ["Se tilbage på året — du har klaret utrolige ting", "Fejr dig selv lige så meget som baby"], momRelatable: "365 dage. Du har givet alt. Og det var nok. Det var mere end nok. ❤️" },
  ];
  return bMilestones.map(m => ({
    ...m,
    unlocked: babyAgeWeeks >= m.week,
    active: babyAgeWeeks >= m.week && (m.week === 52 || babyAgeWeeks < (bMilestones[bMilestones.indexOf(m) + 1]?.week ?? 999)),
  }));
}
