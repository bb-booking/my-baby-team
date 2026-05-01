import { useFamily } from "@/context/FamilyContext";
import { getBabySize, getWeekInsight } from "@/lib/phaseData";
import { MeloWordmark } from "@/components/MeloWordmark";
import { NotificationBell } from "@/components/NotificationCenter";
import { WeekUnlockModal } from "@/components/WeekUnlockModal";
import { CheckInCard } from "@/components/PregnancyCheckIn";
import { User, ArrowRight, Check, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

// ── Week-specific development bullets ─────────────────────────────────────────
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

// ── Weekly guides (list-style) ─────────────────────────────────────────────────
interface Guide {
  emoji: string;
  bgColor: string;
  title: string;
  desc: string;
  path: string;
}

function getWeeklyGuides(week: number, trimester: number): Guide[] {
  const trimLabel = `${trimester}. trimester`;
  return [
    {
      emoji: "🍎",
      bgColor: "hsl(var(--sage-light))",
      title: `Kostråd i ${trimLabel}`,
      desc: "Det anbefales, og det der virker godt nu",
      path: "/graviditet/uge",
    },
    {
      emoji: "🧘",
      bgColor: "hsl(var(--clay-light))",
      title: "Træning og bevægelse",
      desc: "Hvad der er godt for dig og din baby",
      path: "/chat",
    },
    {
      emoji: "❤️",
      bgColor: "hsl(var(--sand-light))",
      title: "Hvad er normalt lige nu?",
      desc: "Symptomer og forandringer i denne tid",
      path: "/chat",
    },
  ];
}

// ── Circular progress ring ─────────────────────────────────────────────────────
function CircularRing({ progress }: { progress: number }) {
  const size = 72;
  const strokeWidth = 5;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ flexShrink: 0 }}>
      {/* Track */}
      <circle
        cx={size / 2} cy={size / 2} r={radius}
        fill="none"
        stroke="hsl(var(--stone-lighter))"
        strokeWidth={strokeWidth}
      />
      {/* Progress */}
      <circle
        cx={size / 2} cy={size / 2} r={radius}
        fill="none"
        stroke="hsl(var(--moss))"
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        style={{ transition: "stroke-dashoffset 0.7s ease" }}
      />
      {/* Label */}
      <text
        x={size / 2} y={size / 2 + 5}
        textAnchor="middle"
        style={{ fontSize: "13px", fontWeight: 600, fill: "hsl(var(--moss))" }}
      >
        {progress}%
      </text>
    </svg>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────
export default function DashboardPregnant() {
  const { profile, currentWeek, totalWeeks, trimester, tasks, morName, farName, takeTask } = useFamily();
  const { i18n } = useTranslation();

  const size = getBabySize(currentWeek);
  const insight = getWeekInsight(currentWeek);
  const bullets = getWeekBullets(currentWeek);
  const guides = getWeeklyGuides(currentWeek, trimester);

  const progress = Math.round((currentWeek / totalWeeks) * 100);
  const daysLeft = Math.max(0, (totalWeeks - currentWeek) * 7);
  const trimesterLabel = trimester === 1 ? "1. trimester" : trimester === 2 ? "2. trimester" : "3. trimester";

  const getGreeting = (): string => {
    const h = new Date().getHours();
    if (h < 10) return "Godmorgen";
    if (h < 17) return "Goddag";
    return "Godaften";
  };

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
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-[0.75rem] font-semibold overflow-hidden"
              style={{ background: "hsl(var(--sage-light))", color: "hsl(var(--moss))" }}
            >
              {profile.parentName?.charAt(0)?.toUpperCase() || <User className="w-4 h-4" />}
            </div>
          </div>
        </div>

        <h1 className="text-[1.9rem] leading-tight">
          {getGreeting()}, {profile.parentName}
        </h1>
        <p className="text-[0.9rem] text-muted-foreground mt-1">Ét skridt ad gangen.</p>
      </div>

      {/* ── B. Daily Check-in ───────────────────────────────────────────────── */}
      <CheckInCard />

      {/* ── C. Pregnancy Hero Card ──────────────────────────────────────────── */}
      <div
        className="rounded-[20px] overflow-hidden section-fade-in"
        style={{
          background: "linear-gradient(145deg, hsl(154 22% 28%), hsl(154 27% 20%))",
          animationDelay: "40ms",
        }}
      >
        <div className="px-5 pt-5 pb-4">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-[0.68rem] font-semibold px-2.5 py-1 rounded-full text-white"
                  style={{ background: "hsl(154 22% 38% / 0.5)" }}>
                  Uge {currentWeek}
                </span>
                <span className="text-[0.75rem] text-white/70">{trimesterLabel}</span>
              </div>
            </div>
            <span className="text-[3.5rem] leading-none">{size.emoji}</span>
          </div>

          <p className="font-serif text-[1.4rem] font-medium text-white leading-snug mb-2">
            Din baby udvikler sig hver dag
          </p>
          <p className="text-[0.85rem] text-white/75 mb-1">
            På størrelse med {size.label.toLowerCase()}
          </p>
          <div className="flex items-center gap-4 mb-4 text-[0.8rem] text-white/70">
            <span>Længde<br /><span className="text-white font-medium">ca. {size.lengthCm} cm</span></span>
            <span className="text-white/30">·</span>
            <span>Vægt<br /><span className="text-white font-medium">ca. {size.weightG} g</span></span>
          </div>

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

          <Link
            to="/graviditet/uge"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-[0.78rem] font-medium text-[hsl(var(--moss))] transition-all active:scale-95"
            style={{ background: "hsl(var(--warm-white))" }}
          >
            Læs mere om uge {currentWeek} <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {insight.milestone && (
          <div className="px-5 py-2.5 border-t border-white/10"
            style={{ background: "hsl(154 27% 16% / 0.5)" }}>
            <p className="text-[0.72rem] text-white/70">🎯 {insight.milestone}</p>
          </div>
        )}
      </div>

      {/* ── D. Progress Card (circular ring) ────────────────────────────────── */}
      <div
        className="rounded-2xl px-5 py-4 section-fade-in"
        style={{
          background: "hsl(var(--warm-white))",
          border: "1px solid hsl(var(--stone-light))",
          animationDelay: "80ms",
        }}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[0.72rem] font-medium tracking-[0.1em] uppercase text-muted-foreground mb-1">
              Din graviditet
            </p>
            <p className="font-serif text-[1.5rem] font-medium leading-tight" style={{ color: "hsl(var(--moss))" }}>
              Du er {progress}% igennem
            </p>
            <p className="text-[0.78rem] text-muted-foreground mt-1">
              {daysLeft} dage tilbage til termin
            </p>
          </div>
          <CircularRing progress={progress} />
        </div>
      </div>

      {/* ── D. Ugens råd og guides ───────────────────────────────────────────── */}
      <div
        className="rounded-2xl overflow-hidden section-fade-in"
        style={{
          background: "hsl(var(--warm-white))",
          border: "1px solid hsl(var(--stone-light))",
          animationDelay: "120ms",
        }}
      >
        <div className="flex items-center justify-between px-5 pt-4 pb-3">
          <div>
            <p className="text-[0.95rem] font-semibold">Ugens råd og guides</p>
            <p className="text-[0.68rem] text-muted-foreground">Tilpasset uge {currentWeek}</p>
          </div>
          <Link
            to="/graviditet/uge"
            className="text-[0.72rem] font-medium px-3 py-1.5 rounded-xl transition-all active:scale-95"
            style={{ background: "hsl(var(--stone-lighter))", color: "hsl(var(--foreground))" }}
          >
            Læs mere
          </Link>
        </div>

        <div className="divide-y" style={{ borderColor: "hsl(var(--stone-lighter))" }}>
          {guides.map((guide, i) => (
            <Link
              key={i}
              to={guide.path}
              className="flex items-center gap-3.5 px-5 py-3.5 transition-all active:bg-[hsl(var(--stone-lighter))]"
            >
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-[1.1rem]"
                style={{ background: guide.bgColor }}
              >
                {guide.emoji}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[0.85rem] font-medium leading-snug">{guide.title}</p>
                <p className="text-[0.68rem] text-muted-foreground">{guide.desc}</p>
              </div>
              <ChevronRight className="w-4 h-4 flex-shrink-0 text-muted-foreground/40" />
            </Link>
          ))}
        </div>
      </div>

      {/* ── E. Tasks Preview ────────────────────────────────────────────────── */}
      {previewTasks.length > 0 && (
        <div className="section-fade-in" style={{ animationDelay: "160ms" }}>
          <div className="flex items-center justify-between mb-3">
            <p className="text-[0.82rem] font-semibold">Det I er i gang med</p>
            <Link to="/samen" className="text-[0.72rem] font-medium" style={{ color: "hsl(var(--moss))" }}>
              Se alle opgaver <ChevronRight className="w-3 h-3 inline" />
            </Link>
          </div>
          <div
            className="rounded-2xl overflow-hidden"
            style={{ background: "hsl(var(--warm-white))", border: "1px solid hsl(var(--stone-light))" }}
          >
            <div className="divide-y" style={{ borderColor: "hsl(var(--stone-lighter))" }}>
              {previewTasks.map(task => {
                const assigneeName =
                  task.assignee === "mor" ? morName :
                  task.assignee === "far" ? farName :
                  "Fælles";
                const assigneeInitial =
                  task.assignee === "mor" ? morName?.[0] :
                  task.assignee === "far" ? farName?.[0] :
                  null;
                const isMyTask = task.assignee === myRole || task.takenBy === myRole;
                const isFelles = task.assignee === "fælles";

                return (
                  <div key={task.id} className="flex items-center gap-3 px-4 py-3">
                    {/* Avatar */}
                    <div className="flex-shrink-0">
                      {isFelles ? (
                        <div className="flex -space-x-1.5">
                          <div className="w-7 h-7 rounded-full flex items-center justify-center text-[0.65rem] font-semibold border-2 border-white z-10"
                            style={{ background: "hsl(var(--clay-light))", color: "hsl(var(--bark))" }}>
                            {morName?.[0]}
                          </div>
                          <div className="w-7 h-7 rounded-full flex items-center justify-center text-[0.65rem] font-semibold border-2 border-white"
                            style={{ background: "hsl(var(--sage-light))", color: "hsl(var(--moss))" }}>
                            {farName?.[0]}
                          </div>
                        </div>
                      ) : (
                        <div className="w-7 h-7 rounded-full flex items-center justify-center text-[0.65rem] font-semibold"
                          style={{
                            background: task.assignee === "mor" ? "hsl(var(--clay-light))" : "hsl(var(--sage-light))",
                            color: task.assignee === "mor" ? "hsl(var(--bark))" : "hsl(var(--moss))",
                          }}>
                          {assigneeInitial}
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-[0.82rem] font-medium truncate">{task.title}</p>
                      <p className="text-[0.65rem] text-muted-foreground">{assigneeName}</p>
                    </div>

                    {isMyTask ? (
                      <span className="text-[0.65rem] px-2.5 py-1 rounded-full flex-shrink-0"
                        style={{ background: "hsl(var(--stone-lighter))", color: "hsl(var(--muted-foreground))" }}>
                        Din opgave
                      </span>
                    ) : (
                      <button
                        onClick={() => takeTask(task.id)}
                        className="text-[0.72rem] font-semibold px-3.5 py-1.5 rounded-xl text-white transition-all active:scale-95 flex-shrink-0"
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
        </div>
      )}

      {/* ── E2. Graviditetskalender ──────────────────────────────────────────── */}
      <Link
        to="/gravid-kalender"
        className="flex items-center gap-4 rounded-2xl px-5 py-4 section-fade-in transition-all active:scale-[0.98]"
        style={{
          background: "hsl(var(--warm-white))",
          border: "1px solid hsl(var(--stone-light))",
          animationDelay: "165ms",
        }}
      >
        <div className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 text-2xl"
          style={{ background: "hsl(var(--sage-light))" }}>
          📅
        </div>
        <div className="flex-1">
          <p className="text-[0.88rem] font-semibold">Scanninger & aftaler</p>
          <p className="text-[0.7rem] text-muted-foreground">Synkronisér med din kalender</p>
        </div>
        <ChevronRight className="w-4 h-4 text-muted-foreground/50" />
      </Link>

      {/* ── F. Fødselsplan (week 30+) ───────────────────────────────────────── */}
      {currentWeek >= 30 && (
        <Link
          to="/foedselsplan"
          className="flex items-center gap-4 rounded-2xl px-5 py-4 section-fade-in transition-all active:scale-[0.98]"
          style={{
            background: "hsl(var(--warm-white))",
            border: "1px solid hsl(var(--stone-light))",
            animationDelay: "170ms",
          }}
        >
          <div className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 text-2xl"
            style={{ background: "hsl(var(--sage-light))" }}>
            🌿
          </div>
          <div className="flex-1">
            <p className="text-[0.88rem] font-semibold">Vores fødselsplan</p>
            <p className="text-[0.7rem] text-muted-foreground">Dokumentér jeres ønsker til fødslen</p>
          </div>
          <ChevronRight className="w-4 h-4 text-muted-foreground/50" />
        </Link>
      )}

      {/* ── G. Contraction Timer (week 36+) ─────────────────────────────────── */}
      {currentWeek >= 36 && (
        <Link
          to="/veer"
          className="flex items-center gap-4 rounded-2xl px-5 py-4 section-fade-in transition-all active:scale-[0.98]"
          style={{
            background: "linear-gradient(135deg, hsl(var(--clay-light)), hsl(var(--sand-light)))",
            border: "1px solid hsl(var(--clay) / 0.3)",
            animationDelay: "180ms",
          }}
        >
          <div className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 text-2xl"
            style={{ background: "rgba(255,255,255,0.5)" }}>
            ⏱️
          </div>
          <div className="flex-1">
            <p className="text-[0.88rem] font-semibold">Veer-timer</p>
            <p className="text-[0.7rem] text-muted-foreground">Track veer og del live med din partner</p>
          </div>
          <ChevronRight className="w-4 h-4 text-muted-foreground/50" />
        </Link>
      )}

      {/* ── G. Disclaimer ───────────────────────────────────────────────────── */}
      <div
        className="rounded-xl px-4 py-3 section-fade-in flex items-start gap-2.5"
        style={{ background: "hsl(var(--stone-lighter))", animationDelay: "200ms" }}
      >
        <span className="text-[0.75rem] text-muted-foreground/60 flex-shrink-0 mt-0.5">ⓘ</span>
        <p className="text-[0.72rem] text-muted-foreground leading-relaxed">
          Alle graviditeter er forskellige. Indholdet er generel information og kan ikke erstatte professionel rådgivning.
        </p>
      </div>

    </div>
  );
}
