import { useState, useCallback } from "react";

export interface BirthPlan {
  // Smertelindring
  painRelief: string[];
  painReliefNote: string;
  // Hvem er til stede
  partnerPresent: boolean;
  doula: boolean;
  otherPresent: string;
  // Under fødslen
  birthPositions: string[];
  wantsMusic: boolean;
  wantsDimLight: boolean;
  wantsMinimalStaff: boolean;
  birthNote: string;
  // Navlesnor
  cordCutting: string;
  delayedCord: boolean;
  // Hud-mod-hud
  skinToSkin: string;
  // Amning
  feeding: string;
  // Partner rolle
  partnerRoles: string[];
  partnerNote: string;
  // Andet
  otherWishes: string;
  updatedAt: string;
}

const STORAGE_KEY = "melo-birth-plan";

const DEFAULT_PLAN: BirthPlan = {
  painRelief: [],
  painReliefNote: "",
  partnerPresent: true,
  doula: false,
  otherPresent: "",
  birthPositions: [],
  wantsMusic: false,
  wantsDimLight: false,
  wantsMinimalStaff: false,
  birthNote: "",
  cordCutting: "",
  delayedCord: false,
  skinToSkin: "",
  feeding: "",
  partnerRoles: [],
  partnerNote: "",
  otherWishes: "",
  updatedAt: "",
};

function load(): BirthPlan {
  try { return { ...DEFAULT_PLAN, ...JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}") }; }
  catch { return DEFAULT_PLAN; }
}

export function useBirthPlan() {
  const [plan, setPlan] = useState<BirthPlan>(load);

  const update = useCallback(<K extends keyof BirthPlan>(key: K, value: BirthPlan[K]) => {
    setPlan(prev => {
      const next = { ...prev, [key]: value, updatedAt: new Date().toISOString() };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const toggleArray = useCallback((key: "painRelief" | "birthPositions" | "partnerRoles", value: string) => {
    setPlan(prev => {
      const arr = prev[key] as string[];
      const next = arr.includes(value) ? arr.filter(v => v !== value) : [...arr, value];
      const updated = { ...prev, [key]: next, updatedAt: new Date().toISOString() };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  // How complete is the plan (0–100)
  const completeness = (() => {
    const checks = [
      plan.painRelief.length > 0,
      plan.birthPositions.length > 0,
      !!plan.cordCutting,
      !!plan.skinToSkin,
      !!plan.feeding,
      plan.partnerRoles.length > 0,
    ];
    return Math.round((checks.filter(Boolean).length / checks.length) * 100);
  })();

  return { plan, update, toggleArray, completeness };
}

// ── Option configs ─────────────────────────────────────────────────────────────
export const PAIN_RELIEF_OPTIONS = [
  { key: "epidural",     label: "Epidural",          icon: "💉" },
  { key: "lattergas",    label: "Lattergas",          icon: "😅" },
  { key: "varmtbad",     label: "Varmt bad/brusebad", icon: "🛁" },
  { key: "akupunktur",   label: "Akupunktur",         icon: "🪡" },
  { key: "transcutaneous", label: "TENS",             icon: "⚡" },
  { key: "morfin",       label: "Morfin/pethidin",    icon: "💊" },
  { key: "ingen",        label: "Så lidt som muligt", icon: "🌿" },
  { key: "aaben",        label: "Åben for alt",       icon: "✨" },
];

export const BIRTH_POSITIONS = [
  { key: "staaende",  label: "Stående",    icon: "🧍" },
  { key: "siddende",  label: "Siddende",   icon: "🪑" },
  { key: "liggende",  label: "Liggende",   icon: "🛌" },
  { key: "firfoeds",  label: "Firefødder", icon: "🐾" },
  { key: "vand",      label: "Vand",       icon: "💧" },
  { key: "aaben",     label: "Åben",       icon: "✨" },
];

export const CORD_OPTIONS = [
  { key: "partner",    label: "Min partner klipper" },
  { key: "jordemoder", label: "Jordemoderen klipper" },
  { key: "ingen",      label: "Ingen præference" },
];

export const SKIN_OPTIONS = [
  { key: "straks",          label: "Straks efter fødslen" },
  { key: "partner-foerst",  label: "Partner får hud-mod-hud først" },
  { key: "efter-vask",      label: "Vask baby først" },
  { key: "ingen",           label: "Ingen præference" },
];

export const FEEDING_OPTIONS = [
  { key: "amme",     label: "Amme",              icon: "🤱" },
  { key: "flaske",   label: "Flaske",            icon: "🍼" },
  { key: "begge",    label: "Begge dele",        icon: "💛" },
  { key: "uafklaret",label: "Ikke besluttet endnu", icon: "🌀" },
];

export const PARTNER_ROLES = [
  { key: "stotte",       label: "Støtte og opmuntre" },
  { key: "massere",      label: "Massere ryggen" },
  { key: "musik",        label: "Sætte musik på" },
  { key: "foto",         label: "Tage billeder/video" },
  { key: "kommunikere",  label: "Kommunikere med personalet" },
  { key: "klip",         label: "Klippe navlesnoren" },
  { key: "hud",          label: "Give hud-mod-hud" },
  { key: "stille",       label: "Bare være der" },
];
