import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ChevronLeft, Trash2, Users, AlertTriangle, PhoneCall, Share2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useContractionTimer, fmtMs, fmtTime } from "@/hooks/useContractionTimer";
import { useFamily } from "@/context/FamilyContext";

// ── Pulsing ring animation ─────────────────────────────────────────────────────
function PulseRing({ active }: { active: boolean }) {
  return (
    <div className="absolute inset-0 rounded-full" style={{ pointerEvents: "none" }}>
      {active && (
        <>
          <div className="absolute inset-0 rounded-full animate-ping opacity-20"
            style={{ background: "hsl(var(--moss))" }} />
          <div className="absolute inset-[-12px] rounded-full animate-ping opacity-10"
            style={{ background: "hsl(var(--moss))", animationDelay: "0.3s" }} />
        </>
      )}
    </div>
  );
}

// ── Stats row ─────────────────────────────────────────────────────────────────
function StatsRow({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="flex-1 text-center space-y-0.5">
      <p className="text-[0.62rem] tracking-[0.1em] uppercase text-muted-foreground">{label}</p>
      <p className="text-[1.1rem] font-semibold tabular-nums" style={{ color: "hsl(var(--moss))" }}>{value}</p>
      {sub && <p className="text-[0.6rem] text-muted-foreground">{sub}</p>}
    </div>
  );
}

// ── Alert banner ──────────────────────────────────────────────────────────────
function AlertBanner({ level }: { level: "none" | "warn" | "urgent" }) {
  if (level === "none") return null;
  const isUrgent = level === "urgent";
  return (
    <div
      className="rounded-2xl px-4 py-3.5 flex items-start gap-3 animate-in fade-in"
      style={{
        background: isUrgent ? "hsl(var(--clay-light))" : "hsl(var(--sand-light))",
        border: `1.5px solid ${isUrgent ? "hsl(var(--clay))" : "hsl(var(--bark) / 0.3)"}`,
      }}
    >
      {isUrgent
        ? <PhoneCall className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: "hsl(var(--clay))" }} />
        : <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: "hsl(var(--bark))" }} />
      }
      <div>
        <p className="text-[0.82rem] font-semibold">
          {isUrgent ? "Tag til fødegangen nu" : "Kontakt din jordemoder"}
        </p>
        <p className="text-[0.72rem] text-muted-foreground leading-snug mt-0.5">
          {isUrgent
            ? "Dine veer er under 2 minutter fra hinanden. Ring 112 eller tag direkte til fødegangen."
            : "Dine veer er under 5 minutter fra hinanden. Ring til din jordemoder eller fødegangen."}
        </p>
        {isUrgent && (
          <a href="tel:112" className="inline-flex items-center gap-1 mt-2 text-[0.75rem] font-semibold px-3 py-1.5 rounded-full text-white"
            style={{ background: "hsl(var(--clay))" }}>
            <PhoneCall className="w-3.5 h-3.5" /> Ring 112
          </a>
        )}
      </div>
    </div>
  );
}

// ── Contraction row ───────────────────────────────────────────────────────────
function ContractionRow({ c, index }: { c: ReturnType<typeof useContractionTimer>["contractions"][0]; index: number }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 border-b last:border-0" style={{ borderColor: "hsl(var(--stone-lighter))" }}>
      <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-[0.6rem] font-semibold"
        style={{ background: "hsl(var(--stone-lighter))", color: "hsl(var(--muted-foreground))" }}>
        {index + 1}
      </div>
      <div className="flex-1">
        <p className="text-[0.78rem] font-medium">{fmtTime(c.startedAt)}</p>
        <p className="text-[0.62rem] text-muted-foreground">
          Varighed: {fmtMs(c.durationMs)}
          {c.intervalMs !== null && ` · Interval: ${fmtMs(c.intervalMs)}`}
        </p>
      </div>
      <div className="text-right">
        <p className="text-[0.82rem] font-semibold tabular-nums" style={{ color: "hsl(var(--moss))" }}>
          {fmtMs(c.durationMs)}
        </p>
        {c.intervalMs !== null && (
          <p className="text-[0.62rem] text-muted-foreground">{fmtMs(c.intervalMs)} siden</p>
        )}
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function ContractionTimerPage() {
  const { profile } = useFamily();
  const [searchParams] = useSearchParams();
  const isPartnerView = searchParams.get("partner") === "1";
  const familyId = profile.familyId || profile.parentName || "default";

  const {
    contractions,
    activeStart,
    elapsed,
    timerState,
    alertLevel,
    partnerActive,
    startContraction,
    stopContraction,
    clearSession,
  } = useContractionTimer(familyId, isPartnerView);

  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // ── Share link ──────────────────────────────────────────────────────────
  const handleShare = async () => {
    const url = `${window.location.origin}/veer?partner=1`;
    if (navigator.share) {
      try { await navigator.share({ title: "Veer-timer — Melo", text: "Følg veer live", url }); } catch {}
    } else {
      await navigator.clipboard.writeText(url);
    }
  };

  // ── Derived stats ───────────────────────────────────────────────────────
  const completed = contractions.filter(c => c.endedAt);
  const lastDuration = completed[0]?.durationMs ?? null;
  const lastInterval = completed[0]?.intervalMs ?? null;
  const avgInterval = completed.length >= 2
    ? completed.slice(0, 5).reduce((s, c) => s + (c.intervalMs ?? 0), 0) / Math.min(completed.length, 5)
    : null;

  return (
    <div className="space-y-5 pb-8">

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between section-fade-in">
        <Link to="/" className="w-9 h-9 flex items-center justify-center rounded-full transition-colors active:bg-[hsl(var(--stone-lighter))]">
          <ChevronLeft className="w-5 h-5 text-muted-foreground" />
        </Link>
        <div className="text-center">
          <p className="text-[1rem] font-semibold">Veer-timer</p>
          <p className="text-[0.65rem] text-muted-foreground">
            {isPartnerView ? "Partneroverblik — live" : "Tryk start når veen begynder"}
          </p>
        </div>
        <div className="flex gap-1">
          <button onClick={handleShare}
            className="w-9 h-9 flex items-center justify-center rounded-full transition-colors active:bg-[hsl(var(--stone-lighter))]">
            <Share2 className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
          </button>
        </div>
      </div>

      {/* ── Partner indicator ───────────────────────────────────────────── */}
      {isPartnerView && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-2xl section-fade-in"
          style={{ background: "hsl(var(--sage-light))", border: "1px solid hsl(var(--sage) / 0.3)" }}>
          <Users className="w-4 h-4" style={{ color: "hsl(var(--moss))" }} />
          <div>
            <p className="text-[0.78rem] font-semibold" style={{ color: "hsl(var(--moss))" }}>
              Du følger live
            </p>
            <p className="text-[0.65rem] text-muted-foreground">
              {partnerActive ? "Din partner tracker en vee lige nu" : "Venter på næste vee..."}
            </p>
          </div>
          <div className={cn("ml-auto w-2.5 h-2.5 rounded-full", partnerActive ? "animate-pulse" : "")}
            style={{ background: partnerActive ? "hsl(var(--moss))" : "hsl(var(--stone-light))" }} />
        </div>
      )}

      {/* ── Alert ──────────────────────────────────────────────────────── */}
      <AlertBanner level={alertLevel} />

      {/* ── Big button ─────────────────────────────────────────────────── */}
      <div className="flex flex-col items-center gap-6 py-4 section-fade-in" style={{ animationDelay: "40ms" }}>
        {/* Elapsed time */}
        <div className="text-center h-12 flex items-center justify-center">
          {activeStart ? (
            <div className="space-y-0.5">
              <p className="text-[2.8rem] font-semibold tabular-nums leading-none" style={{ color: "hsl(var(--moss))" }}>
                {fmtMs(elapsed)}
              </p>
              <p className="text-[0.65rem] text-muted-foreground tracking-wide uppercase">Vee pågår</p>
            </div>
          ) : (
            <div className="space-y-0.5 text-center">
              <p className="text-[1.4rem] font-medium text-muted-foreground">
                {timerState === "idle" ? "Klar til start" : "Vee stoppet"}
              </p>
              {timerState === "stopped" && lastDuration && (
                <p className="text-[0.72rem] text-muted-foreground">Seneste varighed: {fmtMs(lastDuration)}</p>
              )}
            </div>
          )}
        </div>

        {/* Main button */}
        <div className="relative">
          <PulseRing active={!!activeStart} />
          <button
            onClick={activeStart ? stopContraction : startContraction}
            disabled={isPartnerView}
            className={cn(
              "relative w-44 h-44 rounded-full flex flex-col items-center justify-center gap-2 transition-all duration-200 shadow-lg",
              !isPartnerView && "active:scale-95",
              isPartnerView && "opacity-80 cursor-default"
            )}
            style={{
              background: activeStart
                ? "hsl(var(--clay))"
                : "hsl(var(--moss))",
              color: "white",
            }}
          >
            <span className="text-[3rem] leading-none">
              {activeStart ? "⏹" : "▶"}
            </span>
            <span className="text-[0.82rem] font-semibold tracking-wide">
              {activeStart ? "Stop vee" : "Start vee"}
            </span>
          </button>
        </div>

        {/* Stats row */}
        <div className="w-full flex items-stretch gap-px rounded-2xl overflow-hidden"
          style={{ background: "hsl(var(--warm-white))", border: "1px solid hsl(var(--stone-light))" }}>
          <div className="flex-1 py-4">
            <StatsRow label="Antal" value={completed.length.toString()} />
          </div>
          <div className="w-px" style={{ background: "hsl(var(--stone-lighter))" }} />
          <div className="flex-1 py-4">
            <StatsRow label="Seneste" value={fmtMs(lastDuration)} />
          </div>
          <div className="w-px" style={{ background: "hsl(var(--stone-lighter))" }} />
          <div className="flex-1 py-4">
            <StatsRow
              label="Interval"
              value={fmtMs(avgInterval !== null ? Math.round(avgInterval) : lastInterval)}
              sub={completed.length >= 2 ? "gns." : undefined}
            />
          </div>
        </div>
      </div>

      {/* ── Guide card ─────────────────────────────────────────────────── */}
      {timerState === "idle" && (
        <div className="rounded-2xl px-5 py-4 space-y-2 section-fade-in"
          style={{ background: "hsl(var(--sage-light))", border: "1px solid hsl(var(--sage) / 0.25)" }}>
          <p className="text-[0.82rem] font-semibold" style={{ color: "hsl(var(--moss))" }}>Sådan bruger du veer-timeren</p>
          <div className="space-y-1.5">
            {[
              "Tryk Start vee når du mærker veen begynde",
              "Tryk Stop vee når veen er ovre",
              "Gentag — timeren beregner varighed og interval",
              "Del linket med din partner så de kan følge live",
            ].map((tip, i) => (
              <div key={i} className="flex items-start gap-2 text-[0.75rem] text-muted-foreground">
                <span className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 text-[0.55rem] font-semibold mt-0.5"
                  style={{ background: "hsl(var(--sage) / 0.3)", color: "hsl(var(--moss))" }}>
                  {i + 1}
                </span>
                {tip}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Contraction list ────────────────────────────────────────────── */}
      {completed.length > 0 && (
        <div className="section-fade-in" style={{ animationDelay: "60ms" }}>
          <div className="flex items-center justify-between mb-2">
            <p className="text-[0.82rem] font-semibold">Veer i denne session</p>
            {!isPartnerView && (
              <button
                onClick={() => setShowClearConfirm(true)}
                className="flex items-center gap-1 text-[0.68rem] text-muted-foreground active:opacity-60"
              >
                <Trash2 className="w-3 h-3" /> Ryd
              </button>
            )}
          </div>
          <div className="rounded-2xl overflow-hidden"
            style={{ background: "hsl(var(--warm-white))", border: "1px solid hsl(var(--stone-light))" }}>
            {completed.map((c, i) => (
              <ContractionRow key={c.id} c={c} index={i} />
            ))}
          </div>

          {/* Pattern summary */}
          {completed.length >= 3 && avgInterval !== null && (
            <p className="text-[0.68rem] text-muted-foreground text-center mt-2">
              Gennemsnittelig interval: <strong>{fmtMs(Math.round(avgInterval))}</strong> · {completed.length} veer registreret
            </p>
          )}
        </div>
      )}

      {/* ── Share card ──────────────────────────────────────────────────── */}
      {!isPartnerView && (
        <button
          onClick={handleShare}
          className="w-full flex items-center gap-3 rounded-2xl px-5 py-4 text-left transition-all active:scale-[0.98] section-fade-in"
          style={{
            background: "hsl(var(--warm-white))",
            border: "1px solid hsl(var(--stone-light))",
            animationDelay: "80ms",
          }}
        >
          <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ background: "hsl(var(--stone-lighter))" }}>
            <Users className="w-5 h-5 text-muted-foreground" />
          </div>
          <div className="flex-1">
            <p className="text-[0.85rem] font-semibold">Del med din partner</p>
            <p className="text-[0.68rem] text-muted-foreground">De kan følge veer live på deres telefon</p>
          </div>
          <Share2 className="w-4 h-4 text-muted-foreground/50" />
        </button>
      )}

      {/* ── Source disclaimer ────────────────────────────────────────────── */}
      <p className="text-[0.62rem] text-muted-foreground text-center leading-relaxed px-4">
        Ring 1813 (lægevagten) eller tag direkte til fødegangen ved tvivl. Kontakt jordemoder ved regelmæssige veer under 5 minutters interval.
      </p>

      {/* ── Clear confirm modal ──────────────────────────────────────────── */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 flex items-end" style={{ background: "rgba(0,0,0,0.4)" }}
          onClick={() => setShowClearConfirm(false)}>
          <div className="w-full rounded-t-3xl p-6 space-y-4"
            style={{ background: "hsl(var(--warm-white))" }}
            onClick={e => e.stopPropagation()}>
            <p className="text-[0.95rem] font-semibold">Ryd alle veer?</p>
            <p className="text-[0.78rem] text-muted-foreground">Dette kan ikke fortrydes.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowClearConfirm(false)}
                className="flex-1 py-3.5 rounded-2xl text-[0.85rem] font-medium transition-all active:scale-95"
                style={{ background: "hsl(var(--stone-lighter))" }}>
                Annuller
              </button>
              <button
                onClick={() => { clearSession(); setShowClearConfirm(false); }}
                className="flex-1 py-3.5 rounded-2xl text-[0.85rem] font-medium text-white transition-all active:scale-95"
                style={{ background: "hsl(var(--clay))" }}>
                Ryd session
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
