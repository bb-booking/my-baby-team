// Example data for the pregnancy phase

export type LifePhase = "pregnant" | "newborn" | "baby";
export type ParentRole = "mor" | "far";

export interface WeekData {
  week: number;
  totalWeeks: number;
  trimester: number;
  babySize: string;
  babySizeEmoji: string;
  insight: string;
  milestone: string | null;
}

export interface Task {
  id: string;
  title: string;
  assignee: ParentRole | "fælles";
  completed: boolean;
  category: "health" | "preparation" | "admin" | "relationship";
}

export interface PartnerTask {
  id: string;
  title: string;
  forRole: ParentRole;
  hint: string;
}

export const currentWeek: WeekData = {
  week: 20,
  totalWeeks: 40,
  trimester: 2,
  babySize: "En banan",
  babySizeEmoji: "🍌",
  insight: "Baby kan nu høre lyde udefra. Tal, syng og læs højt — det styrker jeres bånd allerede nu.",
  milestone: "Halvvejs! Scanning i denne uge kan afsløre køn.",
};

export const tasks: Task[] = [
  {
    id: "1",
    title: "Book jordemoder-besøg",
    assignee: "mor",
    completed: false,
    category: "health",
  },
  {
    id: "2",
    title: "Undersøg barselsrettigheder",
    assignee: "far",
    completed: false,
    category: "admin",
  },
  {
    id: "3",
    title: "Køb barnevogn sammen",
    assignee: "fælles",
    completed: true,
    category: "preparation",
  },
];

export const partnerTasks: PartnerTask[] = [
  {
    id: "p1",
    title: "Lav aftensmad i aften",
    forRole: "far",
    hint: "Mor er ekstra træt i denne uge — en lille ting gør en stor forskel.",
  },
  {
    id: "p2",
    title: "Planlæg en rolig aften sammen",
    forRole: "fælles",
    hint: "Kvalitetstid styrker jeres team inden baby kommer.",
  },
];

export const milestones = [
  { week: 8, label: "Hjertet slår", unlocked: true },
  { week: 12, label: "Første trimester ✓", unlocked: true },
  { week: 16, label: "Baby bevæger sig", unlocked: true },
  { week: 20, label: "Halvvejs!", unlocked: true, active: true },
  { week: 24, label: "Levedygtig", unlocked: false },
  { week: 28, label: "Tredje trimester", unlocked: false },
  { week: 32, label: "Baby vender sig", unlocked: false },
  { week: 36, label: "Snart klar", unlocked: false },
  { week: 40, label: "Termin 🎉", unlocked: false },
];
