import { useFamily } from "@/context/FamilyContext";
import { useDiary } from "@/context/DiaryContext";
import { useTranslation } from "react-i18next";
import { Heart, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";

// ── Vidste Du Card — rotating fun facts for far ──
export function VidsteDuCard({ ageWeeks, morName }: { ageWeeks: number; morName: string }) {
  const { profile } = useFamily();
  const { t, i18n } = useTranslation();
  const childName = profile.children?.[0]?.name || "Baby";

  const factsDA: { emoji: string; text: string; sub: string; category: string }[] = [
    { emoji: "🧒", category: "Udvikling", text: `${childName}s hjerne danner 1 million nye nerveforbindelser i sekundet`, sub: "Hver gang du taler, synger eller griner — bygger du hjerne." },
    { emoji: "👃", category: "Sanser", text: `${childName} kan kende din lugt på 10 meters afstand`, sub: "Babyer foretrækker fars deodorant over Chanel No. 5." },
    { emoji: "💪", category: "Styrke", text: `En nyfødt har griberefleks stærk nok til at hænge i en stang`, sub: "Teknisk set er din baby klar til CrossFit." },
    { emoji: "🏃", category: "Fun fact", text: "Babyer har 300 knogler — voksne kun 206", sub: "Din baby er bogstaveligt mere fleksibel end nogen yogainstruktør." },
    { emoji: "🫀", category: "Krop", text: `${childName}s hjerte slår 120-160 gange i minuttet`, sub: "Det er hurtigere end din puls efter en 5K." },
    { emoji: "😴", category: "Søvn", text: `${childName} bruger 50% af søvnen på at drømme`, sub: "Voksne kun 20%. Hvad drømmer de mon om? Mælk, garanteret." },
    { emoji: "👀", category: "Syn", text: `${childName} kan kun fokusere 20-25 cm væk`, sub: "Præcis afstanden til dit ansigt under bæring. Evolutionens design." },
    { emoji: "🏋️", category: "Træning", text: `At bære ${childName} en hel dag ≈ at løfte 700+ kg samlet`, sub: "Du træner mere end du tror. Far-bod er en medalje." },
    { emoji: "⚽", category: "Sport", text: "Fedtemadder i nat = straffe i overtiden", sub: "Ingen træner forbereder dig på det her. Men du scorer alligevel." },
    { emoji: "🏆", category: "Præstation", text: "At overleve uge 1 er sværere end en ironman", sub: `Ingen medalje — men du ved det. Og ${morName} ved det.` },
    { emoji: "🎯", category: "Fakta", text: "Fædre der er aktive fra dag 1 har stærkere bånd hele livet", sub: "Det du gør NU har betydning om 20 år. Ingen pres." },
    { emoji: "📊", category: "Forskning", text: "Babyer der hører fars stemme dagligt udvikler sprog hurtigere", sub: "Snak om fodbold, aktier eller vejret — det er lige godt." },
    { emoji: "💑", category: "Parforhold", text: "67% af par oplever lavere tilfredshed efter baby", sub: "Men de der TALER om det, kommer stærkere ud. Så tal." },
    { emoji: "🧠", category: "Hjerne", text: "Fars hjerne ændrer sig fysisk af at være forælder", sub: "Grå substans vokser i empati-området. Du bliver bogstaveligt klogere." },
    { emoji: "🌙", category: "Nattevagt", text: `4-6 timer brudt søvn ≈ 0,1 promille alkohol`, sub: `Kør forsigtigt. Og vær sød mod dig selv — og ${morName}.` },
    { emoji: "🤝", category: "Samarbejde", text: "Par der deler nattefodringer har 40% mindre stress", sub: "Det er ikke 50/50 hver nat — men over tid balancerer det." },
  ];

  const factsEN: { emoji: string; text: string; sub: string; category: string }[] = [
    { emoji: "🧒", category: "Development", text: `${childName}'s brain forms 1 million new neural connections per second`, sub: "Every time you talk, sing or laugh — you're building brain." },
    { emoji: "👃", category: "Senses", text: `${childName} can recognize your scent from 10 meters away`, sub: "Babies prefer dad's deodorant over Chanel No. 5." },
    { emoji: "💪", category: "Strength", text: `A newborn has a grip reflex strong enough to hang from a bar`, sub: "Technically, your baby is ready for CrossFit." },
    { emoji: "🏃", category: "Fun fact", text: "Babies have 300 bones — adults only 206", sub: "Your baby is literally more flexible than any yoga instructor." },
    { emoji: "🫀", category: "Body", text: `${childName}'s heart beats 120-160 times per minute`, sub: "That's faster than your pulse after a 5K." },
    { emoji: "😴", category: "Sleep", text: `${childName} spends 50% of sleep dreaming`, sub: "Adults only 20%. What do they dream about? Milk, guaranteed." },
    { emoji: "👀", category: "Vision", text: `${childName} can only focus 20-25 cm away`, sub: "Exactly the distance to your face while carrying. Evolution's design." },
    { emoji: "🏋️", category: "Training", text: `Carrying ${childName} all day ≈ lifting 700+ kg total`, sub: "You're training more than you think. Dad-bod is a medal." },
    { emoji: "⚽", category: "Sports", text: "Night feeds = penalty kicks in overtime", sub: "No coach prepares you for this. But you score anyway." },
    { emoji: "🏆", category: "Achievement", text: "Surviving week 1 is harder than an ironman", sub: `No medal — but you know it. And ${morName} knows it.` },
    { emoji: "🎯", category: "Facts", text: "Dads who are active from day 1 have stronger bonds for life", sub: "What you do NOW matters in 20 years. No pressure." },
    { emoji: "📊", category: "Research", text: "Babies who hear dad's voice daily develop language faster", sub: "Talk about football, stocks or the weather — it's all good." },
    { emoji: "💑", category: "Relationship", text: "67% of couples experience lower satisfaction after baby", sub: "But those who TALK about it come out stronger. So talk." },
    { emoji: "🧠", category: "Brain", text: "Dad's brain physically changes from being a parent", sub: "Grey matter grows in the empathy area. You're literally getting smarter." },
    { emoji: "🌙", category: "Night shift", text: `4-6 hours broken sleep ≈ 0.1‰ blood alcohol`, sub: `Drive carefully. And be kind to yourself — and ${morName}.` },
    { emoji: "🤝", category: "Teamwork", text: "Couples who share night feeds have 40% less stress", sub: "It's not 50/50 every night — but over time it balances." },
  ];

  const allFacts = i18n.language === "en" ? factsEN : factsDA;
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
  const fact = allFacts[dayOfYear % allFacts.length];

  return (
    <div className="rounded-2xl px-4 py-4 section-fade-in" style={{
      background: "linear-gradient(135deg, hsl(var(--sage) / 0.08), hsl(var(--sage) / 0.03))",
      border: "1px solid hsl(var(--sage) / 0.12)",
    }}>
      <div className="flex items-center gap-2 mb-2.5">
        <span className="text-sm">💡</span>
        <p className="text-[0.55rem] tracking-[0.16em] uppercase text-muted-foreground">{t("farFacts.header")}</p>
        <span className="ml-auto text-[0.55rem] tracking-wider uppercase text-muted-foreground/60">{fact.category}</span>
      </div>
      <div className="flex items-start gap-3">
        <span className="text-xl flex-shrink-0">{fact.emoji}</span>
        <div>
          <p className="text-[0.88rem] font-medium leading-snug">{fact.text}</p>
          <p className="text-[0.72rem] text-muted-foreground mt-1 leading-relaxed">{fact.sub}</p>
        </div>
      </div>
    </div>
  );
}

// ── Dad Daily Missions ──
export function DadDailyMissions() {
  const { morName, babyAgeWeeks, profile } = useFamily();
  const { t, i18n } = useTranslation();
  const childName = profile.children?.[0]?.name || "baby";
  const [completedIds, setCompletedIds] = useState<string[]>([]);

  const allMissions = getMissions(babyAgeWeeks, morName, childName, i18n.language);
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
      <p className="text-[0.55rem] tracking-[0.18em] uppercase text-muted-foreground mb-3">{t("farFacts.todaysActions")}</p>
      <div className="space-y-2">
        {todayMissions.map(m => {
          const done = completedIds.includes(m.id);
          return (
            <button key={m.id} onClick={() => !done && handleComplete(m.id)}
              className={`flex items-center gap-3 w-full text-left px-3 py-3 rounded-xl transition-all active:scale-[0.98] ${done ? "opacity-60" : ""}`}
              style={{ background: done ? "hsl(var(--sage) / 0.08)" : "hsl(var(--sage) / 0.04)", border: `1px solid ${done ? "hsl(var(--sage) / 0.2)" : "hsl(var(--sage) / 0.1)"}` }}>
              <span className="text-base flex-shrink-0">{m.emoji}</span>
              <div className="flex-1 min-w-0">
                <p className={`text-[0.82rem] ${done ? "line-through text-muted-foreground" : "font-medium"}`}>{m.title}</p>
                <p className="text-[0.65rem] text-muted-foreground">{m.subtitle}</p>
              </div>
              {done && <span className="text-[0.68rem]" style={{ color: "hsl(var(--moss))" }}>✓</span>}
            </button>
          );
        })}
      </div>
      {allDone && (
        <div className="mt-3 px-3 py-2.5 rounded-xl text-center" style={{ background: "hsl(var(--sage) / 0.1)" }}>
          <p className="text-[0.78rem] font-medium" style={{ color: "hsl(var(--moss))" }}>{t("farFacts.allDone")}</p>
        </div>
      )}
      {completedIds.length > 0 && !allDone && (
        <div className="mt-2 text-center">
          <p className="text-[0.68rem] text-muted-foreground">{t("farFacts.keepGoing")}</p>
        </div>
      )}
    </div>
  );
}

// ── Dad Insight Card ──
export function DadInsightCard() {
  const { profile, babyAgeWeeks, morName } = useFamily();
  const { i18n } = useTranslation();
  const childName = profile.children?.[0]?.name || "Baby";
  const weight = (3.3 + babyAgeWeeks * 0.15).toFixed(1);

  const cardsDA = [
    { emoji: "💪", text: `${childName} vejer ca. ${weight} kg`, sub: "Perfekt til bicep curls under bæring" },
    { emoji: "👃", text: `${childName} kan kende din lugt`, sub: "Babyer foretrækker deres forældes duft fra dag 1" },
    { emoji: "🧒", text: `${childName}s hjerne vokser 1% om dagen`, sub: "Øjenkontakt, stemme og berøring er raketbrændstof" },
    { emoji: "👂", text: `${childName} genkender din stemme`, sub: "Tal, syng, lav lyde — det hele tæller" },
    { emoji: "🍳", text: "Achievement unlocked: lav morgenmad", sub: "Toast tæller. Alt tæller." },
    { emoji: "🚪", text: `Tag ${childName} når du kommer ind ad døren`, sub: `${morName} har brug for at lade op` },
    { emoji: "💬", text: `Fortæl ${morName} at hun gør det godt`, sub: `${childName} kan ikke selv sige tak endnu ❤️` },
    { emoji: "🫂", text: `Giv ${morName} en fuld pause i aften`, sub: "Bare 30 min uden ansvar gør en kæmpe forskel" },
    { emoji: "👀", text: "Se hvad der skal gøres — og gør det", sub: "Ingen huskeliste. Bare gør det." },
    { emoji: "🌙", text: `Tag aftenputningen med ${childName}`, sub: `${morName} har båret det meste af dagen — du klarer den her` },
  ];

  const cardsEN = [
    { emoji: "💪", text: `${childName} weighs about ${weight} kg`, sub: "Perfect for bicep curls while carrying" },
    { emoji: "👃", text: `${childName} can recognize your scent`, sub: "Babies prefer their parents' scent from day 1" },
    { emoji: "🧒", text: `${childName}'s brain grows 1% per day`, sub: "Eye contact, voice and touch are rocket fuel" },
    { emoji: "👂", text: `${childName} recognizes your voice`, sub: "Talk, sing, make sounds — it all counts" },
    { emoji: "🍳", text: "Achievement unlocked: make breakfast", sub: "Toast counts. Everything counts." },
    { emoji: "🚪", text: `Take ${childName} when you walk in the door`, sub: `${morName} needs to recharge` },
    { emoji: "💬", text: `Tell ${morName} she's doing great`, sub: `${childName} can't say thank you yet ❤️` },
    { emoji: "🫂", text: `Give ${morName} a full break tonight`, sub: "Just 30 min without responsibility makes a huge difference" },
    { emoji: "👀", text: "See what needs doing — and do it", sub: "No checklist needed. Just do it." },
    { emoji: "🌙", text: `Take bedtime with ${childName}`, sub: `${morName} has carried most of the day — you've got this` },
  ];

  const cards = i18n.language === "en" ? cardsEN : cardsDA;
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
  const card = cards[dayOfYear % cards.length];

  return (
    <div className="rounded-2xl px-4 py-3.5 section-fade-in" style={{ background: "hsl(var(--cream))", border: "1px solid hsl(var(--stone-light))" }}>
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

function getMissions(ageWeeks: number, morName: string, childName: string, lang: string) {
  if (lang === "en") {
    const base = [
      { id: "morning", emoji: "🌅", title: "Take the morning today", subtitle: `Let ${morName} sleep a bit extra` },
      { id: "walk", emoji: "🚶", title: `Go for a walk with ${childName}`, subtitle: "Fresh air is good for both of you" },
      { id: "food", emoji: "🍳", title: "Make food or order takeaway", subtitle: "Hunger makes everything harder" },
      { id: "pause", emoji: "☕", title: `Give ${morName} 30 min break`, subtitle: "Just 'go, I've got this' is enough" },
      { id: "dishes", emoji: "🍽️", title: "Do the dishes", subtitle: "Without being asked = gold" },
      { id: "bath", emoji: "🛁", title: `Take bath time with ${childName}`, subtitle: "Skin-to-skin and closeness" },
      { id: "laundry", emoji: "👕", title: "Start a load of laundry", subtitle: "Sounds small but it helps enormously" },
      { id: "putning", emoji: "🌛", title: `Put ${childName} to bed`, subtitle: "Bedtime needs closeness — not nursing" },
      { id: "nice", emoji: "💬", title: `Say something nice to ${morName}`, subtitle: "'You're amazing' always works" },
    ];
    if (ageWeeks < 4) {
      base.push(
        { id: "diaper", emoji: "🧷", title: "Take all diaper changes today", subtitle: "It's quick and it counts" },
        { id: "hug", emoji: "🫂", title: `Skin-to-skin with ${childName}`, subtitle: "15 min strengthens your bond" },
      );
    }
    return base;
  }

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
