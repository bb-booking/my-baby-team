import { useState, useCallback } from "react";

export interface DiaryEntry {
  id: string;
  date: string; // "YYYY-MM-DD"
  week: number;
  mood: 1 | 2 | 3 | 4 | 5;
  energy: 1 | 2 | 3;
  symptoms: string[];
  cravings: string;
  note: string;
  timestamp: string;
}

export interface Advice {
  icon: string;
  title: string;
  text: string;
  bg: string;
  action?: { label: string; path: string };
}

const STORAGE_KEY = "melo-pregnancy-diary";

function loadEntries(): DiaryEntry[] {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); } catch { return []; }
}

function saveEntries(entries: DiaryEntry[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

export function usePregnancyDiary() {
  const [entries, setEntries] = useState<DiaryEntry[]>(loadEntries);

  const addEntry = useCallback((entry: Omit<DiaryEntry, "id" | "timestamp">) => {
    const newEntry: DiaryEntry = { ...entry, id: Date.now().toString(), timestamp: new Date().toISOString() };
    setEntries(prev => {
      const today = new Date().toISOString().slice(0, 10);
      const filtered = prev.filter(e => e.date !== today);
      const next = [newEntry, ...filtered].sort((a, b) => b.timestamp.localeCompare(a.timestamp));
      saveEntries(next);
      return next;
    });
    return newEntry;
  }, []);

  const todayStr = new Date().toISOString().slice(0, 10);
  const todayEntry = entries.find(e => e.date === todayStr) ?? null;

  return { entries, addEntry, todayEntry };
}

// ── Advice engine ──────────────────────────────────────────────────────────────
export function getPersonalizedAdvice(
  mood: number,
  energy: number,
  symptoms: string[],
  week: number
): Advice[] {
  const pool: Advice[] = [];

  // ── Mood ──
  if (mood <= 2) {
    pool.push({
      icon: "💚",
      title: "Tal med MELO om det",
      text: "Det er normalt at have svære dage under graviditeten. MELO lytter og hjælper dig bearbejde dine følelser uden at dømme.",
      bg: "hsl(var(--sage-light))",
      action: { label: "Åbn MELO", path: "/chat" },
    });
    pool.push({
      icon: "🤝",
      title: "Del det med din partner",
      text: "Fortæl din partner præcis hvordan du har det — de vil gerne hjælpe, men de kan ikke gætte det.",
      bg: "hsl(var(--stone-lighter))",
      action: { label: "Se samarbejde", path: "/samen" },
    });
  }
  if (mood >= 4) {
    pool.push({
      icon: "🌸",
      title: "Godt humør smitter",
      text: "Del din glæde med din partner og baby. Positive hormoner styrker jeres bånd allerede nu.",
      bg: "hsl(var(--clay-light))",
    });
  }

  // ── Energy ──
  if (energy === 1) {
    pool.push({
      icon: "😴",
      title: "Din krop beder om hvile",
      text: `Lav energi i uge ${week} er normalt. Hvile er ikke dovenskab — din krop arbejder hårdt for jer begge.`,
      bg: "hsl(var(--stone-lighter))",
    });
  }
  if (energy === 3) {
    pool.push({
      icon: "⚡",
      title: "Brug energien klogt",
      text: "Perfekt til en gåtur, svømmning eller let yoga. Bevægelse er godt for dig og baby — og giver bedre søvn.",
      bg: "hsl(var(--sage-light))",
      action: { label: "Spørg MELO om øvelser", path: "/chat" },
    });
  }

  // ── Symptoms ──
  if (symptoms.includes("kvalme")) {
    pool.push({
      icon: "🤢",
      title: "Mod kvalmen",
      text: "Spis en tør kiks inden du stiger op. Ingefær-te, frisk luft og hyppige, kleine måltider hjælper mange.",
      bg: "hsl(var(--warm-white))",
    });
  }
  if (symptoms.includes("traethed")) {
    pool.push({
      icon: "😴",
      title: "Træthed er et godt tegn",
      text: "Din krop producerer 50% mere blod og bygger et helt nyt organ (placenta). Det er hårdt arbejde.",
      bg: "hsl(var(--stone-lighter))",
    });
  }
  if (symptoms.includes("rygsmerter")) {
    pool.push({
      icon: "🦴",
      title: "Blødere ryg",
      text: "Cat-cow stræk, svømmning eller et varmt bad hjælper. En graviditetspude under maven letter trykket om natten.",
      bg: "hsl(var(--stone-lighter))",
      action: { label: "Spørg MELO om øvelser", path: "/chat" },
    });
  }
  if (symptoms.includes("halsbrand")) {
    pool.push({
      icon: "🔥",
      title: "Halsbrand-tip",
      text: "Spis mindre portioner hyppigere og undgå at ligge ned inden for 2 timer efter mad. Elevér hoofdenden lidt.",
      bg: "hsl(var(--clay-light))",
    });
  }
  if (symptoms.includes("soevnproblemer")) {
    pool.push({
      icon: "🌙",
      title: "Bedre søvn",
      text: "Sov på venstre side med en pude mellem knæene. Undgå skærme 1 time før sengetid og hold sovevær'et køligt.",
      bg: "hsl(var(--stone-lighter))",
    });
  }
  if (symptoms.includes("haevedankler")) {
    pool.push({
      icon: "🦶",
      title: "Hævede ankler",
      text: "Løft benene over hjertehøjde 15-20 min dagligt. Drik rigeligt vand og reducer salt. Undgå at sidde stille længe.",
      bg: "hsl(var(--sage-light))",
    });
  }
  if (symptoms.includes("angst")) {
    pool.push({
      icon: "🫁",
      title: "Box-vejrtrækning virker",
      text: "Ånd ind 4 sek → hold 4 sek → ånd ud 4 sek → hold 4 sek. Gentag 4 gange. Aktiverer dit parasympatiske system.",
      bg: "hsl(var(--sage-light))",
      action: { label: "Tal med MELO", path: "/chat" },
    });
  }
  if (symptoms.includes("spark")) {
    pool.push({
      icon: "👶",
      title: "Baby siger hej!",
      text: "10 spark om dagen er et godt tegn. Læg mærke til hvornår baby er mest aktiv — det er jeres fælles rytme.",
      bg: "hsl(var(--clay-light))",
    });
  }
  if (symptoms.includes("hovedpine")) {
    pool.push({
      icon: "💆",
      title: "Hovedpine under graviditet",
      text: "Drik vand, hvil i et mørkt rum og brug en kold klud. Kontakt din jordemoder ved vedvarende kraftig hovedpine.",
      bg: "hsl(var(--stone-lighter))",
    });
  }
  if (symptoms.includes("glaede")) {
    pool.push({
      icon: "🎉",
      title: "Nyd øjeblikket",
      text: "Denne glæde er vigtig. Skriv den ned, del den med din partner — og lad den fylde dig.",
      bg: "hsl(var(--clay-light))",
    });
  }

  // ── Week-specific ──
  if (week >= 28 && week < 36 && symptoms.length < 3) {
    pool.push({
      icon: "🧳",
      title: "Pak hospitalstasken",
      text: "Fra uge 28 er det klogt at begynde. Tjeklisten hjælper dig huske det vigtigste.",
      bg: "hsl(var(--clay-light))",
      action: { label: "Se tjekliste", path: "/tjekliste" },
    });
  }
  if (week >= 20 && week < 28) {
    pool.push({
      icon: "🎓",
      title: "Fødselsforberedelse",
      text: `I er i uge ${week} — mange hold starter tilmeldingen nu. Gør det til en fælles oplevelse.`,
      bg: "hsl(var(--sage-light))",
      action: { label: "Tilføj som opgave", path: "/samen" },
    });
  }

  // ── Fallback ──
  if (pool.length === 0) {
    pool.push({
      icon: "🌿",
      title: "Du gør det godt",
      text: "Fortsæt med at tjekke ind dagligt — over tid kan du se mønstre i din energi og dit humør.",
      bg: "hsl(var(--sage-light))",
    });
  }

  return pool.slice(0, 3);
}

// ── Symptom config ─────────────────────────────────────────────────────────────
export const SYMPTOMS = [
  { key: "kvalme",         label: "Kvalme",              icon: "🤢" },
  { key: "traethed",       label: "Træthed",             icon: "😴" },
  { key: "rygsmerter",     label: "Rygsmerter",          icon: "🦴" },
  { key: "halsbrand",      label: "Halsbrand",           icon: "🔥" },
  { key: "haevedankler",   label: "Hævede ankler",       icon: "🦶" },
  { key: "soevnproblemer", label: "Søvnproblemer",       icon: "🌙" },
  { key: "hovedpine",      label: "Hovedpine",           icon: "💆" },
  { key: "spark",          label: "Mærkede spark",       icon: "👶" },
  { key: "angst",          label: "Uro/angst",           icon: "😰" },
  { key: "glaede",         label: "Glæde og begejstring",icon: "🌸" },
  { key: "aandennoed",     label: "Åndenød",             icon: "😮‍💨" },
  { key: "cravings",       label: "Cravings",            icon: "🍕" },
];

export const MOOD_OPTIONS = [
  { value: 1 as const, emoji: "😔", label: "Svær dag" },
  { value: 2 as const, emoji: "😕", label: "Lidt tung" },
  { value: 3 as const, emoji: "😐", label: "Okay" },
  { value: 4 as const, emoji: "🙂", label: "God dag" },
  { value: 5 as const, emoji: "😄", label: "Fantastisk" },
];

export const ENERGY_OPTIONS = [
  { value: 1 as const, label: "Lav", icon: "🔋", sub: "Klar til sofaen" },
  { value: 2 as const, label: "Middel", icon: "🔋", sub: "Okay men træt" },
  { value: 3 as const, label: "Høj", icon: "⚡", sub: "Fuld af energi" },
];
