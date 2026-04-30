import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useFamily } from "@/context/FamilyContext";
import { getBabySize, getWeekInsight } from "@/lib/phaseData";
import { ChevronLeft, Check, Plus, Share2 } from "lucide-react";
import { cn } from "@/lib/utils";

// ── Week content helpers ───────────────────────────────────────────────────────

function getWeekBullets(week: number): string[] {
  if (week < 8)  return ["Babys hjerte begynder at slå", "Alle vitale organer er ved at dannes", "Fosteret er på størrelse med et hindbær"];
  if (week < 12) return ["Hjertet slår ca. 150 slag i minuttet", "Fingre og tæer er ved at forme sig", "Hjernen udvikler sig hurtigt"];
  if (week < 16) return ["Første trimester er klaret", "Risikoen for tab falder markant nu", "Baby begynder at bevæge sig"];
  if (week < 20) return ["Baby kan lave ansigtsudtryk", "Sanser begynder at vågne", "Knogler og muskler bliver stærkere"];
  if (week < 24) return ["Baby kan høre lyde udefra", "Halvvejs igennem graviditeten", "Hjertet pumper ca. 25 liter blod i døgnet"];
  if (week < 28) return ["Baby reagerer på lys og mørke", "Har en regelmæssig søvnrytme", "Lungerne er ved at modnes"];
  if (week < 32) return ["Tredje trimester er begyndt", "Baby kan åbne og lukke øjnene", "Baby vender sig langsomt med hovedet nedad"];
  if (week < 36) return ["Baby er næsten fuldt udviklet", "I kan mærke tydelige spark og bevægelser", "Begyn at pakke hospitalstasken"];
  return ["Baby er klar til verden når som helst", "Alle organer er fuldt udviklede", "I er stærkere end I tror"];
}

interface BodyContent {
  intro: string;
  tips: string[];
}

function getBodyContent(week: number): BodyContent {
  if (week < 8) return {
    intro: "De første uger kan føles overvældende. Kvalme, træthed og ømme bryster er meget almindelige og er tegn på at graviditeten udvikler sig normalt.",
    tips: ["Spis lidt og ofte for at holde blodsukkeret stabilt", "Hvil så meget du har brug for — din krop arbejder hårdt", "Hold dig hydreret, særligt hvis du har kvalme"],
  };
  if (week < 12) return {
    intro: "Du er stadig i første trimester. Træthed og kvalme er de mest hyppige symptomer. Mange mærker at symptomerne topper netop nu.",
    tips: ["Ingefær kan hjælpe mod kvalme — prøv te eller kandis", "Undgå stærkt duftende mad hvis lugteoverfølsomhed er et problem", "Korte gåture kan give energi uden at udmatte"],
  };
  if (week < 16) return {
    intro: "Første trimester er overstået! Mange oplever at energien begynder at vende tilbage. Livmoderen er nu stor nok til at du begynder at se en lille bule.",
    tips: ["Begynd at bruge en fugtighedscreme på maven — det hjælper på elasticiteten", "Overvej at fortælle tættere venner og familie nu", "Begynd at sove på siden — det er mere komfortabelt og sundt for blodomløbet"],
  };
  if (week < 20) return {
    intro: "Andet trimester er for mange den behageligste periode. Energien er tilbage, kvalmen er væk, og maven er synlig men ikke tung endnu.",
    tips: ["Start med svømmning, yoga eller gåture — bevægelse er godt for jer begge", "Overvej at starte på svangreomsorgens undersøgelser og scanninger", "Tal med din partner om barselsorlov og praktiske forberedelser"],
  };
  if (week < 24) return {
    intro: "Du er halvvejs! Du kan nu mærke baby bevæge sig tydeligt. Ryggen kan begynde at give lidt — det er fordi din holdning ændrer sig.",
    tips: ["En graviditetspude kan hjælpe dig sove bedre", "Øv dig på bækkenbundøvelser dagligt", "Book halvvejsscanningen hvis du ikke allerede har"],
  };
  if (week < 28) return {
    intro: "Baby sparker og bevæger sig nu regelmæssigt. Halsbranden kan tiltage da livmoderen trykker mod mavesækken. Lette svømmende bevægelser i maven er normalt.",
    tips: ["Spis mindre portioner mere hyppigt for at reducere halsbrand", "Løft benene når du sidder for at modvirke hævede ankler", "Deltag i fødselsforberedelse — det er godt for jer begge"],
  };
  if (week < 32) return {
    intro: "Du er i tredje trimester. Braxton Hicks-sammentrækninger (øveveer) er normale og harmløse. Baby er nu stor nok til at du kan mærke tydelige spark og bevægelser.",
    tips: ["Pak hospitalstasken — det er aldrig for tidligt", "Sov på venstre side for bedst blodomløb til placenta", "Tal med din jordemoder om dine ønsker til fødslen"],
  };
  if (week < 36) return {
    intro: "Baby vender sig med hovedet nedad og er næsten fuldt udviklet. Du kan opleve ryg- og bækkensmerter og hyppigere toiletbesøg.",
    tips: ["Lav en fødselsplan og del den med din jordemoder", "Tjek at hospitalstasken er klar", "Aftal med din partner hvem der skal kontaktes når veer starter"],
  };
  return {
    intro: "Du er næsten ved termin. Baby kan komme når som helst de næste uger. Nesting-instinktet er normalt — det er kroppens måde at gøre sig klar.",
    tips: ["Hvil når du kan — du får brug for energien snart", "Hold din jordemoder og hospital informeret om dine symptomer", "Stol på din krop — den ved hvad den gør"],
  };
}

interface NutritionContent {
  dietTips: string[];
  vitamins: { name: string; note: string; active: boolean }[];
}

function getNutrition(week: number): NutritionContent {
  const trimester = week <= 12 ? 1 : week <= 27 ? 2 : 3;
  return {
    dietTips: trimester === 1
      ? ["Spis varieret — grønt, protein og fuldkorn", "Undgå rå fisk, upasteuriseret ost og lever", "Drik 1,5–2 liter vand dagligt"]
      : trimester === 2
      ? ["Dit kalorieindtag bør stige med ca. 300 kcal/dag", "Spis jernrige fødevarer: linser, kød, grønne blade", "Kalk fra mælkeprodukter og grønt styrker babys knogler"]
      : ["Jern og kalk er ekstra vigtigt nu", "Små måltider hyppigt hjælper mod halsbrand", "Omega-3 fra fisk eller tilskud støtter babys hjerne"],
    vitamins: [
      { name: "Folsyre", note: "Vigtigst før uge 12", active: week < 14 },
      { name: "D-vitamin", note: "Hele graviditeten", active: true },
      { name: "Jern", note: "Fra uge 10 og frem", active: week >= 10 },
      { name: "Omega-3", note: "Støtter babys hjerne", active: week >= 20 },
    ],
  };
}

// ── Main component ─────────────────────────────────────────────────────────────
export default function PregnancyWeekPage() {
  const navigate = useNavigate();
  const { profile, currentWeek, trimester, addTask, addMemory } = useFamily();

  const size = getBabySize(currentWeek);
  const insight = getWeekInsight(currentWeek);
  const bullets = getWeekBullets(currentWeek);
  const body = getBodyContent(currentWeek);
  const nutrition = getNutrition(currentWeek);
  const trimesterLabel = trimester === 1 ? "1. trimester" : trimester === 2 ? "2. trimester" : "3. trimester";

  const [taskAdded, setTaskAdded] = useState(false);
  const [noteAdded, setNoteAdded] = useState(false);

  const handleAddNote = () => {
    addMemory(`Uge ${currentWeek}: ${insight.insight}`);
    setNoteAdded(true);
    setTimeout(() => setNoteAdded(false), 2500);
  };

  const handleAddTask = () => {
    const suggestions = [
      "Book scanning",
      "Pak hospitalstaske",
      "Lav fødselsplan",
      "Tilmeld fødselsforberedelse",
      "Fortæl arbejdet om barsel",
    ];
    const task = suggestions[Math.floor(currentWeek / 5) % suggestions.length];
    addTask(task, "fælles", "never");
    setTaskAdded(true);
    setTimeout(() => setTaskAdded(false), 2500);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Uge ${currentWeek} — Melo`,
          text: `Vi er i uge ${currentWeek}! Baby er på størrelse med ${size.label.toLowerCase()} — ${size.lengthCm} cm og ${size.weightG} g.`,
        });
      } catch {}
    }
  };

  return (
    <div className="space-y-5 pb-8 section-fade-in">

      {/* ── A. Header ────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1 text-muted-foreground text-[0.78rem] active:scale-95 transition-transform"
        >
          <ChevronLeft className="w-4 h-4" />
          Tilbage
        </button>
        <p className="text-[0.82rem] font-semibold">Uge {currentWeek}</p>
        <button onClick={handleShare} className="p-2 text-muted-foreground active:scale-95 transition-transform">
          <Share2 className="w-4 h-4" />
        </button>
      </div>

      {/* ── B. Week Overview Card ─────────────────────────────────────────────── */}
      <div
        className="rounded-[20px] px-5 py-5"
        style={{ background: "hsl(var(--warm-white))", border: "1px solid hsl(var(--stone-light))" }}
      >
        <div className="flex items-start justify-between mb-3">
          <div>
            <p className="font-serif text-[1.75rem] font-medium leading-tight" style={{ color: "hsl(var(--moss))" }}>
              Uge {currentWeek}
            </p>
            <p className="text-[0.82rem] text-muted-foreground mt-0.5">{trimesterLabel}</p>
          </div>
          <span className="text-[4rem] leading-none">{size.emoji}</span>
        </div>

        <p className="font-serif text-[1.05rem] font-medium mb-1">Din baby udvikler sig hver dag</p>
        <p className="text-[0.85rem] text-muted-foreground mb-4">
          På størrelse med {size.label.toLowerCase()} {size.emoji}
        </p>

        <div className="flex gap-3">
          <div className="flex-1 rounded-xl px-3 py-2.5 text-center" style={{ background: "hsl(var(--sage-light))" }}>
            <p className="text-[0.62rem] tracking-[0.1em] uppercase text-muted-foreground mb-0.5">Længde</p>
            <p className="text-[0.95rem] font-semibold" style={{ color: "hsl(var(--moss))" }}>ca. {size.lengthCm} cm</p>
          </div>
          <div className="flex-1 rounded-xl px-3 py-2.5 text-center" style={{ background: "hsl(var(--clay-light))" }}>
            <p className="text-[0.62rem] tracking-[0.1em] uppercase text-muted-foreground mb-0.5">Vægt</p>
            <p className="text-[0.95rem] font-semibold" style={{ color: "hsl(var(--bark))" }}>ca. {size.weightG} g</p>
          </div>
        </div>
      </div>

      {/* ── C. Development Section ────────────────────────────────────────────── */}
      <div className="card-soft">
        <p className="text-[0.72rem] font-medium tracking-[0.1em] uppercase text-muted-foreground mb-3">
          Det sker denne uge
        </p>
        <p className="text-[0.85rem] text-muted-foreground leading-relaxed mb-4">{insight.insight}</p>
        <div className="space-y-2">
          {bullets.map((b, i) => (
            <div key={i} className="flex items-center gap-2.5">
              <div
                className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: "hsl(var(--sage-light))" }}
              >
                <Check className="w-3 h-3" style={{ color: "hsl(var(--moss))" }} />
              </div>
              <p className="text-[0.82rem]">{b}</p>
            </div>
          ))}
        </div>
        {insight.milestone && (
          <div className="mt-4 rounded-xl px-4 py-2.5" style={{ background: "hsl(var(--sage-light))" }}>
            <p className="text-[0.82rem] font-medium" style={{ color: "hsl(var(--moss))" }}>
              🎯 {insight.milestone}
            </p>
          </div>
        )}
      </div>

      {/* ── D. Body & Symptoms ───────────────────────────────────────────────── */}
      <div className="card-soft">
        <p className="text-[0.72rem] font-medium tracking-[0.1em] uppercase text-muted-foreground mb-3">
          Din krop lige nu
        </p>
        <p className="text-[0.85rem] text-muted-foreground leading-relaxed mb-4">{body.intro}</p>
        <div className="space-y-2">
          {body.tips.map((tip, i) => (
            <div key={i} className="flex items-start gap-2.5">
              <span className="text-sm flex-shrink-0 mt-0.5">💡</span>
              <p className="text-[0.82rem] text-muted-foreground leading-snug">{tip}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── E. Nutrition ─────────────────────────────────────────────────────── */}
      <div>
        <p className="text-[0.82rem] font-semibold mb-3">Kost & Vitaminer</p>
        <div className="grid grid-cols-2 gap-3">
          {/* Diet */}
          <div
            className="rounded-2xl px-4 py-4"
            style={{ background: "hsl(var(--warm-white))", border: "1px solid hsl(var(--stone-light))" }}
          >
            <p className="text-base mb-2">🥦</p>
            <p className="text-[0.75rem] font-semibold mb-2">Kost</p>
            <div className="space-y-1.5">
              {nutrition.dietTips.map((tip, i) => (
                <p key={i} className="text-[0.68rem] text-muted-foreground leading-snug">{tip}</p>
              ))}
            </div>
          </div>
          {/* Vitamins */}
          <div
            className="rounded-2xl px-4 py-4"
            style={{ background: "hsl(var(--warm-white))", border: "1px solid hsl(var(--stone-light))" }}
          >
            <p className="text-base mb-2">💊</p>
            <p className="text-[0.75rem] font-semibold mb-2">Vitaminer</p>
            <div className="space-y-1.5">
              {nutrition.vitamins.filter(v => v.active).map((v, i) => (
                <div key={i} className="flex items-center gap-1.5">
                  <div
                    className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                    style={{ background: "hsl(var(--moss))" }}
                  />
                  <div>
                    <span className="text-[0.68rem] font-medium">{v.name}</span>
                    <span className="text-[0.62rem] text-muted-foreground ml-1">{v.note}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── F. Fruit progression link ─────────────────────────────────────────── */}
      <button
        onClick={() => navigate("/graviditet/frugter")}
        className="w-full rounded-2xl px-4 py-4 flex items-center gap-3 transition-all active:scale-[0.98]"
        style={{ background: "hsl(var(--cream))", border: "1px solid hsl(var(--stone-light))" }}
      >
        <span className="text-2xl">{size.emoji}</span>
        <div className="flex-1 text-left">
          <p className="text-[0.82rem] font-medium">Se alle 40 ugers udvikling</p>
          <p className="text-[0.68rem] text-muted-foreground">Følg babys vækst uge for uge</p>
        </div>
        <ChevronLeft className="w-4 h-4 text-muted-foreground rotate-180" />
      </button>

      {/* ── G. Bottom Actions ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-2">
        <button
          onClick={handleAddNote}
          className={cn(
            "rounded-xl px-2 py-3 text-[0.7rem] font-medium transition-all active:scale-95 flex flex-col items-center gap-1.5",
          )}
          style={{
            background: noteAdded ? "hsl(var(--sage-light))" : "hsl(var(--warm-white))",
            border: `1px solid ${noteAdded ? "hsl(var(--sage) / 0.4)" : "hsl(var(--stone-light))"}`,
            color: noteAdded ? "hsl(var(--moss))" : "hsl(var(--foreground))",
          }}
        >
          <span className="text-lg">{noteAdded ? "✓" : "📝"}</span>
          {noteAdded ? "Gemt!" : "Gem som note"}
        </button>

        <button
          onClick={handleShare}
          className="rounded-xl px-2 py-3 text-[0.7rem] font-medium transition-all active:scale-95 flex flex-col items-center gap-1.5"
          style={{ background: "hsl(var(--warm-white))", border: "1px solid hsl(var(--stone-light))" }}
        >
          <span className="text-lg">💌</span>
          Del med partner
        </button>

        <button
          onClick={handleAddTask}
          className={cn(
            "rounded-xl px-2 py-3 text-[0.7rem] font-medium transition-all active:scale-95 flex flex-col items-center gap-1.5",
          )}
          style={{
            background: taskAdded ? "hsl(var(--sage-light))" : "hsl(var(--warm-white))",
            border: `1px solid ${taskAdded ? "hsl(var(--sage) / 0.4)" : "hsl(var(--stone-light))"}`,
            color: taskAdded ? "hsl(var(--moss))" : "hsl(var(--foreground))",
          }}
        >
          <span className="text-lg">{taskAdded ? "✓" : "+"}</span>
          {taskAdded ? "Tilføjet!" : "Opret opgave"}
        </button>
      </div>

      {/* ── H. Disclaimer ─────────────────────────────────────────────────────── */}
      <div className="rounded-xl px-4 py-3" style={{ background: "hsl(var(--stone-lighter))" }}>
        <p className="text-[0.68rem] text-muted-foreground leading-relaxed">
          Alle graviditeter er forskellige. Denne information er generel og kan ikke erstatte rådgivning fra læge eller jordemoder.
        </p>
      </div>
    </div>
  );
}
