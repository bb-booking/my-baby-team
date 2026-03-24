import { useFamily } from "@/context/FamilyContext";
import { useDiary } from "@/context/DiaryContext";
import { PregnancyWeekBar, BabySizeCard, PregnancyInsight } from "@/components/PregnancyWidgets";
import { QuickLog } from "@/components/QuickLog";
import { TaskList } from "@/components/TaskList";
import { PartnerNudge } from "@/components/PartnerNudge";
import { MilestoneTimeline } from "@/components/MilestoneTimeline";
import { MorRecoveryCard, MorSupportCard, MorFeedingCard, MorMicroSupport } from "@/components/MorDashboardCards";
import { FarDailyActionCard, FarEmotionalNudge, FarFunHook, FarGuideCard, FarOwnershipCard } from "@/components/FarDashboardCards";
import { Heart, Shield, Zap, Stethoscope, Brain, MessageCircle, Gamepad2 } from "lucide-react";
import { format } from "date-fns";
import { da } from "date-fns/locale";
import { getBabyInsight, getKnowledgeCards, getActiveLeap, getNextLeap } from "@/lib/phaseData";
import { useRef } from "react";
import { useNavigate, Link } from "react-router-dom";

export default function Dashboard() {
  const { profile, phaseLabel, morName, farName, babyAgeWeeks, babyAgeMonths } = useFamily();
  const greeting = getGreeting();
  const isMor = profile.role === "mor";
  const childName = profile.children?.[0]?.name;

  const displayPhase = childName
    ? `${phaseLabel} · ${childName}`
    : phaseLabel;

  const dateStr = format(new Date(), "EEE d. MMM · HH:mm", { locale: da }).toUpperCase();

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="section-fade-in">
        <div className="flex items-center justify-between">
          <p className="label-upper">{greeting}</p>
          <span className="text-[0.58rem] tracking-[0.1em] uppercase text-muted-foreground px-3 py-1 rounded-full border" style={{ borderColor: "hsl(var(--stone-light))" }}>
            {dateStr}
          </span>
        </div>
        <h1 className="text-[1.9rem] font-normal mt-2">
          {getGreetingWord()}, {profile.parentName}
        </h1>
        <p className="text-[0.62rem] tracking-[0.14em] uppercase text-muted-foreground mt-1">
          {displayPhase}
        </p>
      </div>

      {/* Role focus card */}
      <RoleFocusCard
        isMor={isMor}
        phase={profile.phase}
        childName={childName}
        partnerName={isMor ? farName : morName}
        babyAgeWeeks={babyAgeWeeks}
      />

      {profile.phase === "pregnant" ? (
        <>
          <PregnancyWeekBar />
          <BabySizeCard />
          <TaskList />
          <PregnancyInsight />
          <PartnerNudge />
          <MilestoneTimeline />
        </>
      ) : isMor ? (
          <>
            {/* MOR DASHBOARD */}
            {/* 1. Recovery check-in */}
            <MorRecoveryCard />

            {/* 2. Quick Log */}
            <QuickLog />

            {/* 3. Stats strip */}
            <QuickStatsStrip babyAgeWeeks={babyAgeWeeks} babyAgeMonths={babyAgeMonths} childName={childName || "Baby"} />

            {/* 4. Live sleep tracker */}
            <LiveSleepTracker childName={childName || "Baby"} />

            {/* 5. Support & nudges */}
            <MorSupportCard />

            {/* 6. Feeding support */}
            <MorFeedingCard />

            {/* 7. Relevant now */}
            <RelevantNowCard ageWeeks={babyAgeWeeks} childName={childName || "Baby"} isMor={true} partnerName={farName} />

            {/* 8. Tasks */}
            <TaskList />

            {/* 9. Micro-support message */}
            <MorMicroSupport />

            {/* 10. Quick links */}
            <div className="grid grid-cols-2 gap-2.5 section-fade-in">
              <Link to="/chat" className="card-soft !p-4 flex flex-col items-center gap-2 transition-all hover:shadow-sm active:scale-[0.98]">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "hsl(var(--clay-light))" }}>
                  <MessageCircle className="w-5 h-5" style={{ color: "hsl(var(--clay))" }} />
                </div>
                <p className="text-[0.78rem] font-medium">Spørg Lille</p>
                <p className="text-[0.6rem] text-muted-foreground text-center">Amning, søvn, følelser</p>
              </Link>
              <Link to="/sammen" className="card-soft !p-4 flex flex-col items-center gap-2 transition-all hover:shadow-sm active:scale-[0.98]">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "hsl(var(--clay-light))" }}>
                  <Heart className="w-5 h-5" style={{ color: "hsl(var(--clay))" }} />
                </div>
                <p className="text-[0.78rem] font-medium">Samarbejde</p>
                <p className="text-[0.6rem] text-muted-foreground text-center">Opgaver & fordeling</p>
              </Link>
            </div>

            {/* 11. Leap + knowledge */}
            <LeapBanner ageWeeks={babyAgeWeeks} childName={childName || "Baby"} />
            <KnowledgeCarousel ageWeeks={babyAgeWeeks} childName={childName || "Baby"} />
            <BabyInsightCard ageWeeks={babyAgeWeeks} ageMonths={babyAgeMonths} childName={childName || "Baby"} />

            <PartnerNudge />
            <MilestoneTimeline />
          </>
        ) : (
          <>
            {/* FAR DASHBOARD */}
            {/* 1. Quick Log — first for fast logging */}
            <QuickLog />

            {/* 2. Stats strip */}
            <QuickStatsStrip babyAgeWeeks={babyAgeWeeks} babyAgeMonths={babyAgeMonths} childName={childName || "Baby"} />

            {/* 3. Live sleep tracker */}
            <LiveSleepTracker childName={childName || "Baby"} />

            {/* 4. Daily action card */}
            <FarDailyActionCard />

            {/* 5. Fun hook */}
            <FarFunHook />

            {/* 6. Emotional nudge */}
            <FarEmotionalNudge />

            {/* 7. Ownership card */}
            <FarOwnershipCard />

            {/* 8. Guide */}
            <FarGuideCard />

            {/* 9. Relevant now */}
            <RelevantNowCard ageWeeks={babyAgeWeeks} childName={childName || "Baby"} isMor={false} partnerName={morName} />

            {/* 10. Tasks */}
            <TaskList />

            {/* 11. Quick links */}
            <div className="grid grid-cols-2 gap-2.5 section-fade-in">
              <Link to="/chat" className="card-soft !p-4 flex flex-col items-center gap-2 transition-all hover:shadow-sm active:scale-[0.98]">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "hsl(var(--sage-light))" }}>
                  <MessageCircle className="w-5 h-5" style={{ color: "hsl(var(--moss))" }} />
                </div>
                <p className="text-[0.78rem] font-medium">Spørg Lille</p>
                <p className="text-[0.6rem] text-muted-foreground text-center">Søvn, udvikling, tips</p>
              </Link>
              <Link to="/leg" className="card-soft !p-4 flex flex-col items-center gap-2 transition-all hover:shadow-sm active:scale-[0.98]">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "hsl(var(--sage-light))" }}>
                  <Gamepad2 className="w-5 h-5" style={{ color: "hsl(var(--moss))" }} />
                </div>
                <p className="text-[0.78rem] font-medium">Leg & aktiviteter</p>
                <p className="text-[0.6rem] text-muted-foreground text-center">Tilpasset {childName || "baby"}s alder</p>
              </Link>
            </div>

            {/* 12. Leap + knowledge */}
            <LeapBanner ageWeeks={babyAgeWeeks} childName={childName || "Baby"} />
            <KnowledgeCarousel ageWeeks={babyAgeWeeks} childName={childName || "Baby"} />
            <BabyInsightCard ageWeeks={babyAgeWeeks} ageMonths={babyAgeMonths} childName={childName || "Baby"} />

            <PartnerNudge />
            <MilestoneTimeline />
        </>
      )}

      <div className="h-20 md:h-0" />
    </div>
  );
}

// ── "Relevant now" module ──
function RelevantNowCard({ ageWeeks, childName, isMor, partnerName }: { ageWeeks: number; childName: string; isMor: boolean; partnerName: string }) {
  const activeLeap = getActiveLeap(ageWeeks);

  const focuses: string[] = [];
  if (ageWeeks < 4) {
    focuses.push("Hud-mod-hud kontakt og ro");
    focuses.push("Etabler amning/flaske-rytme");
    if (!isMor) focuses.push(`Støt ${partnerName} med praktisk hjælp`);
  } else if (ageWeeks < 12) {
    focuses.push("Korte mavetids-øvelser");
    focuses.push("Øjenkontakt og smil");
    if (activeLeap) focuses.push(`Tålmodighed — tigerspring i gang`);
  } else if (ageWeeks < 26) {
    focuses.push("Gribelegetøj og sanseleg");
    focuses.push("Tummy time med legetøj");
    if (!isMor) focuses.push(`Tag ${childName} med på gåtur alene`);
  } else {
    focuses.push("Tittit-bansen og pegebøger");
    focuses.push("Babysikring af hjemmet");
    focuses.push("Faste rutiner giver tryghed");
  }

  return (
    <div className="card-soft section-fade-in">
      <p className="text-[0.6rem] tracking-[0.14em] uppercase text-muted-foreground mb-2">🎯 FOKUS LIGE NU</p>
      <p className="text-[0.92rem] font-medium mb-2">Lige nu kan I fokusere på…</p>
      <ul className="space-y-1.5">
        {focuses.map((f, i) => (
          <li key={i} className="flex items-start gap-2 text-[0.78rem] text-foreground/70 leading-relaxed">
            <span className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0" style={{ background: "hsl(var(--sage))" }} />
            {f}
          </li>
        ))}
      </ul>
    </div>
  );
}

// ── Quick stats strip ──
function QuickStatsStrip({ babyAgeWeeks, babyAgeMonths, childName }: { babyAgeWeeks: number; babyAgeMonths: number; childName: string }) {
  const { todayNursingCount, todayDiaperCount, todaySleepMinutes } = useDiary();
  const { profile } = useFamily();
  const feedingMethod = profile.morHealth?.feedingMethod;
  const feedingLabel = feedingMethod === "flaske" ? "Flaske" : feedingMethod === "begge" ? "Måltider" : "Amning";
  const feedingEmoji = feedingMethod === "flaske" ? "🍼" : feedingMethod === "begge" ? "🍼" : "🤱";
  const ageLabel = babyAgeMonths >= 1 ? `${babyAgeMonths} mdr.` : `${babyAgeWeeks} uger`;
  const sleepH = Math.floor(todaySleepMinutes / 60);
  const sleepM = Math.round(todaySleepMinutes % 60);
  const sleepStr = sleepH > 0 ? `${sleepH}t ${sleepM}m` : `${sleepM}m`;

  const stats = [
    { emoji: "🌙", value: sleepStr, label: "Søvn" },
    { emoji: feedingEmoji, value: `${todayNursingCount}×`, label: feedingLabel },
    { emoji: "🧷", value: `${todayDiaperCount}×`, label: "Bleer" },
    { emoji: "👶", value: ageLabel, label: childName },
  ];

  return (
    <div className="rounded-2xl border overflow-hidden section-fade-in" style={{ borderColor: "hsl(var(--stone-light))", animationDelay: "60ms" }}>
      <div className="grid grid-cols-4 divide-x divide-[hsl(var(--stone-lighter))]">
        {stats.map(s => (
          <div key={s.label} className="flex flex-col items-center py-3 px-1.5 gap-0.5">
            <span className="text-base">{s.emoji}</span>
            <span className="text-[0.88rem] font-semibold">{s.value}</span>
            <span className="text-[0.52rem] tracking-[0.12em] uppercase text-muted-foreground">{s.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Sleep status banner ──
function SleepStatusBanner({ childName }: { childName: string }) {
  const { activeSleep, todaySleepMinutes } = useDiary();
  const hours = Math.floor(todaySleepMinutes / 60);
  const mins = Math.round(todaySleepMinutes % 60);

  if (activeSleep) {
    const startTime = format(new Date(activeSleep.startTime), "HH:mm");
    const elapsed = Math.round((Date.now() - new Date(activeSleep.startTime).getTime()) / 60000);
    const eH = Math.floor(elapsed / 60);
    const eM = elapsed % 60;

    return (
      <div
        className="rounded-2xl px-5 py-4 flex items-center gap-4 relative overflow-hidden section-fade-in"
        style={{
          background: "linear-gradient(135deg, hsl(var(--sage-light)), hsl(var(--sage) / 0.35))",
          border: "1px solid hsl(var(--sage) / 0.25)",
        }}
      >
        <span className="text-2xl flex-shrink-0">🌙</span>
        <div className="flex-1">
          <p className="text-[0.95rem] font-semibold" style={{ color: "hsl(var(--moss))" }}>
            {childName} sover
          </p>
          <p className="text-[0.7rem]" style={{ color: "hsl(var(--sage-dark))" }}>
            Startede kl. {startTime} · {activeSleep.type === "nap" ? "Lur" : "Nattesøvn"}
          </p>
        </div>
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-50" style={{ background: "hsl(var(--sage))" }} />
          <span className="relative inline-flex rounded-full h-2.5 w-2.5" style={{ background: "hsl(var(--moss))" }} />
        </span>
        <span className="text-xl font-light" style={{ color: "hsl(var(--moss))" }}>
          {eH > 0 ? `${eH}t ${eM}m` : `${eM}m`}
        </span>
      </div>
    );
  }

  if (todaySleepMinutes > 0) {
    return (
      <div
        className="rounded-2xl px-4 py-3 flex items-center gap-3 section-fade-in"
        style={{ background: "hsl(var(--cream))", border: "1px solid hsl(var(--stone-light))" }}
      >
        <span className="text-lg">😴</span>
        <div className="flex-1">
          <p className="text-[0.82rem] font-medium">Søvn i dag</p>
          <p className="text-[0.68rem] text-muted-foreground">
            {hours > 0 ? `${hours}t ${mins}m` : `${mins}m`} samlet
          </p>
        </div>
      </div>
    );
  }

  return null;
}

// ── Leap banner ──
function LeapBanner({ ageWeeks, childName }: { ageWeeks: number; childName: string }) {
  const activeLeap = getActiveLeap(ageWeeks);
  const nextLeap = getNextLeap(ageWeeks);

  if (activeLeap) {
    return (
      <div
        className="rounded-2xl p-4 section-fade-in"
        style={{
          background: "linear-gradient(135deg, hsl(var(--clay) / 0.12), hsl(var(--clay) / 0.04))",
          border: "1px solid hsl(var(--clay) / 0.25)",
        }}
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "hsl(var(--clay-light))" }}>
            <Zap className="w-5 h-5" style={{ color: "hsl(var(--clay))" }} />
          </div>
          <div>
            <p className="text-[0.58rem] tracking-[0.14em] uppercase" style={{ color: "hsl(var(--bark))" }}>Tigerspring nu</p>
            <p className="text-[0.92rem] font-semibold">{activeLeap.emoji} {activeLeap.title}</p>
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

// ── Knowledge carousel ──
function KnowledgeCarousel({ ageWeeks, childName }: { ageWeeks: number; childName: string }) {
  const cards = getKnowledgeCards(ageWeeks, childName);
  const scrollRef = useRef<HTMLDivElement>(null);
  const colorMap: Record<string, { bg: string; border: string }> = {
    sage: { bg: "hsl(var(--sage-light))", border: "hsl(var(--sage) / 0.2)" },
    clay: { bg: "hsl(var(--clay-light))", border: "hsl(var(--clay) / 0.2)" },
    moss: { bg: "hsl(var(--cream))", border: "hsl(var(--sage) / 0.15)" },
  };

  return (
    <div className="section-fade-in">
      <p className="text-[1rem] font-semibold mb-3">Vidste du? 🧠</p>
      <div ref={scrollRef} className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 snap-x snap-mandatory scrollbar-hide" style={{ scrollbarWidth: "none" }}>
        {cards.map((card, i) => {
          const colors = colorMap[card.color] || colorMap.sage;
          return (
            <div key={i} className="flex-shrink-0 w-[240px] rounded-2xl p-4 snap-start" style={{ background: colors.bg, border: `1px solid ${colors.border}` }}>
              <span className="text-2xl block mb-2">{card.emoji}</span>
              <p className="text-[0.56rem] tracking-[0.14em] uppercase text-muted-foreground mb-1">{card.category}</p>
              <p className="text-[0.88rem] font-semibold mb-1.5 leading-snug">{card.title}</p>
              <p className="text-[0.75rem] text-foreground/70 leading-relaxed">{card.body}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Baby insight card ──
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

// ── Role focus card ──
function RoleFocusCard({ isMor, phase, childName, partnerName, babyAgeWeeks }: { isMor: boolean; phase: string; childName?: string; partnerName: string; babyAgeWeeks: number }) {
  const name = childName || "baby";

  if (phase === "pregnant") {
    if (isMor) {
      return (
        <div className="rounded-2xl p-4 flex items-center gap-4 section-fade-in" style={{ background: "linear-gradient(135deg, hsl(var(--clay) / 0.1), hsl(var(--clay) / 0.04))", border: "1px solid hsl(var(--clay) / 0.2)", animationDelay: "60ms" }}>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "hsl(var(--clay-light))" }}>
            <Heart className="w-5 h-5" style={{ color: "hsl(var(--clay))" }} />
          </div>
          <div>
            <p className="text-[0.88rem] font-medium">Husk dig selv i dag</p>
            <p className="text-[0.72rem] text-muted-foreground leading-relaxed">Din krop arbejder hårdt — tag en pause og mærk efter.</p>
          </div>
        </div>
      );
    }
    return (
      <div className="rounded-2xl p-4 flex items-center gap-4 section-fade-in" style={{ background: "linear-gradient(135deg, hsl(var(--sage) / 0.1), hsl(var(--sage) / 0.04))", border: "1px solid hsl(var(--sage) / 0.2)", animationDelay: "60ms" }}>
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "hsl(var(--sage-light))" }}>
          <Shield className="w-5 h-5" style={{ color: "hsl(var(--moss))" }} />
        </div>
        <div>
          <p className="text-[0.88rem] font-medium">Sådan støtter du {partnerName}</p>
          <p className="text-[0.72rem] text-muted-foreground leading-relaxed">Spørg konkret: "Hvad kan jeg gøre for dig lige nu?"</p>
        </div>
      </div>
    );
  }

  const content = isMor
    ? getMorFocusContent(babyAgeWeeks, name, partnerName)
    : getFarFocusContent(babyAgeWeeks, name, partnerName);
  const colorKey = isMor ? "clay" : "sage";

  return (
    <div className="rounded-2xl p-4 section-fade-in" style={{ background: `linear-gradient(135deg, hsl(var(--${colorKey}) / 0.08), hsl(var(--${colorKey}) / 0.03))`, border: `1px solid hsl(var(--${colorKey}) / 0.18)`, animationDelay: "60ms" }}>
      <div className="flex items-center gap-3 mb-2">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `hsl(var(--${colorKey}-light))` }}>
          {content.icon}
        </div>
        <p className="text-[0.88rem] font-medium">{content.title}</p>
      </div>
      <p className="text-[0.75rem] text-muted-foreground leading-relaxed">{content.body}</p>
    </div>
  );
}

function getMorFocusContent(ageWeeks: number, childName: string, partnerName: string) {
  if (ageWeeks < 2) return { icon: <Stethoscope className="w-4 h-4" style={{ color: "hsl(var(--clay))" }} />, title: "Din krop heler", body: `De første dage handler om hvile. Drik masser af vand, spis godt og lad ${partnerName} tage over når du kan.` };
  if (ageWeeks < 6) return { icon: <Heart className="w-4 h-4" style={{ color: "hsl(var(--clay))" }} />, title: "Recovery & velvære", body: `Baby blues rammer op til 80% i de første uger. Tal med ${partnerName} om det.` };
  if (ageWeeks < 12) return { icon: <Brain className="w-4 h-4" style={{ color: "hsl(var(--clay))" }} />, title: "Mental load er reel", body: `Del ansvaret med ${partnerName} — brug opgavelisten.` };
  return { icon: <Heart className="w-4 h-4" style={{ color: "hsl(var(--clay))" }} />, title: "Du gør det godt", body: `${childName} har en fantastisk mor. Tid til dig selv er nødvendigt.` };
}

function getFarFocusContent(ageWeeks: number, childName: string, partnerName: string) {
  if (ageWeeks < 2) return { icon: <Zap className="w-4 h-4" style={{ color: "hsl(var(--moss))" }} />, title: "Du er afgørende lige nu", body: `Tag ansvar for mad, rengøring og gæster. Hud-mod-hud med ${childName} styrker jeres bånd.` };
  if (ageWeeks < 6) return { icon: <Shield className="w-4 h-4" style={{ color: "hsl(var(--moss))" }} />, title: "Tag nattevagter", body: `Selv én nattevagt giver ${partnerName} den dybe søvn hun har brug for.` };
  if (ageWeeks < 12) return { icon: <Zap className="w-4 h-4" style={{ color: "hsl(var(--moss))" }} />, title: "Find jeres rytme", body: `Tag ${childName} med på gåture alene — det bygger selvtillid.` };
  return { icon: <Shield className="w-4 h-4" style={{ color: "hsl(var(--moss))" }} />, title: "Vær til stede", body: `Kvalitetstid handler om nærvær. Leg, læs, syng.` };
}

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 10) return "GOD MORGEN ☀️";
  if (h < 17) return "GOD DAG 🌿";
  return "GOD AFTEN 🌙";
}

function getGreetingWord(): string {
  const h = new Date().getHours();
  if (h < 10) return "Godmorgen";
  if (h < 17) return "Goddag";
  return "Godaften";
}
