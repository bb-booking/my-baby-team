import { useState, useRef, useEffect, useCallback } from "react";
import { useFamily } from "@/context/FamilyContext";
import { Send, AlertTriangle, Plus, BookOpen, Share2 } from "lucide-react";
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
function getPregnancyPrompts(week: number, name: string): string[] {
  return [
    `Hvad sker der med baby i uge ${week}?`,
    `Er det normalt at føle sig træt i uge ${week}?`,
    `Hvad skal vi have styr på i uge ${week}?`,
    "Hvordan fordeler vi opgaverne bedre?",
    `Hvad bør jeg spise i uge ${week}?`,
    "Hvornår skal jeg kontakte min jordemoder?",
  ];
}

// ── Main component ─────────────────────────────────────────────────────────────
export default function PregnancyChatPage() {
  const { profile, currentWeek, trimester, addTask, addMemory } = useFamily();
  const parentName = profile.parentName || "";

  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeSuggestions, setActiveSuggestions] = useState<string[]>([]);
  const [showActionBar, setShowActionBar] = useState(false);
  const [taskInput, setTaskInput] = useState("");
  const [showTaskInput, setShowTaskInput] = useState(false);

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
    setMessages(prev => [...prev, userMsg]);
    setInput("");

    // Triage check
    if (isUrgentMessage(text)) {
      setMessages(prev => [...prev, { role: "assistant", content: TRIAGE_RESPONSE, expertLabel: "jordemoder" }]);
      return;
    }

    setIsLoading(true);
    const backendMessages = [...messages, userMsg];
    let assistantSoFar = "";

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
        // Pre-fill task input with context
        const taskTitle = text.length < 60 ? text : text.slice(0, 55) + "...";
        setTaskInput(taskTitle);
      },
      onError: (err) => { setError(err); setIsLoading(false); },
    });
  }, [messages, isLoading, context]);

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
    toast("Opgave tilføjet til jeres liste ✓");
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

  const prompts = getPregnancyPrompts(currentWeek, parentName);
  const lastAssistant = messages.filter(m => m.role === "assistant").at(-1);

  return (
    <div
      className="flex flex-col"
      style={{ height: "calc(100dvh - 12rem - env(safe-area-inset-top, 0px) - env(safe-area-inset-bottom, 0px))" }}
    >
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="section-fade-in pb-3">
        <div className="flex items-baseline gap-2">
          <h1 className="text-[1.9rem]">Melo</h1>
          {lastAssistant?.expertLabel && (
            <span
              className="text-[0.62rem] tracking-[0.1em] uppercase px-2 py-0.5 rounded-full"
              style={{ background: "hsl(var(--sage-light))", color: "hsl(var(--moss))" }}
            >
              {lastAssistant.expertLabel}
            </span>
          )}
        </div>
        <p className="text-[0.72rem] text-muted-foreground mt-0.5">Din guide under graviditeten</p>

        <div className="mt-2 flex items-center gap-1.5">
          <AlertTriangle className="w-3 h-3 shrink-0 text-muted-foreground/50" />
          <p className="text-[0.58rem] text-muted-foreground/50 leading-snug">
            AI-genereret vejledning — ikke medicinsk rådgivning. Kontakt altid din læge eller jordemoder ved tvivl.
          </p>
        </div>
      </div>

      {/* ── Messages ───────────────────────────────────────────────────────── */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-3 pb-4">

        {/* Empty state */}
        {messages.length === 0 && (
          <div className="section-fade-in space-y-4 mt-1">
            <div className="rounded-2xl px-5 py-6 text-center"
              style={{ background: "hsl(var(--sage-light))", border: "1px solid hsl(var(--sage) / 0.3)" }}>
              <p className="font-serif text-[1.1rem] font-medium mb-1" style={{ color: "hsl(var(--moss))" }}>
                Hvad kan jeg hjælpe med?
              </p>
              <p className="text-[0.78rem] text-muted-foreground leading-relaxed">
                Jeg svarer med udgangspunkt i jordemoderfaglig viden og troværdige kilder — og guider jer til næste skridt.
              </p>
            </div>

            <div>
              <p className="text-[0.62rem] tracking-[0.14em] uppercase text-muted-foreground mb-2">
                Forslag til uge {currentWeek}
              </p>
              <div className="flex flex-col gap-2">
                {prompts.map((p, i) => (
                  <button
                    key={i}
                    onClick={() => send(p)}
                    className="px-4 py-2.5 rounded-2xl text-[0.78rem] text-left transition-all active:scale-[0.98]"
                    style={{
                      background: "hsl(var(--warm-white))",
                      border: "1px solid hsl(var(--stone-light))",
                    }}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Message bubbles */}
        {messages.map((msg, i) => (
          <div key={i} className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}>
            {/* Expert label on MELO messages */}
            {msg.role === "assistant" && msg.expertLabel && (
              <p className="text-[0.58rem] tracking-[0.1em] uppercase text-muted-foreground mb-1 ml-1">
                Jeg svarer som {msg.expertLabel}
              </p>
            )}
            <div
              className={`max-w-[88%] rounded-2xl px-4 py-3 ${msg.role === "user" ? "rounded-br-md" : "rounded-bl-md"}`}
              style={{
                background: msg.role === "user" ? "hsl(var(--moss))" : "hsl(var(--warm-white))",
                color: msg.role === "user" ? "white" : undefined,
                border: msg.role === "assistant" ? "1px solid hsl(var(--sage) / 0.2)" : undefined,
              }}
            >
              {msg.role === "assistant" ? (
                <div className="prose prose-sm max-w-none text-[0.82rem] leading-relaxed [&_p]:mb-2 [&_strong]:font-semibold [&_ul]:space-y-1 [&_li]:text-[0.78rem]">
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
              ) : (
                <p className="text-[0.82rem] leading-relaxed">{msg.content}</p>
              )}
            </div>
          </div>
        ))}

        {/* Follow-up suggestions */}
        {activeSuggestions.length > 0 && !isLoading && (
          <div className="flex flex-col gap-1.5 pt-1">
            {activeSuggestions.map((s, i) => (
              <button key={i} onClick={() => send(s)}
                className="px-4 py-2.5 rounded-2xl text-[0.78rem] text-left transition-all active:scale-[0.98]"
                style={{ background: "hsl(var(--sage-light))", border: "1px solid hsl(var(--sage) / 0.3)" }}>
                {s}
              </button>
            ))}
          </div>
        )}

        {/* Loading indicator */}
        {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
          <div className="flex justify-start">
            <div className="rounded-2xl rounded-bl-md px-4 py-3"
              style={{ background: "hsl(var(--warm-white))", border: "1px solid hsl(var(--sage) / 0.2)" }}>
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

        {/* ── Action bar after response ─────────────────────────────────────── */}
        {showActionBar && !isLoading && (
          <div className="space-y-2 pt-1">
            <div className="flex gap-2">
              <button
                onClick={() => setShowTaskInput(!showTaskInput)}
                className="flex items-center gap-1.5 flex-1 py-2.5 rounded-full text-[0.72rem] font-medium text-white transition-all active:scale-95"
                style={{ background: "hsl(var(--moss))" }}
              >
                <Plus className="w-3.5 h-3.5" /> Opret opgave
              </button>
              <button
                onClick={handleSaveNote}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-full text-[0.72rem] font-medium transition-all active:scale-95"
                style={{ border: "1.5px solid hsl(var(--stone-light))", color: "hsl(var(--foreground))" }}
              >
                <BookOpen className="w-3.5 h-3.5" /> Gem note
              </button>
              <button
                onClick={handleShare}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-full text-[0.72rem] font-medium transition-all active:scale-95"
                style={{ border: "1.5px solid hsl(var(--stone-light))", color: "hsl(var(--foreground))" }}
              >
                <Share2 className="w-3.5 h-3.5" /> Del
              </button>
            </div>

            {showTaskInput && (
              <div className="flex gap-2">
                <input
                  autoFocus
                  value={taskInput}
                  onChange={e => setTaskInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleAddTask()}
                  placeholder="Opgavetitel..."
                  className="flex-1 rounded-2xl border px-3 py-2.5 text-[0.82rem] focus:outline-none transition-colors"
                  style={{ borderColor: "hsl(var(--stone-light))", background: "hsl(var(--warm-white))", fontSize: "16px" }}
                />
                <button
                  onClick={handleAddTask}
                  disabled={!taskInput.trim()}
                  className="px-4 py-2.5 rounded-2xl text-[0.75rem] font-medium text-white disabled:opacity-40 transition-all active:scale-95"
                  style={{ background: "hsl(var(--moss))" }}
                >
                  Tilføj
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Input ──────────────────────────────────────────────────────────── */}
      <div className="pt-2 pb-1" style={{ borderTop: "1px solid hsl(var(--stone-lighter))" }}>
        <form onSubmit={e => { e.preventDefault(); send(input); }} className="flex gap-2">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Spørg om hvad som helst under graviditeten..."
            disabled={isLoading}
            className="flex-1 rounded-2xl border px-4 py-3 text-[0.85rem] focus:outline-none transition-colors disabled:opacity-50"
            style={{
              borderColor: "hsl(var(--sage) / 0.4)",
              background: "hsl(var(--warm-white))",
              fontSize: "16px",
            }}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="w-11 h-11 rounded-xl flex items-center justify-center transition-all active:scale-90 disabled:opacity-30 flex-shrink-0"
            style={{ background: "hsl(var(--moss))", color: "white" }}
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
