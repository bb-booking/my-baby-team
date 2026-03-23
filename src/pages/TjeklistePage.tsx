import { useState } from "react";
import { useFamily } from "@/context/FamilyContext";
import { Check, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import confetti from "canvas-confetti";

type Priority = "nødvendig" | "valgfri";
type PriceLevel = "budget" | "medium" | "premium";
type Phase = "before" | "after";

interface ChecklistItem {
  id: string;
  title: string;
  hint: string;
  priority: Priority;
  priceLevel: PriceLevel;
  phase: Phase;
  category: string;
  emoji: string;
}

const CHECKLIST_ITEMS: ChecklistItem[] = [
  // ── INDEN FØDSLEN ──
  // Søvn & hvile
  { id: "b1", title: "Barneseng", hint: "Skal have inden hjemsendelse fra hospital", priority: "nødvendig", priceLevel: "medium", phase: "before", category: "Søvn & hvile", emoji: "🌙" },
  { id: "b2", title: "Madras til barneseng", hint: "Fast og flad uden huller — sikkerhedskrav", priority: "nødvendig", priceLevel: "budget", phase: "before", category: "Søvn & hvile", emoji: "🌙" },
  { id: "b3", title: "Sovepose 0–6 mdr.", hint: "TOG 1.0 sommer · TOG 2.5 vinter — sikrere end dyne", priority: "nødvendig", priceLevel: "budget", phase: "before", category: "Søvn & hvile", emoji: "🌙" },
  { id: "b4", title: "Babylydovervågning", hint: "Moonboon synkroniserer automatisk med Lille", priority: "nødvendig", priceLevel: "medium", phase: "before", category: "Søvn & hvile", emoji: "🌙" },
  { id: "b5", title: "White noise maskine", hint: "34% færre opvågninger — meget effektivt", priority: "valgfri", priceLevel: "budget", phase: "before", category: "Søvn & hvile", emoji: "🌙" },

  // Klapvogn & transport
  { id: "b6", title: "Klapvogn", hint: "Den vigtigste investering — vælg én I er glade for i årevis", priority: "nødvendig", priceLevel: "premium", phase: "before", category: "Klapvogn & transport", emoji: "🚗" },
  { id: "b7", title: "Autostol gruppe 0+ (0–13 kg)", hint: "⚠️ Lovpligtigt — skal have inden hjemsendelse fra hospital", priority: "nødvendig", priceLevel: "medium", phase: "before", category: "Klapvogn & transport", emoji: "🚗" },
  { id: "b8", title: "Bæresele / bærebinde", hint: "Frigiver hænder · giver baby ro · fantastisk til far", priority: "valgfri", priceLevel: "medium", phase: "before", category: "Klapvogn & transport", emoji: "🚗" },
  { id: "b9", title: "Regnslag til klapvogn", hint: "Danmark — du ved det godt", priority: "valgfri", priceLevel: "budget", phase: "before", category: "Klapvogn & transport", emoji: "🚗" },

  // Bleer & pusle
  { id: "b10", title: "Puslebord / pusleplads", hint: "Hold altid én hånd på barnet", priority: "nødvendig", priceLevel: "medium", phase: "before", category: "Bleer & pusle", emoji: "🧷" },
  { id: "b11", title: "Bleer str. 1–2 (newborn + næste)", hint: "Abonnement anbefales — aldrig løbe tør", priority: "nødvendig", priceLevel: "budget", phase: "before", category: "Bleer & pusle", emoji: "🧷" },
  { id: "b12", title: "Vådservietter parfumefri", hint: "Hav rigeligt — bruges til alt", priority: "nødvendig", priceLevel: "budget", phase: "before", category: "Bleer & pusle", emoji: "🧷" },
  { id: "b13", title: "Pusleunderlag (kan vaskes)", hint: "Hav mindst 2 — de bliver hurtigt snavsede", priority: "nødvendig", priceLevel: "budget", phase: "before", category: "Bleer & pusle", emoji: "🧷" },

  // Bad & pleje
  { id: "b14", title: "Babybadekar", hint: "Brug altid badetermometer — 37°C er ideelt", priority: "nødvendig", priceLevel: "budget", phase: "before", category: "Bad & pleje", emoji: "🛁" },
  { id: "b15", title: "Badetermometer", hint: "Plastikduk er ikke præcis nok", priority: "nødvendig", priceLevel: "budget", phase: "before", category: "Bad & pleje", emoji: "🛁" },
  { id: "b16", title: "Parfumefri babysæbe & shampoo", hint: "Babyens hud er meget sensitiv de første måneder", priority: "nødvendig", priceLevel: "budget", phase: "before", category: "Bad & pleje", emoji: "🛁" },
  { id: "b17", title: "Neglesaks til baby", hint: "Afrundede spidser — klip mens de sover", priority: "nødvendig", priceLevel: "budget", phase: "before", category: "Bad & pleje", emoji: "🛁" },
  { id: "b18", title: "Babycreme til tørhud", hint: "Mange babyer behøver det ikke — godt at have", priority: "valgfri", priceLevel: "budget", phase: "before", category: "Bad & pleje", emoji: "🛁" },

  // Tøj
  { id: "b19", title: "Bodyer str. 50–56 (5–7 stk.)", hint: "Snaps i skridtet — nemmest. Vask inden brug.", priority: "nødvendig", priceLevel: "budget", phase: "before", category: "Tøj", emoji: "👕" },
  { id: "b20", title: "Sparkebukser & flyverdragter str. 56+62", hint: "De vokser hurtigt — køb ikke for mange i str. 50", priority: "nødvendig", priceLevel: "budget", phase: "before", category: "Tøj", emoji: "👕" },
  { id: "b21", title: "Hue & vanter", hint: "Babyer regulerer kropstemperatur dårligt de første måneder", priority: "nødvendig", priceLevel: "budget", phase: "before", category: "Tøj", emoji: "👕" },

  // Ernæring & amning
  { id: "b22", title: "Nipplecreme", hint: "Start fra dag 1 — forebygger sår markant", priority: "nødvendig", priceLevel: "budget", phase: "before", category: "Ernæring & amning", emoji: "🍼" },
  { id: "b23", title: "Amningspude", hint: "Aflaster nakke og arme markant", priority: "valgfri", priceLevel: "budget", phase: "before", category: "Ernæring & amning", emoji: "🍼" },
  { id: "b24", title: "Brystpumpe", hint: "Kun relevant hvis du planlægger at pumpe", priority: "valgfri", priceLevel: "medium", phase: "before", category: "Ernæring & amning", emoji: "🍼" },
  { id: "b25", title: "Sutteflasker × 2", hint: "Nyttigt selv ved amning til pumpet mælk", priority: "valgfri", priceLevel: "budget", phase: "before", category: "Ernæring & amning", emoji: "🍼" },

  // Praktisk & vigtigt
  { id: "b26", title: "Hospitalspose pakket", hint: "Tøj, snacks, lader, sundhedskort, forsikringsbevis", priority: "nødvendig", priceLevel: "budget", phase: "before", category: "Praktisk & vigtigt", emoji: "📋" },
  { id: "b27", title: "Barselsdagpenge ansøgt", hint: "NemRefusion / borger.dk — tidligst 8 uger før termin", priority: "nødvendig", priceLevel: "budget", phase: "before", category: "Praktisk & vigtigt", emoji: "📋" },
  { id: "b28", title: "Navngivning (inden 15 dage efter fødsel)", hint: "borger.dk — kan gøres direkte fra telefonen", priority: "nødvendig", priceLevel: "budget", phase: "before", category: "Praktisk & vigtigt", emoji: "📋" },

  // ── NÅR BABY ER KOMMET ──
  // Første uger
  { id: "a1", title: "D-vitamin dråber", hint: "Sundhedsstyrelsen anbefaler fra dag 1", priority: "nødvendig", priceLevel: "budget", phase: "after", category: "Første uger", emoji: "🌿" },
  { id: "a2", title: "Bekræft sundhedsplejerske-besøg", hint: "Sker automatisk — ring og bekræft tidspunkt", priority: "nødvendig", priceLevel: "budget", phase: "after", category: "Første uger", emoji: "🌿" },
  { id: "a3", title: "PKU-blodprøve & hørescreening", hint: "Tages på hospitalet — bekræft at det er sket", priority: "nødvendig", priceLevel: "budget", phase: "after", category: "Første uger", emoji: "🌿" },

  // 3–6 måneder
  { id: "a4", title: "4 mdr. lægetjek booket", hint: "Anbefales uge 16–17 — book tidligt, det fyldes hurtigt", priority: "nødvendig", priceLevel: "budget", phase: "after", category: "3–6 måneder", emoji: "📅" },
  { id: "a5", title: "Vaccinationer planlagt", hint: "MFR 1 ved 5 mdr. — Sundhedsstyrelsen.dk", priority: "nødvendig", priceLevel: "budget", phase: "after", category: "3–6 måneder", emoji: "📅" },
  { id: "a6", title: "Bleer str. 3 klar", hint: "Skift typisk ved ca. 6–7 kg — lad Lille minde dig", priority: "nødvendig", priceLevel: "budget", phase: "after", category: "3–6 måneder", emoji: "📅" },
  { id: "a7", title: "Tummy time dagligt (5 min × 3)", hint: "Fundamentalt for motorisk udvikling — start nu", priority: "nødvendig", priceLevel: "budget", phase: "after", category: "3–6 måneder", emoji: "📅" },

  // Fast føde
  { id: "a8", title: "Højstol", hint: "Bruges dagligt i årevis — invester klogt", priority: "nødvendig", priceLevel: "medium", phase: "after", category: "Fast føde (fra ca. 6 mdr.)", emoji: "🍽️" },
  { id: "a9", title: "Babymad bestik silikone", hint: "Bløde kanter — vigtig for gummer og tænder", priority: "valgfri", priceLevel: "budget", phase: "after", category: "Fast føde (fra ca. 6 mdr.)", emoji: "🍽️" },
  { id: "a10", title: "Silikone hagesmæk med lomme", hint: "Nem at gøre ren — undgå stof til mad", priority: "valgfri", priceLevel: "budget", phase: "after", category: "Fast føde (fra ca. 6 mdr.)", emoji: "🍽️" },

  // For jer som forældre
  { id: "a11", title: "Bækkenbund genoptræning", hint: "Specialiseret fysioterapeut — vigtigt efter fødsel, også uden symptomer", priority: "nødvendig", priceLevel: "medium", phase: "after", category: "For jer som forældre", emoji: "❤️" },
  { id: "a12", title: "Barselgruppe", hint: "Sociale bånd der holder — vigtig for begge forældre", priority: "valgfri", priceLevel: "budget", phase: "after", category: "For jer som forældre", emoji: "❤️" },
  { id: "a13", title: "Dato-aften planlagt", hint: "Start fra 2–3 måneder — vigtigt for parforholdet", priority: "valgfri", priceLevel: "budget", phase: "after", category: "For jer som forældre", emoji: "❤️" },
];

const STORAGE_KEY = "lille-checklist";

function useChecklist() {
  const [checked, setChecked] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch { return []; }
  });

  const toggle = (id: string) => {
    setChecked(prev => {
      const next = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      if (!prev.includes(id)) {
        confetti({ particleCount: 40, spread: 50, origin: { y: 0.7 }, colors: ["#5a7a50", "#c4a97d", "#8fae7e", "#d4c4a8"], scalar: 0.7, gravity: 1.2 });
      }
      return next;
    });
  };

  return { checked, toggle };
}

type PriceFilter = "alle" | PriceLevel;

export default function TjeklistePage() {
  const { profile } = useFamily();
  const { checked, toggle } = useChecklist();
  const [phase, setPhase] = useState<Phase>("before");
  const [priceFilter, setPriceFilter] = useState<PriceFilter>("alle");

  const items = CHECKLIST_ITEMS.filter(i => i.phase === phase);
  const filtered = priceFilter === "alle" ? items : items.filter(i => i.priceLevel === priceFilter);

  // Group by category
  const categories: { name: string; emoji: string; items: ChecklistItem[] }[] = [];
  filtered.forEach(item => {
    const existing = categories.find(c => c.name === item.category);
    if (existing) existing.items.push(item);
    else categories.push({ name: item.category, emoji: item.emoji, items: [item] });
  });

  const totalItems = items.length;
  const checkedInPhase = items.filter(i => checked.includes(i.id)).length;
  const pct = totalItems > 0 ? Math.round((checkedInPhase / totalItems) * 100) : 0;

  const priceTabs: { key: PriceFilter; label: string; emoji?: string }[] = [
    { key: "alle", label: "ALLE" },
    { key: "budget", label: "BUDGET", emoji: "💙" },
    { key: "medium", label: "MEDIUM", emoji: "🧡" },
    { key: "premium", label: "PREMIUM", emoji: "🌿" },
  ];

  return (
    <div className="space-y-5">
      <div className="section-fade-in">
        <h1 className="text-[1.9rem] font-normal">Tjekliste</h1>
        <p className="label-upper mt-1">FORBERED JER TIL BABYEN — BUDGET · MEDIUM · PREMIUM</p>
      </div>

      {/* Phase tabs */}
      <div className="section-fade-in flex gap-0" style={{ animationDelay: "40ms" }}>
        <button
          onClick={() => setPhase("before")}
          className={cn(
            "flex-1 py-2.5 text-[0.72rem] tracking-[0.1em] uppercase font-medium border-b-2 transition-all",
            phase === "before"
              ? "border-b-[hsl(var(--sage))] text-foreground"
              : "border-b-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          Inden fødslen
        </button>
        <button
          onClick={() => setPhase("after")}
          className={cn(
            "flex-1 py-2.5 text-[0.72rem] tracking-[0.1em] uppercase font-medium border-b-2 transition-all",
            phase === "after"
              ? "border-b-[hsl(var(--sage))] text-foreground"
              : "border-b-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          Når baby er kommet
        </button>
      </div>

      {/* Price filter + progress */}
      <div className="section-fade-in space-y-3" style={{ animationDelay: "60ms" }}>
        <div className="flex items-center justify-between gap-2">
          <div className="flex gap-1.5">
            {priceTabs.map(tab => (
              <button
                key={tab.key}
                onClick={() => setPriceFilter(tab.key)}
                className={cn(
                  "px-3 py-1.5 rounded-full text-[0.62rem] tracking-[0.08em] uppercase font-medium transition-all active:scale-95",
                  priceFilter === tab.key
                    ? "bg-foreground text-background"
                    : "border border-[hsl(var(--stone-light))] text-muted-foreground hover:bg-[hsl(var(--stone-lighter))]"
                )}
              >
                {tab.emoji && <span className="mr-1">{tab.emoji}</span>}
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Progress */}
        <div className="flex items-center justify-between text-[0.72rem] text-muted-foreground">
          <span>{checkedInPhase} af {totalItems} punkter klar</span>
          <span className="font-medium">{pct}%</span>
        </div>
        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "hsl(var(--stone-lighter))" }}>
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${pct}%`, background: "hsl(var(--sage))" }}
          />
        </div>
      </div>

      {/* Categories */}
      <div className="space-y-6 section-fade-in" style={{ animationDelay: "100ms" }}>
        {categories.map(cat => {
          const catChecked = cat.items.filter(i => checked.includes(i.id)).length;
          return (
            <div key={cat.name}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">{cat.emoji}</span>
                <h2 className="text-[0.92rem] font-semibold">{cat.name}</h2>
                <span className="text-[0.65rem] text-muted-foreground">{catChecked}/{cat.items.length}</span>
              </div>
              <div className="rounded-2xl border border-[hsl(var(--stone-lighter))] overflow-hidden">
                {cat.items.map((item, i) => {
                  const isDone = checked.includes(item.id);
                  return (
                    <div
                      key={item.id}
                      className={cn(
                        "flex items-center gap-3 px-4 py-3.5 transition-all",
                        i > 0 && "border-t border-[hsl(var(--stone-lighter))]",
                        isDone ? "bg-[hsl(var(--sage-light))]/20" : "bg-[hsl(var(--cream))]/30 hover:bg-[hsl(var(--cream))]"
                      )}
                    >
                      <button
                        onClick={() => toggle(item.id)}
                        className={cn(
                          "w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 transition-all active:scale-90 border-[1.5px]",
                          isDone
                            ? "bg-[hsl(var(--sage))] border-[hsl(var(--sage))]"
                            : "border-[hsl(var(--stone-light))] hover:border-[hsl(var(--sage))]"
                        )}
                      >
                        {isDone && <Check className="w-3.5 h-3.5 text-white" />}
                      </button>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={cn("text-[0.85rem]", isDone && "line-through text-muted-foreground")}>{item.title}</span>
                          <span className={cn(
                            "text-[0.55rem] tracking-[0.1em] uppercase px-2 py-0.5 rounded-full font-medium",
                            item.priority === "nødvendig"
                              ? "bg-[hsl(var(--clay-light))] text-[hsl(var(--bark))]"
                              : "border border-[hsl(var(--stone-light))] text-muted-foreground"
                          )}>
                            {item.priority}
                          </span>
                        </div>
                        <p className={cn("text-[0.72rem] text-muted-foreground mt-0.5 leading-snug", isDone && "line-through")}>{item.hint}</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground/40 flex-shrink-0" />
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <div className="h-20 md:h-0" />
    </div>
  );
}
