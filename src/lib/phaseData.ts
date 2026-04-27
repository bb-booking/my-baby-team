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
  level: number;
  weekStart: number; // age in weeks when it typically begins
  weekEnd: number;
  title: string;
  emoji: string;
  description: string;
  signs: string[];
  tips: string[];
  activities: string[];
  momSuggestions: string[];
  momRelatable: string;
  dadSuggestions: string[];
  dadRelatable: string;
}

export const developmentalLeaps: DevelopmentalLeap[] = [
  {
    id: "leap1", level: 1, weekStart: 5, weekEnd: 6,
    title: "Sanseindtryk", emoji: "👁️",
    description: "Baby opdager verden gennem sanserne for første gang. Alt føles nyt og intenst.",
    signs: ["Mere urolig og grædende", "Vil holdes mere", "Ændret søvnmønster"],
    tips: ["Ekstra hud-mod-hud", "Rolige omgivelser", "Tålmodighed — det går over om 1-2 uger"],
    activities: ["Hud-mod-hud i rolige omgivelser", "Brug kontrastbilleder tæt på babys ansigt", "Syng stille og rytmisk"],
    momSuggestions: ["Det er normalt at baby er urolig — du gør det rigtigt", "Bed om hjælp til natterne"],
    momRelatable: "Alt føles kaotisk. Men du ER babys trygge base. Det er nok.",
    dadSuggestions: ["Tag baby på brystet — din hud berolige lige så meget", "Lad mor sove — tag en nattevagt"],
    dadRelatable: "Baby græder mere. Det er ikke dig. Det er hjernen der vokser. Hold fast.",
  },
  {
    id: "leap2", level: 2, weekStart: 8, weekEnd: 9,
    title: "Mønstre", emoji: "🔄",
    description: "Baby begynder at se mønstre — i ansigter, lyde og bevægelser. Det sociale smil kommer!",
    signs: ["Mere opmærksom på omgivelser", "Socialt smil", "Følger ting med øjnene"],
    tips: ["Smil og snak meget", "Vis ansigtsudtryk", "Brug kontrastfarver"],
    activities: ["Lav grimasser og overdrevne ansigtsudtryk", "Vis sort-hvide billeder", "Smil og vent — baby smiler tilbage!"],
    momSuggestions: ["Nyd det første ægte smil — det er rent kærlighed", "Tag et billede af smilet — du fortjener det minde"],
    momRelatable: "Det første smil direkte til dig. Alt det hårde var det værd. ❤️",
    dadSuggestions: ["Dit fjollede ansigt er babys favoritunderholdning nu", "20 minutter alene med baby = kæmpe bonding-boost"],
    dadRelatable: "Baby smiler af dig. Det er stærkere end enhver like du nogensinde har fået.",
  },
  {
    id: "leap3", level: 3, weekStart: 12, weekEnd: 13,
    title: "Bløde overgange", emoji: "🌊",
    description: "Baby opdager at bevægelser kan være flydende — ikke kun ryk. Griber mere bevidst efter ting.",
    signs: ["Griber efter ting", "Drejer hovedet mod lyde", "Mere vokal"],
    tips: ["Tilbyd gribelegetøj", "Tummy time dagligt", "Tal i varierede toner"],
    activities: ["Tummy time 5 min × 3 dagligt", "Hold legetøj så baby rækker ud", "Lav 'flyveren' på dine ben"],
    momSuggestions: ["3 måneder — den hårdeste del er bag jer", "Forkæl dig med noget du savner"],
    momRelatable: "Du har fundet en rytme. Det tog tid, men se dig — du er en naturkraft.",
    dadSuggestions: ["Tummy time er bedst med far som bane — læg baby på dit bryst", "Lav flyveren på dine ben"],
    dadRelatable: "Baby griner af dig. Ikke med dig, AF dig. Og det er det bedste i verden.",
  },
  {
    id: "leap4", level: 4, weekStart: 19, weekEnd: 20,
    title: "Begivenheder", emoji: "🎯",
    description: "Baby forstår nu at ting har en rækkefølge — bold ruller, ting falder ned, lyde følger handlinger.",
    signs: ["Tester årsag-virkning", "Kaster ting gentagne gange", "Kan virke utålmodig"],
    tips: ["Leg med simple årsag-virkning legetøj", "Vær tålmodig med gentagelser", "Navngiv det baby gør"],
    activities: ["Rangle og årsag-virkning legetøj", "Lad baby 'tabe' ting og saml op (gentagelse = læring)", "Navngiv alt baby gør"],
    momSuggestions: ["Baby er ikke besværlig — baby er nysgerrig", "Babysikring af hjemmet — det er tid"],
    momRelatable: "Din baby opdager verden. Og ja, din hårpisk er det mest spændende legetøj.",
    dadSuggestions: ["Byg en 'sansebane' af puder og tæpper", "Lad baby undersøge sikre køkkenting"],
    dadRelatable: "Alt. Går. I. Munden. Dine nøgler, din telefon, din næse. Velkommen til level 4.",
  },
  {
    id: "leap5", level: 5, weekStart: 26, weekEnd: 27,
    title: "Sammenhænge", emoji: "🧩",
    description: "Baby forstår afstand og relationer. Separationsangst begynder — baby ved nu at I kan gå væk.",
    signs: ["Klynger sig til forældre", "Fremmedangst", "Undersøger ting grundigt"],
    tips: ["Leg tittit-bansen (bygger tillid)", "Kort adskillelse, altid sig farvel", "Anerkend følelserne"],
    activities: ["Tittit-bansen — bygger objektpermanens og tillid", "Stof-bøger med klapper", "Introducer fast føde hvis klar"],
    momSuggestions: ["Mad er leg, ikke pligt — 90% havner på gulvet og det er okay", "Separationsangst er et tegn på stærk tilknytning"],
    momRelatable: "Baby vil kun dig. Det er smukt. Og udmattende. Begge dele er sandt.",
    dadSuggestions: ["Lav fars signaturmos — det bliver en tradition", "Baby klynger sig til mor? Bliv ved. Din tid kommer."],
    dadRelatable: "Baby smager broccoli for første gang. Ansigtsudtrykket er Oscar-værdigt.",
  },
  {
    id: "leap6", level: 6, weekStart: 37, weekEnd: 38,
    title: "Kategorier", emoji: "📦",
    description: "Baby begynder at sortere verden: dyr, mad, mennesker. Peger og 'fortæller' hvad tingene er.",
    signs: ["Peger på ting", "Sorterer legetøj", "Imiterer lyde og handlinger"],
    tips: ["Navngiv alt baby peger på", "Læs billedbøger", "Besøg nye steder"],
    activities: ["Navngiv alt baby peger på", "Læs billedbøger sammen", "Besøg nye steder — zoo, legeplads, skov"],
    momSuggestions: ["Følg baby rundt — de viser vej", "Lad rodet ligge, nyd eventyret"],
    momRelatable: "Dit hjem ligner et slagmark. Men dit barn er en opdagelsesrejsende. Stærkt.",
    dadSuggestions: ["Byg en pudde-forhindringsbane", "Kravl med — baby synes det er vildt sjovt"],
    dadRelatable: "Baby kravler hurtigere end du kan løbe. Cardio-niveauet er: forælder.",
  },
  {
    id: "leap7", level: 7, weekStart: 46, weekEnd: 47,
    title: "Rækkefølge", emoji: "📋",
    description: "Baby forstår at handlinger har en rækkefølge — stablelegetøj, putte ting i og ud, følge simple instrukser.",
    signs: ["Stabler klodser", "Putter ting i bokse", "Forsøger at hjælpe med rutiner"],
    tips: ["Involver baby i daglige rutiner", "Stabling og sortering", "Ros indsatsen, ikke resultatet"],
    activities: ["Stabling og sortering af klodser", "Involver baby i rutiner — hæld vand, rør i gryden", "Dans og musik — følg rytmen"],
    momSuggestions: ["Lad baby 'hjælpe' — det tager længere tid, men bygger selvtillid", "Du har næsten klaret et helt år!"],
    momRelatable: "Baby vil hjælpe med alt. Det tager 4× så lang tid. Men det smil? Uvurderligt.",
    dadSuggestions: ["Lad baby hjælpe dig med 'projekter' — de elsker at imitere far", "Byg ting sammen — tårne, togbaner, hvad som helst"],
    dadRelatable: "Baby imiterer dig. Ja, også de ting. Tid til at være en god rollemodel. 😅",
  },
  {
    id: "leap8", level: 8, weekStart: 55, weekEnd: 56,
    title: "Programmer", emoji: "⚙️",
    description: "Barnet forstår nu regler og kan planlægge simple handlinger. 'Nej' bliver et yndlingsord — det er autonomi!",
    signs: ["Siger nej (selvstændighed)", "Leger rolleleg", "Tester grænser"],
    tips: ["Tilbyd valg (den røde eller blå?)", "Enkle, tydelige grænser", "Anerkend viljen — redirect handlingen"],
    activities: ["Tilbyd valg: 'den røde eller blå kop?'", "Rolleleg — dukker, dyr, telefoner", "Simpel problemløsning — formkasser og puslespil"],
    momSuggestions: ["'Nej' er et tegn på selvstændighed — ikke trods", "Se tilbage på året — du har klaret utrolige ting"],
    momRelatable: "365+ dage. Du har givet alt. Og det var nok. Det var mere end nok. ❤️",
    dadSuggestions: ["Vælg dine kampe — ikke alt behøver et 'nej' tilbage", "Planlæg festen — du er eventmanager nu"],
    dadRelatable: "1 år+. Du har skiftet ca. 2.500 bleer og overlevet. Du er en legende.",
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

export type LeapStatus = "completed" | "achieved" | "active" | "upcoming";

export function getLeapStatus(ageWeeks: number, achievedLeaps: string[]): Array<DevelopmentalLeap & { status: LeapStatus; achievedEarly: boolean }> {
  return developmentalLeaps.map((leap) => {
    const manuallyAchieved = achievedLeaps.includes(leap.id);
    const isActive = ageWeeks >= leap.weekStart - 1 && ageWeeks <= leap.weekEnd + 2;
    const isPast = ageWeeks > leap.weekEnd + 2;

    if (manuallyAchieved) {
      const achievedEarly = ageWeeks < leap.weekStart;
      return { ...leap, status: "achieved" as const, achievedEarly };
    }
    if (isActive) return { ...leap, status: "active" as const, achievedEarly: false };
    if (isPast) return { ...leap, status: "completed" as const, achievedEarly: false };
    return { ...leap, status: "upcoming" as const, achievedEarly: false };
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

// Health visit suggestions based on baby age — shown as suggested tasks in checklist
export function getHealthSuggestions(ageWeeks: number): PhaseTask[] {
  const tasks: PhaseTask[] = [];

  if (ageWeeks >= 0 && ageWeeks < 1) {
    tasks.push({ id: "h_jm1", title: "Jordemoderbesøg dag 3–5 — book hvis I ikke har fået tid", assignee: "mor", category: "health" });
  }
  if (ageWeeks >= 1 && ageWeeks < 3) {
    tasks.push({ id: "h_sp14", title: "Sundhedsplejerske dag 14 — husk at booke", assignee: "mor", category: "health" });
  }
  if (ageWeeks >= 2 && ageWeeks < 4) {
    tasks.push({ id: "h_sp3u", title: "Sundhedsplejerske uge 3 — book tid", assignee: "mor", category: "health" });
  }
  if (ageWeeks >= 7 && ageWeeks < 10) {
    tasks.push({ id: "h_2mdr", title: "2-måneders undersøgelse + første vaccination — book hos læge", assignee: "fælles", category: "health" });
  }
  if (ageWeeks >= 5 && ageWeeks < 9) {
    tasks.push({ id: "h_8u_mor", title: "8-ugers kontrol hos læge (mor) — husk at booke", assignee: "mor", category: "health" });
  }
  if (ageWeeks >= 19 && ageWeeks < 23) {
    tasks.push({ id: "h_5mdr", title: "5-måneders undersøgelse + anden vaccination — book hos læge", assignee: "fælles", category: "health" });
  }
  if (ageWeeks >= 33 && ageWeeks < 37) {
    tasks.push({ id: "h_8mdr", title: "8–10-måneders undersøgelse + tredje vaccination — book hos læge", assignee: "fælles", category: "health" });
  }

  return tasks;
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
  leapId?: string;
  signs?: string[];
  tips?: string[];
}

export function getMilestones(phase: "pregnant" | "newborn" | "baby", currentWeek: number, babyAgeWeeks: number, achievedLeaps: string[] = []): MilestoneLevel[] {
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

  // Baby/newborn: Use developmental leaps as levels
  return developmentalLeaps.map((leap) => {
    const isAchieved = achievedLeaps.includes(leap.id);
    const isPast = babyAgeWeeks > leap.weekEnd + 2;
    const isActive = babyAgeWeeks >= leap.weekStart - 1 && babyAgeWeeks <= leap.weekEnd + 2;
    const unlocked = isAchieved || isPast || isActive;

    return {
      week: leap.weekStart,
      label: leap.title,
      emoji: leap.emoji,
      level: leap.level,
      unlocked,
      active: isActive && !isAchieved,
      description: leap.description,
      activities: leap.activities,
      dadSuggestions: leap.dadSuggestions,
      dadRelatable: leap.dadRelatable,
      momSuggestions: leap.momSuggestions,
      momRelatable: leap.momRelatable,
      leapId: leap.id,
      signs: leap.signs,
      tips: leap.tips,
    };
  });
}

// ── Detailed week-by-week pregnancy data ─────────────────────────────────────

export interface PregnancyWeekData {
  babyDev: string;
  motherBody: string;
  partnerFocus: string;
  highlight: string;
  highlightEmoji: string;
}

const weeklyPregnancyData: Record<number, PregnancyWeekData> = {
  5:  { babyDev: "Embryoet er på størrelse med et sesamfrø. Hjertet begynder at dannes — to bittesmå rør, der snart smelter sammen.", motherBody: "Du producerer nu store mængder HCG. Kvalme, træthed og ømme bryster er de første tegn.", partnerFocus: "Hun er mere træt end nogensinde — ikke fordi hun vil. Kroppen arbejder hårdt. Overtag aftensmaden.", highlight: "Hjertet begynder at dannes", highlightEmoji: "💗" },
  6:  { babyDev: "Hjertet slår for første gang — ca. 100 slag i minuttet. Øjne, ører og næse begynder at forme sig.", motherBody: "Kvalmen topper typisk morgen og aften. Sæt tørkiks ved sengen. Små, hyppige måltider hjælper.", partnerFocus: "Lug ikke kraftigt parfumeret sæbe, stearinlys eller mad frem. Lugtesansen er skærpet dramatisk.", highlight: "Hjertet slår for første gang", highlightEmoji: "💓" },
  7:  { babyDev: "Embryoet er på størrelse med et blåbær. Hjernen vokser med 100 neuroner i minuttet.", motherBody: "Livmoderen er nu dobbelt så stor som normalt. Du kan mærke trykken i bækkenet.", partnerFocus: "Book den første jordemoder-samtale nu hvis I ikke har gjort det. Det er din opgave denne uge.", highlight: "100 neuroner pr. minut dannes", highlightEmoji: "🧠" },
  8:  { babyDev: "Alle vitale organer er dannet. Baby har nu fingre — med svømmehud, der langsomt forsvinder.", motherBody: "Mange oplever forværret kvalme uge 8-10. Det er et tegn på at HCG er højt — altså et godt tegn.", partnerFocus: "Første scanning nærmer sig. Vær med — det er jeres første fælles oplevelse af barnet.", highlight: "Alle organer er dannet", highlightEmoji: "✅" },
  9:  { babyDev: "Baby hedder nu et foster. Halen er væk. Baby kan sluge og sparke — du kan bare ikke mærke det endnu.", motherBody: "Bækkenbunden begynder at bærer på ekstra vægt. Start bækkenbundstræning allerede nu.", partnerFocus: "Spørg ind til kvalme og energi uden at komme med løsninger. Lyt og anerkend.", highlight: "Foster-stadiet begynder", highlightEmoji: "🌱" },
  10: { babyDev: "Baby er på størrelse med en oliven — og kan nu bøje og strække armene. Fingernegle dannes.", motherBody: "Blodvolumen stiger. Du kan opleve svimmelhed og hjertebanken — det er normalt.", partnerFocus: "Undersøg jeres rettigheder til barselsorlov og dagpenge nu. Det tager tid at sætte sig ind i.", highlight: "Baby kan bøje armene", highlightEmoji: "💪" },
  11: { babyDev: "Babys knogler begynder at hærde. Fingrene er ikke længere sammenvoksede. Kønsorganerne dannes.", motherBody: "Kvalmen begynder at aftage for mange. Energien vender langsomt tilbage.", partnerFocus: "Book nakkefoldscanning (uge 11-14) nu hvis I ønsker den. Ventelisterne kan være lange.", highlight: "Knogler begynder at hærde", highlightEmoji: "🦴" },
  12: { babyDev: "Baby er nu 5 cm lang — og kan åbne munden og strække fingrene. Nyrerne fungerer og baby laver urin.", motherBody: "1. trimester slutter! Risikoen for spontan abort falder markant. Mange fortæller nyheden nu.", partnerFocus: "Nakkefoldsscanningen er denne uge. Tag fri og vær med — og vær klar på alle mulige svar.", highlight: "1. trimester overstået", highlightEmoji: "🎉" },
  13: { babyDev: "Baby har fingeraftryk. Ansigtet er fuldt formet. Baby kan suge på tommelfingeren.", motherBody: "Maven begynder at vise sig. Mange oplever øget energi og lyst i 2. trimester.", partnerFocus: "Tal om jeres forventninger til hinanden som forældre. Det er lettere nu end efter fødslen.", highlight: "Fingeraftryk dannes", highlightEmoji: "👆" },
  14: { babyDev: "Baby laver vejrtrækningsbevægelser og øver synke-refleksen med fostervand.", motherBody: "Livmoderen er nu over skambenet. Du mærker måske første lette pres oppefra.", partnerFocus: "Undersøg fødesteder sammen. Er det hospitalet, et fødecenter eller hjemmefødsel? Start samtalen.", highlight: "Baby øver at trække vejret", highlightEmoji: "🫁" },
  15: { babyDev: "Baby kan høre lyde fra omverdenen. Tal med din mave — baby kender allerede din stemme.", motherBody: "Mange oplever rund ligament-smerter — stikkende smerter i siden. Det er normalt.", partnerFocus: "Begynd at tale til maven. Det føles mærkeligt, men baby genkender din stemme ved fødslen.", highlight: "Baby kan høre din stemme", highlightEmoji: "👂" },
  16: { babyDev: "Baby er på størrelse med en avocado. Muskler og knogler vokser hurtigt. Øjnene bevæger sig.", motherBody: "Nogle mærker de første forsigtige spark — som sommerfugleflagren eller bobler.", partnerFocus: "Mærk maven dagligt med hånden. Det er din måde at skabe kontakt på allerede nu.", highlight: "Første spark mærkes måske", highlightEmoji: "🦋" },
  17: { babyDev: "Baby er dækket af lanugo — fin dun der holder varmen. Fedtlag begynder at dannes.", motherBody: "Rygsmerter er almindelige nu. Gravid-pude om natten hjælper. Undgå at stå meget.", partnerFocus: "Overtag gulvvask og andet tungt husarbejde. Hendes tyngdepunkt forskydes og giver rygbelastning.", highlight: "Lanugo-dun dækker kroppen", highlightEmoji: "🌫️" },
  18: { babyDev: "Baby kan nu gabe, strækkke sig og sparke. Knoglerne er synlige på scanning.", motherBody: "Maveblodkarrene udvider sig — nogle oplever svimmelhed ved at rejse sig hurtigt.", partnerFocus: "Meld jer til fødselsforberedelseskurset nu — de fylder hurtigt op, særligt weekend-hold.", highlight: "Baby strækker og sparker", highlightEmoji: "🤸" },
  19: { babyDev: "Babys sanser udvikles hurtigt. Hjernens sensoriske centre aktiveres.", motherBody: "Du er tæt på halvvejs. Mærkbare spark begynder for de fleste nu.", partnerFocus: "Lav en liste over hvad I mangler at købe/klargøre. Del det op i måneder fremfor uger.", highlight: "Alle sanser aktiveres", highlightEmoji: "✨" },
  20: { babyDev: "Baby er nu 25 cm lang — fra top til hæl. 20-ugers scanningen viser alt: hjertet, hjernen, rygraden.", motherBody: "HALVVEJS! Maven er nu tydelig. Hudens strækmærker begynder at dannes — fugtig hud hjælper.", partnerFocus: "Mødregruppe og faderskabskursus: undersøg muligheder. Netværket er uvurderligt det første år.", highlight: "HALVVEJS — 20 uger! 🎉", highlightEmoji: "🎉" },
  21: { babyDev: "Baby sover og er vågen i egne cyklusser — uafhængigt af dig. Baby kan smage fostervandet.", motherBody: "Fordøjelsen sænkes af progesteron. Forstoppelse og halsbrand er almindelige nu.", partnerFocus: "Sæt gang i babyværelset — det er en fælles opgave der styrker jeres samhørighed.", highlight: "Baby har sine egne søvncyklusser", highlightEmoji: "💤" },
  22: { babyDev: "Babys læber og øjenbryn er fuldt formede. Hørelsen skærpes — baby reagerer på høje lyde.", motherBody: "Braxton Hicks sammentrækninger (øve-veer) kan starte nu. De er uregelmæssige og smertefrie.", partnerFocus: "Øv dig i at sige 'hvad har du brug for?' frem for at komme med løsninger.", highlight: "Baby reagerer på høje lyde", highlightEmoji: "🔊" },
  23: { babyDev: "Babys hud er stadig rynket — fedtlaget er endnu ikke fyldt ud. Lungerne modner.", motherBody: "Øget svedtendens og varme i kroppen er normalt — blodvolumen er steget 40%.", partnerFocus: "Tjek om arbejdsgiver kræver særlig opsigelse ved barselsstart. Frister kan snige sig op.", highlight: "Blodvolumen +40% over normal", highlightEmoji: "❤️" },
  24: { babyDev: "Levedygtighed nået. Baby er nu levedygtig med intensiv pleje ved præterm fødsel.", motherBody: "Bækkenbund under stigende pres. Inkontinens-øvelser er vigtige — 3 sæt × 10 dagligt.", partnerFocus: "Tal om jeres fødselsplan: ønsker, smertestillende, musik. Det reducerer stress på dagen.", highlight: "Levedygtighed nået ved intensiv pleje", highlightEmoji: "💪" },
  25: { babyDev: "Baby vejer nu ca. 700g. Håndflader og fodsåler er fuldt formede med unikke linjer.", motherBody: "Mange oplever øget sparkaktivitet efter måltider. Baby kan mærke dine blodsukkerstigninger.", partnerFocus: "Frys 10-15 portioner mad ned til barslen. Det er den bedste praktiske investering I kan gøre.", highlight: "Håndlinjer og fodlinjer er unikke", highlightEmoji: "✋" },
  26: { babyDev: "Babys øjne åbner sig for første gang. Baby kan skelne lys fra mørke.", motherBody: "Søvnbesvær starter for mange. Lig på venstre side — det forbedrer blodgennemstrømningen.", partnerFocus: "Masér hendes ryg og ben dagligt. Det er ikke luksus — det lindrer reelle smerter.", highlight: "Baby åbner øjnene for første gang", highlightEmoji: "👀" },
  27: { babyDev: "Hjernens overflade begynder at bugte sig — hjernebarken danner folder. REM-søvn starter.", motherBody: "3. trimester er snart her. Tyngdefølelse, hyppig vandladning og åndenød starter.", partnerFocus: "Undersøg muligheder for besøgskarantæne de første dage hjemme — det er jeres valg, ikke familiens.", highlight: "Baby drømmer måske allerede", highlightEmoji: "🌙" },
  28: { babyDev: "3. trimester! Baby vejer ca. 1 kg. Huden glatter ud efterhånden som fedtet dannes.", motherBody: "Bekken-løsning er hyppig nu. Smerter i symfysen, lysken og indersiden af låret — tag det seriøst.", partnerFocus: "GDM-screening sker typisk uge 28-30. Kør hende derhen — det er et langt besøg.", highlight: "3. TRIMESTER begynder", highlightEmoji: "🏁" },
  29: { babyDev: "Baby kan styre sin kropstemperatur. Muskelmasse og knogletæthed stiger hurtigt.", motherBody: "Åndedrætet kan føles tungt — livmoderen trykker på diafragma. Det er normalt.", partnerFocus: "Forbered jer på de første uger hjemme: hvem kommer? Hvornår? Sæt klare forventninger til familie.", highlight: "Baby styrer selv kropstemperaturen", highlightEmoji: "🌡️" },
  30: { babyDev: "Baby er ca. 40 cm lang og vejer 1,3 kg. Hjernen udvikler sig med enorm fart.", motherBody: "Rygsmertere er på sit højeste. Fysioterapi og vandgymnastik er effektivt.", partnerFocus: "Lær tegn på for tidlig fødsel: regelmæssige veer, pres nedad, vandafgang — og planen hvis det sker.", highlight: "Hjernen vokser eksplosivt", highlightEmoji: "🧠" },
  31: { babyDev: "Baby er ved at vende sig med hovedet nedad. Alle organer er fuldt funktionelle.", motherBody: "Søvnen er svær. Prøv: U-pude, hævet hoved, ingen skærme efter 21.", partnerFocus: "Tag ansvaret for det logistiske: hvem passer dyrene/søskende? Hvad er bilen tanket op?", highlight: "Baby drejer sig med hovedet ned", highlightEmoji: "🔄" },
  32: { babyDev: "Baby øver åndedræt intensivt. Fingre og tæer er fuldt udviklede med negle.", motherBody: "Falske veer (Braxton Hicks) intensiveres. Rigtige veer: regelmæssige, stærkere, tættere.", partnerFocus: "Pak hospitalstasken — begge jeres. Det er for sent at pakke under veerne.", highlight: "Hospitalstasken skal pakkes nu", highlightEmoji: "🧳" },
  33: { babyDev: "Babys knogler hærder fuldstændigt — undtagen kraniet, der forbliver bøjeligt til fødslen.", motherBody: "Brysterne kan producere råmælk (colostrum) allerede nu — let gullig, klistret væske.", partnerFocus: "Kør ruten til hospitalet/fødestedet en gang. Find parkeringen. Kend alternativt transportmiddel.", highlight: "Råmælk begynder at dannes", highlightEmoji: "🤱" },
  34: { babyDev: "Baby sover 90-95% af dagen. CNS og immunforsvaret modnes. Øjnene kan fokusere.", motherBody: "Bækkenbunden bærer nu 10+ kg ekstra. Inkontinens er hyppigt — det er normalt.", partnerFocus: "Gennemgå jeres fødselsplan med jordemoderen. Kend jeres holdning til smertelindring.", highlight: "Immunforsvaret modnes", highlightEmoji: "🛡️" },
  35: { babyDev: "Baby fylder nu hele livmoderen. Plads er knap — bevægelserne mærkes anderledes.", motherBody: "Lysningsperioden starter — maven 'falder' lidt nedad. Åndedræt lettere, pres på blæren øges.", partnerFocus: "Meld dig syg eller tag hjemmefra-dage fremover. Vær tilgængelig. Timen kan komme pludseligt.", highlight: "Maven falder — lysning begynder", highlightEmoji: "⬇️" },
  36: { babyDev: "Baby er fuldt udviklet. Alt handler nu om at tage på. Lanugo-dunene forsvinder.", motherBody: "Uge 36-scaning tjekker præsentation og fostervand. GBS-test kan foretages.", partnerFocus: "Tjek at I har: bilsæde installeret, vugge klar, barnets tøj vasket, bleer og våde klude klar.", highlight: "Baby er fuldt udviklet", highlightEmoji: "✅" },
  37: { babyDev: "FULD TERMIN. Baby kan fødes til enhver tid og er klar. Vejer typisk 2,8-3,2 kg.", motherBody: "Cervix kan begynde at modne. Slimproppen kan afgå (brunlig/rosa slim) — fødsel inden for dage.", partnerFocus: "Sov. Tag resten. Energifyld. Fødslen kræver udholdenhed af jer begge.", highlight: "Fuld termin — baby er klar", highlightEmoji: "🏆" },
  38: { babyDev: "Baby producerer surfaktant der forhindrer lungernes alveolier i at klæbe sammen.", motherBody: "Veer kan starte. Husk: Regelmæssige veer (5-1-1 reglen: veer hvert 5. min, 1 min lange, i 1 time).", partnerFocus: "Sov med telefonen på lyd. Hav en plan for hvad du gør hvis veerne starter om natten.", highlight: "Lungerne er 100% klar", highlightEmoji: "🫁" },
  39: { babyDev: "Baby er typisk 50 cm lang. Voksbeskyttelsen (vernix) vaskes af under veer.", motherBody: "Træthed og uro er normalt. Følg instinkterne — mange kvinder har rastløs energi dagene før fødsel.", partnerFocus: "Vær til stede. Intet arbejde, ingen aftaler. Bare vær der.", highlight: "Fødslen er nær — stol på kroppen", highlightEmoji: "🌅" },
  40: { babyDev: "TERMIN. Baby er klar. Vejer typisk 3,0-3,5 kg og er 50-52 cm lang.", motherBody: "Termin er en gennemsnitsdato — 50% føder efter. Igangsættelse tilbydes typisk uge 41-42.", partnerFocus: "Hold telefonen opladet. Vær calm. Hun har brug for din ro mere end noget andet nu.", highlight: "TERMIN 🎉 I er klar", highlightEmoji: "🎉" },
};

export function getPregnancyWeekData(week: number): PregnancyWeekData {
  const keys = Object.keys(weeklyPregnancyData).map(Number).sort((a, b) => a - b);
  let closest = keys[0];
  for (const k of keys) { if (k <= week) closest = k; }
  return weeklyPregnancyData[closest] || weeklyPregnancyData[40];
}

// ── Standard Danish pregnancy appointments ────────────────────────────────────

export interface PregnancyAppointment {
  id: string;
  week: number;
  title: string;
  description: string;
  emoji: string;
  type: "scan" | "test" | "visit" | "course";
}

export const pregnancyAppointments: PregnancyAppointment[] = [
  { id: "a1", week: 8,  title: "1. jordemodersamtale", description: "Opstart hos jordemoder: helbred, arbejde, kost og screening-tilbud gennemgås.", emoji: "👩‍⚕️", type: "visit" },
  { id: "a2", week: 12, title: "Nakkefoldscanning", description: "Ultralydsscanning der måler nakkefold + kombineret med blodprøve.", emoji: "🔬", type: "scan" },
  { id: "a3", week: 15, title: "2. jordemodersamtale", description: "Gennemgang af screeningsresultater. Samtale om velvære.", emoji: "👩‍⚕️", type: "visit" },
  { id: "a4", week: 19, title: "Misdannelsesscanning", description: "Grundig anatomisk scanning. Hjertet, hjernen, rygraden og alle organer gennemgås.", emoji: "🫀", type: "scan" },
  { id: "a5", week: 25, title: "3. jordemodersamtale", description: "Blodtryk, jerntal og diabetes-screening. Gennemgang af veer og fødselstegn.", emoji: "👩‍⚕️", type: "visit" },
  { id: "a6", week: 28, title: "GDM-blodprøve", description: "Screening for svangerskabsdiabetes. Blodprøve efter faste.", emoji: "🩸", type: "test" },
  { id: "a7", week: 30, title: "Fødselsforberedelseskursus", description: "Kursus på hospitalet eller privat: veer, smertestillende, amning og de første dage.", emoji: "📚", type: "course" },
  { id: "a8", week: 32, title: "4. jordemodersamtale", description: "Babys position, bækkenbund, fødselsplan og tegn på for tidlig fødsel.", emoji: "👩‍⚕️", type: "visit" },
  { id: "a9", week: 36, title: "36-ugers scanning", description: "Tjekker babys præsentation (er hovedet nedad?), fostervandsmængde og placenta.", emoji: "📡", type: "scan" },
  { id: "a10", week: 37, title: "5. jordemodersamtale", description: "Cervix-vurdering, GBS-test, gennemgang af fødselstegn og plan for igangsættelse.", emoji: "👩‍⚕️", type: "visit" },
  { id: "a11", week: 39, title: "6. jordemodersamtale / afrunding", description: "Tjek af mor og baby. Plan for termin-overskridelse.", emoji: "👩‍⚕️", type: "visit" },
];

