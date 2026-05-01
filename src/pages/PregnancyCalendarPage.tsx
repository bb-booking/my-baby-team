import { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, Plus, Calendar, Download, X, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useFamily } from "@/context/FamilyContext";
import { pregnancyAppointments, type PregnancyAppointment } from "@/lib/phaseData";
import { toast } from "sonner";

// ── Date helpers ───────────────────────────────────────────────────────────────

/** Calculate the expected date for a given pregnancy week from due date */
function weekToDate(dueDate: Date, week: number): Date {
  const msPerWeek = 7 * 24 * 60 * 60 * 1000;
  const weeksFromDue = 40 - week;
  const d = new Date(dueDate.getTime() - weeksFromDue * msPerWeek);
  // Move to Monday of that week
  const day = d.getDay();
  const diff = day === 0 ? 1 : day === 1 ? 0 : 8 - day;
  d.setDate(d.getDate() + (day <= 1 ? -day + 1 : 8 - day));
  return d;
}

function formatDate(d: Date): string {
  return d.toLocaleDateString("da-DK", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
}

function formatICSDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}${m}${day}`;
}

function isInPast(d: Date): boolean {
  return d < new Date();
}

// ── ICS generation ─────────────────────────────────────────────────────────────

function buildVEvent(title: string, description: string, date: Date, uid: string): string {
  const start = formatICSDate(date);
  const end = formatICSDate(new Date(date.getTime() + 86400000)); // next day
  const now = new Date().toISOString().replace(/[-:.]/g, "").slice(0, 15) + "Z";
  const safeDesc = description.replace(/\n/g, "\\n").replace(/,/g, "\\,");
  return [
    "BEGIN:VEVENT",
    `UID:${uid}@melo.app`,
    `DTSTAMP:${now}`,
    `DTSTART;VALUE=DATE:${start}`,
    `DTEND;VALUE=DATE:${end}`,
    `SUMMARY:${title}`,
    `DESCRIPTION:${safeDesc}`,
    "END:VEVENT",
  ].join("\r\n");
}

function buildICS(events: { title: string; description: string; date: Date; uid: string }[]): string {
  const vevents = events.map(e => buildVEvent(e.title, e.description, e.date, e.uid)).join("\r\n");
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Melo Baby//Graviditetskalender//DA",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "X-WR-CALNAME:Melo Graviditetskalender",
    "X-WR-CALDESC:Dine graviditetsaftaler fra Melo",
    vevents,
    "END:VCALENDAR",
  ].join("\r\n");
}

function downloadICS(content: string, filename: string) {
  const blob = new Blob([content], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// ── Custom appointment storage ─────────────────────────────────────────────────
interface CustomAppt {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  note: string;
}

const CUSTOM_KEY = "melo-custom-appts";

function loadCustom(): CustomAppt[] {
  try { return JSON.parse(localStorage.getItem(CUSTOM_KEY) || "[]"); } catch { return []; }
}
function saveCustom(c: CustomAppt[]) {
  localStorage.setItem(CUSTOM_KEY, JSON.stringify(c));
}

// ── Type badge ─────────────────────────────────────────────────────────────────
const TYPE_CONFIG = {
  scan:   { label: "Scanning",   bg: "hsl(var(--sage-light))",  color: "hsl(var(--moss))" },
  test:   { label: "Blodprøve",  bg: "hsl(var(--clay-light))",  color: "hsl(var(--bark))" },
  visit:  { label: "Jordemoder", bg: "hsl(var(--stone-lighter))",color: "hsl(var(--foreground))" },
  course: { label: "Kursus",     bg: "hsl(var(--sand-light))",  color: "hsl(var(--bark))" },
  custom: { label: "Aftale",     bg: "hsl(var(--stone-lighter))",color: "hsl(var(--foreground))" },
};

// ── Appointment card ───────────────────────────────────────────────────────────
function ApptCard({
  emoji, title, description, date, type, past, onAdd, onDelete,
}: {
  emoji: string;
  title: string;
  description?: string;
  date: Date;
  type: keyof typeof TYPE_CONFIG;
  past: boolean;
  onAdd: () => void;
  onDelete?: () => void;
}) {
  const [added, setAdded] = useState(false);
  const cfg = TYPE_CONFIG[type];

  const handleAdd = () => {
    onAdd();
    setAdded(true);
    setTimeout(() => setAdded(false), 3000);
  };

  return (
    <div className={cn("rounded-2xl overflow-hidden transition-all", past && "opacity-55")}
      style={{ background: "hsl(var(--warm-white))", border: "1px solid hsl(var(--stone-light))" }}>
      <div className="flex items-start gap-3 px-4 py-4">
        {/* Left: date column */}
        <div className="flex flex-col items-center w-12 flex-shrink-0 pt-0.5">
          <div className="w-10 h-10 rounded-full flex items-center justify-center text-xl"
            style={{ background: past ? "hsl(var(--stone-lighter))" : "hsl(var(--sage-light))" }}>
            {emoji}
          </div>
          {past && (
            <div className="w-5 h-5 rounded-full flex items-center justify-center mt-1"
              style={{ background: "hsl(var(--moss))" }}>
              <Check className="w-3 h-3 text-white" />
            </div>
          )}
        </div>

        {/* Right: content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-0.5">
                <p className={cn("text-[0.85rem] font-semibold leading-snug", past && "line-through text-muted-foreground")}>
                  {title}
                </p>
                <span className="text-[0.58rem] font-medium px-1.5 py-0.5 rounded-full flex-shrink-0"
                  style={{ background: cfg.bg, color: cfg.color }}>
                  {cfg.label}
                </span>
              </div>
              <p className="text-[0.7rem] font-medium" style={{ color: past ? "hsl(var(--muted-foreground))" : "hsl(var(--moss))" }}>
                {formatDate(date)}
              </p>
              {description && (
                <p className="text-[0.68rem] text-muted-foreground leading-snug mt-1">{description}</p>
              )}
            </div>
            {onDelete && (
              <button onClick={onDelete} className="text-muted-foreground/40 hover:text-muted-foreground flex-shrink-0 transition-colors">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {!past && (
            <button
              onClick={handleAdd}
              className={cn(
                "mt-3 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[0.7rem] font-medium transition-all active:scale-95",
              )}
              style={{
                background: added ? "hsl(var(--sage-light))" : "hsl(var(--stone-lighter))",
                color: added ? "hsl(var(--moss))" : "hsl(var(--foreground))",
                border: added ? "1px solid hsl(var(--sage) / 0.4)" : "1px solid hsl(var(--stone-light))",
              }}
            >
              {added
                ? <><Check className="w-3 h-3" /> Tilføjet til kalender</>
                : <><Calendar className="w-3 h-3" /> Tilføj til kalender</>
              }
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Add custom appointment form ────────────────────────────────────────────────
function AddApptSheet({ onClose, onAdd }: { onClose: () => void; onAdd: (a: CustomAppt) => void }) {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [note, setNote] = useState("");

  const handleSave = () => {
    if (!title.trim() || !date) return;
    onAdd({ id: Date.now().toString(), title: title.trim(), date, note });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end" style={{ background: "rgba(0,0,0,0.4)" }} onClick={onClose}>
      <div className="rounded-t-3xl px-5 pb-8 pt-4 space-y-4"
        style={{ background: "hsl(var(--warm-white))" }} onClick={e => e.stopPropagation()}>
        <div className="flex justify-center">
          <div className="w-10 h-1 rounded-full" style={{ background: "hsl(var(--stone-light))" }} />
        </div>
        <div className="flex items-center justify-between">
          <p className="text-[0.95rem] font-semibold">Tilføj aftale</p>
          <button onClick={onClose}><X className="w-4 h-4 text-muted-foreground" /></button>
        </div>

        <div className="space-y-3">
          <input
            autoFocus
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Titel (fx Føtalmedicin, Privat scanning...)"
            className="w-full rounded-xl border px-4 py-3 text-[0.82rem] focus:outline-none"
            style={{ borderColor: "hsl(var(--stone-light))", background: "hsl(var(--stone-lighter))", fontSize: "16px" }}
          />
          <div className="space-y-1">
            <label className="text-[0.72rem] text-muted-foreground font-medium">Dato</label>
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              className="w-full rounded-xl border px-4 py-3 text-[0.82rem] focus:outline-none"
              style={{ borderColor: "hsl(var(--stone-light))", background: "hsl(var(--stone-lighter))", fontSize: "16px" }}
            />
          </div>
          <textarea
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder="Note (valgfrit)"
            rows={2}
            className="w-full rounded-xl border px-4 py-3 text-[0.82rem] focus:outline-none resize-none"
            style={{ borderColor: "hsl(var(--stone-light))", background: "hsl(var(--stone-lighter))", fontSize: "16px" }}
          />
        </div>

        <div className="flex gap-2">
          <button onClick={onClose}
            className="flex-1 py-3.5 rounded-2xl text-[0.85rem] font-medium transition-all active:scale-95"
            style={{ background: "hsl(var(--stone-lighter))" }}>
            Annuller
          </button>
          <button onClick={handleSave} disabled={!title.trim() || !date}
            className="flex-1 py-3.5 rounded-2xl text-[0.85rem] font-medium text-white transition-all active:scale-95 disabled:opacity-40"
            style={{ background: "hsl(var(--moss))" }}>
            Gem aftale
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function PregnancyCalendarPage() {
  const { profile, currentWeek } = useFamily();
  const [customAppts, setCustomAppts] = useState<CustomAppt[]>(loadCustom);
  const [showAddSheet, setShowAddSheet] = useState(false);
  const [filter, setFilter] = useState<"alle" | "kommende" | "egne">("kommende");

  const dueDate = profile.dueOrBirthDate ? new Date(profile.dueOrBirthDate) : null;

  // Build enriched appointments with dates
  const enriched = dueDate
    ? pregnancyAppointments.map(a => ({
        ...a,
        date: weekToDate(dueDate, a.week),
      }))
    : [];

  // Custom appointments with parsed dates
  const enrichedCustom = customAppts.map(a => ({
    ...a,
    date: new Date(a.date),
    type: "custom" as const,
    emoji: "📅",
  }));

  // All combined and sorted
  const allAppts = [
    ...enriched.map(a => ({ ...a, isCustom: false })),
    ...enrichedCustom.map(a => ({ ...a, description: a.note, isCustom: true })),
  ].sort((a, b) => a.date.getTime() - b.date.getTime());

  const upcoming = allAppts.filter(a => !isInPast(a.date));
  const past = allAppts.filter(a => isInPast(a.date));

  const displayed = filter === "kommende"
    ? upcoming
    : filter === "egne"
    ? allAppts.filter(a => a.isCustom)
    : allAppts;

  // Export single event to ICS
  const exportOne = (a: { title: string; description?: string; note?: string; date: Date; id: string; week?: number }) => {
    const title = a.week ? `${a.title} (uge ${a.week}) — Melo` : `${a.title} — Melo`;
    const desc = a.description || a.note || "";
    const ics = buildICS([{ title, description: desc, date: a.date, uid: `melo-${a.id}` }]);
    downloadICS(ics, `${a.title.replace(/\s+/g, "-").toLowerCase()}.ics`);
    toast("Aftale klar til kalender 📅");
  };

  // Export all upcoming
  const exportAll = () => {
    if (upcoming.length === 0) return;
    const events = upcoming.map(a => ({
      title: "week" in a && a.week ? `${a.title} (uge ${a.week}) — Melo` : `${a.title} — Melo`,
      description: "description" in a ? (a.description || "") : ("note" in a ? (a.note || "") : ""),
      date: a.date,
      uid: `melo-${a.id}`,
    }));
    const ics = buildICS(events);
    downloadICS(ics, "melo-graviditetskalender.ics");
    toast(`${upcoming.length} aftaler klar til kalender 📅`);
  };

  const addCustom = (appt: CustomAppt) => {
    const next = [...customAppts, appt].sort((a, b) => a.date.localeCompare(b.date));
    setCustomAppts(next);
    saveCustom(next);
    toast("Aftale tilføjet");
  };

  const deleteCustom = (id: string) => {
    const next = customAppts.filter(a => a.id !== id);
    setCustomAppts(next);
    saveCustom(next);
  };

  if (!dueDate) {
    return (
      <div className="space-y-5">
        <div className="flex items-center gap-3">
          <Link to="/" className="w-9 h-9 flex items-center justify-center rounded-full">
            <ChevronLeft className="w-5 h-5 text-muted-foreground" />
          </Link>
          <h1 className="text-[1.9rem] font-normal">Aftaler</h1>
        </div>
        <div className="text-center py-16 rounded-2xl" style={{ background: "hsl(var(--warm-white))", border: "1px solid hsl(var(--stone-light))" }}>
          <p className="text-3xl mb-3">📅</p>
          <p className="text-[0.88rem] font-medium">Tilføj din terminsdato</p>
          <p className="text-[0.72rem] text-muted-foreground mt-1">Så beregner vi dine aftaler automatisk</p>
          <Link to="/mere" className="inline-block mt-4 px-5 py-2.5 rounded-full text-[0.8rem] font-medium text-white"
            style={{ background: "hsl(var(--moss))" }}>
            Gå til indstillinger
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5 pb-8">

      {/* Header */}
      <div className="flex items-center justify-between section-fade-in">
        <Link to="/" className="w-9 h-9 flex items-center justify-center rounded-full transition-colors active:bg-[hsl(var(--stone-lighter))]">
          <ChevronLeft className="w-5 h-5 text-muted-foreground" />
        </Link>
        <div className="text-center">
          <p className="text-[1rem] font-semibold">Graviditetsaftaler</p>
          <p className="text-[0.65rem] text-muted-foreground">Du er i uge {currentWeek} · termin {dueDate.toLocaleDateString("da-DK", { day: "numeric", month: "long" })}</p>
        </div>
        <button
          onClick={() => setShowAddSheet(true)}
          className="w-9 h-9 flex items-center justify-center rounded-full transition-colors active:bg-[hsl(var(--stone-lighter))]"
          style={{ background: "hsl(var(--stone-lighter))" }}
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Export all banner */}
      {upcoming.length > 0 && (
        <button
          onClick={exportAll}
          className="w-full flex items-center gap-4 rounded-2xl px-5 py-4 text-left transition-all active:scale-[0.98] section-fade-in"
          style={{
            background: "linear-gradient(135deg, hsl(var(--sage-light)), hsl(var(--stone-lighter)))",
            border: "1px solid hsl(var(--sage) / 0.3)",
            animationDelay: "20ms",
          }}
        >
          <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ background: "hsl(var(--moss))" }}>
            <Download className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <p className="text-[0.85rem] font-semibold">Tilføj alle kommende aftaler</p>
            <p className="text-[0.68rem] text-muted-foreground">{upcoming.length} aftaler → Apple Calendar / Google / Outlook</p>
          </div>
        </button>
      )}

      {/* How it works */}
      <div className="rounded-2xl px-4 py-3.5 flex items-start gap-3 section-fade-in"
        style={{ background: "hsl(var(--stone-lighter))", animationDelay: "30ms" }}>
        <span className="text-base flex-shrink-0">ℹ️</span>
        <p className="text-[0.68rem] text-muted-foreground leading-relaxed">
          Aftalerne beregnes ud fra din terminsdato. Tryk på <strong>Tilføj til kalender</strong> for at åbne en aftale direkte i din kalender-app — Apple Calendar, Google Calendar og Outlook understøttes alle.
        </p>
      </div>

      {/* Filter tabs */}
      <div className="flex p-1 rounded-xl gap-1" style={{ background: "hsl(var(--stone-lighter))" }}>
        {(["kommende", "alle", "egne"] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={cn("flex-1 py-2 rounded-lg text-[0.72rem] font-medium transition-all capitalize",
              filter === f ? "bg-background shadow-sm" : "text-muted-foreground")}>
            {f === "kommende" ? `Kommende (${upcoming.length})` : f === "alle" ? "Alle" : "Mine"}
          </button>
        ))}
      </div>

      {/* Appointment list */}
      {displayed.length === 0 ? (
        <div className="text-center py-12 rounded-2xl"
          style={{ background: "hsl(var(--warm-white))", border: "1px solid hsl(var(--stone-light))" }}>
          <p className="text-3xl mb-2">✅</p>
          <p className="text-[0.85rem] font-medium">Alle aftaler er afholdt</p>
          <p className="text-[0.72rem] text-muted-foreground mt-1">Godt gået!</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {displayed.map(a => (
            <ApptCard
              key={a.id}
              emoji={a.emoji}
              title={a.title}
              description={"description" in a ? a.description : ("note" in a ? a.note : undefined)}
              date={a.date}
              type={"type" in a ? (a.type as keyof typeof TYPE_CONFIG) : "custom"}
              past={isInPast(a.date)}
              onAdd={() => exportOne(a as any)}
              onDelete={a.isCustom ? () => deleteCustom(a.id) : undefined}
            />
          ))}
        </div>
      )}

      {/* Add custom button */}
      <button
        onClick={() => setShowAddSheet(true)}
        className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl text-[0.82rem] font-medium transition-all active:scale-[0.98]"
        style={{ border: "1.5px dashed hsl(var(--stone-light))", color: "hsl(var(--muted-foreground))" }}
      >
        <Plus className="w-4 h-4" /> Tilføj egen aftale
      </button>

      {showAddSheet && (
        <AddApptSheet onClose={() => setShowAddSheet(false)} onAdd={addCustom} />
      )}
    </div>
  );
}
