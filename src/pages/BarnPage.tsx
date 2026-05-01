import { useState, useRef, useEffect } from "react";
import { useFamily } from "@/context/FamilyContext";
import { useTranslation } from "react-i18next";
import { getBabyInsight, developmentalLeaps, getLeapStatus, getActiveLeap, getBabySize } from "@/lib/phaseData";
import { Baby as BabyIcon, Check, ChevronDown, ChevronUp, Smile, Hand, Moon, Zap, Bookmark, Share2, ChevronRight, Heart, Shield, X } from "lucide-react";
import { cn } from "@/lib/utils";
import BabyMeasurements from "@/components/BabyMeasurements";
import { Link, useNavigate } from "react-router-dom";

export default function BarnPage() {
  const { profile, currentWeek, babyAgeWeeks, babyAgeMonths } = useFamily();

  if (profile.phase === "pregnant") return <PregnantBarnPage week={currentWeek} />;
  return <BornBarnPage ageWeeks={babyAgeWeeks} ageMonths={babyAgeMonths} />;
}

// ── Data helpers ───────────────────────────────────────────────────────────────
function getDevCards(week: number) {
  if (week < 10) return [
    { icon: "🧠", title: "Hjernen dannes", desc: "Hjernens grundstruktur udvikles i lynende fart." },
    { icon: "❤️", title: "Hjertet slår", desc: "Babys hjerte slår allerede ca. 150 gange i minuttet." },
    { icon: "👁️", title: "Øjne & ører", desc: "De første anlæg til øjne og ører begynder at forme sig." },
    { icon: "🦴", title: "Knogler dannes", desc: "Skelettet begynder at erstatte bruskvæv med knogle." },
  ];
  if (week < 14) return [
    { icon: "🧠", title: "Nervesystem", desc: "Nerve-forbindelser dannes i stor fart i hjernen." },
    { icon: "🤲", title: "Fingre & tæer", desc: "Babys fingre og tæer er ved at forme sig tydeligt." },
    { icon: "😊", title: "Ansigtsudtryk", desc: "Baby kan lave grimasser og røre ved sit ansigt." },
    { icon: "🫁", title: "Organer", desc: "Lever, nyrer og lunger er alle i fuld gang med at udvikle sig." },
  ];
  if (week < 20) return [
    { icon: "🧠", title: "Hjernen udvikles hurtigt", desc: "Forbindelser i hjernen dannes i stor fart, og din baby reagerer nu på sanseindtryk." },
    { icon: "👂", title: "Hørelsen styrkes", desc: "Din baby kan høre lyde udefra – inkl. din stemme og hjerteslag." },
    { icon: "💪", title: "Små bevægelser", desc: "Muskler og led trænes hver dag, selvom du måske ikke mærker det endnu." },
    { icon: "🫀", title: "Nyrerne arbejder", desc: "Nyrerne producerer urin, som din baby slipper ud i fostervandet." },
  ];
  if (week < 28) return [
    { icon: "👂", title: "Hører tydeligt", desc: "Baby reagerer på musik og din stemme — syng og tal til maven." },
    { icon: "👁️", title: "Øjnene åbner", desc: "Baby begynder at åbne og lukke øjnene og reagere på lys." },
    { icon: "💤", title: "Søvnrytme", desc: "Baby har en regelmæssig søvnrytme med aktive og rolige perioder." },
    { icon: "🫁", title: "Lunger modnes", desc: "Lungerne er ved at producere surfaktant, der er nødvendigt ved fødslen." },
  ];
  if (week < 36) return [
    { icon: "🧠", title: "Hjernen færdiggøres", desc: "De sidste hjerneforbindelser etableres — en intens periode." },
    { icon: "💪", title: "Tager på i vægt", desc: "Baby er næsten fuldt udviklet og fokuserer nu på at vokse sig stærk." },
    { icon: "🔄", title: "Vender sig", desc: "Baby drejer sig langsomt med hovedet nedad klar til fødslen." },
    { icon: "👁️", title: "Ser og drømmer", desc: "Baby kan følge lys og har REM-søvn — drømmer måske allerede." },
  ];
  return [
    { icon: "✅", title: "Fuldt udviklet", desc: "Alle organer er fuldt udviklede og klar til livet udenfor." },
    { icon: "⚖️", title: "Tager på", desc: "Baby fokuserer på at tage de sidste gram på." },
    { icon: "🎯", title: "Klar til verden", desc: "Baby kan komme til verden enhver dag nu." },
    { icon: "💓", title: "Stærkt hjerte", desc: "Hjertet pumper ca. 500 liter blod om dagen." },
  ];
}

function getBodyPills(week: number): { icon: string; label: string }[] {
  if (week < 12) return [
    { icon: "😴", label: "Træthed" },
    { icon: "🤢", label: "Kvalme" },
    { icon: "💧", label: "Øget vandladning" },
    { icon: "🌸", label: "Ømme bryster" },
  ];
  if (week < 20) return [
    { icon: "⚡", label: "Mere energi" },
    { icon: "🔵", label: "Rundere mave" },
    { icon: "😊", label: "Forbedret humør" },
    { icon: "💧", label: "Ømme bryster" },
  ];
  if (week < 28) return [
    { icon: "👶", label: "Mærker spark" },
    { icon: "🔥", label: "Halsbrand" },
    { icon: "🦶", label: "Hævede ankler" },
    { icon: "🌙", label: "Søvnproblemer" },
  ];
  if (week < 36) return [
    { icon: "🤰", label: "Tung mave" },
    { icon: "😮‍💨", label: "Åndenød" },
    { icon: "🚽", label: "Hyppig toilet" },
    { icon: "🌀", label: "Braxton Hicks" },
  ];
  return [
    { icon: "🌀", label: "Øveveer" },
    { icon: "🪺", label: "Nesting" },
    { icon: "😴", label: "Træthed" },
    { icon: "⚡", label: "Spænding" },
  ];
}

function getBodyDesc(week: number): { text: string; tip: string } {
  if (week < 12) return {
    text: "De første uger kan føles overvældende. Kvalme, træthed og ømme bryster er meget almindelige og er tegn på, at graviditeten udvikler sig normalt.",
    tip: "Spis lidt og ofte for at holde blodsukkeret stabilt — det hjælper mod kvalme.",
  };
  if (week < 20) return {
    text: "Det er normalt at føle sig mere energisk i dette trimester. Din mave vokser, og du kan opleve nye små spark i løbet af ugen.",
    tip: "Lyt til din krop – hvile og små pauser er stadig vigtige.",
  };
  if (week < 28) return {
    text: "Baby sparker og bevæger sig nu regelmæssigt. Halsbrand kan tiltage da livmoderen trykker mod mavesækken.",
    tip: "Spis mindre portioner mere hyppigt og løft benene når du sidder for at modvirke hævede ankler.",
  };
  if (week < 36) return {
    text: "Du er i tredje trimester. Braxton Hicks-sammentrækninger er normale og harmløse. Baby er nu stor nok til at du kan mærke tydelige spark.",
    tip: "Sov på venstre side — det giver det bedste blodomløb til placenta.",
  };
  return {
    text: "Du er næsten ved termin. Baby kan komme når som helst de næste uger. Nesting-instinktet er normalt.",
    tip: "Hvil når du kan — du får brug for energien snart.",
  };
}

function getSymptoms(week: number): string[] {
  if (week < 12) return ["Kvalme og opkast", "Ekstrem træthed", "Ømme bryster", "Hyppig vandladning"];
  if (week < 20) return ["Oppustethed", "Rygsmerter", "Hyppig vandladning", "Svært ved at sove"];
  if (week < 28) return ["Halsbrand", "Hævede ankler", "Ryg- og bækkensmerter", "Søvnproblemer"];
  if (week < 36) return ["Åndenød", "Hyppig vandladning", "Braxton Hicks", "Træthed"];
  return ["Stærke øveveer", "Bækkentryk", "Nesting-trang", "Søvnproblemer"];
}

function getNutritionTips(week: number): { icon: string; text: string }[] {
  if (week < 14) return [
    { icon: "🥦", text: "Spis folsyrerigt: grønne blade, linser, nødder" },
    { icon: "🥛", text: "Kalk fra mælkeprodukter og brocoli" },
    { icon: "💧", text: "Drik rigeligt med vand — 1,5–2 liter dagligt" },
  ];
  if (week < 28) return [
    { icon: "🥩", text: "Spis jernrige fødevarer (fx kød, linser, spinat)" },
    { icon: "🌾", text: "Husk fuldkorn og fibre" },
    { icon: "💧", text: "Drik rigeligt med vand" },
  ];
  return [
    { icon: "🐟", text: "Omega-3 fra fisk eller tilskud støtter babys hjerne" },
    { icon: "🥛", text: "Kalk og D-vitamin er ekstra vigtigt nu" },
    { icon: "🥗", text: "Små måltider hyppigt hjælper mod halsbrand" },
  ];
}

function getAffirmation(week: number): string {
  if (week < 12) return "Det er helt normalt at have blandede følelser. Din krop gør et fantastisk arbejde. 🌿";
  if (week < 20) return "Det er helt normalt at føle både glæde og bekymring. Du gør det godt. 🌿";
  if (week < 28) return "Halvvejs! I gør det fantastisk. Jeres barn er allerede den heldigste baby i verden. 💚";
  if (week < 36) return "I er stærkere end I tror. Hver dag bringer jer tættere på det store møde. 🌿";
  return "I er klar — kroppen og barnet er klar. Stol på jer selv. 🌿";
}

function getWeekRecommendations(week: number): { icon: string; title: string; sub: string }[] {
  if (week < 12) return [
    { icon: "📅", title: "Book 1. trimester-scanning", sub: "Normalt uge 11–14" },
    { icon: "💊", title: "Start folsyre og D-vitamin", sub: "Vigtigt fra dag ét" },
    { icon: "🏥", title: "Tilmeld dig jordemoder", sub: "Jo tidligere jo bedre" },
  ];
  if (week < 20) return [
    { icon: "📅", title: "Planlæg næste lægebesøg", sub: "Få styr på dato og spørgsmål" },
    { icon: "📖", title: "Læs om fødselsforberedelse", sub: "Bliv klogere – i jeres tempo" },
    { icon: "💬", title: "Tal om forventninger", sub: "Styrk jeres fællesskab" },
  ];
  if (week < 28) return [
    { icon: "🎓", title: "Tilmeld fødselsforberedelse", sub: "Mange hold er hurtigt fulde" },
    { icon: "📷", title: "Book halvvejs-scanning", sub: "Normalt uge 18–20" },
    { icon: "🛍️", title: "Begynd indkøb af basiskøb", sub: "Barneseng, autostol, klapvogn" },
  ];
  if (week < 36) return [
    { icon: "🧳", title: "Pak hospitalstasken", sub: "Det er aldrig for tidligt" },
    { icon: "📋", title: "Lav fødselsplan", sub: "Del den med din jordemoder" },
    { icon: "🏠", title: "Forbered hjemmet", sub: "Klar plads til barneseng" },
  ];
  return [
    { icon: "📞", title: "Kend tegn på fødsel", sub: "Veer, vandafgang, blødning" },
    { icon: "🚗", title: "Kør-ruten til hospitalet", sub: "Øv den med din partner" },
    { icon: "😴", title: "Hvil så meget du kan", sub: "Du får brug for kræfterne" },
  ];
}

function getTrimesterLabel(week: number): string {
  if (week <= 12) return "1. trimester (uge 1-12)";
  if (week <= 27) return "2. trimester (uge 13-27)";
  return "3. trimester (uge 28-42)";
}

// ── Baby Animation Modal ───────────────────────────────────────────────────────
function getAnimConfig(week: number) {
  if (week < 10) return {
    bg: "linear-gradient(160deg, #0a1a12 0%, #0f2318 100%)",
    ringColor: "hsl(154 40% 30%)",
    facts: ["Hjertet begynder at slå", "Alle vitale organer dannes", "Størrelse: en hindbær"],
    label: "Embryo — uge " + week,
  };
  if (week < 14) return {
    bg: "linear-gradient(160deg, #0d1a1f 0%, #102030 100%)",
    ringColor: "hsl(200 40% 30%)",
    facts: ["Fingre og tæer formes", "Hjernen udvikler sig hurtigt", "Baby kan allerede gabe"],
    label: "Fosterstadiet — uge " + week,
  };
  if (week < 20) return {
    bg: "linear-gradient(160deg, #1a140d 0%, #251c0f 100%)",
    ringColor: "hsl(30 40% 35%)",
    facts: ["Babys sanser vågner", "Bevægelser begynder", "Du kan snart mærke dem"],
    label: "2. trimester — uge " + week,
  };
  if (week < 28) return {
    bg: "linear-gradient(160deg, #0f1a0f 0%, #162416 100%)",
    ringColor: "hsl(140 35% 28%)",
    facts: ["Baby hører din stemme", "Øjnene åbner og lukker", "Regelmæssig søvnrytme"],
    label: "Halvvejs — uge " + week,
  };
  if (week < 36) return {
    bg: "linear-gradient(160deg, #1a0f14 0%, #24101c 100%)",
    ringColor: "hsl(330 30% 30%)",
    facts: ["Baby er næsten klar", "Vender sig med hovedet nedad", "Hjernens finale forbindelser skabes"],
    label: "3. trimester — uge " + week,
  };
  return {
    bg: "linear-gradient(160deg, #0d150d 0%, #131f13 100%)",
    ringColor: "hsl(120 30% 25%)",
    facts: ["Fuldt udviklet", "Baby kan komme hvornår som helst", "I er klar — begge to"],
    label: "Terminen nærmer sig — uge " + week,
  };
}

function BabyAnimationModal({ week, size, onClose }: { week: number; size: ReturnType<typeof getBabySize>; onClose: () => void }) {
  const [factIdx, setFactIdx] = useState(0);
  const config = getAnimConfig(week);

  useEffect(() => {
    const id = setInterval(() => setFactIdx(i => (i + 1) % config.facts.length), 2800);
    return () => clearInterval(id);
  }, [config.facts.length]);

  // Scale emoji size by week
  const emojiSize = week < 10 ? "4rem" : week < 20 ? "5.5rem" : week < 28 ? "7rem" : week < 36 ? "8.5rem" : "10rem";

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center"
      style={{ background: config.bg }}
      onClick={onClose}
    >
      <style>{`
        @keyframes melo-float {
          0%, 100% { transform: translateY(0px) rotate(-2deg); }
          50% { transform: translateY(-18px) rotate(2deg); }
        }
        @keyframes melo-ring-pulse {
          0% { transform: scale(1); opacity: 0.5; }
          100% { transform: scale(2.2); opacity: 0; }
        }
        @keyframes melo-heartbeat {
          0%, 100% { transform: scale(1); }
          14% { transform: scale(1.12); }
          28% { transform: scale(1); }
          42% { transform: scale(1.06); }
          56% { transform: scale(1); }
        }
        @keyframes melo-fact-in {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* Close */}
      <button
        onClick={onClose}
        className="absolute top-12 right-6 w-9 h-9 rounded-full flex items-center justify-center"
        style={{ background: "rgba(255,255,255,0.12)" }}
      >
        <X className="w-4 h-4 text-white" />
      </button>

      {/* Label */}
      <p className="text-[0.7rem] tracking-[0.18em] uppercase font-medium mb-10" style={{ color: "rgba(255,255,255,0.45)" }}>
        {config.label}
      </p>

      {/* Rings + baby */}
      <div className="relative flex items-center justify-center" style={{ width: 240, height: 240 }}>
        {/* Outer pulse rings */}
        {[0, 1].map(i => (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              width: 160, height: 160,
              border: `1.5px solid ${config.ringColor}`,
              animation: `melo-ring-pulse 2.4s ease-out ${i * 1.2}s infinite`,
              top: "50%", left: "50%",
              transform: "translate(-50%, -50%)",
            }}
          />
        ))}
        {/* Static ring */}
        <div className="absolute rounded-full" style={{
          width: 160, height: 160,
          border: `1px solid ${config.ringColor}`,
          opacity: 0.25,
          top: "50%", left: "50%",
          transform: "translate(-50%, -50%)",
        }} />
        {/* Heartbeat circle */}
        <div
          className="absolute rounded-full"
          style={{
            width: 140, height: 140,
            background: "rgba(255,255,255,0.04)",
            animation: "melo-heartbeat 1.5s ease-in-out infinite",
            top: "50%", left: "50%",
            transform: "translate(-50%, -50%)",
          }}
        />
        {/* Floating baby emoji */}
        <div style={{ animation: "melo-float 4s ease-in-out infinite", fontSize: emojiSize, lineHeight: 1 }}>
          {size.emoji}
        </div>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-6 mt-10 mb-8">
        <div className="text-center">
          <p className="text-[0.6rem] tracking-widest uppercase" style={{ color: "rgba(255,255,255,0.4)" }}>Længde</p>
          <p className="text-white font-semibold text-[1rem] mt-0.5">ca. {size.lengthCm} cm</p>
        </div>
        <div className="w-px h-8" style={{ background: "rgba(255,255,255,0.15)" }} />
        <div className="text-center">
          <p className="text-[0.6rem] tracking-widest uppercase" style={{ color: "rgba(255,255,255,0.4)" }}>Vægt</p>
          <p className="text-white font-semibold text-[1rem] mt-0.5">ca. {size.weightG} g</p>
        </div>
        <div className="w-px h-8" style={{ background: "rgba(255,255,255,0.15)" }} />
        <div className="text-center">
          <p className="text-[0.6rem] tracking-widest uppercase" style={{ color: "rgba(255,255,255,0.4)" }}>Størrelse</p>
          <p className="text-white font-semibold text-[1rem] mt-0.5">{size.label}</p>
        </div>
      </div>

      {/* Cycling fact */}
      <div className="px-8 text-center" style={{ minHeight: 48 }}>
        <p
          key={factIdx}
          className="text-white/80 text-[0.9rem] leading-relaxed font-serif"
          style={{ animation: "melo-fact-in 0.5s ease forwards" }}
        >
          {config.facts[factIdx]}
        </p>
        <div className="flex justify-center gap-1.5 mt-4">
          {config.facts.map((_, i) => (
            <div key={i} className="rounded-full transition-all" style={{
              width: i === factIdx ? 16 : 5, height: 5,
              background: i === factIdx ? "rgba(255,255,255,0.8)" : "rgba(255,255,255,0.25)",
            }} />
          ))}
        </div>
      </div>

      {/* Tap to close hint */}
      <p className="absolute bottom-10 text-[0.65rem] tracking-widest uppercase" style={{ color: "rgba(255,255,255,0.25)" }}>
        Tryk hvor som helst for at lukke
      </p>
    </div>
  );
}

// ── Pregnant BarnPage ──────────────────────────────────────────────────────────
function PregnantBarnPage({ week: currentWeek }: { week: number }) {
  const [selectedWeek, setSelectedWeek] = useState(currentWeek);
  const [showAnimation, setShowAnimation] = useState(false);
  const weekScrollRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { addTask } = useFamily();

  const size = getBabySize(selectedWeek);
  const devCards = getDevCards(selectedWeek);
  const bodyPills = getBodyPills(selectedWeek);
  const bodyDesc = getBodyDesc(selectedWeek);
  const symptoms = getSymptoms(selectedWeek);
  const nutrition = getNutritionTips(selectedWeek);
  const affirmation = getAffirmation(selectedWeek);
  const recommendations = getWeekRecommendations(selectedWeek);

  // Scroll selected week into center on mount and week change
  useEffect(() => {
    const el = weekScrollRef.current;
    if (!el) return;
    const btn = el.querySelector(`[data-week="${selectedWeek}"]`) as HTMLElement;
    if (!btn) return;
    const offset = btn.offsetLeft - el.clientWidth / 2 + btn.offsetWidth / 2;
    el.scrollTo({ left: offset, behavior: "smooth" });
  }, [selectedWeek]);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Uge ${selectedWeek} — Melo`,
          text: `Baby er i uge ${selectedWeek} på størrelse med ${size.label.toLowerCase()} — ${size.lengthCm} cm og ${size.weightG} g.`,
        });
      } catch {}
    }
  };

  return (
    <div className="space-y-5 pb-6">

      {showAnimation && (
        <BabyAnimationModal week={selectedWeek} size={size} onClose={() => setShowAnimation(false)} />
      )}

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between section-fade-in">
        <div className="w-8" />
        <div className="text-center">
          <p className="text-[1rem] font-semibold">Uge {selectedWeek}</p>
          <p className="text-[0.65rem] text-muted-foreground">{getTrimesterLabel(selectedWeek)}</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="w-8 h-8 flex items-center justify-center rounded-full transition-colors active:bg-[hsl(var(--stone-lighter))]">
            <Bookmark className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
          </button>
          <button onClick={handleShare} className="w-8 h-8 flex items-center justify-center rounded-full transition-colors active:bg-[hsl(var(--stone-lighter))]">
            <Share2 className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
          </button>
        </div>
      </div>

      {/* ── Week selector ───────────────────────────────────────────────── */}
      <div
        ref={weekScrollRef}
        className="-mx-4 px-4 flex gap-3 overflow-x-auto scrollbar-none pb-2 section-fade-in"
        style={{ animationDelay: "30ms" }}
      >
        {Array.from({ length: 38 }, (_, i) => i + 5).map(w => {
          const isActive = w === selectedWeek;
          const isCurrent = w === currentWeek;
          return (
            <button
              key={w}
              data-week={w}
              onClick={() => setSelectedWeek(w)}
              className="flex flex-col items-center gap-1 flex-shrink-0 transition-all active:scale-90"
            >
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-[0.82rem] font-medium transition-all"
                style={{
                  background: isActive ? "hsl(var(--moss))" : "transparent",
                  border: isActive ? "none" : "1.5px solid hsl(var(--stone-light))",
                  color: isActive ? "white" : "hsl(var(--foreground))",
                  fontWeight: isActive ? 600 : 400,
                }}
              >
                {w}
              </div>
              {isCurrent && (
                <Heart className="w-2.5 h-2.5" style={{ color: "hsl(var(--moss))" }} fill="hsl(var(--moss))" />
              )}
            </button>
          );
        })}
      </div>

      {/* ── Hero card ───────────────────────────────────────────────────── */}
      <div className="relative rounded-3xl overflow-hidden section-fade-in" style={{ background: "hsl(var(--sage-light))", animationDelay: "60ms" }}>
        <div className="flex">
          {/* Left content */}
          <div className="flex-1 p-5 pr-2">
            <p className="text-[0.65rem] tracking-[0.1em] uppercase text-muted-foreground mb-2 flex items-center gap-1">
              Barnets udvikling <span>🌱</span>
            </p>
            <h2 className="font-serif text-[1.25rem] font-medium leading-tight mb-2" style={{ color: "hsl(var(--moss))" }}>
              Din baby er på størrelse med {size.label === "?" ? "et lille mirakel" : `en ${size.label.toLowerCase()}`} {size.emoji}
            </h2>
            <p className="text-[0.75rem] text-muted-foreground leading-relaxed mb-4">
              {selectedWeek < 14
                ? "Din baby vokser hurtigt og alle vitale organer er i fuld udvikling."
                : selectedWeek < 28
                ? "Din baby vokser støt og udvikler både sanser, muskler og bevægelser. De fleste mødre kan begynde at mærke liv nu."
                : "Baby er næsten klar — alle organer er udviklet og baby tager de sidste gram på."}
            </p>
            <div className="flex gap-2">
              <div className="flex items-center gap-1.5 rounded-xl px-3 py-2" style={{ background: "rgba(255,255,255,0.6)" }}>
                <span className="text-[0.75rem]">📏</span>
                <div>
                  <p className="text-[0.55rem] text-muted-foreground">Længde</p>
                  <p className="text-[0.78rem] font-semibold">ca. {size.lengthCm} cm</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 rounded-xl px-3 py-2" style={{ background: "rgba(255,255,255,0.6)" }}>
                <span className="text-[0.75rem]">⚖️</span>
                <div>
                  <p className="text-[0.55rem] text-muted-foreground">Vægt</p>
                  <p className="text-[0.78rem] font-semibold">ca. {size.weightG} g</p>
                </div>
              </div>
            </div>
          </div>
          {/* Right emoji */}
          <div className="w-32 flex items-center justify-center py-4 pr-3">
            <div className="w-24 h-24 rounded-full flex items-center justify-center"
              style={{ background: "rgba(255,255,255,0.4)" }}>
              <span className="text-5xl">{size.emoji}</span>
            </div>
          </div>
        </div>
        {/* Animation button */}
        <div className="flex justify-end px-4 pb-4 -mt-2">
          <button
            onClick={() => setShowAnimation(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-full text-[0.72rem] font-medium transition-all active:scale-95"
            style={{ background: "rgba(255,255,255,0.7)", color: "hsl(var(--moss))" }}>
            Se animation
            <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ background: "hsl(var(--moss))" }}>
              <span className="text-white text-[0.5rem] ml-0.5">▶</span>
            </div>
          </button>
        </div>
      </div>

      {/* ── Hvad sker der i denne uge? ──────────────────────────────────── */}
      <div className="section-fade-in" style={{ animationDelay: "80ms" }}>
        <div className="flex items-center justify-between mb-3">
          <p className="text-[0.9rem] font-semibold">Hvad sker der i denne uge?</p>
          <Link to="/graviditet/uge" className="flex items-center gap-0.5 text-[0.72rem]" style={{ color: "hsl(var(--moss))" }}>
            Se mere <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {devCards.map((card) => (
            <div key={card.title} className="rounded-2xl p-3 space-y-1.5"
              style={{ background: "hsl(var(--warm-white))", border: "1px solid hsl(var(--stone-light))" }}>
              <span className="text-[1.4rem]">{card.icon}</span>
              <p className="text-[0.68rem] font-semibold leading-tight">{card.title}</p>
              <p className="text-[0.58rem] text-muted-foreground leading-snug hidden sm:block">{card.desc}</p>
            </div>
          ))}
        </div>
        {/* Expanded descriptions below grid */}
        <div className="mt-3 space-y-2">
          {devCards.map((card) => (
            <div key={card.title + "_desc"} className="flex items-start gap-2.5 text-[0.78rem] text-muted-foreground">
              <span className="text-base flex-shrink-0">{card.icon}</span>
              <span><strong className="text-foreground">{card.title}</strong> — {card.desc}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Din krop i denne fase ───────────────────────────────────────── */}
      <div className="section-fade-in" style={{ animationDelay: "100ms" }}>
        <div className="flex items-center justify-between mb-3">
          <p className="text-[0.9rem] font-semibold">Din krop i denne fase</p>
          <Link to="/chat" className="flex items-center gap-0.5 text-[0.72rem]" style={{ color: "hsl(var(--moss))" }}>
            Spørg MELO <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        {/* Symptom pills */}
        <div className="flex gap-2 overflow-x-auto scrollbar-none pb-1 -mx-4 px-4">
          {bodyPills.map(pill => (
            <div key={pill.label} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full flex-shrink-0 text-[0.72rem] font-medium"
              style={{ background: "hsl(var(--warm-white))", border: "1px solid hsl(var(--stone-light))" }}>
              <span>{pill.icon}</span> {pill.label}
            </div>
          ))}
        </div>
        <p className="text-[0.78rem] text-muted-foreground leading-relaxed mt-3">{bodyDesc.text}</p>
        <div className="mt-3 rounded-2xl p-3.5 flex items-start gap-2.5"
          style={{ background: "hsl(var(--stone-lighter))", border: "1px solid hsl(var(--stone-light))" }}>
          <span className="text-base flex-shrink-0">🌿</span>
          <div>
            <p className="text-[0.72rem] font-semibold uppercase tracking-wide text-muted-foreground">Tip til dig</p>
            <p className="text-[0.78rem] leading-relaxed mt-0.5">{bodyDesc.tip}</p>
          </div>
        </div>
      </div>

      {/* ── 3-column info cards ─────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-2.5 section-fade-in" style={{ animationDelay: "120ms" }}>
        {/* Symptoms */}
        <div className="rounded-2xl p-3.5 space-y-2" style={{ background: "hsl(var(--warm-white))", border: "1px solid hsl(var(--stone-light))" }}>
          <div className="flex items-center justify-between">
            <p className="text-[0.72rem] font-semibold leading-tight">Symptomer der er normale nu</p>
            <span className="text-sm">🙂</span>
          </div>
          <ul className="space-y-1">
            {symptoms.map(s => (
              <li key={s} className="flex items-start gap-1.5 text-[0.65rem] text-muted-foreground">
                <Check className="w-3 h-3 flex-shrink-0 mt-0.5" style={{ color: "hsl(var(--moss))" }} />
                {s}
              </li>
            ))}
          </ul>
          <Link to="/chat" className="text-[0.62rem] flex items-center gap-0.5 mt-1" style={{ color: "hsl(var(--moss))" }}>
            Spørg MELO <ChevronRight className="w-2.5 h-2.5" />
          </Link>
        </div>

        {/* Nutrition */}
        <div className="rounded-2xl p-3.5 space-y-2" style={{ background: "hsl(var(--warm-white))", border: "1px solid hsl(var(--stone-light))" }}>
          <div className="flex items-center justify-between">
            <p className="text-[0.72rem] font-semibold leading-tight">Kostråd i uge {selectedWeek}</p>
            <span className="text-sm">🍎</span>
          </div>
          <ul className="space-y-1.5">
            {nutrition.map(n => (
              <li key={n.text} className="flex items-start gap-1.5 text-[0.65rem] text-muted-foreground">
                <span className="flex-shrink-0">{n.icon}</span>
                {n.text}
              </li>
            ))}
          </ul>
          <Link to="/chat" className="text-[0.62rem] flex items-center gap-0.5 mt-1" style={{ color: "hsl(var(--moss))" }}>
            Se flere kostråd <ChevronRight className="w-2.5 h-2.5" />
          </Link>
        </div>

        {/* Affirmation */}
        <div className="rounded-2xl p-3.5 space-y-2" style={{ background: "hsl(var(--sage-light))", border: "1px solid hsl(var(--sage) / 0.3)" }}>
          <div className="flex items-center justify-between">
            <p className="text-[0.72rem] font-semibold leading-tight">Godt at vide</p>
            <span className="text-sm">🧠</span>
          </div>
          <p className="text-[0.68rem] leading-relaxed" style={{ color: "hsl(var(--moss))" }}>{affirmation}</p>
          <Link to="/gravid-dagbog" className="text-[0.62rem] flex items-center gap-0.5 mt-1" style={{ color: "hsl(var(--moss))" }}>
            Din dagbog <ChevronRight className="w-2.5 h-2.5" />
          </Link>
        </div>
      </div>

      {/* ── Ugens anbefalinger til jer ──────────────────────────────────── */}
      <div className="section-fade-in" style={{ animationDelay: "140ms" }}>
        <div className="flex items-center justify-between mb-1">
          <div>
            <p className="text-[0.9rem] font-semibold">Ugens anbefalinger til jer</p>
            <p className="text-[0.65rem] text-muted-foreground">Små skridt, der gør en stor forskel</p>
          </div>
          <Link to="/tjekliste" className="flex items-center gap-0.5 text-[0.72rem]" style={{ color: "hsl(var(--moss))" }}>
            Se alle <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <div className="flex gap-3 overflow-x-auto scrollbar-none pb-1 -mx-4 px-4 mt-3">
          {recommendations.map(rec => (
            <button
              key={rec.title}
              onClick={() => addTask(rec.title, "fælles", "never")}
              className="flex-shrink-0 w-36 rounded-2xl p-3.5 text-left space-y-1.5 transition-all active:scale-95"
              style={{ background: "hsl(var(--warm-white))", border: "1px solid hsl(var(--stone-light))" }}>
              <span className="text-xl">{rec.icon}</span>
              <p className="text-[0.72rem] font-semibold leading-tight">{rec.title}</p>
              <p className="text-[0.62rem] text-muted-foreground leading-snug">{rec.sub}</p>
            </button>
          ))}
        </div>
      </div>

      {/* ── Fødselsplan (week 30+) ─────────────────────────────────────── */}
      {selectedWeek >= 30 && (
        <Link
          to="/foedselsplan"
          className="flex items-center gap-4 rounded-2xl px-5 py-4 section-fade-in transition-all active:scale-[0.98]"
          style={{
            background: "hsl(var(--warm-white))",
            border: "1px solid hsl(var(--stone-light))",
            animationDelay: "150ms",
          }}
        >
          <div className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 text-2xl"
            style={{ background: "hsl(var(--sage-light))" }}>
            🌿
          </div>
          <div className="flex-1">
            <p className="text-[0.88rem] font-semibold">Vores fødselsplan</p>
            <p className="text-[0.7rem] text-muted-foreground">Dokumentér jeres ønsker til fødslen</p>
          </div>
          <ChevronRight className="w-4 h-4 text-muted-foreground/50" />
        </Link>
      )}

      {/* ── Veer-timer (week 36+) ──────────────────────────────────────── */}
      {selectedWeek >= 36 && (
        <Link
          to="/veer"
          className="flex items-center gap-4 rounded-2xl px-5 py-4 section-fade-in transition-all active:scale-[0.98]"
          style={{
            background: "linear-gradient(135deg, hsl(var(--clay-light)), hsl(var(--sand-light)))",
            border: "1px solid hsl(var(--clay) / 0.3)",
            animationDelay: "160ms",
          }}
        >
          <div className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 text-2xl"
            style={{ background: "rgba(255,255,255,0.5)" }}>
            ⏱️
          </div>
          <div className="flex-1">
            <p className="text-[0.88rem] font-semibold">Veer-timer</p>
            <p className="text-[0.7rem] text-muted-foreground">Track veer og del live med din partner</p>
          </div>
          <ChevronRight className="w-4 h-4 text-muted-foreground/50" />
        </Link>
      )}

      {/* ── Footer disclaimer ───────────────────────────────────────────── */}
      <div className="flex items-center justify-between rounded-2xl p-4 section-fade-in" style={{ background: "hsl(var(--stone-lighter))", animationDelay: "160ms" }}>
        <div className="flex items-start gap-2.5 flex-1">
          <Shield className="w-4 h-4 flex-shrink-0 mt-0.5 text-muted-foreground" strokeWidth={1.5} />
          <p className="text-[0.65rem] text-muted-foreground leading-relaxed">
            Indholdet er udarbejdet i samarbejde med sundhedsfaglige eksperter og bygger på officielle kilder.
          </p>
        </div>
        <button className="flex items-center gap-1 text-[0.65rem] font-medium flex-shrink-0 ml-3" style={{ color: "hsl(var(--moss))" }}>
          Vores kilder <span className="w-4 h-4 rounded-full border border-current flex items-center justify-center text-[0.5rem]">i</span>
        </button>
      </div>

    </div>
  );
}

function BornBarnPage({ ageWeeks, ageMonths }: { ageWeeks: number; ageMonths: number }) {
  const { profile } = useFamily();
  const { t } = useTranslation();
  const childName = profile.children?.[0]?.name || "Baby";
  const insight = getBabyInsight(ageWeeks, childName);
  const activeLeap = getActiveLeap(ageWeeks);

  const [completedLeaps, setCompletedLeaps] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem("melo-achieved-leaps");
      return stored ? JSON.parse(stored) : [];
    } catch { return []; }
  });
  const [expandedLeap, setExpandedLeap] = useState<string | null>(null);

  const leaps = getLeapStatus(ageWeeks, completedLeaps);

  const toggleLeapCompleted = (id: string) => {
    setCompletedLeaps((prev) => {
      const next = prev.includes(id) ? prev.filter((l) => l !== id) : [...prev, id];
      localStorage.setItem("melo-achieved-leaps", JSON.stringify(next));
      return next;
    });
  };

  return (
    <div className="space-y-5">
      <div className="section-fade-in">
        <h1 className="text-[1.9rem] font-normal">{childName}</h1>
        <p className="label-upper mt-1">
          {ageMonths < 3 ? t("barn.weeksLabel", { weeks: ageWeeks }) : t("barn.monthsLabel", { months: ageMonths })} — {t("barn.developmentLeaps")}
        </p>
      </div>

      <div className="card-soft section-fade-in flex flex-col items-center text-center gap-3" style={{ animationDelay: "80ms" }}>
        <div className="w-14 h-14 rounded-full flex items-center justify-center"
          style={{ background: "linear-gradient(135deg, hsl(var(--clay-light)), hsl(var(--clay)))" }}>
          <BabyIcon className="w-7 h-7 text-white" />
        </div>
        <p className="text-[0.8rem] text-muted-foreground max-w-xs leading-relaxed">{insight.insight}</p>
        <div className="rounded-xl px-4 py-2.5 w-full" style={{ background: "hsl(var(--sage-light))" }}>
          <p className="text-[0.82rem]">💡 {insight.tip}</p>
        </div>
      </div>

      <div className="section-fade-in" style={{ animationDelay: "120ms" }}>
        <BabyMeasurements childName={childName} ageWeeks={ageWeeks} />
      </div>

      <Link to="/leg" className="block">
        <div className="rounded-2xl p-4 flex items-center gap-3 section-fade-in transition-all hover:shadow-sm active:scale-[0.98]" style={{
          animationDelay: "140ms",
          background: "linear-gradient(135deg, hsl(var(--sage) / 0.08), hsl(var(--sage) / 0.03))",
          border: "1px solid hsl(var(--sage) / 0.2)",
        }}>
          <span className="text-2xl">🎨</span>
          <div className="flex-1">
            <p className="text-[0.88rem] font-medium">{t("barn.playActivities")}</p>
            <p className="text-[0.68rem] text-muted-foreground">{t("barn.suggestionsForAge", { childName })}</p>
          </div>
          <span className="text-muted-foreground">→</span>
        </div>
      </Link>

      <div className="section-fade-in" style={{ animationDelay: "160ms" }}>
        <h2 className="text-[1rem] font-semibold mb-3">{t("barn.leaps")}</h2>
        <p className="text-[0.75rem] text-muted-foreground mb-4 leading-relaxed">
          {t("barn.leapsDesc", { childName })}
        </p>

        <div className="space-y-2">
          {leaps.map((leap) => {
            const isExpanded = expandedLeap === leap.id;
            const statusStyles: Record<string, { bg: string; border: string; dot: string }> = {
              completed: { bg: "hsl(var(--sage-light) / 0.5)", border: "hsl(var(--sage) / 0.2)", dot: "hsl(var(--sage))" },
              achieved: { bg: "hsl(var(--moss) / 0.08)", border: "hsl(var(--moss) / 0.3)", dot: "hsl(var(--moss))" },
              active: { bg: "hsl(var(--clay) / 0.08)", border: "hsl(var(--clay) / 0.3)", dot: "hsl(var(--clay))" },
              upcoming: { bg: "hsl(var(--warm-white))", border: "hsl(var(--stone-light))", dot: "hsl(var(--stone))" },
            };
            const s = statusStyles[leap.status];

            return (
              <div key={leap.id} className="rounded-2xl overflow-hidden transition-all" style={{ background: s.bg, border: `1px solid ${s.border}` }}>
                <button onClick={() => setExpandedLeap(isExpanded ? null : leap.id)} className="w-full flex items-center gap-3 px-4 py-3 text-left transition-all active:scale-[0.99]">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-lg" style={{ background: `${s.dot}20` }}>
                    {leap.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className={cn("text-[0.85rem] font-medium", leap.status === "upcoming" && "text-foreground/50")}>{leap.title}</p>
                      <span className="text-[0.55rem] tracking-[0.1em] uppercase text-muted-foreground">~{leap.weekStart} {t("common.weeks")}</span>
                    </div>
                    {leap.status === "active" && (
                      <p className="text-[0.65rem] mt-0.5" style={{ color: "hsl(var(--clay))" }}>{t("barn.happeningNow")}</p>
                    )}
                  </div>
                  {(leap.status === "completed" || leap.status === "achieved") && (
                    <span className="text-[0.55rem] tracking-[0.1em] uppercase px-2 py-0.5 rounded-full" style={{ background: "hsl(var(--sage) / 0.15)", color: "hsl(var(--moss))" }}>
                      ✓ {leap.achievedEarly ? t("barn.earlyReached") : t("barn.reached")}
                    </span>
                  )}
                  {isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                </button>

                {isExpanded && (
                  <div className="px-4 pb-4 space-y-3">
                    <p className="text-[0.78rem] text-foreground/70 leading-relaxed">{leap.description}</p>
                    <div>
                      <p className="text-[0.6rem] tracking-[0.14em] uppercase text-muted-foreground mb-1.5">{t("barn.signsToWatch")}</p>
                      <div className="flex flex-wrap gap-1.5">
                        {leap.signs.map((sign, i) => (
                          <span key={i} className="text-[0.68rem] px-2.5 py-1 rounded-full" style={{ background: "hsl(var(--warm-white))", border: "1px solid hsl(var(--stone-light))" }}>{sign}</span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-[0.6rem] tracking-[0.14em] uppercase text-muted-foreground mb-1.5">{t("barn.tips")}</p>
                      <ul className="space-y-1">
                        {leap.tips.map((tip, i) => (
                          <li key={i} className="flex items-start gap-2 text-[0.75rem] text-foreground/70">
                            <span className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ background: "hsl(var(--sage))" }} />{tip}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleLeapCompleted(leap.id); }}
                      className={cn(
                        "w-full mt-2 py-2.5 rounded-xl text-[0.72rem] tracking-[0.08em] uppercase font-medium transition-all active:scale-[0.98]",
                        completedLeaps.includes(leap.id)
                          ? "bg-[hsl(var(--moss))] text-white"
                          : "border border-[hsl(var(--stone-light))] hover:border-[hsl(var(--sage))] text-foreground/70"
                      )}
                    >
                      {completedLeaps.includes(leap.id) ? t("barn.childReached", { childName }) : t("barn.markReached")}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>


    </div>
  );
}
