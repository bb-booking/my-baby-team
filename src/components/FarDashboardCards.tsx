import { useFamily } from "@/context/FamilyContext";
import { useDiary } from "@/context/DiaryContext";
import { Zap, ArrowRight, Trophy, Target, Heart, Flame, Shield } from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import confetti from "canvas-confetti";

// ── Far Streak Bar — gamification XP system ──
export function FarStreakBar() {
  const { profile } = useFamily();
  const { todayNursingCount, todayDiaperCount, todaySleepMinutes } = useDiary();

  // Calculate XP from today's actions
  const feedingXP = todayNursingCount * 10;
  const diaperXP = todayDiaperCount * 15;
  const sleepXP = Math.floor(todaySleepMinutes / 30) * 5;
  const totalXP = feedingXP + diaperXP + sleepXP;

  // Streak from localStorage
  const [streak, setStreak] = useState(() => {
    try {
      const s = localStorage.getItem("lille-far-streak");
      return s ? JSON.parse(s) : { days: 0, lastDate: "" };
    } catch { return { days: 0, lastDate: "" }; }
  });

  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    if (totalXP > 0 && streak.lastDate !== today) {
      const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
      const newDays = streak.lastDate === yesterday ? streak.days + 1 : 1;
      const newStreak = { days: newDays, lastDate: today };
      setStreak(newStreak);
      localStorage.setItem("lille-far-streak", JSON.stringify(newStreak));
    }
  }, [totalXP]);

  // Level system
  const level = Math.floor(totalXP / 50) + 1;
  const xpInLevel = totalXP % 50;
  const xpPct = Math.min((xpInLevel / 50) * 100, 100);

  const levelTitles = ["Rookie", "Sidekick", "Wingman", "Kaptajn", "Legende", "MVP"];
  const title = levelTitles[Math.min(level - 1, levelTitles.length - 1)];

  return (
    <div className="rounded-2xl overflow-hidden section-fade-in" style={{
      background: "linear-gradient(135deg, hsl(var(--sage) / 0.08), hsl(var(--sage) / 0.03))",
      border: "1px solid hsl(var(--sage) / 0.15)",
    }}>
      <div className="px-4 py-3.5">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "hsl(var(--sage-light))" }}>
              <Trophy className="w-4 h-4" style={{ color: "hsl(var(--moss))" }} />
            </div>
            <div>
              <p className="text-[0.72rem] font-semibold">Level {level} · {title}</p>
              <p className="text-[0.58rem] text-muted-foreground">{totalXP} XP i dag</p>
            </div>
          </div>
          {streak.days > 0 && (
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-full" style={{ background: "hsl(var(--clay-light))" }}>
              <Flame className="w-3.5 h-3.5" style={{ color: "hsl(var(--clay))" }} />
              <span className="text-[0.68rem] font-bold" style={{ color: "hsl(var(--bark))" }}>{streak.days}</span>
            </div>
          )}
        </div>

        {/* XP progress bar */}
        <div className="h-2 rounded-full overflow-hidden" style={{ background: "hsl(var(--stone-lighter))" }}>
          <div className="h-full rounded-full transition-all duration-700" style={{
            width: `${xpPct}%`,
            background: "linear-gradient(90deg, hsl(var(--sage)), hsl(var(--moss)))",
          }} />
        </div>
        <p className="text-[0.52rem] text-muted-foreground mt-1 text-right">{xpInLevel}/50 XP til næste level</p>

        {/* XP breakdown */}
        <div className="flex gap-3 mt-2">
          {feedingXP > 0 && <span className="text-[0.58rem] text-muted-foreground">🍼 +{feedingXP}</span>}
          {diaperXP > 0 && <span className="text-[0.58rem] text-muted-foreground">🧷 +{diaperXP}</span>}
          {sleepXP > 0 && <span className="text-[0.58rem] text-muted-foreground">💤 +{sleepXP}</span>}
          {totalXP === 0 && <span className="text-[0.58rem] text-muted-foreground">Log aktiviteter for at optjene XP</span>}
        </div>
      </div>
    </div>
  );
}

// ── Mor Empathy Card — understand what she's going through ──
export function MorEmpathyCard({ ageWeeks, morName }: { ageWeeks: number; morName: string }) {
  const [expanded, setExpanded] = useState(false);

  const content = ageWeeks < 2 ? {
    emoji: "🫂",
    title: `Hvad ${morName} oplever lige nu`,
    headline: "Kroppen heler efter fødslen",
    facts: [
      "Livmoderen trækker sig sammen — det gør ondt, især under amning",
      "Hormonerne crasher: østrogen falder 100× på 3 dage",
      "Brysterne kan være ømme, hævede og smertefulde",
      "Søvnmangel påvirker humør, hukommelse og tålmodighed",
    ],
    action: `Spørg ikke "kan jeg hjælpe?" — gør det bare. Tag opvasken, hent vand, lav mad.`,
  } : ageWeeks < 6 ? {
    emoji: "💛",
    title: `Hvad ${morName} oplever lige nu`,
    headline: "Baby blues rammer op til 80%",
    facts: [
      "Pludselig gråd, angst, irritabilitet — det er hormonelt og NORMALT",
      "Hun kan føle sig utilstrækkelig selvom hun gør det fantastisk",
      "Amning er et fuldtidsjob: 8-12 gange i døgnet, 20-45 min pr. gang",
      "Mental load: hun tænker på alt — mad, bleer, tøj, læge, næste amning",
    ],
    action: `Sig: "Du gør det fantastisk, og jeg ser alt det du gør." Mén det.`,
  } : ageWeeks < 12 ? {
    emoji: "🧠",
    title: `Hvad ${morName} oplever lige nu`,
    headline: "Mental load er usynligt arbejde",
    facts: [
      "Hun holder styr på: sovevinduer, amning, lægeaftaler, tøjstørrelser, madplan",
      "At bede om hjælp ER også arbejde — tag initiativ selv",
      "'Mor-guilt': hun føler sig forkert uanset hvad hun vælger",
      "Identitetskrise: hun er ikke kun 'mor' — hun savner sig selv",
    ],
    action: `Tag en hel aften alene med baby. Sig: "Tag ud, gør noget for dig selv."`,
  } : {
    emoji: "💪",
    title: `Hvad ${morName} oplever lige nu`,
    headline: "Hun finder sin nye rytme",
    facts: [
      "Kroppen er stadig under forandring — det tager 12+ mdr. at hele fuldt",
      "Sammenligning med andre mødre er en konstant kamp",
      "Hun har brug for anerkendelse, ikke gode råd",
      "Parforholdet er under pres — prioritér tid sammen",
    ],
    action: `Planlæg en date night. Bare 2 timer gør en kæmpe forskel.`,
  };

  return (
    <div className="rounded-2xl overflow-hidden section-fade-in" style={{
      background: "linear-gradient(135deg, hsl(var(--clay) / 0.08), hsl(var(--clay) / 0.03))",
      border: "1px solid hsl(var(--clay) / 0.15)",
    }}>
      <button onClick={() => setExpanded(!expanded)} className="w-full text-left px-4 py-3.5 transition-all active:scale-[0.995]">
        <div className="flex items-center gap-3">
          <span className="text-xl">{content.emoji}</span>
          <div className="flex-1">
            <p className="text-[0.58rem] tracking-[0.14em] uppercase text-muted-foreground">FORSTÅ HINANDEN</p>
            <p className="text-[0.88rem] font-medium">{content.headline}</p>
          </div>
          <span className={`text-muted-foreground text-[0.7rem] transition-transform ${expanded ? "rotate-180" : ""}`}>▼</span>
        </div>
      </button>

      {expanded && (
        <div className="px-4 pb-4 animate-fade-in">
          <ul className="space-y-2 mb-3">
            {content.facts.map((fact, i) => (
              <li key={i} className="flex items-start gap-2 text-[0.75rem] text-foreground/70 leading-relaxed">
                <span className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ background: "hsl(var(--clay))" }} />
                {fact}
              </li>
            ))}
          </ul>
          <div className="rounded-xl px-3 py-2.5" style={{ background: "hsl(var(--clay) / 0.1)" }}>
            <p className="text-[0.75rem] font-medium" style={{ color: "hsl(var(--bark))" }}>
              💡 {content.action}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Far: Daily Action Card ("Hvad kan jeg gøre i dag?") ──
export function FarDailyActionCard() {
  const { morName, babyAgeWeeks, profile } = useFamily();
  const childName = profile.children?.[0]?.name || "baby";
  const [completedActions, setCompletedActions] = useState<string[]>([]);

  const allActions = getDailyActions(babyAgeWeeks, morName, childName);
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
  const shuffled = [...allActions].map((a, i) => ({ ...a, sort: (dayOfYear * 7 + i * 13) % 100 }))
    .sort((a, b) => a.sort - b.sort);
  const actions = shuffled.slice(0, 3);

  const handleComplete = (id: string) => {
    setCompletedActions(prev => [...prev, id]);
    confetti({
      particleCount: 30, spread: 50, startVelocity: 18, gravity: 0.9, ticks: 100,
      origin: { y: 0.6 },
      colors: ["#8fae7e", "#c4a77d", "#e8dfd0", "#a3c293"],
      scalar: 0.7,
    });
  };

  return (
    <div className="card-soft section-fade-in" style={{ animationDelay: "60ms" }}>
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "hsl(var(--sage-light))" }}>
          <Target className="w-4 h-4" style={{ color: "hsl(var(--moss))" }} />
        </div>
        <div>
          <p className="text-[0.6rem] tracking-[0.14em] uppercase text-muted-foreground">DAGENS MISSION</p>
          <p className="text-[0.9rem] font-medium">Hvad kan du gøre i dag?</p>
        </div>
      </div>

      <div className="space-y-2">
        {actions.map(a => {
          const done = completedActions.includes(a.id);
          return (
            <button
              key={a.id}
              onClick={() => !done && handleComplete(a.id)}
              className={`flex items-center gap-3 w-full text-left px-3 py-3 rounded-xl transition-all active:scale-[0.98] ${done ? "opacity-60" : ""}`}
              style={{
                background: done ? "hsl(var(--sage) / 0.08)" : "hsl(var(--sage) / 0.05)",
                border: `1px solid ${done ? "hsl(var(--sage) / 0.25)" : "hsl(var(--sage) / 0.12)"}`,
              }}
            >
              <span className="text-base flex-shrink-0">{a.emoji}</span>
              <div className="flex-1 min-w-0">
                <p className={`text-[0.82rem] font-medium ${done ? "line-through text-muted-foreground" : ""}`}>{a.title}</p>
                <p className="text-[0.65rem] text-muted-foreground">{a.subtitle}</p>
              </div>
              {done ? (
                <span className="text-[0.7rem] font-medium" style={{ color: "hsl(var(--moss))" }}>✓ +20 XP</span>
              ) : (
                <Zap className="w-4 h-4 flex-shrink-0" style={{ color: "hsl(var(--sage))" }} />
              )}
            </button>
          );
        })}
      </div>

      {completedActions.length >= 2 && (
        <div className="mt-3 px-3 py-2.5 rounded-xl text-center" style={{ background: "hsl(var(--sage) / 0.1)" }}>
          <p className="text-[0.75rem] font-medium" style={{ color: "hsl(var(--moss))" }}>
            🏆 Stærkt! Du gør en kæmpe forskel. +50 bonus XP
          </p>
        </div>
      )}
    </div>
  );
}

// ── Far: Emotional Nudge ──
export function FarEmotionalNudge() {
  const { morName, babyAgeWeeks } = useFamily();

  const nudges = [
    { emoji: "💬", text: `Sig noget rart til ${morName} i dag`, detail: "Små ord gør en stor forskel" },
    { emoji: "👀", text: "Se hvad der skal gøres — uden at blive bedt", detail: "Det letter den mentale load enormt" },
    { emoji: "🤝", text: `${morName} har brug for en pause`, detail: "Tag over i 30 minutter" },
    { emoji: "☕", text: `Lav kaffe/te til ${morName}`, detail: "Overraskelser behøver ikke være store" },
    { emoji: "🫂", text: "Spørg hvordan hun har det — og lyt", detail: "Ikke for at fikse, bare for at forstå" },
    { emoji: "💪", text: "Tag aftenrutinen i dag", detail: "Bad, ble, nattøj — du klarer det" },
  ];

  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
  const nudge = nudges[dayOfYear % nudges.length];

  return (
    <div className="rounded-2xl px-4 py-4 section-fade-in" style={{
      background: "linear-gradient(135deg, hsl(var(--sage) / 0.08), hsl(var(--sage) / 0.03))",
      border: "1px solid hsl(var(--sage) / 0.15)",
      animationDelay: "120ms",
    }}>
      <div className="flex items-start gap-3">
        <span className="text-xl flex-shrink-0">{nudge.emoji}</span>
        <div>
          <p className="text-[0.88rem] font-medium mb-0.5">{nudge.text}</p>
          <p className="text-[0.72rem] text-muted-foreground">{nudge.detail}</p>
        </div>
      </div>
    </div>
  );
}

// ── Far: Fun Hooks / Relatable Content ──
export function FarFunHook() {
  const { profile, babyAgeWeeks } = useFamily();
  const childName = profile.children?.[0]?.name || "Baby";

  const hooks = [
    { emoji: "🏋️", text: `${childName} vejer nu det samme som en kettlebell`, sub: "Perfekt til bicep curls under bæring" },
    { emoji: "🎮", text: "XP optjent: Partner Support +10", sub: "Level up: tag nattevagten i aften" },
    { emoji: "🚶", text: "Dagens mission: 2 km barnevogn walk", sub: "Bonus XP hvis du tager en kaffe med hjem" },
    { emoji: "🦸", text: "Far-mode: AKTIVERET", sub: "Du er ikke backup — du er starting lineup" },
    { emoji: "💤", text: `Antal timer søvn du har fået: ja`, sub: "Solidaritet, bro. Det bliver bedre." },
    { emoji: "🍳", text: "Achievement unlocked: Lav morgenmad", sub: "Toast tæller. Alt tæller." },
    { emoji: "📱", text: "Pro tip: Læg telefonen. Øjenkontakt > alt", sub: `${childName} kan se dig — og elsker det` },
  ];

  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
  const hook = hooks[dayOfYear % hooks.length];

  return (
    <div className="rounded-2xl px-4 py-3 section-fade-in" style={{
      background: "hsl(var(--cream))",
      border: "1px solid hsl(var(--stone-light))",
      animationDelay: "180ms",
    }}>
      <div className="flex items-center gap-3">
        <span className="text-xl">{hook.emoji}</span>
        <div>
          <p className="text-[0.82rem] font-medium">{hook.text}</p>
          <p className="text-[0.65rem] text-muted-foreground">{hook.sub}</p>
        </div>
      </div>
    </div>
  );
}

// ── Helper: get daily actions based on baby age ──
function getDailyActions(ageWeeks: number, morName: string, childName: string) {
  const base = [
    { id: "morning", emoji: "🌅", title: "Tag morgenen i dag", subtitle: `Lad ${morName} sove lidt ekstra` },
    { id: "walk", emoji: "🚶", title: `Gå en tur med ${childName}`, subtitle: "Frisk luft gør godt for jer begge" },
    { id: "food", emoji: "🍳", title: "Lav mad eller bestil take-away", subtitle: "Hunger gør alting sværere" },
    { id: "pause", emoji: "☕", title: `Giv ${morName} 30 min pause`, subtitle: "Bare 'gå, jeg klarer det' er nok" },
    { id: "dishes", emoji: "🍽️", title: "Tag opvasken og køkkenet", subtitle: "Uden at blive bedt om det = guld" },
    { id: "bath", emoji: "🛁", title: `Tag badetid med ${childName}`, subtitle: "Hud-mod-hud og nærhed" },
    { id: "laundry", emoji: "👕", title: "Start en maskine tøj", subtitle: "Det lyder småt, men det letter enormt" },
    { id: "night", emoji: "🌙", title: "Tag nattevagten", subtitle: `En hel nats søvn for ${morName}` },
    { id: "putning", emoji: "🌛", title: `Put ${childName} i seng`, subtitle: "Putning kræver nærhed — ikke amning. Du kan det!" },
    { id: "nice", emoji: "💬", title: `Sig noget rart til ${morName}`, subtitle: "'Du er fantastisk' virker altid" },
    { id: "shop", emoji: "🛒", title: "Gør ugens indkøb", subtitle: "Bleer, mad, snacks — uden huskeliste" },
  ];

  if (ageWeeks < 4) {
    return [
      ...base,
      { id: "diaper", emoji: "🧷", title: "Tag alle bleskift i dag", subtitle: "Det er hurtigt og det tæller" },
      { id: "hug", emoji: "🫂", title: `Hud-mod-hud med ${childName}`, subtitle: "15 min styrker jeres bånd" },
    ];
  }

  return base;
}
