import { useState, useEffect } from "react";
import { useDiary } from "@/context/DiaryContext";
import { useFamily } from "@/context/FamilyContext";
import { useTranslation } from "react-i18next";

interface NightMessage {
  headline: string;
  body: string;
  source?: string;
}

function getNightMessages(ageWeeks: number, childName: string, lastLogType: string | null, t: (key: string, opts?: any) => string): NightMessage[] {
  const name = childName || "Baby";
  const msgs: NightMessage[] = [];

  msgs.push({ headline: t("nightCard.notAlone"), body: t("nightCard.notAloneBody") });

  if (ageWeeks < 6) {
    msgs.push({ headline: t("nightCard.babyOk", { name }), body: t("nightCard.babyOkBody"), source: t("nightCard.babyOkSource") });
    msgs.push({ headline: t("nightCard.nightNursingImportant"), body: t("nightCard.nightNursingBody"), source: t("nightCard.nightNursingSource") });
  } else if (ageWeeks < 12) {
    msgs.push({ headline: t("nightCard.peak"), body: t("nightCard.peakBody") });
  } else if (ageWeeks < 20) {
    msgs.push({ headline: t("nightCard.maturing", { name }), body: t("nightCard.maturingBody", { name }), source: t("nightCard.maturingSource") });
  } else {
    msgs.push({ headline: t("nightCard.stillNormal"), body: t("nightCard.stillNormalBody") });
  }

  if (lastLogType === "nursing") {
    msgs.push({ headline: t("nightCard.givingBest"), body: t("nightCard.givingBestBody", { name }) });
  }

  msgs.push({ headline: t("nightCard.brainWorks"), body: t("nightCard.brainWorksBody") });

  return msgs;
}

function getWeeklyRotatingIndex(ageWeeks: number): number {
  const hour = new Date().getHours();
  return (ageWeeks + hour) % 4;
}

export function NattenKort() {
  const [show, setShow] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const { nursingLogs, diaperLogs } = useDiary();
  const { profile, babyAgeWeeks } = useFamily();
  const { t } = useTranslation();
  const childName = profile.children?.[0]?.name || "Baby";

  useEffect(() => {
    const check = () => {
      const h = new Date().getHours();
      setShow(h >= 0 && h < 5);
    };
    check();
    const interval = setInterval(check, 60000);
    return () => clearInterval(interval);
  }, []);

  // Reset dismissal each night
  useEffect(() => {
    const lastDismiss = localStorage.getItem("melo-night-dismissed");
    if (lastDismiss !== new Date().toDateString()) {
      setDismissed(false);
    }
  }, []);

  if (!show || dismissed || profile.phase === "pregnant") return null;

  const lastLog = [...nursingLogs, ...diaperLogs].sort((a, b) =>
    new Date((b as any).timestamp).getTime() - new Date((a as any).timestamp).getTime()
  )[0];
  const lastLogType = lastLog ? ("side" in lastLog ? "nursing" : "diaper") : null;

  const messages = getNightMessages(babyAgeWeeks, childName, lastLogType, t);
  const msgIndex = getWeeklyRotatingIndex(babyAgeWeeks) % messages.length;
  const msg = messages[msgIndex];

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem("melo-night-dismissed", new Date().toDateString());
  };

  return (
    <div
      className="rounded-2xl px-5 py-5 section-fade-in space-y-2 relative"
      style={{
        background: "linear-gradient(145deg, hsl(220 40% 12%), hsl(240 35% 18%))",
        border: "1px solid hsl(240 30% 25%)",
      }}
    >
      <button
        onClick={handleDismiss}
        className="absolute top-3 right-3 w-6 h-6 rounded-full flex items-center justify-center text-white/40 hover:text-white/70 transition-colors text-[0.9rem]"
      >
        ×
      </button>

      <div className="flex items-center gap-2">
        <span className="text-lg">🌙</span>
        <p className="text-[0.55rem] tracking-[0.18em] uppercase text-white/50">
          {new Date().getHours()}:{String(new Date().getMinutes()).padStart(2, "0")} · {t("nightCard.label")}
        </p>
      </div>

      <p className="text-[1rem] font-medium text-white leading-snug">{msg.headline}</p>
      <p className="text-[0.8rem] text-white/70 leading-relaxed">{msg.body}</p>

      {msg.source && (
        <p className="text-[0.6rem] text-white/30 italic">{msg.source}</p>
      )}
    </div>
  );
}
