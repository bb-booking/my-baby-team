import { useFamily } from "@/context/FamilyContext";
import { Heart, MessageCircle, Send } from "lucide-react";
import { Link } from "react-router-dom";

// ── Mor Recovery Support — based on birth type and time ──
export function MorRecoveryCard() {
  const { profile, babyAgeWeeks } = useFamily();

  const tips = getRecoveryTips(babyAgeWeeks, profile.morHealth?.birthType, profile.morHealth?.complications);

  if (!tips) return null;

  return (
    <div className="card-soft section-fade-in">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "hsl(var(--clay-light))" }}>
          <Heart className="w-3.5 h-3.5" style={{ color: "hsl(var(--clay))" }} />
        </div>
        <p className="text-[0.55rem] tracking-[0.14em] uppercase text-muted-foreground">RECOVERY</p>
      </div>
      <p className="text-[0.88rem] font-medium mb-1">{tips.title}</p>
      <p className="text-[0.75rem] text-muted-foreground leading-relaxed">{tips.body}</p>
      <p className="text-[0.68rem] mt-2 italic" style={{ color: "hsl(var(--clay))" }}>{tips.reassurance}</p>
    </div>
  );
}

function getRecoveryTips(ageWeeks: number, birthType?: string, complications?: string[]) {
  if (ageWeeks > 16) return null; // Recovery tips fade after 4 months

  if (birthType === "kejsersnit") {
    if (ageWeeks < 2) return {
      title: "Din krop heler fra en operation",
      body: "Undgå at løfte tungt. Bevæg dig langsomt og lyt til kroppen.",
      reassurance: "Det er helt normalt at det tager tid. Du er modig.",
    };
    if (ageWeeks < 6) return {
      title: "Arret heler — vær tålmodig",
      body: "Numhed og stikken er normalt. Undgå stramme bukser.",
      reassurance: "Kroppen ved hvad den laver. Giv den tid.",
    };
    return {
      title: "Recovery tager 12+ uger efter kejsersnit",
      body: "Start forsigtig med bevægelse. Bækkenbunden har også brug for opmærksomhed.",
      reassurance: "Du gør det fantastisk — også selvom det ikke føles sådan.",
    };
  }

  if (ageWeeks < 2) return {
    title: "Din krop arbejder hårdt på at hele",
    body: "Blødning, ømhed og træthed er helt normalt. Hvil så meget du kan.",
    reassurance: "Det er okay at have blandede følelser. Alt er tilladt.",
  };

  if (ageWeeks < 6) return {
    title: "Recovery tager tid",
    body: "Bækkenbundsøvelser, hvile og god kost. Ingen haster.",
    reassurance: "Sammenlign dig ikke med andre. Din krop, dit tempo.",
  };

  if (ageWeeks < 12) return {
    title: "Du begynder at finde rytmen",
    body: "Kroppen finder langsomt tilbage. Vær tålmodig med dig selv.",
    reassurance: "Du gør det bedre end du tror. Seriøst.",
  };

  return null;
}

// ── Mor Auto Support — triggered suggestions ──
export function MorAutoSupport() {
  const { farName, babyAgeWeeks, isOnLeave, profile } = useFamily();
  const onLeave = isOnLeave("mor");
  const hour = new Date().getHours();

  let suggestion: { emoji: string; text: string; detail: string } | null = null;

  // Afternoon slump for leave parent
  if (onLeave && hour >= 13 && hour <= 16) {
    suggestion = {
      emoji: "☕",
      text: "Du har klaret det hele formiddagen",
      detail: "God tid for en pause. Selv 15 minutter gør en forskel.",
    };
  }

  // Evening — trigger partner help
  if (hour >= 17 && hour <= 19) {
    suggestion = {
      emoji: "🤝",
      text: `${farName} kan tage over nu`,
      detail: "Du behøver ikke bede om det. Du har fortjent pausen.",
    };
  }

  if (!suggestion) return null;

  return (
    <div className="rounded-2xl px-4 py-3 section-fade-in" style={{
      background: "hsl(var(--clay) / 0.06)",
      border: "1px solid hsl(var(--clay) / 0.1)",
    }}>
      <div className="flex items-start gap-3">
        <span className="text-lg">{suggestion.emoji}</span>
        <div>
          <p className="text-[0.82rem] font-medium">{suggestion.text}</p>
          <p className="text-[0.68rem] text-muted-foreground">{suggestion.detail}</p>
        </div>
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
      { title: "Det er normalt at det gør ondt i starten", body: "Stillinger og sugeteknik tager tid. Bed sundhedsplejersken om hjælp." },
      { title: "Hyppig amning = god mælkeproduktion", body: "Babyer ammer ofte — det er tegn på sund udvikling." },
    ],
    flaske: [
      { title: "Flaske er et godt valg", body: "Det vigtigste er at baby er mæt og tryg. Øjenkontakt under flaske styrker jeres bånd." },
      { title: "Del fladerne", body: "En stor fordel ved flaske er at begge forældre kan give mad." },
    ],
    begge: [
      { title: "Kombi-feeding er fleksibelt", body: "Kombination af bryst og flaske giver frihed. Der er ingen 'forkert' måde." },
      { title: "Vær tålmodig med overgangen", body: "Nogle babyer har brug for tid til at vænne sig." },
    ],
  };

  const currentTips = tips[method] || tips.amning;
  const tip = currentTips[babyAgeWeeks < 4 ? 0 : 1] || currentTips[0];

  return (
    <div className="card-soft section-fade-in">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-base">🤱</span>
        <p className="text-[0.55rem] tracking-[0.14em] uppercase text-muted-foreground">
          {method === "amning" ? "AMNING" : method === "flaske" ? "FLASKEMAD" : "KOMBI-FEEDING"}
        </p>
      </div>
      <p className="text-[0.88rem] font-medium mb-1">{tip.title}</p>
      <p className="text-[0.75rem] text-muted-foreground leading-relaxed">{tip.body}</p>
    </div>
  );
}

// ── Mor Micro-support (rotating validating messages) ──
export function MorMicroSupport() {
  const messages = [
    "Du gør det godt — også når det ikke føles sådan 💛",
    "Det er okay at være træt. Det er en hård fase.",
    "Du behøver ikke have styr på alt. Bare vær der.",
    "Små skridt tæller. Du er en fantastisk mor.",
    "Tag imod hjælp — det er styrke, ikke svaghed.",
  ];

  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
  const message = messages[dayOfYear % messages.length];

  return (
    <div
      className="rounded-2xl px-5 py-4 text-center section-fade-in"
      style={{
        background: "linear-gradient(135deg, hsl(var(--clay) / 0.08), hsl(var(--clay) / 0.03))",
        border: "1px solid hsl(var(--clay) / 0.12)",
      }}
    >
      <p className="text-[0.88rem] leading-relaxed" style={{ color: "hsl(var(--bark))" }}>
        {message}
      </p>
    </div>
  );
}
