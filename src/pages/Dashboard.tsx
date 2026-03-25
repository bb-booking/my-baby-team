import { useFamily } from "@/context/FamilyContext";
import { useDiary } from "@/context/DiaryContext";
import { PregnancyWeekBar, BabySizeCard, PregnancyInsight } from "@/components/PregnancyWidgets";
import { QuickLog } from "@/components/QuickLog";
import { TaskList } from "@/components/TaskList";
import { PartnerNudge } from "@/components/PartnerNudge";
import { MilestoneTimeline } from "@/components/MilestoneTimeline";
import { MorRecoveryCard, MorAutoSupport, MorFeedingCard, MorMicroSupport } from "@/components/MorDashboardCards";
import { MorEmpathyCard } from "@/components/FarDashboardCards";
import { WhatMattersNow, FrictionAlert } from "@/components/CommandCenter";
import { MessageCircle, Heart, Gamepad2, Square } from "lucide-react";
import { format } from "date-fns";
import { da } from "date-fns/locale";
import { getBabyInsight, getKnowledgeCards, getActiveLeap, getNextLeap } from "@/lib/phaseData";
import { useRef, useState, useEffect } from "react";
import { Link } from "react-router-dom";

export default function Dashboard() {
  const { profile, phaseLabel, morName, farName, babyAgeWeeks, babyAgeMonths } = useFamily();
  const isMor = profile.role === "mor";
  const childName = profile.children?.[0]?.name;

  const displayPhase = childName
    ? `${phaseLabel} · ${childName}`
    : phaseLabel;

  const dateStr = format(new Date(), "EEE d. MMM", { locale: da }).toUpperCase();

  return (
    <div className="space-y-4">
      {/* Header — minimal, no duplication */}
      <div className="section-fade-in">
        <div className="flex items-center justify-between">
          <h1 className="text-[1.9rem] font-normal">
            {getGreetingWord()}, {profile.parentName}
          </h1>
          <span className="text-[0.58rem] tracking-[0.1em] uppercase text-muted-foreground">{dateStr}</span>
        </div>
        <p className="text-[0.62rem] tracking-[0.14em] uppercase text-muted-foreground mt-1">
          {displayPhase}
        </p>
      </div>

      {profile.phase === "pregnant" ? (
        <>
          <PregnancyWeekBar />
          <BabySizeCard />
          <TaskList />
          <PregnancyInsight />
          <PartnerNudge />
          <MilestoneTimeline />
        </>
      ) : (
        <>
          {/* ═══ FAMILY COMMAND CENTER ═══ */}

          {/* A. What Matters Now — the ONE primary message */}
          <WhatMattersNow />

          {/* Live sleep tracker — only when baby is sleeping */}
          <LiveSleepTracker childName={childName || "Baby"} />

          {/* Friction alert — soft pattern detection */}
          <FrictionAlert />

          {/* Tasks & Quick Log — moved up for fast access */}
          <TaskList />
          <QuickLog />

          {/* ═══ ROLE-SPECIFIC CONTENT ═══ */}
          {isMor ? (
            <>
              <MorRecoveryCard />
              <MorAutoSupport />
              <MorFeedingCard />
            </>
          ) : (
            <>
              {/* Dad: Empathy card — insight, not actions */}
              <MorEmpathyCard ageWeeks={babyAgeWeeks} morName={morName} />
            </>
          )}

          {/* Quick links */}
          <div className="grid grid-cols-2 gap-2.5 section-fade-in">
            <Link to="/chat" className="card-soft !p-4 flex flex-col items-center gap-2 transition-all hover:shadow-sm active:scale-[0.98]">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: isMor ? "hsl(var(--clay-light))" : "hsl(var(--sage-light))" }}>
                <MessageCircle className="w-5 h-5" style={{ color: isMor ? "hsl(var(--clay))" : "hsl(var(--moss))" }} />
              </div>
              <p className="text-[0.78rem] font-medium">Spørg Melo</p>
              <p className="text-[0.6rem] text-muted-foreground text-center">Søvn, udvikling, alt</p>
            </Link>
            <Link to={isMor ? "/sammen" : "/leg"} className="card-soft !p-4 flex flex-col items-center gap-2 transition-all hover:shadow-sm active:scale-[0.98]">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: isMor ? "hsl(var(--clay-light))" : "hsl(var(--sage-light))" }}>
                {isMor ? <Heart className="w-5 h-5" style={{ color: "hsl(var(--clay))" }} /> : <Gamepad2 className="w-5 h-5" style={{ color: "hsl(var(--moss))" }} />}
              </div>
              <p className="text-[0.78rem] font-medium">{isMor ? "Samarbejde" : "Leg & aktiviteter"}</p>
              <p className="text-[0.6rem] text-muted-foreground text-center">{isMor ? "Opgaver & fordeling" : `Tilpasset ${childName || "baby"}s alder`}</p>
            </Link>
          </div>

          {/* Knowledge */}
          <LeapBanner ageWeeks={babyAgeWeeks} childName={childName || "Baby"} />
          <BabyInsightCard ageWeeks={babyAgeWeeks} ageMonths={babyAgeMonths} childName={childName || "Baby"} />

          {/* Micro-support (mom only) */}
          {isMor && <MorMicroSupport />}

          <MilestoneTimeline />
        </>
      )}

      <div className="h-20 md:h-0" />
    </div>
  );
}

// ── Live Sleep Tracker ──
function LiveSleepTracker({ childName }: { childName: string }) {
  const { activeSleep, endSleep } = useDiary();
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    if (!activeSleep) return;
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, [activeSleep]);

  if (!activeSleep) return null;

  const startTime = new Date(activeSleep.startTime);
  const elapsedMs = now - startTime.getTime();
  const totalSeconds = Math.floor(elapsedMs / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const pad = (n: number) => n.toString().padStart(2, "0");

  return (
    <div className="rounded-2xl overflow-hidden section-fade-in" style={{
      background: "linear-gradient(145deg, hsl(var(--moss)), hsl(var(--sage-dark)))",
      border: "1px solid hsl(var(--moss) / 0.3)",
    }}>
      <div className="px-5 py-5 flex flex-col items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg font-semibold"
            style={{ background: "hsl(var(--sage))", color: "white" }}>
            {childName.charAt(0)}
          </div>
          <div>
            <p className="text-[0.95rem] font-semibold text-white">{childName}</p>
            <div className="flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-50" style={{ background: "hsl(var(--sage-light))" }} />
                <span className="relative inline-flex rounded-full h-2 w-2" style={{ background: "hsl(var(--sage-light))" }} />
              </span>
              <p className="text-[0.68rem] text-white/70">
                Sover siden {format(startTime, "HH:mm")} · {activeSleep.type === "nap" ? "Lur" : "Nattesøvn"}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-baseline gap-1 tabular-nums">
          <span className="text-[2.8rem] font-light text-white leading-none">{pad(hours)}</span>
          <span className="text-[2rem] text-white/50 font-light leading-none">:</span>
          <span className="text-[2.8rem] font-light text-white leading-none">{pad(minutes)}</span>
          <span className="text-[2rem] text-white/50 font-light leading-none">:</span>
          <span className="text-[2.8rem] font-light text-white leading-none">{pad(seconds)}</span>
        </div>

        <button
          onClick={() => endSleep(activeSleep.id)}
          className="mt-1 w-14 h-14 rounded-full flex items-center justify-center transition-all active:scale-90"
          style={{ background: "hsl(var(--sage-light))", boxShadow: "0 0 20px hsl(var(--sage) / 0.3)" }}
        >
          <Square className="w-5 h-5" style={{ color: "hsl(var(--moss))", fill: "hsl(var(--moss))" }} />
        </button>
        <p className="text-[0.6rem] text-white/40 uppercase tracking-wider">Stop søvn</p>
      </div>
    </div>
  );
}

// ── Leap Banner ──
function LeapBanner({ ageWeeks, childName }: { ageWeeks: number; childName: string }) {
  const activeLeap = getActiveLeap(ageWeeks);
  const nextLeap = getNextLeap(ageWeeks);

  if (activeLeap) {
    return (
      <div className="rounded-2xl p-4 section-fade-in" style={{
        background: "linear-gradient(135deg, hsl(var(--clay) / 0.12), hsl(var(--clay) / 0.04))",
        border: "1px solid hsl(var(--clay) / 0.25)",
      }}>
        <div className="flex items-center gap-3 mb-2">
          <span className="text-xl">{activeLeap.emoji}</span>
          <div>
            <p className="text-[0.58rem] tracking-[0.14em] uppercase" style={{ color: "hsl(var(--bark))" }}>Tigerspring nu</p>
            <p className="text-[0.92rem] font-semibold">{activeLeap.title}</p>
          </div>
        </div>
        <p className="text-[0.78rem] text-foreground/70 leading-relaxed mb-2">{activeLeap.description}</p>
        <div className="flex flex-wrap gap-1.5">
          {activeLeap.signs.map((s, i) => (
            <span key={i} className="text-[0.62rem] px-2 py-0.5 rounded-full" style={{ background: "hsl(var(--clay) / 0.12)", color: "hsl(var(--bark))" }}>
              {s}
            </span>
          ))}
        </div>
      </div>
    );
  }

  if (nextLeap) {
    const weeksUntil = nextLeap.weekStart - ageWeeks;
    return (
      <div className="rounded-2xl p-4 flex items-center gap-3 section-fade-in" style={{ background: "hsl(var(--cream))", border: "1px solid hsl(var(--stone-light))" }}>
        <span className="text-xl">{nextLeap.emoji}</span>
        <div className="flex-1">
          <p className="text-[0.82rem] font-medium">Næste tigerspring: {nextLeap.title}</p>
          <p className="text-[0.68rem] text-muted-foreground">Om ca. {weeksUntil} {weeksUntil === 1 ? "uge" : "uger"}</p>
        </div>
      </div>
    );
  }
  return null;
}

// ── Baby Insight Card ──
function BabyInsightCard({ ageWeeks, ageMonths, childName }: { ageWeeks: number; ageMonths: number; childName: string }) {
  const insight = getBabyInsight(ageWeeks, childName);
  return (
    <div className="card-soft section-fade-in">
      <p className="label-upper mb-1">
        <span className="inline-block w-2 h-2 rounded-full mr-1.5" style={{ background: "hsl(var(--sage))" }} />
        {ageMonths < 3 ? `${ageWeeks} UGER` : `${ageMonths} MÅNEDER`} · {childName.toUpperCase()}
      </p>
      <p className="text-[1.05rem] font-semibold mb-1.5 mt-2">{insight.title.includes("·") ? insight.title.split("·")[1]?.trim() : insight.title}</p>
      <p className="text-[0.8rem] text-muted-foreground leading-relaxed">{insight.insight}</p>
      <div className="mt-3 rounded-xl px-4 py-2.5" style={{ background: "hsl(var(--sage-light))" }}>
        <p className="text-[0.82rem]">💡 {insight.tip}</p>
      </div>
    </div>
  );
}


function getGreetingWord(): string {
  const h = new Date().getHours();
  if (h < 10) return "Godmorgen";
  if (h < 17) return "Goddag";
  return "Godaften";
}
