import { useFamily } from "@/context/FamilyContext";
import { useDiary } from "@/context/DiaryContext";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { getActiveLeap, getNextLeap } from "@/lib/phaseData";

// ── A. WHAT MATTERS NOW — single primary message ──
export function WhatMattersNow() {
  const { profile, babyAgeWeeks, morName, farName, isOnLeave, tasks } = useFamily();
  const { activeSleep, todayNursingCount, todaySleepMinutes, sleepLogs, todayDiaperCount } = useDiary();
  const isMor = profile.role === "mor";
  const childName = profile.children?.[0]?.name || "baby";
  const partnerName = isMor ? farName : morName;

  const message = getWhatMattersMessage({
    isMor,
    childName,
    partnerName,
    babyAgeWeeks,
    activeSleep: !!activeSleep,
    nursingCount: todayNursingCount,
    sleepMinutes: todaySleepMinutes,
    lastSleepEnd: getLastSleepEnd(sleepLogs),
    isOnLeave: isOnLeave(profile.role),
    partnerOnLeave: isOnLeave(isMor ? "far" : "mor"),
    diaperCount: todayDiaperCount,
    tasks: tasks.map(t => ({ completed: t.completed, dueDate: t.dueDate, assignee: t.assignee, title: t.title })),
  });

  return (
    <div className="rounded-2xl overflow-hidden section-fade-in" style={{
      background: "linear-gradient(145deg, hsl(var(--moss)), hsl(var(--sage-dark)))",
    }}>
      <div className="px-5 py-5">
        <p className="text-[0.55rem] tracking-[0.2em] uppercase text-white/50 mb-2">LIGE NU</p>
        <p className="text-[1.15rem] font-medium text-white leading-snug mb-1">
          {message.title}
        </p>
        <p className="text-[0.78rem] text-white/70 leading-relaxed">
          {message.body}
        </p>
        {message.link && (
          <Link to={message.link} className="inline-flex items-center gap-1.5 mt-3 text-[0.68rem] tracking-[0.08em] uppercase text-white/80 hover:text-white transition-colors">
            {message.linkLabel} <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        )}
      </div>
    </div>
  );
}

function getLastSleepEnd(sleepLogs: any[]): number | null {
  const completed = sleepLogs.filter(l => l.endTime);
  if (completed.length === 0) return null;
  const sorted = [...completed].sort((a, b) => new Date(b.endTime!).getTime() - new Date(a.endTime!).getTime());
  return new Date(sorted[0].endTime!).getTime();
}

interface MessageInput {
  isMor: boolean;
  childName: string;
  partnerName: string;
  babyAgeWeeks: number;
  activeSleep: boolean;
  nursingCount: number;
  sleepMinutes: number;
  lastSleepEnd: number | null;
  isOnLeave: boolean;
  partnerOnLeave: boolean;
  diaperCount: number;
  tasks: { completed: boolean; dueDate: string; assignee: string; title: string }[];
}

interface WMMessage {
  title: string;
  body: string;
  link: string;
  linkLabel: string;
}

function getWhatMattersMessage(input: MessageInput): WMMessage {
  const { isMor, childName, partnerName, babyAgeWeeks, activeSleep, nursingCount, lastSleepEnd, isOnLeave, partnerOnLeave, diaperCount, tasks } = input;
  const hour = new Date().getHours();

  // ══════════════════════════════════════════════
  // PRIORITY 1: Sleep sweetspot (within 30 min)
  // ══════════════════════════════════════════════
  if (!activeSleep && lastSleepEnd) {
    const minutesSinceWake = (Date.now() - lastSleepEnd) / 60000;
    const maxWakeWindow = babyAgeWeeks < 6 ? 60 : babyAgeWeeks < 12 ? 90 : babyAgeWeeks < 26 ? 120 : 150;
    const timeLeft = maxWakeWindow - minutesSinceWake;

    if (timeLeft > 0 && timeLeft < 30) {
      const who = isMor && !isOnLeave && partnerOnLeave
        ? `Måske ${partnerName} kan putte?`
        : !isMor && isOnLeave
        ? "Du kan tage denne."
        : "";
      return {
        title: `${childName} er klar til en lur om ~${Math.round(timeLeft)} min 💤`,
        body: `Det kan være et godt tidspunkt at dæmpe lys og finde ro. ${who}`.trim(),
        link: "/sovn",
        linkLabel: "Søvnoverblik",
      };
    }
  }

  // Active sleep — suggest what to do
  if (activeSleep) {
    return {
      title: `${childName} sover 💤`,
      body: isMor
        ? "Brug tiden på dig selv. Hvil, spis, eller bare vær."
        : `God tid til at hjælpe ${partnerName} — eller tag en pause selv.`,
      link: "/sovn",
      linkLabel: "Se søvndata",
    };
  }

  // ══════════════════════════════════════════════
  // PRIORITY 2: Clinical flags (nursing/diaper)
  // ══════════════════════════════════════════════
  if (hour >= 14) {
    // Low nursing count for age
    const minNursing = babyAgeWeeks < 6 ? 6 : babyAgeWeeks < 16 ? 5 : 4;
    if (nursingCount > 0 && nursingCount < minNursing && hour >= 16) {
      return {
        title: `${childName} har fået ${nursingCount} måltider i dag`,
        body: `Anbefalingen er mindst ${minNursing} dagligt i denne alder. Måske tid til endnu et måltid?`,
        link: "/dagbog",
        linkLabel: "Se dagbogen",
      };
    }

    // Low diaper count
    if (diaperCount > 0 && diaperCount < 3 && hour >= 16 && babyAgeWeeks < 12) {
      return {
        title: `Kun ${diaperCount} bleskift logget i dag`,
        body: `Forventer typisk 4-6+ våde bleer dagligt. Hold øje med at ${childName} er godt hydreret.`,
        link: "/dagbog",
        linkLabel: "Log bleskift",
      };
    }
  }

  // ══════════════════════════════════════════════
  // PRIORITY 3: Tiger leap insights
  // ══════════════════════════════════════════════
  const activeLeap = getActiveLeap(babyAgeWeeks);
  if (activeLeap) {
    const leapTips = isMor
      ? `Ekstra nærhed og tålmodighed hjælper ${childName} igennem.`
      : `${childName} kan være ekstra klyngende. Hold fast — det er en fase.`;
    return {
      title: `${activeLeap.emoji} Tigerspring: ${activeLeap.title}`,
      body: leapTips,
      link: "/barn",
      linkLabel: "Se tigerspring",
    };
  }

  // ══════════════════════════════════════════════
  // PRIORITY 4: Partner support (role-specific)
  // ══════════════════════════════════════════════
  if (hour >= 12 && hour < 20) {
    if (isMor && isOnLeave && !partnerOnLeave && hour >= 15) {
      return {
        title: "Du har klaret dagen 💚",
        body: `Når ${partnerName} kommer hjem, prøv at sige hvad du har mest brug for. Det er ikke at klage — det er at kommunikere.`,
        link: "/sammen",
        linkLabel: "Samarbejde",
      };
    }
    if (!isMor && !isOnLeave && hour >= 14) {
      return {
        title: `${partnerName} har haft ${childName} hele dagen`,
        body: `Prøv at tage over med det samme, du kommer hjem. Selv 30 minutters pause gør en kæmpe forskel.`,
        link: "/sammen",
        linkLabel: "Se opgaver",
      };
    }
    if (!isMor && isOnLeave) {
      return {
        title: `Bliv hands-on med ${childName} 🙌`,
        body: `Brug din barselsdag proaktivt — tag bad, gåtur eller leg. Din binding styrkes hvert minut.`,
        link: "/leg",
        linkLabel: "Leg & aktiviteter",
      };
    }
  }

  // ══════════════════════════════════════════════
  // PRIORITY 5: Play & activity suggestions
  // ══════════════════════════════════════════════
  if (hour >= 9 && hour < 17 && lastSleepEnd) {
    const minutesSinceWake = (Date.now() - lastSleepEnd) / 60000;
    const maxWake = babyAgeWeeks < 6 ? 60 : babyAgeWeeks < 12 ? 90 : babyAgeWeeks < 26 ? 120 : 150;
    const inWakeWindow = minutesSinceWake > 10 && minutesSinceWake < maxWake * 0.6;

    if (inWakeWindow) {
      const activity = getAgeActivity(babyAgeWeeks, childName);
      return {
        title: activity.title,
        body: activity.body,
        link: "/leg",
        linkLabel: "Flere aktiviteter",
      };
    }
  }

  // ══════════════════════════════════════════════
  // PRIORITY 6: Daily tasks
  // ══════════════════════════════════════════════
  const today = new Date().toISOString().slice(0, 10);
  const todayTasks = tasks.filter(t => t.dueDate === today && !t.completed);
  const myTasks = todayTasks.filter(t => t.assignee === (isMor ? "mor" : "far") || t.assignee === "fælles");

  if (myTasks.length > 0) {
    return {
      title: `${myTasks.length} opgave${myTasks.length > 1 ? "r" : ""} i dag 📋`,
      body: `Du har ting på listen — tag dem i det tempo der passer.`,
      link: "/sammen",
      linkLabel: "Se alle opgaver",
    };
  }

  // ══════════════════════════════════════════════
  // PRIORITY 7: Time-based encouragement (fallback)
  // ══════════════════════════════════════════════
  return getTimeBasedFallback(hour, isMor, childName, partnerName, babyAgeWeeks);
}

// ── Age-appropriate activity suggestions ──
function getAgeActivity(ageWeeks: number, childName: string): { title: string; body: string } {
  if (ageWeeks < 6) return {
    title: `Tid til nærvær med ${childName} 🤲`,
    body: "Hud-mod-hud, øjenkontakt og rolige lyde. Det er alt der skal til lige nu.",
  };
  if (ageWeeks < 12) return {
    title: `Tummy time med ${childName} 💪`,
    body: "3-5 minutter på maven styrker nakke og ryg. Læg dig ved siden af!",
  };
  if (ageWeeks < 20) return {
    title: `Sanselegetid med ${childName} 🎵`,
    body: "Prøv en rangle, synge en sang, eller vis kontrastbilleder. Alt er nyt og spændende!",
  };
  if (ageWeeks < 30) return {
    title: `Udforsk sammen med ${childName} 🧩`,
    body: "Stof-bøger, gribelegetøj, eller bare udforsk ting i køkkenet. Alt er en opdagelse!",
  };
  return {
    title: `Leg med ${childName} 🎈`,
    body: "Byg tårne, leg tittit-bansen, eller gå på opdagelse. Leg er læring!",
  };
}

// ── Time-based fallback messages ──
function getTimeBasedFallback(hour: number, isMor: boolean, childName: string, partnerName: string, ageWeeks: number): WMMessage {
  if (hour < 7) {
    return {
      title: "Stille morgenstund 🌅",
      body: isMor
        ? `Mærk efter hvad du har brug for i dag. Du behøver ikke have en plan.`
        : `Stille morgen med ${childName}? En gåtur i barnevognen giver ro for jer begge.`,
      link: "/chat",
      linkLabel: "Spørg Melo",
    };
  }
  if (hour < 10) {
    return {
      title: `Godmorgen ☀️`,
      body: `God dag at dele morgenrutinen og finde jeres rytme sammen.`,
      link: "/sammen",
      linkLabel: "Se opgaver",
    };
  }
  if (hour < 17) {
    const nextLeap = getNextLeap(ageWeeks);
    if (nextLeap) {
      const weeksUntil = nextLeap.weekStart - ageWeeks;
      return {
        title: `Næste tigerspring om ${weeksUntil} ${weeksUntil === 1 ? "uge" : "uger"} ${nextLeap.emoji}`,
        body: `"${nextLeap.title}" — ${nextLeap.description.slice(0, 80)}...`,
        link: "/barn",
        linkLabel: "Læs mere",
      };
    }
    return {
      title: `God dag med ${childName} 🌿`,
      body: "I finder jeres rytme. Én ting ad gangen.",
      link: "/leg",
      linkLabel: "Leg & aktiviteter",
    };
  }
  if (hour < 21) {
    return {
      title: `Aftenrutine — hold det enkelt 🌙`,
      body: `Bad, ble, nattøj, ro. ${childName} mærker jeres stemning.`,
      link: "/sovn",
      linkLabel: "Søvnguide",
    };
  }
  return {
    title: "God nat, I klarer det 💛",
    body: isMor
      ? "Hvil dig. I morgen er en ny dag."
      : `Sørg for at ${partnerName} også får sovet. I er et team.`,
    link: "/chat",
    linkLabel: "Spørg Melo",
  };
}

// ── B. TODAY'S FLOW — who does what ──
export function TodaysFlow() {
  const { profile, morName, farName, isOnLeave } = useFamily();
  const hour = new Date().getHours();
  const childName = profile.children?.[0]?.name || "baby";

  const morLeave = isOnLeave("mor");
  const farLeave = isOnLeave("far");

  // Generate simple flow based on leave status
  const slots = generateFlowSlots(morName, farName, morLeave, farLeave, childName);
  const currentSlotIndex = slots.findIndex(s => hour >= s.startHour && hour < s.endHour);

  return (
    <div className="card-soft section-fade-in" style={{ animationDelay: "40ms" }}>
      <p className="text-[0.55rem] tracking-[0.18em] uppercase text-muted-foreground mb-3">DAGENS FLOW</p>

      <div className="space-y-1">
        {slots.map((slot, i) => {
          const isCurrent = i === currentSlotIndex;
          return (
            <div key={i} className="flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all" style={{
              background: isCurrent ? "hsl(var(--sage-light))" : "transparent",
              border: isCurrent ? "1px solid hsl(var(--sage) / 0.2)" : "1px solid transparent",
            }}>
              <div className="w-6 text-center">
                {slot.icon}
              </div>
              <div className="flex-1">
                <p className={`text-[0.82rem] ${isCurrent ? "font-semibold" : "font-normal text-foreground/60"}`}>
                  {slot.label}
                </p>
              </div>
              <span className={`text-[0.65rem] ${isCurrent ? "font-medium" : "text-muted-foreground"}`}>
                {slot.who}
              </span>
              {isCurrent && (
                <span className="text-[0.55rem] tracking-[0.1em] uppercase px-2 py-0.5 rounded-full" style={{
                  background: "hsl(var(--moss))",
                  color: "white",
                }}>NU</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function generateFlowSlots(morName: string, farName: string, morLeave: boolean, farLeave: boolean, childName: string) {
  // Both on leave — balanced
  if (morLeave && farLeave) {
    return [
      { startHour: 6, endHour: 10, icon: "🌅", label: "Morgen", who: farName },
      { startHour: 10, endHour: 13, icon: "☀️", label: "Formiddag", who: morName },
      { startHour: 13, endHour: 17, icon: "🌤️", label: "Eftermiddag", who: farName },
      { startHour: 17, endHour: 20, icon: "🌆", label: "Aften", who: "Sammen" },
      { startHour: 20, endHour: 6, icon: "🌙", label: "Nat", who: "Skiftes" },
    ];
  }

  // Mom on leave, dad working
  if (morLeave && !farLeave) {
    return [
      { startHour: 6, endHour: 8, icon: "🌅", label: "Morgen", who: farName },
      { startHour: 8, endHour: 16, icon: "☀️", label: "Dag", who: morName },
      { startHour: 16, endHour: 20, icon: "🌆", label: "Sen eftm. + aften", who: farName },
      { startHour: 20, endHour: 6, icon: "🌙", label: "Nat", who: "Skiftes" },
    ];
  }

  // Dad on leave, mom working
  if (!morLeave && farLeave) {
    return [
      { startHour: 6, endHour: 8, icon: "🌅", label: "Morgen", who: morName },
      { startHour: 8, endHour: 16, icon: "☀️", label: "Dag", who: farName },
      { startHour: 16, endHour: 20, icon: "🌆", label: "Sen eftm. + aften", who: morName },
      { startHour: 20, endHour: 6, icon: "🌙", label: "Nat", who: "Skiftes" },
    ];
  }

  // Neither on leave — coordination
  return [
    { startHour: 6, endHour: 8, icon: "🌅", label: "Morgen", who: "Skiftes" },
    { startHour: 8, endHour: 16, icon: "☀️", label: "Dag", who: "Passer/institution" },
    { startHour: 16, endHour: 20, icon: "🌆", label: "Aften", who: "Sammen" },
    { startHour: 20, endHour: 6, icon: "🌙", label: "Nat", who: "Skiftes" },
  ];
}

// ── C. SUPPORT INSIGHT — soft, non-judging balance signal ──
export function SupportInsight() {
  const { tasks, morName, farName, profile } = useFamily();
  const { todayNursingCount, todayDiaperCount } = useDiary();
  const isMor = profile.role === "mor";

  // Calculate soft balance signal from task completion patterns (last 7 days)
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const recentTasks = tasks.filter(t => t.completed && t.dueDate >= weekAgo);
  const morTasks = recentTasks.filter(t => t.assignee === "mor").length;
  const farTasks = recentTasks.filter(t => t.assignee === "far").length;
  const total = morTasks + farTasks;

  // Determine insight — NEVER show percentages or blame
  let insight: { emoji: string; text: string; action: string; actionLink?: string } | null = null;

  if (total < 3) {
    // Not enough data
    insight = {
      emoji: "🌱",
      text: "Brug opgavelisten til at synliggøre hvem der gør hvad — det hjælper jer begge.",
      action: "Se opgaver",
      actionLink: "/sammen",
    };
  } else if (total > 0) {
    const ratio = morTasks / total;
    if (ratio > 0.7) {
      insight = {
        emoji: "🤝",
        text: "Det ser ud til at den ene af jer har haft lidt ekstra den seneste uge. Måske I kan bytte en rutine i dag?",
        action: "Fordel opgaver",
        actionLink: "/sammen",
      };
    } else if (ratio < 0.3) {
      insight = {
        emoji: "🤝",
        text: "Det ser ud til at den ene af jer har taget lidt ekstra. Sørg for at begge får pauser.",
        action: "Se fordeling",
        actionLink: "/sammen",
      };
    } else {
      insight = {
        emoji: "💚",
        text: "I har fordelt tingene godt den seneste uge. Bliv ved med at snakke om det.",
        action: "",
      };
    }
  }

  if (!insight) return null;

  return (
    <div className="rounded-2xl px-4 py-3.5 section-fade-in" style={{
      background: "hsl(var(--cream))",
      border: "1px solid hsl(var(--stone-light))",
      animationDelay: "80ms",
    }}>
      <div className="flex items-start gap-3">
        <span className="text-lg flex-shrink-0">{insight.emoji}</span>
        <div className="flex-1">
          <p className="text-[0.78rem] text-foreground/70 leading-relaxed">{insight.text}</p>
          {insight.action && insight.actionLink && (
            <Link to={insight.actionLink} className="inline-flex items-center gap-1 mt-1.5 text-[0.68rem] font-medium transition-colors" style={{ color: "hsl(var(--moss))" }}>
              {insight.action} <ArrowRight className="w-3 h-3" />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

// ── D. ONE NUDGE — single actionable suggestion ──
export function OneNudge() {
  const { profile, morName, farName, isOnLeave, babyAgeWeeks } = useFamily();
  const { todaySleepMinutes } = useDiary();
  const isMor = profile.role === "mor";
  const childName = profile.children?.[0]?.name || "baby";
  const partnerName = isMor ? farName : morName;

  const nudge = getNudge(isMor, childName, partnerName, babyAgeWeeks, isOnLeave(profile.role), todaySleepMinutes);

  return (
    <div className="rounded-2xl px-4 py-3.5 section-fade-in" style={{
      background: isMor
        ? "linear-gradient(135deg, hsl(var(--clay) / 0.08), hsl(var(--clay) / 0.03))"
        : "linear-gradient(135deg, hsl(var(--sage) / 0.08), hsl(var(--sage) / 0.03))",
      border: `1px solid hsl(var(--${isMor ? "clay" : "sage"}) / 0.15)`,
      animationDelay: "120ms",
    }}>
      <div className="flex items-start gap-3">
        <span className="text-lg flex-shrink-0">{nudge.emoji}</span>
        <div>
          <p className="text-[0.88rem] font-medium mb-0.5">{nudge.text}</p>
          <p className="text-[0.72rem] text-muted-foreground">{nudge.detail}</p>
        </div>
      </div>
    </div>
  );
}

function getNudge(isMor: boolean, childName: string, partnerName: string, ageWeeks: number, onLeave: boolean, sleepMinutes: number) {
  const hour = new Date().getHours();
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);

  if (isMor) {
    const morNudges = [
      { emoji: "☕", text: "Tag 15 minutter for dig selv", detail: "Du behøver ikke en grund. Bare gør det." },
      { emoji: "🚶‍♀️", text: "Gå en tur — alene", detail: "Frisk luft og stilhed gør underværker." },
      { emoji: "💬", text: `Fortæl ${partnerName} hvad du har brug for`, detail: "At bede om hjælp er styrke, ikke svaghed." },
      { emoji: "🛁", text: "Bad eller varm drik", detail: "Små ting der føles store lige nu." },
      { emoji: "📝", text: "Skriv én ting du er taknemmelig for", detail: "Det ændrer perspektivet." },
    ];
    return morNudges[dayOfYear % morNudges.length];
  }

  const farNudges = [
    { emoji: "🏃", text: `Tag ${childName} med på en kort gåtur`, detail: `${partnerName} får en pause — I får frisk luft.` },
    { emoji: "💬", text: `Sig noget rart til ${partnerName}`, detail: "'Jeg ser alt det du gør' virker altid." },
    { emoji: "🍳", text: "Lav aftensmad i dag", detail: "Praktisk hjælp > store ord." },
    { emoji: "🌙", text: "Tag aftenrutinen i aften", detail: `Bad, ble, nattøj — du klarer det, ${childName} elsker det.` },
    { emoji: "🫂", text: `Giv ${partnerName} en fuld pause`, detail: "Bare 30 minutter uden ansvar gør en kæmpe forskel." },
    { emoji: "👀", text: "Se hvad der skal gøres — og gør det", detail: "Ingen huskeliste. Bare gør det." },
  ];

  return farNudges[dayOfYear % farNudges.length];
}

// ── DAILY CHECK-IN — very light mood check ──
export function DailyCheckIn() {
  const { addCheckIn, todayCheckIn, profile } = useFamily();

  const moods = [
    { emoji: "😊", label: "Godt", response: "Skønt! Nyd de gode øjeblikke 💛" },
    { emoji: "😐", label: "Okay", response: "Helt fint. Én dag ad gangen." },
    { emoji: "😔", label: "Svært", response: "Tak fordi du mærker efter. Du gør det bedre end du tror." },
  ];

  if (todayCheckIn) {
    const mood = moods.find(m => m.label === todayCheckIn.mood) || moods[1];
    return (
      <div className="rounded-2xl px-4 py-3 section-fade-in" style={{
        background: "hsl(var(--cream))",
        border: "1px solid hsl(var(--stone-light))",
        animationDelay: "160ms",
      }}>
        <div className="flex items-center gap-3">
          <span className="text-xl">{mood.emoji}</span>
          <p className="text-[0.78rem] text-foreground/70">{mood.response}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card-soft section-fade-in" style={{ animationDelay: "160ms" }}>
      <p className="text-[0.78rem] font-medium mb-2.5">Hvordan har du det i dag?</p>
      <div className="flex gap-2">
        {moods.map(m => (
          <button
            key={m.label}
            onClick={() => addCheckIn(m.label)}
            className="flex-1 flex flex-col items-center gap-1 py-3 rounded-xl transition-all active:scale-95"
            style={{ background: "hsl(var(--stone-lighter))", border: "1px solid hsl(var(--stone-light))" }}
          >
            <span className="text-xl">{m.emoji}</span>
            <span className="text-[0.62rem] text-muted-foreground">{m.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
// FrictionAlert logic is now integrated into WhatMattersNow
