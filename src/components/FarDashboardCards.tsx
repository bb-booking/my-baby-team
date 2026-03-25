import { useFamily } from "@/context/FamilyContext";
import { useDiary } from "@/context/DiaryContext";
import { Heart, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";

// ── Mor Empathy Card — understand what she's going through ──
export function MorEmpathyCard({ ageWeeks, morName }: { ageWeeks: number; morName: string }) {
  const [expanded, setExpanded] = useState(false);

  const content = ageWeeks < 2 ? {
    emoji: "🫂",
    headline: "Kroppen heler efter fødslen",
    facts: [
      "Livmoderen trækker sig sammen — det gør ondt, især under amning",
      "Hormonerne crasher: østrogen falder 100× på 3 dage",
      "Søvnmangel påvirker humør, hukommelse og tålmodighed",
    ],
    action: `Spørg ikke "kan jeg hjælpe?" — gør det bare. Tag opvasken, hent vand, lav mad.`,
  } : ageWeeks < 6 ? {
    emoji: "💛",
    headline: "Baby blues rammer op til 80%",
    facts: [
      "Pludselig gråd, angst, irritabilitet — det er hormonelt og NORMALT",
      "Amning er et fuldtidsjob: 8-12 gange i døgnet",
      "Mental load: hun tænker på alt — mad, bleer, tøj, læge, næste amning",
    ],
    action: `Sig: "Du gør det fantastisk, og jeg ser alt det du gør." Mén det.`,
  } : ageWeeks < 12 ? {
    emoji: "🧠",
    headline: "Mental load er usynligt arbejde",
    facts: [
      "Hun holder styr på: sovevinduer, amning, lægeaftaler, tøjstørrelser",
      "At bede om hjælp ER også arbejde — tag initiativ selv",
      "'Mor-guilt': hun føler sig forkert uanset hvad hun vælger",
    ],
    action: `Tag en hel aften alene med baby. Sig: "Tag ud, gør noget for dig selv."`,
  } : {
    emoji: "💪",
    headline: "Hun finder sin nye rytme",
    facts: [
      "Kroppen er stadig under forandring — det tager 12+ mdr. at hele",
      "Hun har brug for anerkendelse, ikke gode råd",
      "Parforholdet er under pres — prioritér tid sammen",
    ],
    action: `Planlæg en date night. Bare 2 timer gør en kæmpe forskel.`,
  };

  return (
    <div className="rounded-2xl overflow-hidden section-fade-in" style={{
      background: "linear-gradient(135deg, hsl(var(--clay) / 0.08), hsl(var(--clay) / 0.03))",
      border: "1px solid hsl(var(--clay) / 0.15)",
    }}>
      <button onClick={() => setExpanded(!expanded)} className="w-full text-left px-4 py-3.5 transition-all active:scale-[0.995]">
        <div className="flex items-center gap-3">
          <span className="text-xl">{content.emoji}</span>
          <div className="flex-1">
            <p className="text-[0.58rem] tracking-[0.14em] uppercase text-muted-foreground">FORSTÅ HINANDEN</p>
            <p className="text-[0.88rem] font-medium">{content.headline}</p>
          </div>
          <span className={`text-muted-foreground text-[0.7rem] transition-transform ${expanded ? "rotate-180" : ""}`}>▼</span>
        </div>
      </button>

      {expanded && (
        <div className="px-4 pb-4 animate-fade-in">
          <ul className="space-y-2 mb-3">
            {content.facts.map((fact, i) => (
              <li key={i} className="flex items-start gap-2 text-[0.75rem] text-foreground/70 leading-relaxed">
                <span className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ background: "hsl(var(--clay))" }} />
                {fact}
              </li>
            ))}
          </ul>
          <div className="rounded-xl px-3 py-2.5" style={{ background: "hsl(var(--clay) / 0.1)" }}>
            <p className="text-[0.75rem] font-medium" style={{ color: "hsl(var(--bark))" }}>
              💡 {content.action}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Dad Daily Missions — encouragement, no scores ──
export function DadDailyMissions() {
  const { morName, babyAgeWeeks, profile } = useFamily();
  const childName = profile.children?.[0]?.name || "baby";
  const [completedIds, setCompletedIds] = useState<string[]>([]);

  const allMissions = getMissions(babyAgeWeeks, morName, childName);
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
  const todayMissions = [...allMissions]
    .map((m, i) => ({ ...m, sort: (dayOfYear * 7 + i * 13) % 100 }))
    .sort((a, b) => a.sort - b.sort)
    .slice(0, 3);

  const handleComplete = (id: string) => {
    setCompletedIds(prev => [...prev, id]);
  };

  const allDone = completedIds.length >= todayMissions.length;

  return (
    <div className="card-soft section-fade-in">
      <p className="text-[0.55rem] tracking-[0.18em] uppercase text-muted-foreground mb-3">DAGENS HANDLINGER</p>

      <div className="space-y-2">
        {todayMissions.map(m => {
          const done = completedIds.includes(m.id);
          return (
            <button
              key={m.id}
              onClick={() => !done && handleComplete(m.id)}
              className={`flex items-center gap-3 w-full text-left px-3 py-3 rounded-xl transition-all active:scale-[0.98] ${done ? "opacity-60" : ""}`}
              style={{
                background: done ? "hsl(var(--sage) / 0.08)" : "hsl(var(--sage) / 0.04)",
                border: `1px solid ${done ? "hsl(var(--sage) / 0.2)" : "hsl(var(--sage) / 0.1)"}`,
              }}
            >
              <span className="text-base flex-shrink-0">{m.emoji}</span>
              <div className="flex-1 min-w-0">
                <p className={`text-[0.82rem] ${done ? "line-through text-muted-foreground" : "font-medium"}`}>{m.title}</p>
                <p className="text-[0.65rem] text-muted-foreground">{m.subtitle}</p>
              </div>
              {done && (
                <span className="text-[0.68rem]" style={{ color: "hsl(var(--moss))" }}>✓</span>
              )}
            </button>
          );
        })}
      </div>

      {allDone && (
        <div className="mt-3 px-3 py-2.5 rounded-xl text-center" style={{ background: "hsl(var(--sage) / 0.1)" }}>
          <p className="text-[0.78rem] font-medium" style={{ color: "hsl(var(--moss))" }}>
            Stærkt! Du gør en kæmpe forskel for hele familien 💚
          </p>
        </div>
      )}

      {completedIds.length > 0 && !allDone && (
        <div className="mt-2 text-center">
          <p className="text-[0.68rem] text-muted-foreground">
            Du er godt i gang — bliv ved 🌿
          </p>
        </div>
      )}
    </div>
  );
}

// ── Dad Insight Card — fun facts + caring nudges, rotating daily ──
export function DadInsightCard() {
  const { profile, babyAgeWeeks, morName } = useFamily();
  const childName = profile.children?.[0]?.name || "Baby";
  const weight = (3.3 + babyAgeWeeks * 0.15).toFixed(1);

  const cards: { emoji: string; text: string; sub: string }[] = [
    // Fun facts
    { emoji: "💪", text: `${childName} vejer ca. ${weight} kg`, sub: "Perfekt til bicep curls under bæring" },
    { emoji: "👃", text: `${childName} kan kende din lugt`, sub: "Babyer foretrækker deres forældes duft fra dag 1" },
    { emoji: "🧒", text: `${childName}s hjerne vokser 1% om dagen`, sub: "Øjenkontakt, stemme og berøring er raketbrændstof" },
    { emoji: "👂", text: `${childName} genkender din stemme`, sub: "Tal, syng, lav lyde — det hele tæller" },
    { emoji: "🍳", text: "Achievement unlocked: lav morgenmad", sub: "Toast tæller. Alt tæller." },
    // Caring nudges
    { emoji: "🚪", text: `Tag ${childName} når du kommer ind ad døren`, sub: `${morName} har brug for at lade op — en lur, et bad, eller 15 min alene` },
    { emoji: "💬", text: `Fortæl ${morName} at hun gør det godt`, sub: `${childName} kan ikke selv sige tak endnu ❤️` },
    { emoji: "🫂", text: `Giv ${morName} en fuld pause i aften`, sub: "Bare 30 min uden ansvar gør en kæmpe forskel" },
    { emoji: "👀", text: "Se hvad der skal gøres — og gør det", sub: "Ingen huskeliste. Bare gør det." },
    { emoji: "🌙", text: `Tag aftenputningen med ${childName}`, sub: `${morName} har båret det meste af dagen — du klarer den her` },
  ];

  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
  const card = cards[dayOfYear % cards.length];

  return (
    <div className="rounded-2xl px-4 py-3.5 section-fade-in" style={{
      background: "hsl(var(--cream))",
      border: "1px solid hsl(var(--stone-light))",
    }}>
      <div className="flex items-start gap-3">
        <span className="text-xl flex-shrink-0">{card.emoji}</span>
        <div>
          <p className="text-[0.82rem] font-medium">{card.text}</p>
          <p className="text-[0.68rem] text-muted-foreground mt-0.5">{card.sub}</p>
        </div>
      </div>
    </div>
  );
}

// ── Helper: daily missions ──
function getMissions(ageWeeks: number, morName: string, childName: string) {
  const base = [
    { id: "morning", emoji: "🌅", title: "Tag morgenen i dag", subtitle: `Lad ${morName} sove lidt ekstra` },
    { id: "walk", emoji: "🚶", title: `Gå en tur med ${childName}`, subtitle: "Frisk luft gør godt for jer begge" },
    { id: "food", emoji: "🍳", title: "Lav mad eller bestil take-away", subtitle: "Hunger gør alting sværere" },
    { id: "pause", emoji: "☕", title: `Giv ${morName} 30 min pause`, subtitle: "Bare 'gå, jeg klarer det' er nok" },
    { id: "dishes", emoji: "🍽️", title: "Tag opvasken", subtitle: "Uden at blive bedt om det = guld" },
    { id: "bath", emoji: "🛁", title: `Tag badetid med ${childName}`, subtitle: "Hud-mod-hud og nærhed" },
    { id: "laundry", emoji: "👕", title: "Start en vask", subtitle: "Det lyder småt, men det letter enormt" },
    { id: "putning", emoji: "🌛", title: `Put ${childName} i seng`, subtitle: "Putning kræver nærhed — ikke amning" },
    { id: "nice", emoji: "💬", title: `Sig noget rart til ${morName}`, subtitle: "'Du er fantastisk' virker altid" },
  ];

  if (ageWeeks < 4) {
    base.push(
      { id: "diaper", emoji: "🧷", title: "Tag alle bleskift i dag", subtitle: "Det er hurtigt og det tæller" },
      { id: "hug", emoji: "🫂", title: `Hud-mod-hud med ${childName}`, subtitle: "15 min styrker jeres bånd" },
    );
  }

  return base;
}
