import { useState, useEffect } from "react";
import { useFamily } from "@/context/FamilyContext";
import { useDiary } from "@/context/DiaryContext";
import { useTranslation } from "react-i18next";
import { QuickLog } from "@/components/QuickLog";
import { TaskList } from "@/components/TaskList";
import { VidsteDuCard } from "@/components/FarDashboardCards";
import { WhatMattersNow } from "@/components/CommandCenter";
import { NeedsCard } from "@/components/NeedsCard";
import { AppreciationCard } from "@/components/AppreciationCard";
import { MemoryKeeper } from "@/components/MemoryKeeper";
import { JordemoderCard } from "@/components/JordemoderCard";
import { NatteplanCard } from "@/components/NatteplanCard";
import { DagensSpørgsmål } from "@/components/DagensSpørgsmål";
import { UgensRecap } from "@/components/UgensRecap";
import { BabyDevCard } from "@/components/BabyDevCard";
import { NattenKort } from "@/components/NattenKort";
import { MessageCircle, Heart, Gamepad2, Square } from "lucide-react";
import { format } from "date-fns";
import { da, enUS } from "date-fns/locale";
import { Link } from "react-router-dom";
import { useSleepNotifications } from "@/hooks/useSleepNotifications";

export default function DashboardBaby() {
  const { profile, phaseLabel, morName, farName, babyAgeWeeks, isOnLeave, setNeed } = useFamily();
  const { t, i18n } = useTranslation();
  const hasPartner = profile.hasPartner !== false;
  const isMor = profile.role === "mor";
  const childName = profile.children?.[0]?.name;
  const dateFnsLocale = i18n.language === "en" ? enUS : da;

  useSleepNotifications();

  const displayPhase = childName
    ? `${phaseLabel} · ${childName}`
    : phaseLabel;

  const dateStr = format(new Date(), "EEE d. MMM", { locale: dateFnsLocale }).toUpperCase();

  const getGreeting = (): string => {
    const h = new Date().getHours();
    if (h < 10) return t("greeting.morning");
    if (h < 17) return t("greeting.afternoon");
    return t("greeting.evening");
  };

  return (
    <div className="space-y-4">
      <div className="section-fade-in">
        <div className="flex items-center justify-between">
          <h1 className="text-[1.9rem]">
            {getGreeting()}, {profile.parentName}
          </h1>
          <span className="text-[0.58rem] tracking-[0.1em] uppercase text-muted-foreground">{dateStr}</span>
        </div>
        <p className="text-[0.62rem] tracking-[0.14em] uppercase text-muted-foreground mt-1">
          {displayPhase}
        </p>
      </div>

      <NattenKort />
      <LiveSleepTracker childName={childName || "Baby"} />
      <WhatMattersNow />
      <QuickLog />
      <TaskList />
      <NeedsCardConditional />
      <NatteplanCard />
      <UgensRecap />
      <JordemoderCard />
      <BabyDevCard />
      {!isMor && (
        <VidsteDuCard ageWeeks={babyAgeWeeks} morName={morName} />
      )}
      <AppreciationCard />
      <MemoryKeeper />
      <DagensSpørgsmål />
      <NotificationPrompt childName={childName || "Baby"} />

      <div className={`grid gap-2.5 section-fade-in ${hasPartner ? "grid-cols-2" : "grid-cols-1 max-w-[200px] mx-auto"}`}>
        <Link to="/chat" className="card-soft !p-4 flex flex-col items-center gap-2 transition-all hover:shadow-sm active:scale-[0.98]">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: isMor ? "hsl(var(--clay-light))" : "hsl(var(--sage-light))" }}>
            <MessageCircle className="w-5 h-5" style={{ color: isMor ? "hsl(var(--clay))" : "hsl(var(--moss))" }} />
          </div>
          <p className="text-[0.78rem] font-medium">{t("dashboard.askMelo")}</p>
          <p className="text-[0.6rem] text-muted-foreground text-center">{t("dashboard.sleepDevAll")}</p>
        </Link>
        {hasPartner && (
          <Link to={isMor ? "/sammen" : "/leg"} className="card-soft !p-4 flex flex-col items-center gap-2 transition-all hover:shadow-sm active:scale-[0.98]">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: isMor ? "hsl(var(--clay-light))" : "hsl(var(--sage-light))" }}>
              {isMor ? <Heart className="w-5 h-5" style={{ color: "hsl(var(--clay))" }} /> : <Gamepad2 className="w-5 h-5" style={{ color: "hsl(var(--moss))" }} />}
            </div>
            <p className="text-[0.78rem] font-medium">{isMor ? t("dashboard.collaboration") : t("dashboard.playActivities")}</p>
            <p className="text-[0.6rem] text-muted-foreground text-center">{isMor ? t("dashboard.tasksDistribution") : t("dashboard.adaptedToAge", { childName: childName || "baby" })}</p>
          </Link>
        )}
      </div>
    </div>
  );
}

// ── Helper components ─────────────────────────────────────────────────────────

/**
 * NeedsCard visibility logic:
 * - No partner → never show
 * - Person on leave, partner at work (07–15) → show to fill in needs
 * - Working partner (15–19) → show so they see partner's needs before coming home
 * - Both on leave → show to both all day (mutual check-in)
 * - Stale need (>24h old) → auto-clear
 */
function NeedsCardConditional() {
  const { profile, isOnLeave, setNeed } = useFamily();
  const { role } = profile;
  const hasPartner = profile.hasPartner !== false;
  if (!hasPartner) return null;

  const hour = new Date().getHours();
  const myOnLeave = isOnLeave(role);
  const partnerOnLeave = isOnLeave(role === "mor" ? "far" : "mor");

  const myNeed = profile.activeNeed?.[role];
  if (myNeed) {
    const ageHours = (Date.now() - new Date(myNeed.setAt).getTime()) / 3600000;
    if (ageHours > 24) {
      setNeed(null);
      return null;
    }
  }

  if (myOnLeave && partnerOnLeave) return <NeedsCard />;
  if (myOnLeave && !partnerOnLeave && hour >= 7 && hour < 15) return <NeedsCard />;
  if (!myOnLeave && partnerOnLeave && hour >= 15 && hour < 19) return <NeedsCard />;

  return null;
}

function NotificationPrompt({ childName }: { childName: string }) {
  const { t } = useTranslation();
  const [show, setShow] = useState(false);

  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      setShow(true);
    }
  }, []);

  if (!show) return null;

  const handleEnable = async () => {
    const result = await Notification.requestPermission();
    setShow(false);
    if (result === "granted") {
      new Notification(t("notifications.enabled"), {
        body: t("notifications.enabledBody", { childName }),
        icon: "/favicon.ico",
      });
    }
  };

  return (
    <div className="rounded-2xl px-4 py-3.5 section-fade-in" style={{
      background: "hsl(var(--cream))",
      border: "1px solid hsl(var(--stone-light))",
    }}>
      <div className="flex items-start gap-3">
        <span className="text-lg">🔔</span>
        <div className="flex-1">
          <p className="text-[0.82rem] font-medium mb-0.5">{t("notifications.title")}</p>
          <p className="text-[0.72rem] text-muted-foreground mb-2">
            {t("notifications.body", { childName })}
          </p>
          <div className="flex gap-2">
            <button onClick={handleEnable} className="text-[0.72rem] font-medium px-3 py-1.5 rounded-lg transition-all active:scale-95" style={{ background: "hsl(var(--moss))", color: "white" }}>
              {t("notifications.enable")}
            </button>
            <button onClick={() => setShow(false)} className="text-[0.72rem] text-muted-foreground px-3 py-1.5">
              {t("notifications.notNow")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function LiveSleepTracker({ childName }: { childName: string }) {
  const { activeSleep, endSleep } = useDiary();
  const { profile } = useFamily();
  const isMor = profile.role === "mor";
  const { t } = useTranslation();
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    if (!activeSleep) return;
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, [activeSleep]);

  if (!activeSleep) return null;

  const startTime = new Date(activeSleep.startTime);
  const elapsedMs = Math.max(0, now - startTime.getTime());
  const totalSeconds = Math.max(0, Math.floor(elapsedMs / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const pad = (n: number) => n.toString().padStart(2, "0");

  const typeLabel = activeSleep.type === "nap" ? t("liveTracker.nap") : t("liveTracker.nightSleep");

  return (
    <div className="rounded-2xl overflow-hidden section-fade-in" style={{
      background: isMor
        ? "linear-gradient(145deg, hsl(var(--clay)), hsl(var(--bark)))"
        : "linear-gradient(145deg, hsl(var(--moss)), hsl(var(--sage-dark)))",
      border: isMor ? "1px solid hsl(var(--clay) / 0.3)" : "1px solid hsl(var(--moss) / 0.3)",
    }}>
      <div className="px-5 py-5 flex flex-col items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg font-semibold"
            style={{ background: isMor ? "hsl(var(--clay-light))" : "hsl(var(--sage))", color: isMor ? "hsl(var(--bark))" : "hsl(var(--moss))" }}>
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
                {t("liveTracker.sleepingSince", { time: format(startTime, "HH:mm"), type: typeLabel })}
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
          style={{
            background: isMor ? "hsl(var(--clay-light))" : "hsl(var(--sage-light))",
            boxShadow: isMor ? "0 0 20px hsl(var(--clay) / 0.3)" : "0 0 20px hsl(var(--sage) / 0.3)",
          }}
        >
          <Square className="w-5 h-5" style={{ color: isMor ? "hsl(var(--bark))" : "hsl(var(--moss))", fill: isMor ? "hsl(var(--bark))" : "hsl(var(--moss))" }} />
        </button>
        <p className="text-[0.6rem] text-white/40 uppercase tracking-wider">{t("liveTracker.stopSleep")}</p>
      </div>
    </div>
  );
}
