import { useFamily } from "@/context/FamilyContext";
import { getBabySize, getWeekInsight } from "@/lib/phaseData";
import { MeloWordmark } from "@/components/MeloWordmark";
import { NotificationBell } from "@/components/NotificationCenter";
import { WeekUnlockModal } from "@/components/WeekUnlockModal";
import { User, ArrowRight, Check } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

// ── Week-specific development bullets ─────────────────────────────────────────
function getWeekBullets(week: number): string[] {
  if (week < 8)  return ["Babys hjerte begynder at slå", "Alle vitale organer er ved at dannes", "Fosteret er størrelse med et hindbær"];
  if (week < 12) return ["Hjertet slår ca. 150 slag i minuttet", "Fingre og tæer er ved at forme sig", "Hjernen udvikler sig hurtigt"];
  if (week < 16) return ["Første trimester er klaret", "Risikoen for tab falder markant nu", "Baby begynder at bevæge sig"];
  if (week < 20) return ["Baby kan lave ansigtsudtryk", "Sanser begynder at vågne", "Knogler og muskler bliver stærkere"];
  if (week < 24) return ["Baby kan høre lyde udefra", "Halvvejs igennem graviditeten", "Hjertet pumper ca. 25 liter blod i døgnet"];
  if (week < 28) return ["Baby reagerer på lys og mørke", "Har en regelmæssig søvnrytme", "Lungerne er ved at modnes"];
  if (week < 32) return ["Tredje trimester er begyndt", "Baby kan åbne og lukke øjnene", "Baby vender sig langsomt med hovedet nedad"];
  if (week < 36) return ["Baby er næsten fuldt udviklet", "I kan mærke tydelige spark og bevægelser", "Begyn at pakke hospitalstasken"];
  return ["Baby er klar til verden når som helst", "Alle organer er fuldt udviklede", "I er stærkere end I tror"];
}

// ── Daily rotating insight ─────────────────────────────────────────────────────
interface DailyInsight {
  category: string;
  emoji: string;
  tip: string;
  accentVar: string;
}

function getDailyInsights(week: number): DailyInsight[] {
  if (week < 12) return [
    { category: "Kost", emoji: "🥗", tip: "Tag folinsyre hver dag — det reducerer risikoen for medfødte nervesystemsfejl med op til 70%.", accentVar: "--sage" },
    { category: "Motion", emoji: "🚶", tip: "En 20-minutters gåtur om dagen reducerer træthed og forbedrer dit humør mærkbart.", accentVar: "--moss" },
    { category: "Afslapning", emoji: "💆", tip: "Prøv akupressur på P6-punktet på håndleddet mod morgenkvalme — det virker for mange.", accentVar: "--clay" },
    { category: "Sjov fakta", emoji: "✨", tip: "Dit foster har allerede unikke fingeraftryk — dannet i uge 10!", accentVar: "--bark" },
    { category: "Craving", emoji: "🍋", tip: "Sur mad og frisk ingefær er naturlige hjælpere mod morgenkvalme. Prøv ingefærbiskuit.", accentVar: "--clay" },
  ];
  if (week < 20) return [
    { category: "Kost", emoji: "🥦", tip: "Jern er vigtigt nu — spis rødt kød, linser og mørke bladgrøntsager. Tag det med C-vitamin for bedre optagelse.", accentVar: "--sage" },
    { category: "Motion", emoji: "🏊", tip: "Svømning og vandgymnastik er ideelt i 2. trimester — skånsomt og styrker hele kroppen.", accentVar: "--moss" },
    { category: "Afslapning", emoji: "🧘", tip: "Prøv graviditetsyoga eller 10 minutters vejrtrækningsøvelser. Det hjælper mod spændinger i ryggen.", accentVar: "--clay" },
    { category: "Sjov fakta", emoji: "👂", tip: "Baby begynder at høre din stemme fra uge 16. Tal, læs højt eller syng — det skaber kontakt.", accentVar: "--bark" },
    { category: "Craving", emoji: "🍫", tip: "Chokolade-cravings? Dit legeme mangler måske magnesium. Prøv nødder, avocado eller mørk chokolade.", accentVar: "--clay" },
  ];
  if (week < 28) return [
    { category: "Kost", emoji: "🐟", tip: "Omega-3 fra fed fisk (laks, makrel) understøtter babys hjernedannelse. 2 portioner om ugen er idealt.", accentVar: "--sage" },
    { category: "Motion", emoji: "🚲", tip: "Bækkenbundstræning nu forebygger urinlækage efter fødslen. 3 sæt á 10 øvelser dagligt rækker.", accentVar: "--moss" },
    { category: "Afslapning", emoji: "😴", tip: "Sov på venstre side fra nu — det forbedrer blodcirkulationen til baby og reducerer trykket på dine organer.", accentVar: "--clay" },
    { category: "Sjov fakta", emoji: "💤", tip: "Baby sover op til 20 timer i døgnet nu — og drømmer sandsynligvis. Hjernen er super aktiv.", accentVar: "--bark" },
    { category: "Craving", emoji: "🧂", tip: "Saltcravings kan være et tegn på lavt blodtryk i graviditeten — det er normalt. Hold dig hydreret.", accentVar: "--clay" },
  ];
  if (week < 36) return [
    { category: "Kost", emoji: "🥛", tip: "Calcium er kritisk nu — baby bygger knoglerne færdige. Mejeriprodukter, mandler og broccoli er gode kilder.", accentVar: "--sage" },
    { category: "Motion", emoji: "🧗", tip: "Gåture og lette strækøvelser hjælper baby i den rigtige position. Undgå lang tid på ryggen.", accentVar: "--moss" },
    { category: "Afslapning", emoji: "🛁", tip: "Et varmt (ikke hedt) bad kan lindre rygsmerter og svangerskabsødemer. Tilsæt lavendelolie for afslapning.", accentVar: "--clay" },
    { category: "Sjov fakta", emoji: "🧠", tip: "Babys hjerne vokser med op til 250.000 neuroner i minuttet i denne periode.", accentVar: "--bark" },
    { category: "Craving", emoji: "🍦", tip: "Is-cravings? Frossen frugt er et sundere alternativ der giver den kolde tilfredsstillelse.", accentVar: "--clay" },
  ];
  return [
    { category: "Kost", emoji: "💧", tip: "Drik mindst 2 liter vand om dagen — det hjælper med at forebygge for tidlig fødsel og holder fostervandet frisk.", accentVar: "--sage" },
    { category: "Motion", emoji: "🚶", tip: "Korte gåture hjælper baby i stilling og kan igangsætte fødslen naturligt. Gå lidt mere end du plejer.", accentVar: "--moss" },
    { category: "Afslapning", emoji: "🌿", tip: "Prøv at visualisere fødslen positivt — forskning viser det reducerer smerter og frygt markant.", accentVar: "--clay" },
    { category: "Sjov fakta", emoji: "👶", tip: "Baby er nu fuldt udviklet og bare venter. Lungerne er det sidste organ der modnes.", accentVar: "--bark" },
    { category: "Craving", emoji: "🌶️", tip: "Stærk mad aktiverer prostaglandiner som teoretisk kan hjælpe med at igangsætte fødslen — om end effekten er lille.", accentVar: "--clay" },
  ];
}

// ── 4 wellness category cards ──────────────────────────────────────────────────
interface WellnessTip {
  category: string;
  emoji: string;
  title: string;
  desc: string;
  accentVar: string;
}

function getWellnessTips(week: number): WellnessTip[] {
  if (week < 12) return [
    { category: "Kost", emoji: "🥗", title: "Folinsyre & jern", desc: "Tag folinsyre dagligt og spis jernrige fødevarer som linser og spinat", accentVar: "--sage" },
    { category: "Motion", emoji: "🚶", title: "Blide gåture", desc: "20 min om dagen booster energi og reducerer morgenkvalme", accentVar: "--moss" },
    { category: "Afslapning", emoji: "💆", title: "Hvil uden skyld", desc: "Træthed i 1. trimester er hormonel — din krop arbejder hårdt", accentVar: "--clay" },
    { category: "Sjov fakta", emoji: "🫀", title: "Hjertet banker", desc: "Babys hjerte slår nu 150 slag/min — dobbelt så hurtigt som dit", accentVar: "--bark" },
  ];
  if (week < 20) return [
    { category: "Kost", emoji: "🥦", title: "Jern & C-vitamin", desc: "Spis dem sammen for dobbelt optagelse — fx linsesuppe med paprika", accentVar: "--sage" },
    { category: "Motion", emoji: "🏊", title: "Vand er din ven", desc: "Svømning er skånsomt og styrker core — perfekt nu", accentVar: "--moss" },
    { category: "Afslapning", emoji: "🧘", title: "Graviditetsyoga", desc: "Åbner hofterne og reducerer spændinger i ryg og bækken", accentVar: "--clay" },
    { category: "Sjov fakta", emoji: "👂", title: "Baby hører dig", desc: "Fra uge 16 kan baby høre din stemme — tal og syng gerne", accentVar: "--bark" },
  ];
  if (week < 28) return [
    { category: "Kost", emoji: "🐟", title: "Omega-3 til hjernen", desc: "Fed fisk 2x ugentlig understøtter babys hjernedannelse", accentVar: "--sage" },
    { category: "Motion", emoji: "💪", title: "Bækkenbund", desc: "3×10 knipøvelser dagligt forebygger læk efter fødslen", accentVar: "--moss" },
    { category: "Afslapning", emoji: "😴", title: "Sov på venstre side", desc: "Bedre blodcirkulation til baby og mindre tryk på dine organer", accentVar: "--clay" },
    { category: "Sjov fakta", emoji: "💤", title: "Baby drømmer", desc: "Baby sover 20 timer i døgnet og har REM-søvn ligesom dig", accentVar: "--bark" },
  ];
  if (week < 36) return [
    { category: "Kost", emoji: "🥛", title: "Calcium til knoglerne", desc: "Baby bygger sit skelet færdigt — mælk, mandler og broccoli", accentVar: "--sage" },
    { category: "Motion", emoji: "🧗", title: "Hold dig aktiv", desc: "Gåture og stræk hjælper baby i stilling og reducerer hævelse", accentVar: "--moss" },
    { category: "Afslapning", emoji: "🛁", title: "Varmt bad", desc: "Lindrer rygsmerter og ødemer — tilsæt lavendel for ro", accentVar: "--clay" },
    { category: "Sjov fakta", emoji: "🧠", title: "250.000 neuroner/min", desc: "Babys hjerne vokser eksplosivt — mest intensive periode", accentVar: "--bark" },
  ];
  return [
    { category: "Kost", emoji: "💧", title: "Hydrering er alt", desc: "2+ liter vand holder fostervandet frisk og forebygger tidlig fødsel", accentVar: "--sage" },
    { category: "Motion", emoji: "🚶", title: "Gå lidt mere", desc: "Hjælper baby i stilling og kan igangsætte fødslen naturligt", accentVar: "--moss" },
    { category: "Afslapning", emoji: "🌿", title: "Visualisér fødslen", desc: "Positiv visualization reducerer smerter og frygt — forskning bekræfter det", accentVar: "--clay" },
    { category: "Sjov fakta", emoji: "👶", title: "Fuldt udviklet", desc: "Baby venter bare på det rette tidspunkt — alt er klar", accentVar: "--bark" },
  ];
}

// ── Main component ─────────────────────────────────────────────────────────────
export default function DashboardPregnant() {
  const { profile, currentWeek, totalWeeks, trimester, tasks, morName, farName, takeTask } = useFamily();
  const { i18n } = useTranslation();

  const size = getBabySize(currentWeek);
  const insight = getWeekInsight(currentWeek);
  const bullets = getWeekBullets(currentWeek);
  const allInsights = getDailyInsights(currentWeek);
  const wellnessTips = getWellnessTips(currentWeek);

  // Rotate daily insight by day of year
  const dayIndex = Math.floor(Date.now() / (1000 * 60 * 60 * 24)) % allInsights.length;
  const todayInsight = allInsights[dayIndex];

  const progress = Math.round((currentWeek / totalWeeks) * 100);
  const daysLeft = Math.max(0, (totalWeeks - currentWeek) * 7);
  const trimesterLabel = trimester === 1 ? "1. trimester" : trimester === 2 ? "2. trimester" : "3. trimester";

  const getGreeting = (): string => {
    const h = new Date().getHours();
    if (h < 10) return "Godmorgen";
    if (h < 17) return "Goddag";
    return "Godaften";
  };

  const previewTasks = tasks.filter(t => !t.completed).slice(0, 3);
  const myRole = profile.role;

  return (
    <div className="space-y-5 pb-6">
      <WeekUnlockModal />

      {/* ── A. Header ───────────────────────────────────────────────────────── */}
      <div className="section-fade-in">
        <div className="flex items-center justify-between mb-5">
          <MeloWordmark size="1.8rem" />
          <div className="flex items-center gap-3">
            <NotificationBell />
            <div className="w-9 h-9 rounded-full flex items-center justify-center text-[0.75rem] font-semibold"
              style={{ background: "hsl(var(--sage-light))", color: "hsl(var(--moss))" }}>
              {profile.parentName?.charAt(0)?.toUpperCase() || <User className="w-4 h-4" />}
            </div>
          </div>
        </div>

        <h1 className="text-[1.9rem] leading-tight">
          {getGreeting()}, {profile.parentName}
        </h1>
        <p className="text-[0.9rem] text-muted-foreground mt-1">Ét skridt ad gangen.</p>
      </div>

      {/* ── B. Pregnancy Hero Card ──────────────────────────────────────────── */}
      <div
        className="rounded-[20px] overflow-hidden section-fade-in"
        style={{
          background: "linear-gradient(145deg, hsl(154 22% 28%), hsl(154 27% 20%))",
          animationDelay: "40ms",
        }}
      >
        <div className="px-5 pt-5 pb-4">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="font-serif text-[1.5rem] font-medium text-white leading-tight">Uge {currentWeek}</p>
              <p className="text-[0.82rem] text-white/70 mt-0.5">{trimesterLabel}</p>
            </div>
            <span className="text-[3.5rem] leading-none">{size.emoji}</span>
          </div>

          <p className="font-serif text-[1.15rem] font-medium text-white leading-snug mb-1">
            Din baby udvikler sig hver dag
          </p>
          <p className="text-[0.85rem] text-white/75 mb-3">
            På størrelse med {size.label.toLowerCase()} — {size.lengthCm} cm · {size.weightG} g
          </p>

          <div className="space-y-1.5 mb-4">
            {bullets.map((b, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: "hsl(140 22% 55% / 0.35)" }}>
                  <Check className="w-2.5 h-2.5 text-white" />
                </div>
                <p className="text-[0.8rem] text-white/80">{b}</p>
              </div>
            ))}
          </div>

          <Link
            to="/graviditet/uge"
            className="inline-flex items-center gap-1.5 text-[0.75rem] font-medium text-white/90 hover:text-white transition-colors"
          >
            Se mere om uge {currentWeek} <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {insight.milestone && (
          <div className="px-5 py-2.5 border-t border-white/10"
            style={{ background: "hsl(154 27% 16% / 0.5)" }}>
            <p className="text-[0.72rem] text-white/70">🎯 {insight.milestone}</p>
          </div>
        )}
      </div>

      {/* ── C. Progress Card ────────────────────────────────────────────────── */}
      <div
        className="rounded-2xl px-5 py-4 section-fade-in"
        style={{
          background: "hsl(var(--warm-white))",
          border: "1px solid hsl(var(--stone-light))",
          animationDelay: "80ms",
        }}
      >
        <div className="flex items-center justify-between mb-3">
          <p className="text-[0.72rem] font-medium tracking-[0.1em] uppercase text-muted-foreground">Din graviditet</p>
          <div className="flex items-center justify-center w-10 h-10 rounded-full"
            style={{ background: "hsl(var(--sage-light))" }}>
            <span className="text-[0.72rem] font-semibold" style={{ color: "hsl(var(--moss))" }}>{progress}%</span>
          </div>
        </div>

        <div className="flex items-baseline gap-2 mb-3">
          <span className="font-serif text-[2rem] font-medium" style={{ color: "hsl(var(--moss))" }}>
            Uge {currentWeek}
          </span>
          <span className="text-[0.82rem] text-muted-foreground">af 40</span>
        </div>

        <div className="h-2 rounded-full overflow-hidden mb-2" style={{ background: "hsl(var(--stone-lighter))" }}>
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${progress}%`,
              background: "linear-gradient(90deg, hsl(var(--sage)), hsl(var(--moss)))",
            }}
          />
        </div>

        <div className="flex justify-between items-center">
          <p className="text-[0.68rem] text-muted-foreground">{trimesterLabel}</p>
          <p className="text-[0.68rem] text-muted-foreground">{daysLeft} dage tilbage</p>
        </div>
      </div>

      {/* ── D. Dagens tip (rotating daily) ──────────────────────────────────── */}
      <div
        className="rounded-2xl px-5 py-4 section-fade-in"
        style={{
          background: `hsl(var(${todayInsight.accentVar}) / 0.08)`,
          border: `1px solid hsl(var(${todayInsight.accentVar}) / 0.25)`,
          animationDelay: "100ms",
        }}
      >
        <div className="flex items-center gap-2 mb-3">
          <span className="text-[0.58rem] font-semibold tracking-[0.16em] uppercase px-2 py-0.5 rounded-full"
            style={{ background: `hsl(var(${todayInsight.accentVar}) / 0.15)`, color: `hsl(var(${todayInsight.accentVar}))` }}>
            {todayInsight.category}
          </span>
          <span className="text-[0.62rem] text-muted-foreground/70">Dagens tip</span>
        </div>
        <div className="flex gap-3 items-start">
          <span className="text-[2rem] leading-none flex-shrink-0">{todayInsight.emoji}</span>
          <p className="text-[0.88rem] leading-relaxed">{todayInsight.tip}</p>
        </div>
        <Link
          to="/chat"
          className="mt-3 inline-flex items-center gap-1 text-[0.72rem] font-medium transition-colors"
          style={{ color: `hsl(var(${todayInsight.accentVar}))` }}
        >
          Spørg Melo om dette <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      {/* ── E. Optimér din graviditet (2×2 grid) ────────────────────────────── */}
      <div className="section-fade-in" style={{ animationDelay: "130ms" }}>
        <div className="flex items-center justify-between mb-3">
          <p className="text-[0.82rem] font-semibold">Optimér din graviditet</p>
          <Link to="/graviditet/uge" className="text-[0.72rem] font-medium" style={{ color: "hsl(var(--moss))" }}>
            Uge {currentWeek} i detaljer
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-2.5">
          {wellnessTips.map((tip, i) => (
            <div
              key={i}
              className="rounded-2xl px-4 py-3.5"
              style={{
                background: `hsl(var(${tip.accentVar}) / 0.07)`,
                border: `1px solid hsl(var(${tip.accentVar}) / 0.2)`,
              }}
            >
              <span className="text-[0.55rem] font-semibold tracking-[0.14em] uppercase block mb-1.5"
                style={{ color: `hsl(var(${tip.accentVar}))` }}>
                {tip.category}
              </span>
              <span className="text-lg block mb-1.5">{tip.emoji}</span>
              <p className="text-[0.78rem] font-medium leading-snug mb-1">{tip.title}</p>
              <p className="text-[0.65rem] text-muted-foreground leading-snug">{tip.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── F. Tasks Preview ────────────────────────────────────────────────── */}
      {previewTasks.length > 0 && (
        <div className="section-fade-in" style={{ animationDelay: "160ms" }}>
          <div className="flex items-center justify-between mb-3">
            <p className="text-[0.82rem] font-semibold">Det I har gang i</p>
            <Link to="/sammen" className="text-[0.72rem] font-medium" style={{ color: "hsl(var(--moss))" }}>
              Se alle opgaver
            </Link>
          </div>
          <div className="space-y-2">
            {previewTasks.map(task => {
              const assigneeName =
                task.assignee === "mor" ? morName :
                task.assignee === "far" ? farName :
                "Fælles";
              const isMyTask = task.assignee === myRole || task.takenBy === myRole;

              return (
                <div
                  key={task.id}
                  className="flex items-center gap-3 rounded-2xl px-4 py-3"
                  style={{
                    background: "hsl(var(--warm-white))",
                    border: "1px solid hsl(var(--stone-light))",
                  }}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-[0.82rem] font-medium truncate">{task.title}</p>
                    <p className="text-[0.68rem] text-muted-foreground">{assigneeName}</p>
                  </div>
                  {isMyTask ? (
                    <span className="text-[0.68rem] px-3 py-1.5 rounded-full"
                      style={{ background: "hsl(var(--stone-lighter))", color: "hsl(var(--muted-foreground))" }}>
                      Din opgave
                    </span>
                  ) : (
                    <button
                      onClick={() => takeTask(task.id)}
                      className="text-[0.72rem] font-medium px-3 py-1.5 rounded-full text-white transition-all active:scale-95"
                      style={{ background: "hsl(var(--moss))" }}
                    >
                      Tag den
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── G. Samen — secondary link ────────────────────────────────────────── */}
      <Link
        to="/sammen"
        className="flex items-center justify-between rounded-2xl px-5 py-4 section-fade-in transition-all active:scale-[0.98]"
        style={{
          background: "hsl(var(--sage-light))",
          border: "1px solid hsl(var(--sage) / 0.3)",
          animationDelay: "180ms",
        }}
      >
        <div>
          <p className="text-[0.88rem] font-medium" style={{ color: "hsl(var(--moss))" }}>Samarbejd med din partner</p>
          <p className="text-[0.72rem] text-muted-foreground mt-0.5">Opgaver, nætter og tjek-in</p>
        </div>
        <ArrowRight className="w-4 h-4 flex-shrink-0" style={{ color: "hsl(var(--moss))" }} />
      </Link>

      {/* ── H. Disclaimer ───────────────────────────────────────────────────── */}
      <div
        className="rounded-xl px-4 py-3 section-fade-in"
        style={{ background: "hsl(var(--stone-lighter))", animationDelay: "200ms" }}
      >
        <p className="text-[0.72rem] text-muted-foreground leading-relaxed">
          Alle graviditeter er forskellige. Indholdet er generel information og kan ikke erstatte professionel rådgivning.
        </p>
      </div>

    </div>
  );
}
