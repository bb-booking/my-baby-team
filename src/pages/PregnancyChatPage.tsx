import { useState, useRef, useEffect, useCallback } from "react";
import { useFamily } from "@/context/FamilyContext";
import { AlertTriangle, Plus, Bookmark, Users, Sparkles, Mic, ArrowRight, Info, X } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// ── Shared streaming logic ─────────────────────────────────────────────────────
interface Msg {
  role: "user" | "assistant";
  content: string;
  expertLabel?: string | null;
}

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/baby-chat`;

function parseSuggestions(content: string): { text: string; suggestions: string[] } {
  const marker = "---suggestions---";
  const idx = content.indexOf(marker);
  if (idx === -1) return { text: content, suggestions: [] };
  const text = content.slice(0, idx).trim();
  const suggestionsRaw = content.slice(idx + marker.length).trim();
  const suggestions = suggestionsRaw.split("\n").map(s => s.replace(/^[-•*]\s*/, "").trim()).filter(s => s.length > 0);
  return { text, suggestions };
}

async function streamChat({ messages, context, onDelta, onDone, onError }: {
  messages: Msg[]; context: any;
  onDelta: (text: string) => void; onDone: () => void; onError: (err: string) => void;
}) {
  try {
    const resp = await fetch(CHAT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      },
      body: JSON.stringify({ messages, context }),
    });
    if (!resp.ok) { const d = await resp.json().catch(() => ({})); onError(d.error || "Noget gik galt."); return; }
    if (!resp.body) { onError("Intet svar modtaget."); return; }

    const reader = resp.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      let idx: number;
      while ((idx = buffer.indexOf("\n")) !== -1) {
        let line = buffer.slice(0, idx);
        buffer = buffer.slice(idx + 1);
        if (line.endsWith("\r")) line = line.slice(0, -1);
        if (!line.startsWith("data: ")) continue;
        const json = line.slice(6).trim();
        if (json === "[DONE]") { onDone(); return; }
        try {
          const parsed = JSON.parse(json);
          const content = parsed.choices?.[0]?.delta?.content;
          if (content) onDelta(content);
        } catch { buffer = line + "\n" + buffer; break; }
      }
    }
    onDone();
  } catch { onError("Forbindelsesfejl."); }
}

// ── Expert routing ─────────────────────────────────────────────────────────────
function detectExpertLabel(message: string): string | null {
  const l = message.toLowerCase();
  if (/blødning|smerter|svimmel|kvalme|opkast|feber|mavepine|rygsmerter/.test(l)) return "jordemoder";
  if (/spis|kost|vitamin|mad|ernæring|folinsyre|jern|kalk/.test(l)) return "kostvejleder";
  if (/angst|stress|ked|overvældet|deprimeret|ensom|bange|gråd/.test(l)) return "psykolog";
  if (/partner|forhold|argument|kommunik|skændes|sur på/.test(l)) return "parterapeut";
  if (/amning|bryst|mælk/.test(l)) return "ammevejleder";
  if (/pak|book|bestil|plan|liste|forbered|scanning|hospital/.test(l)) return "planlægger";
  return null;
}

// ── Triage detection ───────────────────────────────────────────────────────────
const URGENT_KEYWORDS = [
  "kraftig blødning", "kraftige smerter", "stærke smerter",
  "feber over 38", "nedsat fosterbevægelse", "ikke mærket baby",
  "åndenød", "pludselig hævelse", "besvimer", "besvimede",
];

function isUrgentMessage(msg: string): boolean {
  const l = msg.toLowerCase();
  return URGENT_KEYWORDS.some(kw => l.includes(kw));
}

const TRIAGE_RESPONSE = `🚨 **Det her bør du have vurderet hurtigt.**

Kontakt din læge eller fødegangen med det samme — ring **1813** eller tag direkte til fødegangen.

Det er altid bedre at ringe og få besked om at det er okay, end at vente.`;

// ── Week-based suggested prompts ───────────────────────────────────────────────
function getPregnancyPrompts(week: number): string[] {
  return [
    `Hvad skal vi have styr på i denne uge?`,
    `Hvad må jeg spise i denne uge?`,
    `Er det normalt at være så træt?`,
    `Gode øvelser til lændesmerter?`,
    `Hvad sker der med baby i uge ${week}?`,
    `Hvornår skal jeg kontakte min jordemoder?`,
  ];
}

// ── MELO avatar ────────────────────────────────────────────────────────────────
function MeloAvatar({ size = 32 }: { size?: number }) {
  return (
    <div
      className="rounded-full flex items-center justify-center flex-shrink-0"
      style={{ width: size, height: size, background: "hsl(var(--moss))" }}
    >
      <svg width={size * 0.55} height={size * 0.55} viewBox="0 0 20 20" fill="none">
        <circle cx="10" cy="10" r="9" stroke="white" strokeWidth="1.5" />
        <circle cx="7" cy="9" r="1.2" fill="white" />
        <circle cx="13" cy="9" r="1.2" fill="white" />
        <path d="M7 13c0.8 1.2 5.2 1.2 6 0" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    </div>
  );
}

// ── Timestamp helper ───────────────────────────────────────────────────────────
function nowTime() {
  const d = new Date();
  return `${d.getHours().toString().padStart(2, "0")}.${d.getMinutes().toString().padStart(2, "0")}`;
}

// ── Main component ─────────────────────────────────────────────────────────────
export default function PregnancyChatPage() {
  const { profile, currentWeek, trimester, addTask, addMemory } = useFamily();
  const parentName = profile.parentName || "dig";

  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeSuggestions, setActiveSuggestions] = useState<string[]>([]);
  const [showActionBar, setShowActionBar] = useState(false);
  const [showTaskInput, setShowTaskInput] = useState(false);
  const [taskInput, setTaskInput] = useState("");
  const [showInfo, setShowInfo] = useState(false);
  const [msgTimes] = useState<Map<number, string>>(new Map());

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, activeSuggestions, showActionBar]);

  const context = {
    phase: "pregnant",
    currentWeek,
    trimester,
    role: profile.role,
    parentName,
    language: "da",
    chatMode: "pregnancy",
  };

  const send = useCallback(async (text: string) => {
    if (!text.trim() || isLoading) return;
    setError(null);
    setActiveSuggestions([]);
    setShowActionBar(false);
    setShowTaskInput(false);

    const expertLabel = detectExpertLabel(text);
    const userMsg: Msg = { role: "user", content: text.trim() };
    const userIdx = messages.length;
    msgTimes.set(userIdx, nowTime());
    setMessages(prev => [...prev, userMsg]);
    setInput("");

    // Triage check
    if (isUrgentMessage(text)) {
      const aIdx = userIdx + 1;
      msgTimes.set(aIdx, nowTime());
      setMessages(prev => [...prev, { role: "assistant", content: TRIAGE_RESPONSE, expertLabel: "jordemoder" }]);
      setShowActionBar(true);
      return;
    }

    setIsLoading(true);
    const backendMessages = [...messages, userMsg];
    let assistantSoFar = "";
    let assistantIdx = -1;

    await streamChat({
      messages: backendMessages,
      context,
      onDelta: (chunk) => {
        assistantSoFar += chunk;
        const { text: visibleText } = parseSuggestions(assistantSoFar);
        setMessages(prev => {
          const last = prev[prev.length - 1];
          if (last?.role === "assistant") {
            return prev.map((m, i) => i === prev.length - 1 ? { ...m, content: visibleText } : m);
          }
          assistantIdx = prev.length;
          msgTimes.set(assistantIdx, nowTime());
          return [...prev, { role: "assistant", content: visibleText, expertLabel }];
        });
      },
      onDone: () => {
        const { text: finalText, suggestions } = parseSuggestions(assistantSoFar);
        setMessages(prev =>
          prev.map((m, i) => i === prev.length - 1 && m.role === "assistant"
            ? { ...m, content: finalText }
            : m
          )
        );
        if (suggestions.length > 0) setActiveSuggestions(suggestions);
        setIsLoading(false);
        setShowActionBar(true);
        const taskTitle = text.length < 60 ? text : text.slice(0, 55) + "...";
        setTaskInput(taskTitle);
      },
      onError: (err) => { setError(err); setIsLoading(false); },
    });
  }, [messages, isLoading, context, msgTimes]);

  const handleSaveNote = () => {
    const last = messages.filter(m => m.role === "assistant").at(-1);
    if (!last) return;
    addMemory(last.content.slice(0, 200));
    toast("Gemt som note 📝");
    setShowActionBar(false);
  };

  const handleAddTask = () => {
    if (!taskInput.trim()) return;
    addTask(taskInput.trim(), "fælles", "never");
    toast("Opgave tilføjet ✓");
    setShowTaskInput(false);
    setShowActionBar(false);
  };

  const handleShare = async () => {
    const last = messages.filter(m => m.role === "assistant").at(-1);
    if (!last) return;
    if (navigator.share) {
      try { await navigator.share({ title: "Fra Melo", text: last.content.slice(0, 300) }); } catch {}
    } else {
      await navigator.clipboard.writeText(last.content.slice(0, 300));
      toast("Kopieret til udklipsholder");
    }
  };

  const prompts = getPregnancyPrompts(currentWeek);
  const hasConversation = messages.length > 0;

  return (
    <div className="flex flex-col" style={{ height: "calc(100dvh - 7rem - env(safe-area-inset-top, 0px) - env(safe-area-inset-bottom, 0px))" }}>

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-1 pt-1 pb-3 flex-shrink-0">
        <Sparkles className="w-5 h-5" style={{ color: "hsl(var(--moss))" }} strokeWidth={1.5} />
        <div className="text-center">
          <h1 className="text-[1.1rem] font-semibold tracking-[0.12em] uppercase" style={{ color: "hsl(var(--moss))" }}>MELO</h1>
          <p className="text-[0.65rem] text-muted-foreground -mt-0.5">Din guide under graviditeten</p>
        </div>
        <button onClick={() => setShowInfo(true)} className="w-7 h-7 flex items-center justify-center rounded-full transition-colors active:bg-[hsl(var(--stone-lighter))]">
          <Info className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
        </button>
      </div>

      {/* ── Info modal ─────────────────────────────────────────────────────── */}
      {showInfo && (
        <div className="absolute inset-0 z-50 flex items-end" style={{ background: "rgba(0,0,0,0.3)" }} onClick={() => setShowInfo(false)}>
          <div className="w-full rounded-t-3xl p-6 space-y-3" style={{ background: "hsl(var(--warm-white))" }} onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <p className="font-semibold text-[0.95rem]">Om MELO</p>
              <button onClick={() => setShowInfo(false)}><X className="w-4 h-4 text-muted-foreground" /></button>
            </div>
            <p className="text-[0.78rem] text-muted-foreground leading-relaxed">
              MELO svarer med udgangspunkt i jordemoderfaglig viden og anbefalinger fra Sundhedsstyrelsen og Jordemoderforeningen.
            </p>
            <p className="text-[0.72rem] text-muted-foreground leading-relaxed">
              Dette er ikke en erstatning for professionel medicinsk rådgivning. Kontakt altid din læge eller jordemoder ved tvivl eller akutte symptomer.
            </p>
          </div>
        </div>
      )}

      {/* ── Messages ───────────────────────────────────────────────────────── */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-4 pb-3">

        {/* Greeting */}
        <div className="flex items-end gap-2">
          <MeloAvatar size={36} />
          <div className="max-w-[78%] rounded-2xl rounded-bl-md px-4 py-3"
            style={{ background: "hsl(var(--stone-lighter))", border: "1px solid hsl(var(--stone-light))" }}>
            <p className="text-[0.85rem] leading-relaxed">Hej {profile.parentName || ""}  👋<br />Hvordan kan jeg hjælpe dig i dag?</p>
          </div>
        </div>

        {/* Empty state prompts */}
        {!hasConversation && (
          <div className="space-y-3 mt-2">
            <div className="flex items-center justify-between">
              <p className="text-[0.78rem] font-medium">Spørgsmål du måske har</p>
              <button className="text-[0.72rem] flex items-center gap-0.5" style={{ color: "hsl(var(--moss))" }}>
                Se alle <ArrowRight className="w-3 h-3" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {prompts.slice(0, 4).map((p, i) => (
                <button key={i} onClick={() => send(p)}
                  className="rounded-2xl px-3 py-3 text-[0.75rem] text-left leading-snug transition-all active:scale-[0.97]"
                  style={{ background: "hsl(var(--warm-white))", border: "1px solid hsl(var(--stone-light))" }}>
                  {p}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Message bubbles */}
        {messages.map((msg, i) => (
          <div key={i} className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}>
            {msg.role === "assistant" && (
              <div className="flex items-end gap-2 w-full">
                <MeloAvatar size={32} />
                <div className="flex-1 max-w-[84%]">
                  <div className="rounded-2xl rounded-bl-md px-4 py-3"
                    style={{ background: "hsl(var(--warm-white))", border: "1px solid hsl(var(--stone-light))" }}>
                    <div className="prose prose-sm max-w-none text-[0.82rem] leading-relaxed [&_p]:mb-2 [&_strong]:font-semibold [&_ul]:space-y-1 [&_li]:text-[0.78rem]">
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>
                    {msgTimes.get(i) && (
                      <p className="text-[0.6rem] text-muted-foreground/60 text-right mt-1">{msgTimes.get(i)}</p>
                    )}
                  </div>
                </div>
              </div>
            )}
            {msg.role === "user" && (
              <div className="max-w-[78%]">
                <div className="rounded-2xl rounded-br-md px-4 py-3"
                  style={{ background: "hsl(var(--clay-light))", border: "1px solid hsl(var(--clay) / 0.25)" }}>
                  <p className="text-[0.85rem] leading-relaxed" style={{ color: "hsl(var(--bark))" }}>{msg.content}</p>
                </div>
                {msgTimes.get(i) && (
                  <p className="text-[0.6rem] text-muted-foreground/60 text-right mt-0.5 pr-1">{msgTimes.get(i)} ✓✓</p>
                )}
              </div>
            )}
          </div>
        ))}

        {/* Follow-up suggestions */}
        {activeSuggestions.length > 0 && !isLoading && (
          <div className="ml-10 grid grid-cols-2 gap-2 pt-1">
            {activeSuggestions.slice(0, 4).map((s, i) => (
              <button key={i} onClick={() => send(s)}
                className="rounded-2xl px-3 py-2.5 text-[0.75rem] text-left leading-snug transition-all active:scale-[0.97]"
                style={{ background: "hsl(var(--sage-light))", border: "1px solid hsl(var(--sage) / 0.3)" }}>
                {s}
              </button>
            ))}
          </div>
        )}

        {/* Loading */}
        {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
          <div className="flex items-end gap-2">
            <MeloAvatar size={32} />
            <div className="rounded-2xl rounded-bl-md px-4 py-3"
              style={{ background: "hsl(var(--warm-white))", border: "1px solid hsl(var(--stone-light))" }}>
              <div className="flex gap-1.5">
                {[0, 150, 300].map(delay => (
                  <span key={delay} className="w-2 h-2 rounded-full animate-bounce"
                    style={{ background: "hsl(var(--moss))", animationDelay: `${delay}ms` }} />
                ))}
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="rounded-2xl px-4 py-3 flex items-center gap-2 text-[0.78rem]"
            style={{ background: "hsl(var(--clay-light))", border: "1px solid hsl(var(--clay) / 0.3)" }}>
            <AlertTriangle className="w-4 h-4" style={{ color: "hsl(var(--clay))" }} />
            {error}
          </div>
        )}

        {/* ── Action bar ───────────────────────────────────────────────────── */}
        {showActionBar && !isLoading && (
          <div className="space-y-2 pt-1 ml-10">
            <div className="grid grid-cols-4 gap-2">
              {[
                { icon: Plus, label: "Opret opgave", action: () => setShowTaskInput(!showTaskInput) },
                { icon: Bookmark, label: "Gem som note", action: handleSaveNote },
                { icon: Users, label: "Del med partner", action: handleShare },
                { icon: Sparkles, label: "Få forslag", action: () => setActiveSuggestions(prompts.slice(0, 4)) },
              ].map(({ icon: Icon, label, action }) => (
                <button key={label} onClick={action}
                  className="flex flex-col items-center gap-1.5 py-3 rounded-2xl transition-all active:scale-95"
                  style={{ border: "1px solid hsl(var(--stone-light))", background: "hsl(var(--warm-white))" }}>
                  <Icon className="w-4 h-4" style={{ color: "hsl(var(--moss))" }} strokeWidth={1.5} />
                  <span className="text-[0.6rem] text-center leading-tight text-muted-foreground">{label}</span>
                </button>
              ))}
            </div>

            {showTaskInput && (
              <div className="flex gap-2">
                <input
                  autoFocus
                  value={taskInput}
                  onChange={e => setTaskInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleAddTask()}
                  placeholder="Opgavetitel..."
                  className="flex-1 rounded-2xl border px-3 py-2.5 text-[0.82rem] focus:outline-none"
                  style={{ borderColor: "hsl(var(--stone-light))", background: "hsl(var(--warm-white))", fontSize: "16px" }}
                />
                <button onClick={handleAddTask} disabled={!taskInput.trim()}
                  className="px-4 rounded-2xl text-[0.75rem] font-medium text-white disabled:opacity-40 transition-all active:scale-95"
                  style={{ background: "hsl(var(--moss))" }}>
                  Tilføj
                </button>
              </div>
            )}
          </div>
        )}

        {/* Suggestions after conversation */}
        {hasConversation && !isLoading && !showActionBar && (
          <div className="space-y-2 ml-10">
            <div className="flex items-center justify-between">
              <p className="text-[0.72rem] font-medium text-muted-foreground">Spørgsmål du måske har</p>
              <button className="text-[0.65rem] flex items-center gap-0.5" style={{ color: "hsl(var(--moss))" }}>
                Se alle <ArrowRight className="w-2.5 h-2.5" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {prompts.slice(0, 4).map((p, i) => (
                <button key={i} onClick={() => send(p)}
                  className="rounded-2xl px-3 py-2.5 text-[0.72rem] text-left leading-snug transition-all active:scale-[0.97]"
                  style={{ background: "hsl(var(--warm-white))", border: "1px solid hsl(var(--stone-light))" }}>
                  {p}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Input ──────────────────────────────────────────────────────────── */}
      <div className="pt-2 pb-1 flex-shrink-0" style={{ borderTop: "1px solid hsl(var(--stone-lighter))" }}>
        <form onSubmit={e => { e.preventDefault(); send(input); }} className="flex items-center gap-2">
          <button type="button"
            className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 transition-all active:scale-90"
            style={{ border: "1.5px solid hsl(var(--stone-light))", color: "hsl(var(--muted-foreground))" }}>
            <Plus className="w-4 h-4" />
          </button>
          <div className="flex-1 flex items-center rounded-full px-4"
            style={{ border: "1.5px solid hsl(var(--stone-light))", background: "hsl(var(--warm-white))", height: "44px" }}>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Skriv til MELO..."
              disabled={isLoading}
              className="flex-1 bg-transparent text-[0.85rem] focus:outline-none disabled:opacity-50"
              style={{ fontSize: "16px" }}
            />
            <Mic className="w-4 h-4 flex-shrink-0 text-muted-foreground/60" strokeWidth={1.5} />
          </div>
          <button type="submit" disabled={!input.trim() || isLoading}
            className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 transition-all active:scale-90 disabled:opacity-30"
            style={{ background: "hsl(var(--moss))", color: "white" }}>
            <ArrowRight className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
}
