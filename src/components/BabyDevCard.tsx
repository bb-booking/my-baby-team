import { useState } from "react";
import { useFamily } from "@/context/FamilyContext";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useTranslation } from "react-i18next";

interface DevStage {
  weekMin: number;
  weekMax: number;
  title: string;
  description: string;
  activities: { title: string; how: string }[];
  morTip: string;
  farTip: string;
}

const DEV_STAGES: DevStage[] = [
  {
    weekMin: 0, weekMax: 3,
    title: "4. trimester · sanser og nærhed",
    description: "Babyen genkender din stemme fra fostertilværelsen. Ansigter på 20–30 cm er optimal synsafstand. Hud-mod-hud regulerer temperatur, hjerterytme og stress.",
    activities: [
      { title: "Ansigt til ansigt", how: "Hold baby 20–30 cm fra dit ansigt, lav øjenkontakt og tal langsomt. Vent på reaktion — det er 'serve and return'." },
      { title: "Hud-mod-hud", how: "Læg baby nøgen på dit bryst. Regulerer cortisol hos jer begge — forskning viser det også virker på far." },
      { title: "Sang og stemme", how: "Syng eller tal — baby kender din stemme. Monotone rythmer (shhhh, vuggesang) aktiverer ro-systemet." },
    ],
    morTip: "Din stemme er det første instrument baby kender. Brug den.",
    farTip: "Hud-mod-hud virker for dig også. 20 minutter om dagen på dit bryst starter tilknytningen.",
  },
  {
    weekMin: 4, weekMax: 7,
    title: "Det sociale smil · uge 4–7",
    description: "Babyen begynder at smile socialt — ikke kun refleksivt. Det er hjernens belønningssystem, der responderer på jeres ansigt. Øjenkontakt og imitation er nu det vigtigste.",
    activities: [
      { title: "Imiter babyen", how: "Lad baby 'lede' — hvis de åbner munden, gør det samme. Pause og vent. Forskning kaldt det 'contingent responding'." },
      { title: "Tummy time", how: "3–5 minutter, 3–4 gange om dagen. Læg dig ned foran baby i øjenniveau — det motiverer dem til at løfte hovedet." },
      { title: "Kontrastmønstre", how: "Babyer kan se sort/hvid tydeligt. Vis enkle mønstre eller dit ansigt med overdrevne udtryk." },
    ],
    morTip: "Det første smil er til dig. Det er hjernens tak for alt hvad du har gjort.",
    farTip: "Baby smiler nu til ansigter der reagerer. Jo mere du engagerer dig, jo mere smiler de til dig.",
  },
  {
    weekMin: 8, weekMax: 15,
    title: "Udforskning · uge 8–15",
    description: "Hænder opdages. Lyde produceres bevidst (øh-øh, gurgling). Baby begynder at gribe og trækkes mod bevægelse og farver.",
    activities: [
      { title: "Serve and return med lyd", how: "Lav en lyd → vent → baby 'svarer' → responder. Det er grundlaget for al kommunikation og sprog." },
      { title: "Gribelegetøj", how: "Ryst noget med lyd foran baby. Lad dem gribe og undersøge i eget tempo — undgå at guide hånden." },
      { title: "Spejl-tid", how: "Hold baby foran et spejl. De genkender ikke sig selv, men elsker at se en 'anden baby' reagere." },
    ],
    morTip: "Baby imiterer dit tonefald nu. Overdrevet entusiasme er det rigtige niveau.",
    farTip: "Din dybere stemme er ny og interessant for baby. Leg med variation i toneleje.",
  },
  {
    weekMin: 16, weekMax: 25,
    title: "4-månedsskiftet · ny søvn og bevægelse",
    description: "Søvnarkitekturen skifter permanent til voksenagtig cyklus. Det er IKKE en regression — det er en modning. Baby begynder at rulle og udforske rummet.",
    activities: [
      { title: "Friheds-gulv-tid", how: "Læg baby på et sikkert gulv uden legetøj. Lad dem opdage at de kan flytte sig. Undgå at guide — de finder ud af det." },
      { title: "Kigge-peek-a-boo", how: "Gem dit ansigt bag dine hænder, kom frem igen. Øver 'object permanence' og udløser latter." },
      { title: "Sange med bevægelse", how: "Hold baby i dine arme og drej, vip, løft i takt med sang. Vestibulær stimulering er vigtig nu." },
    ],
    morTip: "4-månedsskiftet er hårdt. Det er biologi — ikke noget du gør forkert.",
    farTip: "Dét her er et perfekt tidspunkt at tage søvnvagter. Baby kan sove igen med trøst — ikke kun amning.",
  },
  {
    weekMin: 26, weekMax: 39,
    title: "Socialt og motorisk · 6–9 måneder",
    description: "Baby begynder at sidde, kravle og forstå 'intention'. De forstår nu at du går væk og kommer tilbage — separationsangst er et tegn på sund tilknytning.",
    activities: [
      { title: "Mad-udforskning (BLW)", how: "Giv bløde stykker mad i passende størrelse. Lad baby bestemme tempo og mængde. Rodet er en del af læringen." },
      { title: "Frem og tilbage kravlelegv", how: "Kravl væk fra baby og kig tilbage. De vil følge — det øver motorik og tillid ('du er der, selv om du går')." },
      { title: "Navngiv alt", how: "Sæt ord på alt i babys synsfeld. 'Det er en kop. Kop. Vi drikker af koppen.' Sprogudvikling starter nu." },
    ],
    morTip: "Separationsangst er et kompliment — baby er dybt knyttet til dig.",
    farTip: "Farsens involvering ved 9 måneder forudsiger barnets sprogudvikling ved 24 måneder (evidens). Det er nu.",
  },
  {
    weekMin: 40, weekMax: 999,
    title: "Opdagelse · 10–12+ måneder",
    description: "Baby begynder at forstå årsag og virkning, imiterer handlinger og viser 'intentional communication'. Det første ord nærmer sig.",
    activities: [
      { title: "Pege og navngive", how: "Følg babys blik og peg: 'Ja, det er en hund! En hund!'. Fælles opmærksomhed er grundlag for sprog." },
      { title: "Simpel klaptur", how: "Klap, bank på bordet, giv en ting og tag igen. Baby imiterer og forstår 'tur-tagning'." },
      { title: "Indrettes til udforskning", how: "Et lavt skab med legetøj de selv kan hente. Autonomi og problemløsning starter med at vælge selv." },
    ],
    morTip: "Baby imiterer dig nu præcist. De ser HVAD du gør, ikke hvad du siger.",
    farTip: "Byg ting, ryd op, lav mad — baby vil 'hjælpe'. Det er kompetence-læring, ikke forstyrrelse.",
  },
];

const DEV_STAGES_EN: DevStage[] = [
  {
    weekMin: 0, weekMax: 3,
    title: "4th trimester · senses and closeness",
    description: "Your baby recognises your voice from the womb. Faces at 20–30 cm are the optimal visual distance. Skin-to-skin regulates temperature, heart rate and stress.",
    activities: [
      { title: "Face to face", how: "Hold baby 20–30 cm from your face, make eye contact and speak slowly. Wait for a response — this is 'serve and return'." },
      { title: "Skin-to-skin", how: "Place baby skin-to-skin on your chest. It regulates cortisol in both of you — research shows it works for dads too." },
      { title: "Song and voice", how: "Sing or talk — baby knows your voice. Monotone rhythms (shhhh, lullabies) activate the calm system." },
    ],
    morTip: "Your voice is the first instrument baby knows. Use it.",
    farTip: "Skin-to-skin works for you too. 20 minutes a day on your chest starts the bonding process.",
  },
  {
    weekMin: 4, weekMax: 7,
    title: "The social smile · weeks 4–7",
    description: "Baby is starting to smile socially — not just reflexively. It's the brain's reward system responding to your face. Eye contact and imitation are the most important things now.",
    activities: [
      { title: "Imitate baby", how: "Let baby 'lead' — if they open their mouth, do the same. Pause and wait. Research calls this 'contingent responding'." },
      { title: "Tummy time", how: "3–5 minutes, 3–4 times a day. Lie down in front of baby at eye level — it motivates them to lift their head." },
      { title: "Contrast patterns", how: "Babies can see black/white clearly. Show simple patterns or your face with exaggerated expressions." },
    ],
    morTip: "The first smile is for you. It's the brain's thanks for everything you've done.",
    farTip: "Baby smiles at faces that respond. The more you engage, the more they smile at you.",
  },
  {
    weekMin: 8, weekMax: 15,
    title: "Exploration · weeks 8–15",
    description: "Hands are discovered. Sounds are produced intentionally (eh-eh, gurgling). Baby starts to grasp and is drawn to movement and colour.",
    activities: [
      { title: "Serve and return with sound", how: "Make a sound → wait → baby 'answers' → respond. This is the foundation of all communication and language." },
      { title: "Grabbing toy", how: "Shake something noisy in front of baby. Let them grab and explore at their own pace — avoid guiding their hand." },
      { title: "Mirror time", how: "Hold baby in front of a mirror. They don't recognise themselves, but love watching 'another baby' react." },
    ],
    morTip: "Baby imitates your tone of voice now. Exaggerated enthusiasm is the right level.",
    farTip: "Your deeper voice is new and interesting for baby. Play with variation in pitch.",
  },
  {
    weekMin: 16, weekMax: 25,
    title: "The 4-month shift · new sleep and movement",
    description: "Sleep architecture permanently shifts to an adult-like cycle. It is NOT a regression — it's a maturation. Baby starts to roll and explore the space.",
    activities: [
      { title: "Floor freedom time", how: "Place baby on a safe floor without toys. Let them discover they can move. Avoid guiding — they'll figure it out." },
      { title: "Peek-a-boo", how: "Hide your face behind your hands, come back again. Practises 'object permanence' and triggers laughter." },
      { title: "Songs with movement", how: "Hold baby in your arms and turn, tilt, lift in time with song. Vestibular stimulation is important now." },
    ],
    morTip: "The 4-month shift is hard. It's biology — not something you're doing wrong.",
    farTip: "This is a perfect time to take sleep shifts. Baby can sleep again with comfort — not just nursing.",
  },
  {
    weekMin: 26, weekMax: 39,
    title: "Social and motor · 6–9 months",
    description: "Baby starts to sit, crawl and understand 'intention'. They now understand that you go away and come back — separation anxiety is a sign of healthy attachment.",
    activities: [
      { title: "Food exploration (BLW)", how: "Give soft pieces of food in appropriate size. Let baby control the pace and amount. Messy is part of learning." },
      { title: "Back-and-forth crawl game", how: "Crawl away from baby and look back. They'll follow — this practises motor skills and trust ('you're there, even when you leave')." },
      { title: "Name everything", how: "Put words on everything in baby's field of vision. 'That's a cup. Cup. We drink from the cup.' Language development starts now." },
    ],
    morTip: "Separation anxiety is a compliment — baby is deeply attached to you.",
    farTip: "Dad's involvement at 9 months predicts the child's language development at 24 months (evidence). That time is now.",
  },
  {
    weekMin: 40, weekMax: 999,
    title: "Discovery · 10–12+ months",
    description: "Baby starts to understand cause and effect, imitates actions and shows 'intentional communication'. The first word is approaching.",
    activities: [
      { title: "Point and name", how: "Follow baby's gaze and point: 'Yes, that's a dog! A dog!' Joint attention is the foundation for language." },
      { title: "Simple turn-taking", how: "Clap, tap the table, give something and take it back. Baby imitates and understands 'taking turns'." },
      { title: "Set up for exploration", how: "A low cupboard with toys they can fetch themselves. Autonomy and problem-solving start with choosing." },
    ],
    morTip: "Baby imitates you precisely now. They see WHAT you do, not what you say.",
    farTip: "Build things, tidy up, cook — baby will 'help'. That's competence-learning, not disruption.",
  },
];

function getStage(ageWeeks: number, en: boolean): DevStage {
  const stages = en ? DEV_STAGES_EN : DEV_STAGES;
  return stages.find(s => ageWeeks >= s.weekMin && ageWeeks <= s.weekMax) || stages[stages.length - 1];
}

export function BabyDevCard() {
  const { profile, babyAgeWeeks } = useFamily();
  const { t, i18n } = useTranslation();
  const isMor = profile.role === "mor";
  const en = i18n.language === "en";
  const [expanded, setExpanded] = useState(false);
  const [activeActivity, setActiveActivity] = useState<number | null>(null);

  if (profile.phase === "pregnant") return null;

  const stage = getStage(babyAgeWeeks, en);
  const tip = isMor ? stage.morTip : stage.farTip;
  const accentBg = isMor ? "hsl(var(--clay-light))" : "hsl(var(--sage-light))";
  const accentText = isMor ? "hsl(var(--bark))" : "hsl(var(--moss))";

  return (
    <div className="card-soft section-fade-in space-y-3">
      <button
        className="w-full flex items-center justify-between"
        onClick={() => setExpanded(e => !e)}
      >
        <div className="flex items-center gap-2">
          <span className="text-base">🌱</span>
          <div className="text-left">
            <p className="text-[0.55rem] tracking-[0.14em] uppercase text-muted-foreground">{t("babyDev.label")}</p>
            <p className="text-[0.85rem] font-medium mt-0.5" style={{ color: "hsl(var(--bark))" }}>{stage.title}</p>
          </div>
        </div>
        {expanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
      </button>

      {/* Always visible: role tip */}
      <div className="rounded-xl px-3 py-2.5" style={{ background: accentBg }}>
        <p className="text-[0.78rem] leading-relaxed" style={{ color: accentText }}>💡 {tip}</p>
      </div>

      {expanded && (
        <div className="space-y-3">
          <p className="text-[0.75rem] text-muted-foreground leading-relaxed">{stage.description}</p>

          <p className="text-[0.62rem] tracking-[0.12em] uppercase text-muted-foreground">{t("babyDev.activities")}</p>
          <div className="space-y-2">
            {stage.activities.map((act, i) => (
              <div key={i}>
                <button
                  className="w-full text-left px-3 py-2.5 rounded-xl transition-all active:scale-[0.98]"
                  style={{
                    background: activeActivity === i ? accentBg : "hsl(var(--cream))",
                    border: "1px solid hsl(var(--stone-light))",
                  }}
                  onClick={() => setActiveActivity(activeActivity === i ? null : i)}
                >
                  <p className="text-[0.82rem] font-medium" style={{ color: "hsl(var(--bark))" }}>{act.title}</p>
                </button>
                {activeActivity === i && (
                  <div className="mx-1 px-3 py-2.5 rounded-b-xl" style={{ background: accentBg, marginTop: -4 }}>
                    <p className="text-[0.75rem] leading-relaxed" style={{ color: accentText }}>{act.how}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
