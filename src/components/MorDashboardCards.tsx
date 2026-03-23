import { useFamily } from "@/context/FamilyContext";
import { Heart, Stethoscope, Brain, MessageCircle, Send } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";

// ── Mor Recovery Check-in ──
export function MorRecoveryCard() {
  const { profile, babyAgeWeeks } = useFamily();
  const [checkedIn, setCheckedIn] = useState(false);
  const [mood, setMood] = useState<string | null>(null);

  const moods = [
    { emoji: "😊", label: "Godt" },
    { emoji: "😐", label: "Okay" },
    { emoji: "😔", label: "Svært" },
    { emoji: "😢", label: "Hårdt" },
  ];

  if (checkedIn) {
    const responses: Record<string, string> = {
      "Godt": "Skønt at høre! Husk at nyde de gode øjeblikke 💛",
      "Okay": "Det er helt fint. Én dag ad gangen — du klarer det.",
      "Svært": "Tak fordi du er ærlig. Du gør det bedre end du tror. Tal med nogen du stoler på.",
      "Hårdt": "Det er modigt at mærke efter. Du er ikke alene — ræk ud til sundhedsplejersken eller din partner.",
    };

    return (
      <div className="card-soft section-fade-in">
        <div className="flex items-start gap-3">
          <span className="text-xl">💛</span>
          <div>
            <p className="text-[0.9rem] font-medium mb-1">Tak fordi du deler</p>
            <p className="text-[0.78rem] text-muted-foreground leading-relaxed">
              {responses[mood || "Okay"]}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const bodyMessage = profile.morHealth?.birthType === "kejsersnit"
    ? "Kejsersnit kræver ekstra tid til heling. Vær tålmodig med dig selv."
    : babyAgeWeeks < 2
    ? "Din krop arbejder hårdt på at hele. Hvordan føler du dig?"
    : babyAgeWeeks < 6
    ? "Recovery tager tid. Det er okay at have blandede følelser."
    : "Hvordan har du det i dag?";

  return (
    <div className="card-soft section-fade-in" style={{ animationDelay: "60ms" }}>
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "hsl(var(--clay-light))" }}>
          <Heart className="w-4 h-4" style={{ color: "hsl(var(--clay))" }} />
        </div>
        <div>
          <p className="text-[0.6rem] tracking-[0.14em] uppercase text-muted-foreground">CHECK-IN</p>
          <p className="text-[0.9rem] font-medium">{bodyMessage}</p>
        </div>
      </div>
      <div className="flex gap-2">
        {moods.map(m => (
          <button
            key={m.label}
            onClick={() => { setMood(m.label); setCheckedIn(true); }}
            className="flex-1 flex flex-col items-center gap-1 py-3 rounded-xl transition-all active:scale-95 hover:shadow-sm"
            style={{ background: "hsl(var(--clay) / 0.06)", border: "1px solid hsl(var(--clay) / 0.12)" }}
          >
            <span className="text-xl">{m.emoji}</span>
            <span className="text-[0.62rem] text-muted-foreground">{m.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Mor Support Nudges ──
export function MorSupportCard() {
  const { farName, babyAgeWeeks } = useFamily();

  const suggestions = babyAgeWeeks < 4
    ? [
        { emoji: "🛁", text: `Foreslå at ${farName} tager badet i aften` },
        { emoji: "☕", text: "Tag 10 minutter for dig selv med en kop te" },
        { emoji: "💬", text: `Send en opgave til ${farName}`, link: "/sammen" },
      ]
    : babyAgeWeeks < 12
    ? [
        { emoji: "🚶‍♀️", text: "Gå en tur alene — du har fortjent det" },
        { emoji: "📋", text: `Se opgavefordelingen med ${farName}`, link: "/sammen" },
        { emoji: "💤", text: "Prioritér søvn over husarbejde" },
      ]
    : [
        { emoji: "🧘", text: "5 minutters ro mens baby sover" },
        { emoji: "👫", text: `Planlæg kvalitetstid med ${farName}`, link: "/sammen" },
        { emoji: "📝", text: "Skriv én ting du er glad for i dag" },
      ];

  return (
    <div className="card-soft section-fade-in" style={{ animationDelay: "120ms" }}>
      <p className="text-[0.6rem] tracking-[0.14em] uppercase text-muted-foreground mb-2">💛 STØTTE TIL DIG</p>
      <div className="space-y-2">
        {suggestions.map((s, i) => (
          s.link ? (
            <Link key={i} to={s.link} className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all hover:shadow-sm active:scale-[0.98]"
              style={{ background: "hsl(var(--clay) / 0.06)", border: "1px solid hsl(var(--clay) / 0.1)" }}>
              <span className="text-base">{s.emoji}</span>
              <span className="text-[0.78rem] flex-1">{s.text}</span>
              <Send className="w-3.5 h-3.5 text-muted-foreground" />
            </Link>
          ) : (
            <div key={i} className="flex items-center gap-3 px-3 py-2.5 rounded-xl"
              style={{ background: "hsl(var(--clay) / 0.06)" }}>
              <span className="text-base">{s.emoji}</span>
              <span className="text-[0.78rem]">{s.text}</span>
            </div>
          )
        ))}
      </div>
    </div>
  );
}

// ── Mor Feeding Support ──
export function MorFeedingCard() {
  const { profile, babyAgeWeeks } = useFamily();
  const method = profile.morHealth?.feedingMethod || "amning";

  const tips: Record<string, { title: string; body: string }[]> = {
    amning: [
      { title: "Det er normalt at det gør ondt i starten", body: "Stillinger og sugeteknik tager tid at lære. Bed sundhedsplejersken om hjælp." },
      { title: "Hyppig amning = god mælkeproduktion", body: "Babyer ammer ofte i starten — det er tegn på sund udvikling, ikke at du ikke har nok mælk." },
    ],
    flaske: [
      { title: "Flaske er et godt valg", body: "Det vigtigste er at baby er mæt og tryg. Øjenkontakt under flaske styrker jeres bånd." },
      { title: "Del fladerne", body: "En stor fordel ved flaske er at begge forældre kan give mad — brug det!" },
    ],
    begge: [
      { title: "Kombi-feeding er fleksibelt", body: "Kombination af bryst og flaske giver frihed. Der er ingen 'forkert' måde." },
      { title: "Vær tålmodig med overgangen", body: "Nogle babyer har brug for tid til at vænne sig til begge dele." },
    ],
  };

  const currentTips = tips[method] || tips.amning;
  const tip = currentTips[babyAgeWeeks < 4 ? 0 : 1] || currentTips[0];

  return (
    <div className="card-soft section-fade-in" style={{ animationDelay: "180ms" }}>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-base">🤱</span>
        <p className="text-[0.6rem] tracking-[0.14em] uppercase text-muted-foreground">
          {method === "amning" ? "AMNING" : method === "flaske" ? "FLASKEMAD" : "KOMBI-FEEDING"}
        </p>
      </div>
      <p className="text-[0.88rem] font-medium mb-1">{tip.title}</p>
      <p className="text-[0.75rem] text-muted-foreground leading-relaxed">{tip.body}</p>
    </div>
  );
}

// ── Mor Micro-support (validating messages) ──
export function MorMicroSupport() {
  const { babyAgeWeeks } = useFamily();

  const messages = [
    "Du gør det godt — også når det ikke føles sådan 💛",
    "Det er okay at være træt. Det er en hård fase.",
    "Du behøver ikke have styr på alt. Bare vær der.",
    "Små skridt tæller. Du er en fantastisk mor.",
    "Det er normalt at tvivle. Det betyder du bekymrer dig.",
    "Tag imod hjælp — det er styrke, ikke svaghed.",
  ];

  // Rotate based on day of year
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
  const message = messages[dayOfYear % messages.length];

  return (
    <div
      className="rounded-2xl px-5 py-4 text-center section-fade-in"
      style={{
        background: "linear-gradient(135deg, hsl(var(--clay) / 0.08), hsl(var(--clay) / 0.03))",
        border: "1px solid hsl(var(--clay) / 0.12)",
        animationDelay: "240ms",
      }}
    >
      <p className="text-[0.88rem] leading-relaxed" style={{ color: "hsl(var(--bark))" }}>
        {message}
      </p>
    </div>
  );
}
