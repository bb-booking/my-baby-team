import { useEffect, useRef } from "react";
import { useDiary } from "@/context/DiaryContext";
import { useFamily } from "@/context/FamilyContext";

/**
 * Sends browser notifications when baby's wake window is closing.
 * Only notifies the parent who is "on duty" (on leave = default on duty,
 * weekends = both parents get notified).
 */
export function useSleepNotifications() {
  const { sleepLogs, activeSleep } = useDiary();
  const { profile, babyAgeWeeks, isOnLeave } = useFamily();
  const notifiedRef = useRef<string | null>(null);
  const childName = profile.children?.[0]?.name || "Baby";

  // Request permission on mount
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    if (activeSleep) return; // baby is sleeping, no need to notify
    if (!("Notification" in window) || Notification.permission !== "granted") return;

    // Determine if this parent should receive notifications
    const dayOfWeek = new Date().getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const currentRoleOnLeave = isOnLeave(profile.role);

    // On weekdays: only notify if on leave. On weekends: notify both.
    if (!isWeekend && !currentRoleOnLeave) return;

    // Find last sleep end
    const completed = sleepLogs.filter(l => l.endTime);
    if (completed.length === 0) return;

    const sorted = [...completed].sort(
      (a, b) => new Date(b.endTime!).getTime() - new Date(a.endTime!).getTime()
    );
    const lastEnd = new Date(sorted[0].endTime!).getTime();
    const lastSleepId = sorted[0].id;

    // Calculate wake window
    const maxWakeMin =
      babyAgeWeeks < 6 ? 60 :
      babyAgeWeeks < 12 ? 90 :
      babyAgeWeeks < 26 ? 120 : 150;

    const minutesSinceWake = (Date.now() - lastEnd) / 60000;
    const timeLeft = maxWakeMin - minutesSinceWake;

    // Notify ~15 min before sweetspot closes
    if (timeLeft > 0 && timeLeft <= 15 && notifiedRef.current !== lastSleepId) {
      notifiedRef.current = lastSleepId;
      new Notification(`${childName} er snart klar til en lur 💤`, {
        body: `Søvnvinduet lukker om ca. ${Math.round(timeLeft)} minutter. God tid at finde ro.`,
        icon: "/favicon.ico",
        tag: "sleep-sweetspot",
      });
    }

    // Set up a timer to check again
    if (timeLeft > 15) {
      const msUntilNotify = (timeLeft - 15) * 60000;
      const timer = setTimeout(() => {
        if (notifiedRef.current !== lastSleepId) {
          notifiedRef.current = lastSleepId;
          new Notification(`${childName} er snart klar til en lur 💤`, {
            body: `Søvnvinduet lukker om ca. 15 minutter. God tid at finde ro.`,
            icon: "/favicon.ico",
            tag: "sleep-sweetspot",
          });
        }
      }, msUntilNotify);
      return () => clearTimeout(timer);
    }
  }, [sleepLogs, activeSleep, babyAgeWeeks, profile, isOnLeave, childName]);
}
