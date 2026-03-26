import { useState, useRef, useEffect, useCallback } from "react";
import { useFamily } from "@/context/FamilyContext";
import { Send, Sparkles, AlertTriangle } from "lucide-react";
import ReactMarkdown from "react-markdown";

interface Msg {
  role: "user" | "assistant";
  content: string;
}

function getQuickPrompts(childName: string) {
  return [
    `Hvor meget skal ${childName} sove?`,
    `${childName} vil ikke tage brystet – hvad gør jeg?`,
    `Hvordan ved jeg om ${childName} får nok mælk?`,
    `${childName} græder meget – hvad kan vi prøve?`,
    "Hvornår kan vi begynde med grød og mad?",
    "Hvordan ser en normal ble ud?",
    "Hvordan støtter jeg min partner bedst lige nu?",
    `Hvad kan vi lege med ${childName}?`,
    "Jeg føler mig overvældet – er det normalt?",
  ];
}

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/baby-chat`;

function parseSuggestions(content: string): { text: string; suggestions: string[] } {
  const marker = "---suggestions---";
  const idx = content.indexOf(marker);
  if (idx === -1) return { text: content, suggestions: [] };
  const text = content.slice(0, idx).trim();
  const suggestionsRaw = content.slice(idx + marker.length).trim();
  const suggestions = suggestionsRaw
    .split("\n")
    .map((s) => s.replace(/^[-•*]\s*/, "").trim())
    .filter((s) => s.length > 0);
  return { text, suggestions };
}

async function streamChat({
  messages, context, onDelta, onDone, onError,
}: {
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
    if (!resp.ok) {
      const data = await resp.json().catch(() => ({}));
      onError(data.error || "Noget gik galt. Prøv igen.");
      return;
    }
    if (!resp.body) { onError("Ingen svar modtaget."); return; }

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
        } catch {
          buffer = line + "\n" + buffer;
          break;
        }
      }
    }
    onDone();
  } catch {
    onError("Kunne ikke forbinde til AI. Tjek din forbindelse.");
  }
}

export default function ChatPage() {
  const { profile, babyAgeWeeks, babyAgeMonths } = useFamily();
  const childName = profile.children?.[0]?.name || "Baby";

  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeSuggestions, setActiveSuggestions] = useState<string[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const context = { babyAgeWeeks, babyAgeMonths, childName, role: profile.role, phase: profile.phase };

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, activeSuggestions]);

  const send = useCallback(async (text: string) => {
    if (!text.trim() || isLoading) return;
    setError(null);
    setActiveSuggestions([]);
    const userMsg: Msg = { role: "user", content: text.trim() };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    let assistantSoFar = "";

    await streamChat({
      messages: [...messages, userMsg],
      context,
      onDelta: (chunk) => {
        assistantSoFar += chunk;
        // While streaming, show full content (including suggestions marker) — we'll clean up onDone
        const { text: visibleText } = parseSuggestions(assistantSoFar);
        setMessages(prev => {
          const last = prev[prev.length - 1];
          if (last?.role === "assistant") {
            return prev.map((m, i) => i === prev.length - 1 ? { ...m, content: visibleText } : m);
          }
          return [...prev, { role: "assistant", content: visibleText }];
        });
      },
      onDone: () => {
        const { text: finalText, suggestions } = parseSuggestions(assistantSoFar);
        setMessages(prev =>
          prev.map((m, i) => i === prev.length - 1 && m.role === "assistant" ? { ...m, content: finalText } : m)
        );
        if (suggestions.length > 0) setActiveSuggestions(suggestions);
        setIsLoading(false);
      },
      onError: (err) => { setError(err); setIsLoading(false); },
    });
  }, [messages, isLoading, context]);

  const relevantPrompts = getQuickPrompts(childName).slice(0, 4);

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)] md:h-[calc(100vh-5rem)]">
      <div className="section-fade-in px-1 pb-3">
        <h1 className="text-[1.9rem] font-normal">Spørg Melo</h1>
        <p className="label-upper mt-1">DIN TRYGGE RÅDGIVER</p>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-3 px-1 pb-4">
        {messages.length === 0 && (
          <div className="section-fade-in space-y-4 mt-2">
            <div className="card-soft text-center py-6">
              <div className="w-14 h-14 rounded-full mx-auto mb-3 flex items-center justify-center"
                style={{ background: "linear-gradient(135deg, hsl(var(--sage-light)), hsl(var(--sage)))" }}>
                <Sparkles className="w-7 h-7 text-white" />
              </div>
              <p className="text-[0.92rem] font-medium mb-1">Spørg om søvn, udvikling, trivsel og hverdag</p>
              <p className="text-[0.7rem] text-muted-foreground max-w-xs mx-auto leading-relaxed">
                Svarene er vejledende og erstatter ikke akut lægehjælp. Ved bekymring — ring altid 1813.
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-[0.6rem] tracking-[0.14em] uppercase text-muted-foreground">FORSLAG TIL DIG</p>
              <div className="flex flex-wrap gap-2">
                {relevantPrompts.map((p, i) => (
                  <button key={i} onClick={() => send(p)}
                    className="px-3.5 py-2 rounded-2xl text-[0.75rem] border transition-all active:scale-95 hover:shadow-sm text-left"
                    style={{ borderColor: "hsl(var(--stone-light))", background: "hsl(var(--warm-white))" }}>
                    {p}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[85%] rounded-2xl px-4 py-3 ${msg.role === "user" ? "rounded-br-md" : "rounded-bl-md"}`}
              style={{
                background: msg.role === "user" ? "hsl(var(--moss))" : "hsl(var(--warm-white))",
                color: msg.role === "user" ? "white" : undefined,
                border: msg.role === "assistant" ? "1px solid hsl(var(--stone-light))" : undefined,
              }}>
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

        {/* Clickable suggestion chips */}
        {activeSuggestions.length > 0 && !isLoading && (
          <div className="flex flex-wrap gap-2 pt-1 pb-2">
            {activeSuggestions.map((s, i) => (
              <button key={i} onClick={() => send(s)}
                className="px-3.5 py-2.5 rounded-2xl text-[0.75rem] border transition-all active:scale-95 hover:shadow-sm text-left"
                style={{ borderColor: "hsl(var(--sage) / 0.3)", background: "hsl(var(--sage-light) / 0.15)" }}>
                {s}
              </button>
            ))}
          </div>
        )}

        {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
          <div className="flex justify-start">
            <div className="rounded-2xl rounded-bl-md px-4 py-3" style={{ background: "hsl(var(--warm-white))", border: "1px solid hsl(var(--stone-light))" }}>
              <div className="flex gap-1.5">
                <span className="w-2 h-2 rounded-full animate-bounce" style={{ background: "hsl(var(--sage))", animationDelay: "0ms" }} />
                <span className="w-2 h-2 rounded-full animate-bounce" style={{ background: "hsl(var(--sage))", animationDelay: "150ms" }} />
                <span className="w-2 h-2 rounded-full animate-bounce" style={{ background: "hsl(var(--sage))", animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="flex justify-center">
            <div className="rounded-2xl px-4 py-3 flex items-center gap-2 text-[0.78rem]"
              style={{ background: "hsl(var(--clay-light))", border: "1px solid hsl(var(--clay) / 0.3)" }}>
              <AlertTriangle className="w-4 h-4" style={{ color: "hsl(var(--clay))" }} />
              {error}
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="px-1 pb-2 pt-2" style={{ borderTop: "1px solid hsl(var(--stone-lighter))" }}>
        <form onSubmit={(e) => { e.preventDefault(); send(input); }} className="flex gap-2">
          <input ref={inputRef} value={input} onChange={e => setInput(e.target.value)}
            placeholder="Skriv dit spørgsmål her…" disabled={isLoading}
            className="flex-1 rounded-2xl border px-4 py-3 text-[0.85rem] focus:outline-none transition-colors disabled:opacity-50"
            style={{ borderColor: "hsl(var(--stone-light))", background: "hsl(var(--warm-white))" }} />
          <button type="submit" disabled={!input.trim() || isLoading}
            className="w-11 h-11 rounded-xl flex items-center justify-center transition-all active:scale-90 disabled:opacity-30"
            style={{ background: "hsl(var(--moss))", color: "white" }}>
            <Send className="w-4.5 h-4.5" />
          </button>
        </form>
      </div>
    </div>
  );
}
