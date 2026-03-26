import { useFamily } from "@/context/FamilyContext";
import { useDiary } from "@/context/DiaryContext";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { getActiveLeap, getNextLeap } from "@/lib/phaseData";
import { useTranslation } from "react-i18next";
import type { TFunction } from "i18next";

// ── A. WHAT MATTERS NOW — single primary message ──
export function WhatMattersNow() {
  const { profile, babyAgeWeeks, morName, farName, isOnLeave, tasks } = useFamily();
  const { activeSleep, todayNursingCount, todaySleepMinutes, sleepLogs, todayDiaperCount } = useDiary();
  const { t } = useTranslation();
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
    t,
  });

  return (
    <div className="rounded-2xl overflow-hidden section-fade-in" style={{
      background: "linear-gradient(145deg, hsl(var(--moss)), hsl(var(--sage-dark)))",
    }}>
      <div className="px-5 py-5">
        <p className="text-[0.55rem] tracking-[0.2em] uppercase text-white/50 mb-2">{t("commandCenter.rightNow")}</p>
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
  t: TFunction;
}

interface WMMessage {
  title: string;
  body: string;
  link: string;
  linkLabel: string;
}

function getWhatMattersMessage(input: MessageInput): WMMessage {
  const { isMor, childName, partnerName, babyAgeWeeks, activeSleep, nursingCount, lastSleepEnd, isOnLeave, partnerOnLeave, diaperCount, tasks, t } = input;
  const hour = new Date().getHours();

  // PRIORITY 1: Sleep sweetspot
  if (!activeSleep && lastSleepEnd) {
    const minutesSinceWake = (Date.now() - lastSleepEnd) / 60000;
    const maxWakeWindow = babyAgeWeeks < 6 ? 60 : babyAgeWeeks < 12 ? 90 : babyAgeWeeks < 26 ? 120 : 150;
    const timeLeft = maxWakeWindow - minutesSinceWake;

    if (timeLeft > 0 && timeLeft < 30) {
      const who = isMor && !isOnLeave && partnerOnLeave
        ? t("commandCenter.maybePut", { partnerName })
        : !isMor && isOnLeave
        ? t("commandCenter.youCanTake")
        : "";
      return {
        title: t("commandCenter.readyForNap", { childName, minutes: Math.round(timeLeft) }),
        body: `${t("commandCenter.dimLights")} ${who}`.trim(),
        link: "/sovn",
        linkLabel: t("commandCenter.sleepOverview"),
      };
    }
  }

  if (activeSleep) {
    return {
      title: t("commandCenter.sleeping", { childName }),
      body: isMor
        ? t("commandCenter.useMeTime")
        : t("commandCenter.helpPartner", { partnerName }),
      link: "/sovn",
      linkLabel: t("commandCenter.seeSleepData"),
    };
  }

  // PRIORITY 2: Clinical flags
  if (hour >= 14) {
    const minNursing = babyAgeWeeks < 6 ? 6 : babyAgeWeeks < 16 ? 5 : 4;
    if (nursingCount > 0 && nursingCount < minNursing && hour >= 16) {
      return {
        title: t("commandCenter.mealsToday", { childName, count: nursingCount }),
        body: t("commandCenter.minMeals", { min: minNursing }),
        link: "/dagbog",
        linkLabel: t("commandCenter.seeDiary"),
      };
    }

    if (diaperCount > 0 && diaperCount < 3 && hour >= 16 && babyAgeWeeks < 12) {
      return {
        title: t("commandCenter.fewDiapers", { count: diaperCount }),
        body: t("commandCenter.expectDiapers", { childName }),
        link: "/dagbog",
        linkLabel: t("commandCenter.logDiaper"),
      };
    }
  }

  // PRIORITY 3: Tiger leap
  const activeLeap = getActiveLeap(babyAgeWeeks);
  if (activeLeap) {
    const leapTips = isMor
      ? t("commandCenter.leapTipMom", { childName })
      : t("commandCenter.leapTipDad", { childName });
    return {
      title: t("commandCenter.leapTitle", { emoji: activeLeap.emoji, title: activeLeap.title }),
      body: leapTips,
      link: "/barn",
      linkLabel: t("commandCenter.seeLeaps"),
    };
  }

  // PRIORITY 4: Partner support
  if (hour >= 12 && hour < 20) {
    if (isMor && isOnLeave && !partnerOnLeave && hour >= 15) {
      return {
        title: t("commandCenter.youMadeIt"),
        body: t("commandCenter.tellPartner", { partnerName }),
        link: "/sammen",
        linkLabel: t("together.title"),
      };
    }
    if (!isMor && !isOnLeave && hour >= 14) {
      return {
        title: t("commandCenter.partnerHadBaby", { partnerName, childName }),
        body: t("commandCenter.takeOver"),
        link: "/sammen",
        linkLabel: t("commandCenter.seeTasks"),
      };
    }
    if (!isMor && isOnLeave) {
      return {
        title: t("commandCenter.handsOn", { childName }),
        body: t("commandCenter.useLeaveDay"),
        link: "/leg",
        linkLabel: t("play.title"),
      };
    }
  }

  // PRIORITY 5: Play & activity
  if (hour >= 9 && hour < 17 && lastSleepEnd) {
    const minutesSinceWake = (Date.now() - lastSleepEnd) / 60000;
    const maxWake = babyAgeWeeks < 6 ? 60 : babyAgeWeeks < 12 ? 90 : babyAgeWeeks < 26 ? 120 : 150;
    const inWakeWindow = minutesSinceWake > 10 && minutesSinceWake < maxWake * 0.6;

    if (inWakeWindow) {
      const activity = getAgeActivity(babyAgeWeeks, childName, t);
      return {
        title: activity.title,
        body: activity.body,
        link: "/leg",
        linkLabel: t("commandCenter.moreActivities"),
      };
    }
  }

  // PRIORITY 6: Daily tasks
  const today = new Date().toISOString().slice(0, 10);
  const todayTasks = tasks.filter(t => t.dueDate === today && !t.completed);
  const myTasks = todayTasks.filter(t => t.assignee === (isMor ? "mor" : "far") || t.assignee === "fælles");

  if (myTasks.length > 0) {
    return {
      title: t("commandCenter.tasksToday", { count: myTasks.length, plural: myTasks.length > 1 ? "s" : "" }),
      body: t("commandCenter.tasksTodayDesc"),
      link: "/sammen",
      linkLabel: t("commandCenter.seeAllTasks"),
    };
  }

  // PRIORITY 7: Time-based fallback
  return getTimeBasedFallback(hour, isMor, childName, partnerName, babyAgeWeeks, t);
}

function getAgeActivity(ageWeeks: number, childName: string, t: TFunction): { title: string; body: string } {
  if (ageWeeks < 6) return {
    title: t("commandCenter.closenessTime", { childName }),
    body: t("commandCenter.closenessDesc"),
  };
  if (ageWeeks < 12) return {
    title: t("commandCenter.tummyTime", { childName }),
    body: t("commandCenter.tummyDesc"),
  };
  if (ageWeeks < 20) return {
    title: t("commandCenter.sensoryPlay", { childName }),
    body: t("commandCenter.sensoryDesc"),
  };
  if (ageWeeks < 30) return {
    title: t("commandCenter.exploreWith", { childName }),
    body: t("commandCenter.exploreDesc"),
  };
  return {
    title: t("commandCenter.playWith", { childName }),
    body: t("commandCenter.playDesc"),
  };
}

function getTimeBasedFallback(hour: number, isMor: boolean, childName: string, partnerName: string, ageWeeks: number, t: TFunction): WMMessage {
  if (hour < 7) {
    return {
      title: t("commandCenter.quietMorning"),
      body: isMor
        ? t("commandCenter.feelMorning")
        : t("commandCenter.morningWalk", { childName }),
      link: "/chat",
      linkLabel: t("commandCenter.askMelo"),
    };
  }
  if (hour < 10) {
    return {
      title: t("commandCenter.goodMorning"),
      body: t("commandCenter.shareRoutine"),
      link: "/sammen",
      linkLabel: t("commandCenter.seeTasks"),
    };
  }
  if (hour < 17) {
    const nextLeap = getNextLeap(ageWeeks);
    if (nextLeap) {
      const weeksUntil = nextLeap.weekStart - ageWeeks;
      return {
        title: t("commandCenter.nextLeap", {
          weeks: weeksUntil,
          weekWord: weeksUntil === 1 ? t("commandCenter.weekSingular") : t("commandCenter.weekPlural"),
          emoji: nextLeap.emoji,
        }),
        body: `"${nextLeap.title}" — ${nextLeap.description.slice(0, 80)}...`,
        link: "/barn",
        linkLabel: t("commandCenter.readMore"),
      };
    }
    return {
      title: t("commandCenter.goodDayWith", { childName }),
      body: t("commandCenter.oneThingAtATime"),
      link: "/leg",
      linkLabel: t("play.title"),
    };
  }
  if (hour < 21) {
    return {
      title: t("commandCenter.eveningRoutine"),
      body: t("commandCenter.eveningDesc", { childName }),
      link: "/sovn",
      linkLabel: t("commandCenter.sleepGuide"),
    };
  }
  return {
    title: t("commandCenter.goodNight"),
    body: isMor
      ? t("commandCenter.restMom")
      : t("commandCenter.partnerSleep", { partnerName }),
    link: "/chat",
    linkLabel: t("commandCenter.askMelo"),
  };
}

// ── B. TODAY'S FLOW ──
export function TodaysFlow() {
  const { profile, morName, farName, isOnLeave } = useFamily();
  const { t } = useTranslation();
  const hour = new Date().getHours();
  const childName = profile.children?.[0]?.name || "baby";

  const morLeave = isOnLeave("mor");
  const farLeave = isOnLeave("far");

  const slots = generateFlowSlots(morName, farName, morLeave, farLeave, childName, t);
  const currentSlotIndex = slots.findIndex(s => hour >= s.startHour && hour < s.endHour);

  return (
    <div className="card-soft section-fade-in" style={{ animationDelay: "40ms" }}>
      <p className="text-[0.55rem] tracking-[0.18em] uppercase text-muted-foreground mb-3">{t("flow.todaysFlow")}</p>

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
                }}>{t("flow.now")}</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function generateFlowSlots(morName: string, farName: string, morLeave: boolean, farLeave: boolean, childName: string, t: TFunction) {
  if (morLeave && farLeave) {
    return [
      { startHour: 6, endHour: 10, icon: "🌅", label: t("flow.morning"), who: farName },
      { startHour: 10, endHour: 13, icon: "☀️", label: t("flow.forenoon"), who: morName },
      { startHour: 13, endHour: 17, icon: "🌤️", label: t("flow.afternoon"), who: farName },
      { startHour: 17, endHour: 20, icon: "🌆", label: t("flow.evening"), who: t("flow.together") },
      { startHour: 20, endHour: 6, icon: "🌙", label: t("flow.night"), who: t("flow.takesTurns") },
    ];
  }
  if (morLeave && !farLeave) {
    return [
      { startHour: 6, endHour: 8, icon: "🌅", label: t("flow.morning"), who: farName },
      { startHour: 8, endHour: 16, icon: "☀️", label: t("flow.day"), who: morName },
      { startHour: 16, endHour: 20, icon: "🌆", label: t("flow.lateAfternoon"), who: farName },
      { startHour: 20, endHour: 6, icon: "🌙", label: t("flow.night"), who: t("flow.takesTurns") },
    ];
  }
  if (!morLeave && farLeave) {
    return [
      { startHour: 6, endHour: 8, icon: "🌅", label: t("flow.morning"), who: morName },
      { startHour: 8, endHour: 16, icon: "☀️", label: t("flow.day"), who: farName },
      { startHour: 16, endHour: 20, icon: "🌆", label: t("flow.lateAfternoon"), who: morName },
      { startHour: 20, endHour: 6, icon: "🌙", label: t("flow.night"), who: t("flow.takesTurns") },
    ];
  }
  return [
    { startHour: 6, endHour: 8, icon: "🌅", label: t("flow.morning"), who: t("flow.takesTurns") },
    { startHour: 8, endHour: 16, icon: "☀️", label: t("flow.day"), who: t("flow.daycare") },
    { startHour: 16, endHour: 20, icon: "🌆", label: t("flow.evening"), who: t("flow.together") },
    { startHour: 20, endHour: 6, icon: "🌙", label: t("flow.night"), who: t("flow.takesTurns") },
  ];
}

// ── C. SUPPORT INSIGHT ──
export function SupportInsight() {
  const { tasks, morName, farName, profile } = useFamily();
  const { todayNursingCount, todayDiaperCount } = useDiary();
  const { t } = useTranslation();
  const isMor = profile.role === "mor";

  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const recentTasks = tasks.filter(t => t.completed && t.dueDate >= weekAgo);
  const morTasks = recentTasks.filter(t => t.assignee === "mor").length;
  const farTasks = recentTasks.filter(t => t.assignee === "far").length;
  const total = morTasks + farTasks;

  let insight: { emoji: string; text: string; action: string; actionLink?: string } | null = null;

  if (total < 3) {
    insight = {
      emoji: "🌱",
      text: t("support.useTaskList"),
      action: t("support.seeTasks"),
      actionLink: "/sammen",
    };
  } else if (total > 0) {
    const ratio = morTasks / total;
    if (ratio > 0.7) {
      insight = {
        emoji: "🤝",
        text: t("support.momHasMore"),
        action: t("support.distributeTasks"),
        actionLink: "/sammen",
      };
    } else if (ratio < 0.3) {
      insight = {
        emoji: "🤝",
        text: t("support.dadHasMore"),
        action: t("support.seeDistribution"),
        actionLink: "/sammen",
      };
    } else {
      insight = {
        emoji: "💚",
        text: t("support.balanced"),
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

// ── D. ONE NUDGE ──
export function OneNudge() {
  const { profile, morName, farName, isOnLeave, babyAgeWeeks } = useFamily();
  const { todaySleepMinutes } = useDiary();
  const { t } = useTranslation();
  const isMor = profile.role === "mor";
  const childName = profile.children?.[0]?.name || "baby";
  const partnerName = isMor ? farName : morName;

  const nudge = getNudge(isMor, childName, partnerName, t);

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

function getNudge(isMor: boolean, childName: string, partnerName: string, t: TFunction) {
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);

  if (isMor) {
    const nudges = t("nudge.momNudges", { returnObjects: true, partnerName }) as any[];
    return nudges[dayOfYear % nudges.length];
  }

  const nudges = t("nudge.dadNudges", { returnObjects: true, childName, partnerName }) as any[];
  return nudges[dayOfYear % nudges.length];
}

// ── DAILY CHECK-IN ──
export function DailyCheckIn() {
  const { addCheckIn, todayCheckIn, profile } = useFamily();
  const { t } = useTranslation();

  const moods = [
    { emoji: "😊", label: t("checkin.good"), response: t("checkin.goodResponse") },
    { emoji: "😐", label: t("checkin.okay"), response: t("checkin.okayResponse") },
    { emoji: "😔", label: t("checkin.hard"), response: t("checkin.hardResponse") },
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
      <p className="text-[0.78rem] font-medium mb-2.5">{t("checkin.howAreYou")}</p>
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
