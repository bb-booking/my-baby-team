import { useFamily } from "@/context/FamilyContext";
import { getBabySize, getWeekInsight } from "@/lib/phaseData";
import { MeloWordmark } from "@/components/MeloWordmark";
import { NotificationBell } from "@/components/NotificationCenter";
import { WeekUnlockModal } from "@/components/WeekUnlockModal";
import { User, ArrowRight, Check } from "lucide-react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { da, enUS } from "date-fns/locale";
import { useTranslation } from "react-i18next";

// ── Week-specific bullet points ───────────────────────────────────────────────
function getWeekBullets(week: number): string[] {
  if (week < 8)  return ["Babys hjerte begynder at slå", "Alle vitale organer er ved at dannes", "Fosteret er størrelse med et hindbær"];
  if (week < 12) return ["Hjertet slår ca. 150 slag i minuttet", "Fingre og tæer er ved at forme sig", "Hjernen udvikler sig hurtigt"];
  if (week < 16) return ["Første trimester er klaret", "Risikoen for tab falder markant nu", "Baby begynder at bevæge sig"];
  if (week < 20) return ["Baby kan lave ansigtsudtryk", "Sanser begynder at vågne", "Knogler og muskler bliver stærkere"];
  if (week < 24) return ["Baby kan høre lyde udefra", "Halvvejs igennem graviditeten", "Hjertet pumper ca. 25 liter blod i døgnet"];
  if (week < 28) return ["Baby reagerer på lys og mørke", "Har en regelmæssig søvnrytme", "Lungerne er ved at modnes"];
  if (week < 32) return ["Tredje trimester er begyndt", "Baby kan åbne og lukke øjnene", "Baby vender sig langsomt med hovedet nedad"];
  if (week < 36) return ["Baby er næsten fuldt udviklet", "I kan mærke tydelige spark og bevægelser", "Begyn at pakke hospitalstasken"];
  return ["Baby er klar til verden når som helst", "Alle organer er fuldt udviklede", "I er stærkere end I tror"];
}

// ── This Week preparation cards ───────────────────────────────────────────────
interface PrepCard {
  icon: string;
  title: string;
  desc: string;
}

function getThisWeekCards(week: number): PrepCard[] {
  if (week < 12) return [
    { icon: "💊", title: "Tag folinsyre", desc: "Vigtigt i første trimester" },
    { icon: "📅", title: "Book jordemoder", desc: "Jo hurtigere jo bedre" },
    { icon: "🚭", title: "Undgå alkohol og røg", desc: "Ingen sikker grænse" },
    { icon: "💬", title: "Fortæl familien", desc: "Når I er klar til det" },
  ];
  if (week < 20) return [
    { icon: "🔍", title: "Halvvejsscanning", desc: "Bestil tid nu" },
    { icon: "👔", title: "Tal om barselsorlov", desc: "Hvem tager hvad og hvornår?" },
    { icon: "🛏️", title: "Start barnevognssøgning", desc: "Levering kan tage tid" },
    { icon: "📋", title: "Giv arbejdet besked", desc: "Barselsvarsel inden uge 22" },
  ];
  if (week < 32) return [
    { icon: "🧳", title: "Pak hospitalstaske", desc: "Begynd at samle tingene" },
    { icon: "🏠", title: "Gør hjemmet klar", desc: "Barnerum og sikkerhed" },
    { icon: "👶", title: "Fødselsforberedelse", desc: "Tilmeld jer et kursus" },
    { icon: "💆", title: "Planlæg hvile", desc: "I kan snart ikke det hele" },
  ];
  return [
    { icon: "🧳", title: "Tjek hospitalstaske", desc: "Alt pakket og klar?" },
    { icon: "📝", title: "Lav fødselsplan", desc: "Dine ønsker til fødslen" },
    { icon: "🚗", title: "Tjek autostolen", desc: "Monteret og godkendt?" },
    { icon: "📱", title: "Hav telefonen opladet", desc: "Og lader med i tasken" },
  ];
}

// ── Main component ─────────────────────────────────────────────────────────────
export default function DashboardPregnant() {
  const { profile, currentWeek, totalWeeks, trimester, tasks, morName, farName, takeTask } = useFamily();
  const { i18n } = useTranslation();
  const dateFnsLocale = i18n.language === "en" ? enUS : da;

  const size = getBabySize(currentWeek);
  const insight = getWeekInsight(currentWeek);
  const bullets = getWeekBullets(currentWeek);
  const prepCards = getThisWeekCards(currentWeek);

  const progress = Math.round((currentWeek / totalWeeks) * 100);
  const daysLeft = Math.max(0, (totalWeeks - currentWeek) * 7);
  const trimesterLabel = trimester === 1 ? "1. trimester" : trimester === 2 ? "2. trimester" : "3. trimester";

  const getGreeting = (): string => {
    const h = new Date().getHours();
    if (h < 10) return "Godmorgen";
    if (h < 17) return "Goddag";
    return "Godaften";
  };

  // Tasks preview: max 3 incomplete tasks
  const previewTasks = tasks.filter(t => !t.completed).slice(0, 3);
  const myRole = profile.role;

  return (
    <div className="space-y-5 pb-6">
      <WeekUnlockModal />

      {/* ── A. Header ───────────────────────────────────────────────────────── */}
      <div className="section-fade-in">
        <div className="flex items-center justify-between mb-5">
          <MeloWordmark size="1.8rem" />
          <div className="flex items-center gap-3">
            <NotificationBell />
            <div className="w-9 h-9 rounded-full flex items-center justify-center text-[0.75rem] font-semibold"
              style={{ background: "hsl(var(--sage-light))", color: "hsl(var(--moss))" }}>
              {profile.parentName?.charAt(0)?.toUpperCase() || <User className="w-4 h-4" />}
            </div>
          </div>
        </div>

        <h1 className="text-[1.9rem] leading-tight">
          {getGreeting()}, {profile.parentName}
        </h1>
        <p className="text-[0.9rem] text-muted-foreground mt-1">Ét skridt ad gangen.</p>
      </div>

      {/* ── B. Pregnancy Hero Card ──────────────────────────────────────────── */}
      <div
        className="rounded-[20px] overflow-hidden section-fade-in"
        style={{
          background: "linear-gradient(145deg, hsl(154 22% 28%), hsl(154 27% 20%))",
          animationDelay: "40ms",
        }}
      >
        <div className="px-5 pt-5 pb-4">
          {/* Top row: week info + emoji */}
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="font-serif text-[1.5rem] font-medium text-white leading-tight">Uge {currentWeek}</p>
              <p className="text-[0.82rem] text-white/70 mt-0.5">{trimesterLabel}</p>
            </div>
            <span className="text-[3.5rem] leading-none">{size.emoji}</span>
          </div>

          {/* Main message */}
          <p className="font-serif text-[1.15rem] font-medium text-white leading-snug mb-1">
            Din baby udvikler sig hver dag
          </p>
          <p className="text-[0.85rem] text-white/75 mb-3">
            På størrelse med {size.label.toLowerCase()} — {size.lengthCm} cm · {size.weightG} g
          </p>

          {/* Bullets */}
          <div className="space-y-1.5 mb-4">
            {bullets.map((b, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: "hsl(140 22% 55% / 0.35)" }}>
                  <Check className="w-2.5 h-2.5 text-white" />
                </div>
                <p className="text-[0.8rem] text-white/80">{b}</p>
              </div>
            ))}
          </div>

          {/* CTA */}
          <Link
            to="/graviditet/uge"
            className="inline-flex items-center gap-1.5 text-[0.75rem] font-medium text-white/90 hover:text-white transition-colors"
          >
            Se mere om uge {currentWeek} <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Milestone bar */}
        {insight.milestone && (
          <div className="px-5 py-2.5 border-t border-white/10"
            style={{ background: "hsl(154 27% 16% / 0.5)" }}>
            <p className="text-[0.72rem] text-white/70">🎯 {insight.milestone}</p>
          </div>
        )}
      </div>

      {/* ── C. Progress Card ────────────────────────────────────────────────── */}
      <div
        className="rounded-2xl px-5 py-4 section-fade-in"
        style={{
          background: "hsl(var(--warm-white))",
          border: "1px solid hsl(var(--stone-light))",
          animationDelay: "80ms",
        }}
      >
        <div className="flex items-center justify-between mb-3">
          <p className="text-[0.72rem] font-medium tracking-[0.1em] uppercase text-muted-foreground">Din graviditet</p>
          <div className="flex items-center justify-center w-10 h-10 rounded-full"
            style={{ background: "hsl(var(--sage-light))" }}>
            <span className="text-[0.72rem] font-semibold" style={{ color: "hsl(var(--moss))" }}>{progress}%</span>
          </div>
        </div>

        <div className="flex items-baseline gap-2 mb-3">
          <span className="font-serif text-[2rem] font-medium" style={{ color: "hsl(var(--moss))" }}>
            Uge {currentWeek}
          </span>
          <span className="text-[0.82rem] text-muted-foreground">af 40</span>
        </div>

        <div className="h-2 rounded-full overflow-hidden mb-2" style={{ background: "hsl(var(--stone-lighter))" }}>
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${progress}%`,
              background: "linear-gradient(90deg, hsl(var(--sage)), hsl(var(--moss)))",
            }}
          />
        </div>

        <div className="flex justify-between items-center">
          <p className="text-[0.68rem] text-muted-foreground">
            {trimesterLabel}
          </p>
          <p className="text-[0.68rem] text-muted-foreground">
            {daysLeft} dage tilbage
          </p>
        </div>
      </div>

      {/* ── D. This Week ────────────────────────────────────────────────────── */}
      <div className="section-fade-in" style={{ animationDelay: "120ms" }}>
        <div className="flex items-center justify-between mb-3">
          <p className="text-[0.82rem] font-semibold">I denne uge kan I fokusere på</p>
          <Link to="/sammen" className="text-[0.72rem] font-medium" style={{ color: "hsl(var(--moss))" }}>Se alle</Link>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-1 -mx-1 px-1" style={{ scrollbarWidth: "none" }}>
          {prepCards.map((card, i) => (
            <div
              key={i}
              className="flex-shrink-0 rounded-2xl px-4 py-3.5 w-36"
              style={{
                background: "hsl(var(--warm-white))",
                border: "1px solid hsl(var(--stone-light))",
              }}
            >
              <span className="text-xl block mb-2">{card.icon}</span>
              <p className="text-[0.78rem] font-medium leading-snug mb-1">{card.title}</p>
              <p className="text-[0.66rem] text-muted-foreground leading-snug">{card.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── E. Check-in Together (PRIMARY CTA) ──────────────────────────────── */}
      <div
        className="rounded-2xl px-5 py-5 section-fade-in"
        style={{
          background: "hsl(var(--sage-light))",
          border: "1px solid hsl(var(--sage) / 0.3)",
          animationDelay: "160ms",
        }}
      >
        <p className="font-serif text-[1.1rem] font-medium mb-1" style={{ color: "hsl(var(--moss))" }}>
          Hvordan har I det lige nu?
        </p>
        <p className="text-[0.82rem] text-muted-foreground mb-4">
          2 minutter kan gøre en stor forskel.
        </p>
        <Link
          to="/sammen"
          className="inline-flex items-center justify-center gap-2 w-full py-3 rounded-full text-[0.85rem] font-semibold text-white transition-all active:scale-[0.98]"
          style={{ background: "hsl(var(--moss))" }}
        >
          Tjek ind sammen <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* ── F. Tasks Preview ────────────────────────────────────────────────── */}
      {previewTasks.length > 0 && (
        <div className="section-fade-in" style={{ animationDelay: "200ms" }}>
          <div className="flex items-center justify-between mb-3">
            <p className="text-[0.82rem] font-semibold">Det I har gang i</p>
            <Link to="/sammen" className="text-[0.72rem] font-medium" style={{ color: "hsl(var(--moss))" }}>
              Se alle opgaver
            </Link>
          </div>
          <div className="space-y-2">
            {previewTasks.map(task => {
              const assigneeName =
                task.assignee === "mor" ? morName :
                task.assignee === "far" ? farName :
                "Fælles";
              const isMyTask = task.assignee === myRole || task.takenBy === myRole;

              return (
                <div
                  key={task.id}
                  className="flex items-center gap-3 rounded-2xl px-4 py-3"
                  style={{
                    background: "hsl(var(--warm-white))",
                    border: "1px solid hsl(var(--stone-light))",
                  }}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-[0.82rem] font-medium truncate">{task.title}</p>
                    <p className="text-[0.68rem] text-muted-foreground">{assigneeName}</p>
                  </div>
                  {isMyTask ? (
                    <span className="text-[0.68rem] px-3 py-1.5 rounded-full"
                      style={{ background: "hsl(var(--stone-lighter))", color: "hsl(var(--muted-foreground))" }}>
                      Din opgave
                    </span>
                  ) : (
                    <button
                      onClick={() => takeTask(task.id)}
                      className="text-[0.72rem] font-medium px-3 py-1.5 rounded-full text-white transition-all active:scale-95"
                      style={{ background: "hsl(var(--moss))" }}
                    >
                      Tag den
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── G. Disclaimer ───────────────────────────────────────────────────── */}
      <div
        className="rounded-xl px-4 py-3 section-fade-in"
        style={{
          background: "hsl(var(--stone-lighter))",
          animationDelay: "240ms",
        }}
      >
        <p className="text-[0.72rem] text-muted-foreground leading-relaxed">
          Alle graviditeter er forskellige. Indholdet er generel information og kan ikke erstatte professionel rådgivning.
        </p>
      </div>

    </div>
  );
}
