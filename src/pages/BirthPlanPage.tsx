import { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, Share2, Check, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  useBirthPlan,
  PAIN_RELIEF_OPTIONS,
  BIRTH_POSITIONS,
  CORD_OPTIONS,
  SKIN_OPTIONS,
  FEEDING_OPTIONS,
  PARTNER_ROLES,
} from "@/hooks/useBirthPlan";
import { useFamily } from "@/context/FamilyContext";

// ── Section wrapper ────────────────────────────────────────────────────────────
function Section({
  icon, title, subtitle, children, defaultOpen = true,
}: {
  icon: string; title: string; subtitle?: string; children: React.ReactNode; defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: "hsl(var(--warm-white))", border: "1px solid hsl(var(--stone-light))" }}>
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-3 px-4 py-4 text-left transition-all active:bg-[hsl(var(--stone-lighter))]"
      >
        <span className="text-xl flex-shrink-0">{icon}</span>
        <div className="flex-1 min-w-0">
          <p className="text-[0.88rem] font-semibold">{title}</p>
          {subtitle && <p className="text-[0.65rem] text-muted-foreground">{subtitle}</p>}
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-muted-foreground flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />}
      </button>
      {open && (
        <div className="px-4 pb-4 space-y-3 border-t" style={{ borderColor: "hsl(var(--stone-lighter))" }}>
          <div className="pt-3">{children}</div>
        </div>
      )}
    </div>
  );
}

// ── Pill multi-select ──────────────────────────────────────────────────────────
function PillSelect({
  options, selected, onToggle,
}: {
  options: { key: string; label: string; icon?: string }[];
  selected: string[];
  onToggle: (key: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map(opt => {
        const active = selected.includes(opt.key);
        return (
          <button
            key={opt.key}
            onClick={() => onToggle(opt.key)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-full text-[0.75rem] font-medium transition-all active:scale-95"
            style={{
              background: active ? "hsl(var(--moss))" : "hsl(var(--stone-lighter))",
              color: active ? "white" : "hsl(var(--foreground))",
              border: active ? "none" : "1.5px solid hsl(var(--stone-light))",
            }}
          >
            {opt.icon && <span>{opt.icon}</span>}
            {opt.label}
            {active && <Check className="w-3 h-3" />}
          </button>
        );
      })}
    </div>
  );
}

// ── Radio select ───────────────────────────────────────────────────────────────
function RadioSelect({
  options, value, onChange,
}: {
  options: { key: string; label: string; icon?: string }[];
  value: string;
  onChange: (key: string) => void;
}) {
  return (
    <div className="space-y-2">
      {options.map(opt => {
        const active = value === opt.key;
        return (
          <button
            key={opt.key}
            onClick={() => onChange(opt.key)}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all active:scale-[0.98]"
            style={{
              background: active ? "hsl(var(--sage-light))" : "hsl(var(--stone-lighter))",
              border: active ? "1.5px solid hsl(var(--sage))" : "1.5px solid transparent",
            }}
          >
            {opt.icon && <span className="text-base">{opt.icon}</span>}
            <span className="flex-1 text-[0.82rem] font-medium">{opt.label}</span>
            {active && (
              <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: "hsl(var(--moss))" }}>
                <Check className="w-3 h-3 text-white" />
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}

// ── Toggle switch ──────────────────────────────────────────────────────────────
function Toggle({ label, value, onChange, sub }: { label: string; value: boolean; onChange: (v: boolean) => void; sub?: string }) {
  return (
    <button
      onClick={() => onChange(!value)}
      className="w-full flex items-center justify-between py-2.5"
    >
      <div>
        <p className="text-[0.82rem] font-medium text-left">{label}</p>
        {sub && <p className="text-[0.65rem] text-muted-foreground text-left">{sub}</p>}
      </div>
      <div
        className="w-11 h-6 rounded-full flex-shrink-0 transition-all relative"
        style={{ background: value ? "hsl(var(--moss))" : "hsl(var(--stone-light))" }}
      >
        <div
          className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all"
          style={{ left: value ? "calc(100% - 1.375rem)" : "0.125rem" }}
        />
      </div>
    </button>
  );
}

// ── Build shareable text summary ──────────────────────────────────────────────
function buildSummary(plan: ReturnType<typeof useBirthPlan>["plan"], morName: string, farName: string): string {
  const lines: string[] = [
    `🌿 FØDSELSPLAN — ${morName}${farName ? ` & ${farName}` : ""}`,
    "",
  ];
  if (plan.painRelief.length > 0) {
    lines.push(`💉 Smertelindring: ${plan.painRelief.join(", ")}`);
    if (plan.painReliefNote) lines.push(`   Note: ${plan.painReliefNote}`);
  }
  if (plan.partnerPresent) lines.push("👥 Partner er til stede under hele fødslen");
  if (plan.doula) lines.push("👥 Doula er med");
  if (plan.otherPresent) lines.push(`👥 Også til stede: ${plan.otherPresent}`);
  if (plan.birthPositions.length > 0) lines.push(`🧍 Foretrukne fødselspositioner: ${plan.birthPositions.join(", ")}`);
  if (plan.wantsMusic) lines.push("🎵 Vi ønsker musik under fødslen");
  if (plan.wantsDimLight) lines.push("🕯️ Vi ønsker dæmpet lys");
  if (plan.wantsMinimalStaff) lines.push("🤫 Vi ønsker færrest mulige ind og ud");
  if (plan.birthNote) lines.push(`📝 Note: ${plan.birthNote}`);
  if (plan.cordCutting) lines.push(`✂️ Navlesnor: ${CORD_OPTIONS.find(o => o.key === plan.cordCutting)?.label}`);
  if (plan.delayedCord) lines.push("⏳ Forsinket navlesnorsskæring ønskes");
  if (plan.skinToSkin) lines.push(`🫂 Hud-mod-hud: ${SKIN_OPTIONS.find(o => o.key === plan.skinToSkin)?.label}`);
  if (plan.feeding) lines.push(`🍼 Fodring: ${FEEDING_OPTIONS.find(o => o.key === plan.feeding)?.label}`);
  if (plan.partnerRoles.length > 0) lines.push(`💪 Partnerens rolle: ${plan.partnerRoles.join(", ")}`);
  if (plan.partnerNote) lines.push(`   Note: ${plan.partnerNote}`);
  if (plan.otherWishes) lines.push(`\n📋 Andre ønsker:\n${plan.otherWishes}`);
  lines.push("\nLavet med Melo 💚");
  return lines.join("\n");
}

// ── Progress bar ──────────────────────────────────────────────────────────────
function ProgressBar({ pct }: { pct: number }) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-[0.65rem] text-muted-foreground">
        <span>Udfyldt</span>
        <span className="font-medium" style={{ color: "hsl(var(--moss))" }}>{pct}%</span>
      </div>
      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "hsl(var(--stone-lighter))" }}>
        <div className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, background: "hsl(var(--moss))" }} />
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function BirthPlanPage() {
  const { plan, update, toggleArray, completeness } = useBirthPlan();
  const { profile, morName, farName } = useFamily();

  const handleShare = async () => {
    const text = buildSummary(plan, morName || "Mor", farName || "Far");
    if (navigator.share) {
      try { await navigator.share({ title: "Vores fødselsplan", text }); } catch {}
    } else {
      await navigator.clipboard.writeText(text);
    }
  };

  return (
    <div className="space-y-5 pb-8">

      {/* Header */}
      <div className="flex items-center justify-between section-fade-in">
        <Link to="/barn" className="w-9 h-9 flex items-center justify-center rounded-full transition-colors active:bg-[hsl(var(--stone-lighter))]">
          <ChevronLeft className="w-5 h-5 text-muted-foreground" />
        </Link>
        <div className="text-center">
          <p className="text-[1rem] font-semibold">Vores fødselsplan</p>
          <p className="text-[0.65rem] text-muted-foreground">Gemmes automatisk</p>
        </div>
        <button
          onClick={handleShare}
          className="w-9 h-9 flex items-center justify-center rounded-full transition-colors active:bg-[hsl(var(--stone-lighter))]"
        >
          <Share2 className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
        </button>
      </div>

      {/* Intro + progress */}
      <div className="rounded-2xl px-5 py-4 space-y-3 section-fade-in"
        style={{ background: "hsl(var(--sage-light))", border: "1px solid hsl(var(--sage) / 0.25)" }}>
        <div className="flex items-start gap-3">
          <span className="text-2xl">🌿</span>
          <div>
            <p className="text-[0.85rem] font-semibold" style={{ color: "hsl(var(--moss))" }}>Jeres ønsker til fødslen</p>
            <p className="text-[0.72rem] text-muted-foreground leading-relaxed mt-0.5">
              En fødselsplan hjælper jer og personalet forstå jeres ønsker. Den er vejledende — ikke bindende.
            </p>
          </div>
        </div>
        <ProgressBar pct={completeness} />
      </div>

      {/* ── 1. Smertelindring ─────────────────────────────────────────────── */}
      <Section icon="💉" title="Smertelindring" subtitle="Hvad er dine præferencer?">
        <div className="space-y-3">
          <PillSelect
            options={PAIN_RELIEF_OPTIONS}
            selected={plan.painRelief}
            onToggle={key => toggleArray("painRelief", key)}
          />
          <textarea
            value={plan.painReliefNote}
            onChange={e => update("painReliefNote", e.target.value)}
            placeholder="Evt. yderligere ønsker eller noter..."
            rows={2}
            className="w-full rounded-xl border px-3 py-2.5 text-[0.78rem] focus:outline-none resize-none"
            style={{ borderColor: "hsl(var(--stone-light))", background: "hsl(var(--stone-lighter))", fontSize: "16px" }}
          />
        </div>
      </Section>

      {/* ── 2. Hvem er til stede ─────────────────────────────────────────── */}
      <Section icon="👥" title="Hvem er til stede" subtitle="Under fødslen">
        <div className="space-y-0.5 divide-y" style={{ borderColor: "hsl(var(--stone-lighter))" }}>
          <Toggle
            label="Min partner"
            sub="Er med under hele fødslen"
            value={plan.partnerPresent}
            onChange={v => update("partnerPresent", v)}
          />
          <Toggle
            label="Doula"
            sub="Vi har eller ønsker en doula"
            value={plan.doula}
            onChange={v => update("doula", v)}
          />
        </div>
        <input
          value={plan.otherPresent}
          onChange={e => update("otherPresent", e.target.value)}
          placeholder="Andre (fx søskende, mor, veninde...)"
          className="w-full rounded-xl border px-3 py-2.5 text-[0.78rem] focus:outline-none mt-3"
          style={{ borderColor: "hsl(var(--stone-light))", background: "hsl(var(--stone-lighter))", fontSize: "16px" }}
        />
      </Section>

      {/* ── 3. Under fødslen ─────────────────────────────────────────────── */}
      <Section icon="🧍" title="Under fødslen" subtitle="Positioner og omgivelser">
        <div className="space-y-4">
          <div>
            <p className="text-[0.72rem] font-medium text-muted-foreground uppercase tracking-wide mb-2">Foretrukne positioner</p>
            <PillSelect
              options={BIRTH_POSITIONS}
              selected={plan.birthPositions}
              onToggle={key => toggleArray("birthPositions", key)}
            />
          </div>
          <div className="divide-y space-y-0.5" style={{ borderColor: "hsl(var(--stone-lighter))" }}>
            <Toggle label="Musik" sub="Vi ønsker musik i rummet" value={plan.wantsMusic} onChange={v => update("wantsMusic", v)} />
            <Toggle label="Dæmpet lys" sub="Vi ønsker dæmpet belysning" value={plan.wantsDimLight} onChange={v => update("wantsDimLight", v)} />
            <Toggle label="Ro og privatliv" sub="Færrest mulige ind og ud af rummet" value={plan.wantsMinimalStaff} onChange={v => update("wantsMinimalStaff", v)} />
          </div>
          <textarea
            value={plan.birthNote}
            onChange={e => update("birthNote", e.target.value)}
            placeholder="Andre ønsker til omgivelserne..."
            rows={2}
            className="w-full rounded-xl border px-3 py-2.5 text-[0.78rem] focus:outline-none resize-none"
            style={{ borderColor: "hsl(var(--stone-light))", background: "hsl(var(--stone-lighter))", fontSize: "16px" }}
          />
        </div>
      </Section>

      {/* ── 4. Navlesnor ─────────────────────────────────────────────────── */}
      <Section icon="✂️" title="Navlesnor" subtitle="Klipning og timing" defaultOpen={false}>
        <div className="space-y-3">
          <RadioSelect
            options={CORD_OPTIONS}
            value={plan.cordCutting}
            onChange={v => update("cordCutting", v)}
          />
          <Toggle
            label="Forsinket navlesnorsskæring"
            sub="Vi ønsker at vente mindst 1-3 min inden klipning"
            value={plan.delayedCord}
            onChange={v => update("delayedCord", v)}
          />
        </div>
      </Section>

      {/* ── 5. Hud-mod-hud ───────────────────────────────────────────────── */}
      <Section icon="🫂" title="Hud-mod-hud og første tid" subtitle="Første kontakt med baby" defaultOpen={false}>
        <RadioSelect
          options={SKIN_OPTIONS}
          value={plan.skinToSkin}
          onChange={v => update("skinToSkin", v)}
        />
      </Section>

      {/* ── 6. Amning ────────────────────────────────────────────────────── */}
      <Section icon="🍼" title="Fodring" subtitle="Hvad er jeres plan?" defaultOpen={false}>
        <RadioSelect
          options={FEEDING_OPTIONS}
          value={plan.feeding}
          onChange={v => update("feeding", v)}
        />
      </Section>

      {/* ── 7. Partnerens rolle ───────────────────────────────────────────── */}
      <Section icon="💪" title={`${farName || "Partnerens"} rolle`} subtitle="Hvad skal din partner gøre?" defaultOpen={false}>
        <div className="space-y-3">
          <div className="flex flex-col gap-2">
            {PARTNER_ROLES.map(r => {
              const active = plan.partnerRoles.includes(r.key);
              return (
                <button
                  key={r.key}
                  onClick={() => toggleArray("partnerRoles", r.key)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all active:scale-[0.98]"
                  style={{
                    background: active ? "hsl(var(--sage-light))" : "hsl(var(--stone-lighter))",
                    border: active ? "1.5px solid hsl(var(--sage))" : "1.5px solid transparent",
                  }}
                >
                  <span className="flex-1 text-[0.82rem] font-medium">{r.label}</span>
                  {active && (
                    <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ background: "hsl(var(--moss))" }}>
                      <Check className="w-3 h-3 text-white" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
          <textarea
            value={plan.partnerNote}
            onChange={e => update("partnerNote", e.target.value)}
            placeholder={`Evt. specifikke ønsker til ${farName || "din partner"}...`}
            rows={2}
            className="w-full rounded-xl border px-3 py-2.5 text-[0.78rem] focus:outline-none resize-none"
            style={{ borderColor: "hsl(var(--stone-light))", background: "hsl(var(--stone-lighter))", fontSize: "16px" }}
          />
        </div>
      </Section>

      {/* ── 8. Andre ønsker ──────────────────────────────────────────────── */}
      <Section icon="📝" title="Andre ønsker" subtitle="Frit felt til alt andet" defaultOpen={false}>
        <textarea
          value={plan.otherWishes}
          onChange={e => update("otherWishes", e.target.value)}
          placeholder="Fx ønsker til kejsersnit, religiøse eller kulturelle ønsker, allergier, tidligere erfaringer..."
          rows={4}
          className="w-full rounded-xl border px-3 py-2.5 text-[0.78rem] focus:outline-none resize-none"
          style={{ borderColor: "hsl(var(--stone-light))", background: "hsl(var(--stone-lighter))", fontSize: "16px" }}
        />
      </Section>

      {/* Share button */}
      <button
        onClick={handleShare}
        className="w-full py-4 rounded-2xl text-[0.88rem] font-semibold text-white flex items-center justify-center gap-2 transition-all active:scale-[0.98] section-fade-in"
        style={{ background: "hsl(var(--moss))" }}
      >
        <Share2 className="w-4 h-4" />
        Del fødselsplanen
      </button>

      {/* Disclaimer */}
      <p className="text-[0.62rem] text-muted-foreground text-center leading-relaxed px-4 pb-2">
        En fødselsplan er jeres ønsker — ikke en garanti. Snak den igennem med jeres jordemoder og vær åbne for at tingene kan forløbe anderledes end planlagt.
      </p>
    </div>
  );
}
