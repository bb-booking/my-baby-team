import { useState, useRef, useEffect, useCallback } from "react";
import { useFamily } from "@/context/FamilyContext";
import { Send, Sparkles, AlertTriangle, Lock, Leaf, MessageCircle, Copy, Check } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

interface Msg {
  role: "user" | "assistant";
  content: string;
  synthetic?: boolean; // opening messages not sent to backend
}

type ChatMode = "normal" | "oracle" | "rage";

const MODE_CONFIG: Record<ChatMode, {
  icon: React.ReactNode;
  label: string;
  accentVar: string;
  bgVar: string;
  placeholder: string;
  subtitle: string;
  openingMsg?: string;
}> = {
  normal: {
    icon: <MessageCircle className="w-3.5 h-3.5" />,
    label: "Melo",
    accentVar: "--moss",
    bgVar: "--sage-light",
    placeholder: "Spørg om hvad som helst...",
    subtitle: "Søvn, amning, udvikling, kærlighed",
  },
  oracle: {
    icon: <Leaf className="w-3.5 h-3.5" />,
    label: "Er det normalt?",
    accentVar: "--sage",
    bgVar: "--sage-light",
    placeholder: "Er det normalt at...",
    subtitle: "Hurtige, varme og faktabaserede svar",
    openingMsg: "Hvad undrer dig? Jeg svarer med det vi faktisk ved — varmt og direkte. Du er i gode hænder.",
  },
  rage: {
    icon: <Lock className="w-3.5 h-3.5" />,
    label: "Ventil",
    accentVar: "--clay",
    bgVar: "--clay-light",
    placeholder: "Hvad sidder du med?",
    subtitle: "Privat — intet deles med din partner",
    openingMsg: "Dette rum er kun for dig. Ingenting herfra sendes til din partner. Hvad sker der?",
  },
};

const ORACLE_PROMPTS = [
  "Er det normalt at baby kun sover på mig?",
  "Er det normalt at jeg gråder uden grund?",
  "Er det normalt at amning gør ondt?",
  "Er det normalt at vi ikke har haft sex i 2 måneder?",
  "Er det normalt at baby stadig vågner om natten?",
  "Er det normalt at jeg savner mit gamle liv?",
  "Er det normalt at baby klynger sig hele dagen?",
  "Er det normalt at jeg er vred på min partner?",
];

const RAGE_PROMPTS = [
  "Jeg er så træt og ingen forstår det",
  "Min partner hjælper ikke nok",
  "Jeg føler mig usynlig",
  "Jeg er ikke mig selv længere",
];

function getQuickPrompts(childName: string, en: boolean) {
  if (en) return [
    `How much should ${childName} sleep?`,
    `${childName} won't latch — what should I do?`,
    `How do I know if ${childName} is getting enough milk?`,
    "How can I best support my partner right now?",
  ];
  return [
    `Hvor meget skal ${childName} sove?`,
    `${childName} vil ikke tage brystet – hvad gør jeg?`,
    `Hvordan ved jeg om ${childName} får nok mælk?`,
    "Hvordan støtter jeg min partner bedst lige nu?",
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
      onError(data.error || "Something went wrong.");
      return;
    }
    if (!resp.body) { onError("No response received."); return; }

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
    onError("Connection error.");
  }
}

export default function ChatPage() {
  const { profile, babyAgeWeeks, babyAgeMonths } = useFamily();
  const { t, i18n } = useTranslation();
  const childName = profile.children?.[0]?.name || "Baby";
  const en = i18n.language === "en";

  const [mode, setMode] = useState<ChatMode>("normal");
  const [histories, setHistories] = useState<Record<ChatMode, Msg[]>>({
    normal: [],
    oracle: [],
    rage: [],
  });
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeSuggestions, setActiveSuggestions] = useState<string[]>([]);
  const [copiedPartnerMsg, setCopiedPartnerMsg] = useState(false);
  const [isFormulating, setIsFormulating] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const messages = histories[mode];
  const cfg = MODE_CONFIG[mode];

  const setMessages = useCallback((updater: Msg[] | ((prev: Msg[]) => Msg[])) => {
    setHistories(prev => ({
      ...prev,
      [mode]: typeof updater === "function" ? updater(prev[mode]) : updater,
    }));
  }, [mode]);

  // Inject opening message when switching to oracle/rage with empty history
  useEffect(() => {
    if (cfg.openingMsg && histories[mode].length === 0) {
      setMessages([{ role: "assistant", content: cfg.openingMsg, synthetic: true }]);
    }
  }, [mode]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, activeSuggestions]);

  const context = {
    babyAgeWeeks, babyAgeMonths, childName,
    role: profile.role, phase: profile.phase,
    language: i18n.language, chatMode: mode,
  };

  const send = useCallback(async (text: string) => {
    if (!text.trim() || isLoading) return;
    setError(null);
    setActiveSuggestions([]);
    const userMsg: Msg = { role: "user", content: text.trim() };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    // Filter out synthetic messages before sending to backend
    const backendMessages = [...histories[mode].filter(m => !m.synthetic), userMsg];
    let assistantSoFar = "";

    await streamChat({
      messages: backendMessages,
      context,
      onDelta: (chunk) => {
        assistantSoFar += chunk;
        const { text: visibleText } = parseSuggestions(assistantSoFar);
        setMessages(prev => {
          const last = prev[prev.length - 1];
          if (last?.role === "assistant" && !last.synthetic) {
            return prev.map((m, i) => i === prev.length - 1 ? { ...m, content: visibleText } : m);
          }
          return [...prev, { role: "assistant", content: visibleText }];
        });
      },
      onDone: () => {
        const { text: finalText, suggestions } = parseSuggestions(assistantSoFar);
        setMessages(prev =>
          prev.map((m, i) => i === prev.length - 1 && m.role === "assistant" && !m.synthetic ? { ...m, content: finalText } : m)
        );
        if (suggestions.length > 0) setActiveSuggestions(suggestions);
        setIsLoading(false);
      },
      onError: (err) => { setError(err); setIsLoading(false); },
    });
  }, [histories, mode, isLoading, context]);

  // Rage room: formulate a gentle message to partner
  const formulateForPartner = useCallback(async () => {
    setIsFormulating(true);
    const internalPrompt = "[INTERN INSTRUKTION: Skriv nu én kort, konkret besked (maks 3 sætninger) som brugeren kan sende til sin partner. Brug 'jeg'-sprog. Ingen bebrejdelse. Ingen forklaring af prompten — bare selve beskeden.]";

    const backendMessages = [
      ...histories.rage.filter(m => !m.synthetic),
      { role: "user" as const, content: internalPrompt },
    ];

    let result = "";
    await streamChat({
      messages: backendMessages,
      context: { ...context, chatMode: "rage_formulate" },
      onDelta: (chunk) => { result += chunk; },
      onDone: () => {
        setMessages(prev => [...prev, {
          role: "assistant",
          content: `**Til din partner:**\n\n"${result.trim()}"`,
        }]);
        setIsFormulating(false);
      },
      onError: () => setIsFormulating(false),
    });
  }, [histories, context]);

  const handleModeSwitch = (m: ChatMode) => {
    setMode(m);
    setInput("");
    setError(null);
    setActiveSuggestions([]);
  };

  const quickPrompts = mode === "oracle"
    ? ORACLE_PROMPTS.slice(0, 4)
    : mode === "rage"
      ? RAGE_PROMPTS.slice(0, 4)
      : getQuickPrompts(childName, en).slice(0, 4);

  const hasRageExchange = histories.rage.filter(m => m.role === "user").length > 0;
  const accentColor = `hsl(var(${cfg.accentVar}))`;

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)] md:h-[calc(100vh-5rem)]">

      {/* Header */}
      <div className="section-fade-in px-1 pb-3">
        <h1 className="text-[1.9rem] font-normal">{t("chat.title")}</h1>

        {/* Mode tabs */}
        <div className="flex gap-1.5 mt-2.5 p-1 rounded-2xl" style={{ background: "hsl(var(--stone-lighter))" }}>
          {(Object.keys(MODE_CONFIG) as ChatMode[]).map(m => (
            <button
              key={m}
              onClick={() => handleModeSwitch(m)}
              className={cn(
                "flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-[0.68rem] font-medium transition-all",
                mode === m
                  ? "bg-background shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
              style={mode === m ? { color: `hsl(var(${MODE_CONFIG[m].accentVar}))` } : {}}
            >
              {MODE_CONFIG[m].icon}
              <span className="hidden sm:inline">{MODE_CONFIG[m].label}</span>
            </button>
          ))}
        </div>

        {/* Mode subtitle */}
        <p className="text-[0.6rem] tracking-[0.12em] uppercase mt-2" style={{ color: accentColor }}>
          {cfg.subtitle}
        </p>
      </div>

      {/* Rage room privacy banner */}
      {mode === "rage" && (
        <div className="mx-1 mb-2 rounded-xl px-3 py-2 flex items-center gap-2 section-fade-in"
          style={{ background: "hsl(var(--clay-light) / 0.5)", border: "1px solid hsl(var(--clay) / 0.2)" }}>
          <Lock className="w-3.5 h-3.5 shrink-0" style={{ color: "hsl(var(--clay))" }} />
          <p className="text-[0.68rem] text-muted-foreground">Privat rum — intet her deles med din partner</p>
        </div>
      )}

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-3 px-1 pb-4">
        {messages.length === 0 && (
          <div className="section-fade-in space-y-4 mt-2">
            <div className="card-soft text-center py-6">
              <div className="w-14 h-14 rounded-full mx-auto mb-3 flex items-center justify-center text-2xl"
                style={{ background: `hsl(var(${cfg.bgVar}))` }}>
                {mode === "normal" && <Sparkles className="w-7 h-7" style={{ color: accentColor }} />}
                {mode === "oracle" && "🌿"}
                {mode === "rage" && "🔒"}
              </div>
              <p className="text-[0.92rem] font-medium mb-1">
                {mode === "normal" ? t("chat.askAbout") : cfg.label}
              </p>
              <p className="text-[0.7rem] text-muted-foreground max-w-xs mx-auto leading-relaxed">
                {cfg.subtitle}
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-[0.6rem] tracking-[0.14em] uppercase text-muted-foreground">
                {mode === "rage" ? "Eller start herfra" : t("chat.suggestionsForYou")}
              </p>
              <div className="flex flex-wrap gap-2">
                {quickPrompts.map((p, i) => (
                  <button key={i} onClick={() => send(p)}
                    className="px-3.5 py-2 rounded-2xl text-[0.75rem] border transition-all active:scale-95 text-left"
                    style={{ borderColor: `hsl(var(${cfg.accentVar}) / 0.3)`, background: `hsl(var(${cfg.bgVar}) / 0.3)` }}>
                    {p}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 ${msg.role === "user" ? "rounded-br-md" : "rounded-bl-md"}`}
              style={{
                background: msg.role === "user"
                  ? accentColor
                  : msg.synthetic ? `hsl(var(${cfg.bgVar}) / 0.4)` : "hsl(var(--warm-white))",
                color: msg.role === "user" ? "white" : undefined,
                border: msg.role === "assistant" ? `1px solid hsl(var(${cfg.accentVar}) / 0.15)` : undefined,
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

        {/* Rage room: formulate for partner button */}
        {mode === "rage" && hasRageExchange && !isLoading && (
          <div className="flex justify-center pt-1">
            <button
              onClick={formulateForPartner}
              disabled={isFormulating}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-[0.72rem] font-medium border transition-all active:scale-[0.97] disabled:opacity-50"
              style={{ borderColor: "hsl(var(--clay) / 0.4)", background: "hsl(var(--clay-light) / 0.4)", color: "hsl(var(--clay))" }}
            >
              {isFormulating ? "Formulerer..." : "Formuler det til din partner →"}
            </button>
          </div>
        )}

        {activeSuggestions.length > 0 && !isLoading && (
          <div className="flex flex-wrap gap-2 pt-1 pb-2">
            {activeSuggestions.map((s, i) => (
              <button key={i} onClick={() => send(s)}
                className="px-3.5 py-2.5 rounded-2xl text-[0.75rem] border transition-all active:scale-95 text-left"
                style={{ borderColor: `hsl(var(${cfg.accentVar}) / 0.3)`, background: `hsl(var(${cfg.bgVar}) / 0.15)` }}>
                {s}
              </button>
            ))}
          </div>
        )}

        {(isLoading || isFormulating) && messages[messages.length - 1]?.role !== "assistant" && (
          <div className="flex justify-start">
            <div className="rounded-2xl rounded-bl-md px-4 py-3"
              style={{ background: "hsl(var(--warm-white))", border: `1px solid hsl(var(${cfg.accentVar}) / 0.15)` }}>
              <div className="flex gap-1.5">
                {[0, 150, 300].map(delay => (
                  <span key={delay} className="w-2 h-2 rounded-full animate-bounce"
                    style={{ background: accentColor, animationDelay: `${delay}ms` }} />
                ))}
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
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder={cfg.placeholder}
            disabled={isLoading}
            className="flex-1 rounded-2xl border px-4 py-3 text-[0.85rem] focus:outline-none transition-colors disabled:opacity-50"
            style={{ borderColor: `hsl(var(${cfg.accentVar}) / 0.4)`, background: "hsl(var(--warm-white))" }}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="w-11 h-11 rounded-xl flex items-center justify-center transition-all active:scale-90 disabled:opacity-30"
            style={{ background: accentColor, color: "white" }}
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
