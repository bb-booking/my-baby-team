import { useFamily } from "@/context/FamilyContext";
import { Zap, ArrowRight, Trophy, Target, Heart } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";

// ── Far: Daily Action Card ("Hvad kan jeg gøre i dag?") ──
export function FarDailyActionCard() {
  const { morName, babyAgeWeeks, profile } = useFamily();
  const childName = profile.children?.[0]?.name || "baby";
  const [completedActions, setCompletedActions] = useState<string[]>([]);

  const allActions = getDailyActions(babyAgeWeeks, morName, childName);
  // Pick 3 actions based on day rotation
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
  const shuffled = [...allActions].map((a, i) => ({ ...a, sort: (dayOfYear * 7 + i * 13) % 100 }))
    .sort((a, b) => a.sort - b.sort);
  const actions = shuffled.slice(0, 3);

  const handleComplete = (id: string) => {
    setCompletedActions(prev => [...prev, id]);
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
              className={`flex items-center gap-3 w-full text-left px-3 py-3 rounded-xl transition-all active:scale-[0.98] ${
                done ? "opacity-60" : ""
              }`}
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
                <span className="text-[0.7rem] font-medium" style={{ color: "hsl(var(--moss))" }}>✓ Done</span>
              ) : (
                <Zap className="w-4 h-4 flex-shrink-0" style={{ color: "hsl(var(--sage))" }} />
              )}
            </button>
          );
        })}
      </div>

      {completedActions.length >= 2 && (
        <div className="mt-3 px-3 py-2 rounded-xl text-center" style={{ background: "hsl(var(--sage) / 0.1)" }}>
          <p className="text-[0.75rem] font-medium" style={{ color: "hsl(var(--moss))" }}>
            🏆 Stærkt! Du gør en kæmpe forskel.
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
    <div
      className="rounded-2xl px-4 py-4 section-fade-in"
      style={{
        background: "linear-gradient(135deg, hsl(var(--sage) / 0.08), hsl(var(--sage) / 0.03))",
        border: "1px solid hsl(var(--sage) / 0.15)",
        animationDelay: "120ms",
      }}
    >
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
    { emoji: "🏋️", text: `${childName} vejer nu det samme som en kettlebell`, sub: "Perfekt til bicep curls under amning... wait" },
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

// ── Far: Guide to supporting ──
export function FarGuideCard() {
  const { morName, babyAgeWeeks, profile } = useFamily();
  const feedingMethod = profile.morHealth?.feedingMethod;

  const guides = babyAgeWeeks < 4 ? [
    ...(feedingMethod === "amning" || feedingMethod === "begge" ? [
      { emoji: "🤱", title: "Sådan støtter du under amning", body: `Hent vand, pude og telefon FØR hun sætter sig. Sid ved hende — din tilstedeværelse betyder alt.` },
    ] : []),
    { emoji: "🌙", title: "Tag en nattevagt", body: `Selv én uafbrudt søvnperiode for ${morName} gør en kæmpe forskel.` },
    { emoji: "🏠", title: "Overtag det praktiske", body: "Indkøb, madlavning, opvask, tøjvask. Gør det uden at blive spurgt." },
  ] : babyAgeWeeks < 12 ? [
    { emoji: "👶", title: `Alene-tid med ${profile.children?.[0]?.name || "baby"}`, body: "Tag barnevognsturen, baderutinen eller legepladsen alene. Det bygger selvtillid for jer begge." },
    { emoji: "💬", title: "Hvad hun har brug for (uden at sige det)", body: `Anerkendelse. "Du gør det fantastisk" er stærkere end "kan jeg hjælpe?"` },
    { emoji: "📋", title: "Overtag opgaver", body: "Se samarbejdslisten og tag dem der står som 'fælles'.", link: "/sammen" },
  ] : [
    { emoji: "🎯", title: "Ejerskab over rutiner", body: "Vælg en fast rutine — morgenmad, bad, eller sengelægning — og gør den til din." },
    { emoji: "🧠", title: "Tænk fremad", body: "Bestil tid hos lægen, køb bleer inden de slipper op, planlæg weekenden." },
  ];

  return (
    <div className="card-soft section-fade-in" style={{ animationDelay: "240ms" }}>
      <p className="text-[0.6rem] tracking-[0.14em] uppercase text-muted-foreground mb-2">📖 GUIDE: SÅDAN HJÆLPER DU</p>
      <div className="space-y-2">
        {guides.map((g, i) => (
          g.link ? (
            <Link key={i} to={g.link} className="flex items-start gap-3 px-3 py-2.5 rounded-xl transition-all hover:shadow-sm active:scale-[0.98]"
              style={{ background: "hsl(var(--sage) / 0.05)", border: "1px solid hsl(var(--sage) / 0.1)" }}>
              <span className="text-base flex-shrink-0 mt-0.5">{g.emoji}</span>
              <div className="flex-1">
                <p className="text-[0.82rem] font-medium">{g.title}</p>
                <p className="text-[0.68rem] text-muted-foreground leading-relaxed">{g.body}</p>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0 mt-1" />
            </Link>
          ) : (
            <div key={i} className="flex items-start gap-3 px-3 py-2.5 rounded-xl"
              style={{ background: "hsl(var(--sage) / 0.05)" }}>
              <span className="text-base flex-shrink-0 mt-0.5">{g.emoji}</span>
              <div>
                <p className="text-[0.82rem] font-medium">{g.title}</p>
                <p className="text-[0.68rem] text-muted-foreground leading-relaxed">{g.body}</p>
              </div>
            </div>
          )
        ))}
      </div>
    </div>
  );
}

// ── Far: Ownership / responsibility card ──
export function FarOwnershipCard() {
  const { tasks, profile } = useFamily();
  const today = new Date().toISOString().split("T")[0];
  const myTasks = tasks.filter(t => (t.assignee === "far" || t.assignee === "fælles") && t.dueDate === today && !t.completed);
  const completedToday = tasks.filter(t => (t.assignee === "far") && t.dueDate === today && t.completed);

  if (myTasks.length === 0 && completedToday.length === 0) return null;

  return (
    <div className="card-soft section-fade-in" style={{ animationDelay: "300ms" }}>
      <div className="flex items-center justify-between mb-2">
        <p className="text-[0.6rem] tracking-[0.14em] uppercase text-muted-foreground">🎯 DIT ANSVAR I DAG</p>
        <Link to="/sammen" className="text-[0.65rem] font-medium" style={{ color: "hsl(var(--moss))" }}>
          Se alle →
        </Link>
      </div>
      <div className="space-y-1.5">
        {myTasks.slice(0, 4).map(t => (
          <div key={t.id} className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: "hsl(var(--sage) / 0.05)" }}>
            <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: "hsl(var(--sage))" }} />
            <span className="text-[0.78rem]">{t.title}</span>
          </div>
        ))}
        {completedToday.length > 0 && (
          <p className="text-[0.65rem] text-muted-foreground mt-2 flex items-center gap-1">
            <Trophy className="w-3 h-3" /> {completedToday.length} opgave{completedToday.length > 1 ? "r" : ""} klaret i dag
          </p>
        )}
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
