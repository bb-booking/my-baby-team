import { useFamily } from "@/context/FamilyContext";
import { getBabySize } from "@/lib/phaseData";
import { MeloWordmark } from "@/components/MeloWordmark";
import { NotificationBell } from "@/components/NotificationCenter";
import { User, ChevronRight, Heart, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";

// ── Week-specific content for the partner ─────────────────────────────────────

interface WeekContent {
  partnerTip: string;
  herSymptoms: string[];
  helpTips: string[];
  babyFact: string;
  partnerFocus: string;
}

function getWeekContent(week: number): WeekContent {
  if (week < 8) return {
    partnerTip: "Første trimester er det hårdeste for kroppen. Din ro og omsorg er alt.",
    herSymptoms: ["Kraftig træthed", "Kvalme og opkastninger", "Ømme bryster", "Stemningsudsving"],
    helpTips: [
      "Tag over med madlavning — undgå stærke dufte",
      "Lad hende hvile uden dårlig samvittighed",
      "Spørg ind til, hvad hun har brug for",
      "Vær tålmodig med stemningsudsving",
    ],
    babyFact: "Babys hjerte begynder at slå. Alle vitale organer er ved at dannes.",
    partnerFocus: "Skab tryghed og ro derhjemme.",
  };
  if (week < 12) return {
    partnerTip: "Mange venter med at fortælle det til uge 12. Støt hendes valg om, hvem der skal vide det.",
    herSymptoms: ["Kvalme — specielt om morgenen", "Ekstrem træthed", "Hyppig vandladning", "Madfrastød"],
    helpTips: [
      "Hav kiks og vand klar på natbordet",
      "Tilbyd at tage med til første scanning",
      "Tag dig af de tunge huslige gøremål",
      "Mød hende uden forventninger",
    ],
    babyFact: "Hjertet slår ca. 150 slag i minuttet. Fingre og tæer formes nu.",
    partnerFocus: "Vær med til scanninger — det betyder meget.",
  };
  if (week < 16) return {
    partnerTip: "Andet trimester starter snart — de fleste kvinder får det markant bedre nu.",
    herSymptoms: ["Kvalmen aftager for de fleste", "Stadig træt", "Begyndende mavebulning", "Humøret løfter sig"],
    helpTips: [
      "Planlæg noget I glæder jer til — en weekendtur",
      "Tal om jeres forventninger til forældrerollen",
      "Start at tænke på indretning af værelset",
      "Gå ture sammen — det giver energi til begge",
    ],
    babyFact: "Risikoen for tab falder markant. Baby begynder at bevæge sig.",
    partnerFocus: "Fejr at I er kommet godt igennem 1. trimester.",
  };
  if (week < 20) return {
    partnerTip: "Baby begynder at sparke snart. Hold øje — det er et øjeblik I aldrig glemmer.",
    herSymptoms: ["Maverundhed bliver synlig", "Lænderygsmerter", "Halsbrand", "Baby begynder at sparke"],
    helpTips: [
      "Læg hånden på maven og vent tålmodigt",
      "Massér hendes ryg — det giver stor lindring",
      "Tag styring på indkøb og madplaner",
      "Tal til maven — baby hører din stemme nu",
    ],
    babyFact: "Baby kan lave ansigtsudtryk. Sanser begynder at vågne.",
    partnerFocus: "Din stemme er din baby allerede ved at kende.",
  };
  if (week < 24) return {
    partnerTip: "I er halvvejs! Baby kan høre jer begge tydeligt nu. Tal, synge — det tæller.",
    herSymptoms: ["Hævede ankler og fødder", "Halsbrand", "Rygsmerter", "Lejlighedsvis søvnproblemer"],
    helpTips: [
      "Sæt benene op for hende om aftenen",
      "Søg info om fødselsforberedelseskurser nu",
      "Tag ansvar for jeres økonomi-forberedelse",
      "Spørg hvad hun ønsker til fødslen — lyt",
    ],
    babyFact: "Baby kan høre lyde udefra. I er halvvejs igennem graviditeten.",
    partnerFocus: "Halvvejs — fejr det ordentligt i aften.",
  };
  if (week < 28) return {
    partnerTip: "Tredje trimester nærmer sig. Grydeinstinktet kan sætte ind — støt op om det.",
    herSymptoms: ["Træthed vender tilbage", "Åndedrætsbesvær", "Braxton Hicks (træningsveer)", "Hyppig vandladning"],
    helpTips: [
      "Tilmeld jer fødselsforberedelseskursus nu",
      "Begynd at læse om din rolle under fødslen",
      "Spørg hvad hun vil have med på hospitalet",
      "Lav en plan for, hvem der passes barnet hvis det går hurtigt",
    ],
    babyFact: "Baby reagerer på lys og mørke. Lungerne er ved at modnes.",
    partnerFocus: "Nu er det tid til at forberede sig praktisk.",
  };
  if (week < 32) return {
    partnerTip: "3. trimester. Din partner bærer nu en fuld baby — al hjælp er guld.",
    herSymptoms: ["Træt og tung", "Ryg- og bækkensmerter", "Søvnproblemer", "Bræ ndt"],
    helpTips: [
      "Tag over med alt der kræver bøjning og løft",
      "Pak hospitalstasken færdig sammen",
      "Lær om de tidlige tegn på fødsel",
      "Hav veer-timeren klar på telefonen",
    ],
    babyFact: "Baby kan åbne og lukke øjnene. Vender sig langsomt med hovedet nedad.",
    partnerFocus: "Hospitalstasken skal pakkes nu.",
  };
  if (week < 36) return {
    partnerTip: "Baby er næsten klar. Vær mentalt forberedt på, at det kan gå hurtigt.",
    herSymptoms: ["Meget tung og træt", "Bækkensmerter", "Nervøsitet/glæde", "Svære at sove"],
    helpTips: [
      "Øv jer på kørsel til hospitalet",
      "Hav telefonen opladet til enhver tid",
      "Lær at genkende reel fødsel vs. træningsveer",
      "Hold hendes hånd og minder hende om, hun er stærk",
    ],
    babyFact: "Baby er næsten fuldt udviklet. Alle organer klar.",
    partnerFocus: "Vær klar. Hold telefonen opladet.",
  };
  return {
    partnerTip: "Baby kan komme når som helst. I er klar — begge to.",
    herSymptoms: ["Meget ubehagelig", "Svær ved at sove", "Utålmodig", "Blandede følelser"],
    helpTips: [
      "Vær til stede — aflys hvad du kan",
      "Tag styring på alt praktisk",
      "Minder hende om, hun er den stærkeste person du kender",
      "Hav veer-timeren klar",
    ],
    babyFact: "Baby er fuldt udviklet og klar til verden.",
    partnerFocus: "I er klar. Det er jeres tid.",
  };
}

// ── Partner action items by week ──────────────────────────────────────────────
function getPartnerActions(week: number): string[] {
  if (week < 12) return ["Booking af jordemoder", "Fortæl din arbejdsgiver om orloven", "Undersøg regler for fedreorlov"];
  if (week < 20) return ["Tilmeld jer fødselsforberedelse", "Start samtale om navne", "Lav budget for første år"];
  if (week < 28) return ["Bestil babygrej (seng, klapvogn)", "Lær om din rolle under fødslen", "Planlæg barselsorlov"];
  if (week < 34) return ["Pak hospitalstasken", "Lær veer-timeren at kende", "Lav aftale om hvem passer ældre søskende"];
  return ["Hold telefon opladet altid", "Kend vej til hospitalet", "Vær klar til at tage af sted"];
}

// ── Main component ─────────────────────────────────────────────────────────────
export default function DashboardPregnantFar() {
  const { profile, currentWeek, morName, farName, tasks, takeTask } = useFamily();

  const size = getBabySize(currentWeek);
  const content = getWeekContent(currentWeek);
  const actions = getPartnerActions(currentWeek);

  const myTasks = tasks.filter(t => !t.completed && (t.assignee === "far" || t.takenBy === "far")).slice(0, 3);

  const getGreeting = (): string => {
    const h = new Date().getHours();
    if (h < 10) return "Godmorgen";
    if (h < 17) return "Goddag";
    return "Godaften";
  };

  return (
    <div className="space-y-5 pb-6">

      {/* ── A. Header ───────────────────────────────────────────────────────── */}
      <div className="section-fade-in">
        <div className="flex items-center justify-between mb-5">
          <MeloWordmark size="1.8rem" />
          <div className="flex items-center gap-3">
            <NotificationBell />
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-[0.75rem] font-semibold overflow-hidden"
              style={{ background: "hsl(var(--clay-light))", color: "hsl(var(--bark))" }}
            >
              {profile.parentName?.charAt(0)?.toUpperCase() || <User className="w-4 h-4" />}
            </div>
          </div>
        </div>

        <h1 className="text-[1.9rem] leading-tight">
          {getGreeting()}, {farName || profile.parentName}
        </h1>
        <p className="text-[0.9rem] text-muted-foreground mt-1">
          {morName} er i uge {currentWeek}. I er næsten der.
        </p>
      </div>

      {/* ── B. Baby + uge hero ──────────────────────────────────────────────── */}
      <div
        className="rounded-[20px] overflow-hidden section-fade-in"
        style={{
          background: "linear-gradient(145deg, hsl(22 35% 38%), hsl(22 30% 28%))",
          animationDelay: "30ms",
        }}
      >
        <div className="px-5 pt-5 pb-4">
          <div className="flex items-start justify-between mb-3">
            <div>
              <span className="text-[0.68rem] font-semibold px-2.5 py-1 rounded-full text-white"
                style={{ background: "rgba(255,255,255,0.15)" }}>
                Uge {currentWeek} — partnerens guide
              </span>
            </div>
            <span className="text-[3.2rem] leading-none">{size.emoji}</span>
          </div>

          <p className="font-serif text-[1.35rem] font-medium text-white leading-snug mb-1.5">
            {content.partnerFocus}
          </p>
          <p className="text-[0.82rem] text-white/75 mb-4">
            {content.babyFact}
          </p>

          <div className="flex items-center gap-4 text-[0.78rem] text-white/70">
            <span>Størrelse<br /><span className="text-white font-medium">{size.label}</span></span>
            <span className="text-white/30">·</span>
            <span>Længde<br /><span className="text-white font-medium">ca. {size.lengthCm} cm</span></span>
            <span className="text-white/30">·</span>
            <span>Vægt<br /><span className="text-white font-medium">ca. {size.weightG} g</span></span>
          </div>
        </div>

        <div className="px-5 py-3 border-t border-white/10"
          style={{ background: "rgba(0,0,0,0.15)" }}>
          <p className="text-[0.73rem] text-white/70 italic">"{content.partnerTip}"</p>
        </div>
      </div>

      {/* ── C. Forstå [morName] ──────────────────────────────────────────────── */}
      <div
        className="rounded-2xl overflow-hidden section-fade-in"
        style={{
          background: "hsl(var(--warm-white))",
          border: "1px solid hsl(var(--stone-light))",
          animationDelay: "60ms",
        }}
      >
        <div className="px-5 pt-4 pb-2">
          <div className="flex items-center gap-2 mb-1">
            <Heart className="w-4 h-4" style={{ color: "hsl(var(--clay))" }} />
            <p className="text-[0.95rem] font-semibold">Forstå hvad {morName} oplever nu</p>
          </div>
          <p className="text-[0.72rem] text-muted-foreground mb-3">Typiske symptomer i uge {currentWeek}</p>
          <div className="flex flex-wrap gap-2 mb-4">
            {content.herSymptoms.map((s, i) => (
              <span
                key={i}
                className="text-[0.72rem] px-3 py-1.5 rounded-full font-medium"
                style={{ background: "hsl(var(--clay-light))", color: "hsl(var(--bark))" }}
              >
                {s}
              </span>
            ))}
          </div>
        </div>

        <div className="border-t" style={{ borderColor: "hsl(var(--stone-lighter))" }}>
          <div className="px-5 py-3">
            <p className="text-[0.78rem] font-semibold mb-2.5">Sådan hjælper du</p>
            <div className="space-y-2">
              {content.helpTips.map((tip, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: "hsl(var(--moss))" }} />
                  <p className="text-[0.8rem] leading-snug">{tip}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── D. Det gør du nu ────────────────────────────────────────────────── */}
      <div
        className="rounded-2xl overflow-hidden section-fade-in"
        style={{
          background: "hsl(var(--warm-white))",
          border: "1px solid hsl(var(--stone-light))",
          animationDelay: "90ms",
        }}
      >
        <div className="px-5 pt-4 pb-3">
          <p className="text-[0.95rem] font-semibold mb-0.5">Det gør du nu</p>
          <p className="text-[0.72rem] text-muted-foreground mb-3">Praktiske ting du kan tage styring på</p>
          <div className="space-y-2.5">
            {actions.map((action, i) => (
              <div
                key={i}
                className="flex items-center gap-3 px-4 py-3 rounded-xl"
                style={{ background: "hsl(var(--stone-lighter))" }}
              >
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-[0.7rem] font-bold text-white"
                  style={{ background: "hsl(var(--moss))" }}
                >
                  {i + 1}
                </div>
                <p className="text-[0.82rem] font-medium">{action}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── E. Dine opgaver ──────────────────────────────────────────────────── */}
      {myTasks.length > 0 && (
        <div className="section-fade-in" style={{ animationDelay: "120ms" }}>
          <div className="flex items-center justify-between mb-3">
            <p className="text-[0.82rem] font-semibold">Dine opgaver</p>
            <Link to="/samen" className="text-[0.72rem] font-medium" style={{ color: "hsl(var(--moss))" }}>
              Se alle <ChevronRight className="w-3 h-3 inline" />
            </Link>
          </div>
          <div
            className="rounded-2xl overflow-hidden"
            style={{ background: "hsl(var(--warm-white))", border: "1px solid hsl(var(--stone-light))" }}
          >
            <div className="divide-y" style={{ borderColor: "hsl(var(--stone-lighter))" }}>
              {myTasks.map(task => (
                <div key={task.id} className="flex items-center gap-3 px-4 py-3">
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-[0.65rem] font-semibold flex-shrink-0"
                    style={{ background: "hsl(var(--clay-light))", color: "hsl(var(--bark))" }}
                  >
                    {farName?.[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[0.82rem] font-medium truncate">{task.title}</p>
                    <p className="text-[0.65rem] text-muted-foreground">Din opgave</p>
                  </div>
                  <span className="text-[0.65rem] px-2.5 py-1 rounded-full flex-shrink-0"
                    style={{ background: "hsl(var(--stone-lighter))", color: "hsl(var(--muted-foreground))" }}>
                    Din
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── F. Hurtige links ────────────────────────────────────────────────── */}
      <div className="section-fade-in" style={{ animationDelay: "150ms" }}>
        <p className="text-[0.82rem] font-semibold mb-3">Jeres redskaber</p>
        <div className="grid grid-cols-2 gap-3">
          <Link
            to="/gravid-kalender"
            className="flex flex-col gap-2 rounded-2xl p-4 transition-all active:scale-[0.97]"
            style={{ background: "hsl(var(--warm-white))", border: "1px solid hsl(var(--stone-light))" }}
          >
            <span className="text-2xl">📅</span>
            <div>
              <p className="text-[0.82rem] font-semibold leading-snug">Scanninger</p>
              <p className="text-[0.65rem] text-muted-foreground">& kalender</p>
            </div>
          </Link>

          <Link
            to="/foedselsplan"
            className="flex flex-col gap-2 rounded-2xl p-4 transition-all active:scale-[0.97]"
            style={{ background: "hsl(var(--warm-white))", border: "1px solid hsl(var(--stone-light))" }}
          >
            <span className="text-2xl">🌿</span>
            <div>
              <p className="text-[0.82rem] font-semibold leading-snug">Fødselsplan</p>
              <p className="text-[0.65rem] text-muted-foreground">Jeres ønsker</p>
            </div>
          </Link>

          <Link
            to="/chat"
            className="flex flex-col gap-2 rounded-2xl p-4 transition-all active:scale-[0.97]"
            style={{ background: "hsl(var(--warm-white))", border: "1px solid hsl(var(--stone-light))" }}
          >
            <span className="text-2xl">💬</span>
            <div>
              <p className="text-[0.82rem] font-semibold leading-snug">Spørg MELO</p>
              <p className="text-[0.65rem] text-muted-foreground">Din AI-guide</p>
            </div>
          </Link>

          {currentWeek >= 36 ? (
            <Link
              to="/veer"
              className="flex flex-col gap-2 rounded-2xl p-4 transition-all active:scale-[0.97]"
              style={{
                background: "linear-gradient(135deg, hsl(var(--clay-light)), hsl(var(--sand-light)))",
                border: "1px solid hsl(var(--clay) / 0.3)",
              }}
            >
              <span className="text-2xl">⏱️</span>
              <div>
                <p className="text-[0.82rem] font-semibold leading-snug">Veer-timer</p>
                <p className="text-[0.65rem] text-muted-foreground">Track live</p>
              </div>
            </Link>
          ) : (
            <Link
              to="/barn"
              className="flex flex-col gap-2 rounded-2xl p-4 transition-all active:scale-[0.97]"
              style={{ background: "hsl(var(--warm-white))", border: "1px solid hsl(var(--stone-light))" }}
            >
              <span className="text-2xl">👶</span>
              <div>
                <p className="text-[0.82rem] font-semibold leading-snug">Baby</p>
                <p className="text-[0.65rem] text-muted-foreground">Ugens udvikling</p>
              </div>
            </Link>
          )}
        </div>
      </div>

      {/* ── G. Disclaimer ───────────────────────────────────────────────────── */}
      <div
        className="rounded-xl px-4 py-3 section-fade-in flex items-start gap-2.5"
        style={{ background: "hsl(var(--stone-lighter))", animationDelay: "180ms" }}
      >
        <span className="text-[0.75rem] text-muted-foreground/60 flex-shrink-0 mt-0.5">ⓘ</span>
        <p className="text-[0.72rem] text-muted-foreground leading-relaxed">
          Alle graviditeter er forskellige. Indholdet er generel information og erstatter ikke professionel rådgivning.
        </p>
      </div>

    </div>
  );
}
