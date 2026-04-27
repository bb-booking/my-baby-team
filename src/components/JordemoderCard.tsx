import { useFamily } from "@/context/FamilyContext";
import { useDiary } from "@/context/DiaryContext";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { da, enUS } from "date-fns/locale";
import { useTranslation } from "react-i18next";

function getRecoveryContent(birthType: string | undefined, ageWeeks: number, isMor: boolean, en: boolean) {
  if (!isMor) return null;
  if (ageWeeks > 16) return null;

  const sections: { icon: string; text: string }[] = [];

  if (ageWeeks < 1) {
    if (birthType === "kejsersnit") {
      sections.push({ icon: "🩹", text: en ? "Your incision is healing from the inside out. Avoid lifting more than the baby for the next 6 weeks — it's not laziness, it's medically necessary." : "Dit snit heler indefra ud. Undgå at løfte mere end baby de næste 6 uger — det er ikke dovenskab, det er medicinsk nødvendigt." });
      sections.push({ icon: "⚠️", text: en ? "Warning signs: Fever above 38°, increasing redness/swelling at the scar, heavy bleeding — call your doctor or emergency services." : "Advarselstegn: Feber over 38°, tiltagende rødme/hævelse ved ar, kraftig blødning — ring til 1813 eller 112." });
    } else {
      sections.push({ icon: "🌸", text: en ? "Your body will bleed normally for 4–6 weeks. Keep any stitches clean and dry — they usually heal within 2 weeks." : "Din krop bløder normalt i 4–6 uger. Hold eventuelle sting rene og tørre — de heler oftest inden 2 uger." });
      sections.push({ icon: "⚠️", text: en ? "Warning signs: Heavy bleeding (more than a period), fever, unpleasant smell from stitches — contact your midwife." : "Advarselstegn: Kraftig blødning (mere end en menstruation), feber, ubehagelig lugt fra sting — kontakt din jordmoder." });
    }
    sections.push({ icon: "🤍", text: en ? "Baby blues peaks days 3–5 and is completely normal. PPD is different and not about weakness. Talk to your midwife if you're unsure." : "Babybluesen topper dag 3–5 og er helt normal. PPD er noget andet og handler ikke om svaghed. Tal med din jordmoder hvis du er i tvivl." });
  } else if (ageWeeks < 3) {
    if (birthType === "kejsersnit") {
      sections.push({ icon: "🩹", text: en ? "Avoid baths, pools and the sea for now — wait at least 4 weeks. Showers are fine. No lifting heavier than the baby." : "Undgå bad, pool og hav endnu — vent mindst 4 uger. Brusebad er fint. Ingen løft over babyens vægt." });
    } else {
      sections.push({ icon: "🌸", text: en ? "Stitches are healing for most now. You can start pelvic floor exercises gently — 10 holds, 3× a day." : "Sting heler nu for de fleste. Bækkenbundstræning kan du starte stille og roligt — 10 holdninger, 3× om dagen." });
    }
    sections.push({ icon: "💤", text: en ? "Sleep deprivation accumulates — try to sleep when baby sleeps, even if it feels impossible." : "Søvnmangel akkumulerer — forsøg at sove når baby sover, selv om det føles umuligt." });
  } else if (ageWeeks < 7) {
    if (birthType === "kejsersnit") {
      sections.push({ icon: "🩹", text: en ? "6 weeks: You can now gradually start lifting more. The scar is sensitive for up to a year — moisturising with a neutral cream helps." : "6 uger: Nu må du gradvist begynde at løfte mere. Arret er sart i op til et år — fugt det gerne med neutralcreme." });
    }
    sections.push({ icon: "🏥", text: en ? "Remember: 8-week check-up with your GP. Book it now if you haven't already." : "Husk: 8-ugers kontrol hos din læge. Book den nu hvis du ikke allerede har gjort det." });
    sections.push({ icon: "💪", text: en ? "Pelvic floor exercises: 3 sets × 10 holds, 3× a week. Your body is recovering." : "Bækkenbundstræning: 3 sæt × 10 holdninger, 3× om ugen. Din krop er i gang med at komme sig." });
  } else if (ageWeeks < 13) {
    sections.push({ icon: "💛", text: en ? "Your body may need 6–8 months for full recovery. It's still normal to have pain or fatigue now." : "Din krop kan have brug for 6–8 måneder til fuld genopretning. Det er normalt stadig at have smerter eller træthed nu." });
    if (birthType === "kejsersnit") {
      sections.push({ icon: "🩹", text: en ? "The internal scar is still healing. Avoid heavy lifting and intense exercise until at least week 12." : "Arret inde i kroppen er stadig ved at hele. Undgå tunge løft og intens motion til minimum uge 12." });
    }
  } else if (ageWeeks < 17) {
    sections.push({ icon: "✨", text: en ? "Most bodies are well into recovery now. Keep up the pelvic floor work — it pays off long term." : "De fleste kroppe er godt i gang med genopretning nu. Fortsæt bækkenbundstræning — det betaler sig langsigtet." });
  }

  return sections.length > 0 ? sections : null;
}

function getNursingInsight(nursingLogs: any[], feedingMethod: string | undefined, en: boolean) {
  if (!feedingMethod || feedingMethod === "flaske") return null;

  const breastLogs = nursingLogs.filter(l => l.side !== "bottle");
  const lastBreast = breastLogs[0];
  const lastAny = nursingLogs[0];

  if (!lastAny) return null;

  const locale = en ? enUS : da;
  const leftLabel = en ? "left" : "venstre";
  const rightLabel = en ? "right" : "højre";

  if (feedingMethod === "amning" && lastBreast) {
    const suggestedSide = lastBreast.side === "left" ? rightLabel : leftLabel;
    const ago = formatDistanceToNow(new Date(lastBreast.timestamp), { locale, addSuffix: true });
    return {
      icon: "🤱",
      line1: en ? `Last: ${lastBreast.side === "left" ? "left" : "right"} breast · ${ago}` : `Sidst: ${lastBreast.side === "left" ? "venstre" : "højre"} bryst · ${ago}`,
      line2: en ? `Suggestion: Try ${suggestedSide} side next time` : `Forslag: Prøv ${suggestedSide} side næste gang`,
    };
  }

  if (feedingMethod === "begge") {
    if (lastAny.side === "bottle") {
      const ago = formatDistanceToNow(new Date(lastAny.timestamp), { locale, addSuffix: true });
      return {
        icon: "🍼",
        line1: en ? `Last: bottle${lastAny.ml ? ` · ${lastAny.ml} ml` : ""} · ${ago}` : `Sidst: flaske${lastAny.ml ? ` · ${lastAny.ml} ml` : ""} · ${ago}`,
        line2: lastBreast
          ? (en ? `Last nursing: ${lastBreast.side === "left" ? "left" : "right"} breast` : `Seneste amning: ${lastBreast.side === "left" ? "venstre" : "højre"} bryst`)
          : (en ? "Switch to nursing next time?" : "Skift til amning næste gang?"),
      };
    } else if (lastBreast) {
      const suggestedSide = lastBreast.side === "left" ? rightLabel : leftLabel;
      const ago = formatDistanceToNow(new Date(lastBreast.timestamp), { locale, addSuffix: true });
      return {
        icon: "🤱",
        line1: en ? `Last: ${lastBreast.side === "left" ? "left" : "right"} breast · ${ago}` : `Sidst: ${lastBreast.side === "left" ? "venstre" : "højre"} bryst · ${ago}`,
        line2: en ? `Suggestion: ${suggestedSide} side next time` : `Forslag: ${suggestedSide} side næste gang`,
      };
    }
  }

  return null;
}

function getHealthVisitReminder(ageWeeks: number, en: boolean): { icon: string; text: string } | null {
  if (ageWeeks >= 1 && ageWeeks < 3) return { icon: "📋", text: en ? "Health visitor at day 14 is approaching — book it if you haven't got an appointment yet." : "Sundhedsplejerske-besøg dag 14 nærmer sig — book det hvis du ikke har fået tid endnu." };
  if (ageWeeks >= 7 && ageWeeks < 10) return { icon: "💉", text: en ? "2-month check-up + first vaccinations are approaching. Book an appointment with your GP now." : "2-måneders undersøgelse + første vaccination nærmer sig. Book tid hos din læge nu." };
  if (ageWeeks >= 19 && ageWeeks < 23) return { icon: "💉", text: en ? "5-month check-up + second vaccinations. Remember to book an appointment with your GP." : "5-måneders undersøgelse + anden vaccination. Husk at booke tid hos din læge." };
  if (ageWeeks >= 33 && ageWeeks < 37) return { icon: "💉", text: en ? "8–10-month check-up + third vaccinations. Remember to book an appointment with your GP." : "8–10-måneders undersøgelse + tredje vaccination. Husk at booke tid hos din læge." };
  return null;
}

export function JordemoderCard() {
  const { profile, babyAgeWeeks, morName } = useFamily();
  const { nursingLogs } = useDiary();
  const { t, i18n } = useTranslation();
  const isMor = profile.role === "mor";
  const en = i18n.language === "en";
  const birthType = profile.morHealth?.birthType;
  const feedingMethod = profile.morHealth?.feedingMethod;

  const recoverySections = getRecoveryContent(birthType, babyAgeWeeks, isMor, en);
  const nursingInsight = getNursingInsight(nursingLogs, feedingMethod, en);
  const healthReminder = getHealthVisitReminder(babyAgeWeeks, en);

  const farSupportTip = !isMor && babyAgeWeeks < 8 ? getFarSupportTip(birthType, babyAgeWeeks, en) : null;

  const hasContent = recoverySections || nursingInsight || healthReminder || farSupportTip;
  if (!hasContent) return null;

  return (
    <div className="card-soft section-fade-in space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-base">{isMor ? "🌸" : "🤝"}</span>
          <p className="text-[0.55rem] tracking-[0.14em] uppercase text-muted-foreground">
            {isMor ? t("jordemoder.forYou", { name: profile.parentName || morName }) : t("jordemoder.supportPartner", { name: morName })}
          </p>
        </div>
        {isMor && (
          <Link to="/raad" className="inline-flex items-center gap-1 text-[0.62rem] font-medium transition-colors" style={{ color: "hsl(var(--clay))" }}>
            {t("jordemoder.readMore")} <ArrowRight className="w-3 h-3" />
          </Link>
        )}
      </div>

      {/* Far support tip */}
      {farSupportTip && (
        <div className="rounded-xl px-3 py-2.5 space-y-1" style={{ background: "hsl(var(--sage-light))" }}>
          <p className="text-[0.8rem] font-medium" style={{ color: "hsl(var(--moss))" }}>{farSupportTip.title}</p>
          <p className="text-[0.75rem] leading-relaxed" style={{ color: "hsl(var(--moss))" }}>{farSupportTip.body}</p>
        </div>
      )}

      {/* Jordemoder recovery sections */}
      {recoverySections && recoverySections.map((s, i) => (
        <div key={i} className={`rounded-xl px-3 py-2.5 ${s.icon === "⚠️" ? "" : ""}`}
          style={{ background: s.icon === "⚠️" ? "hsl(var(--clay-light))" : "hsl(var(--cream))", border: s.icon === "⚠️" ? "1px solid hsl(var(--clay) / 0.3)" : "1px solid hsl(var(--stone-light))" }}>
          <p className="text-[0.78rem] leading-relaxed" style={{ color: "hsl(var(--bark))" }}>{s.icon} {s.text}</p>
        </div>
      ))}

      {/* Ammevejleder nursing insight */}
      {nursingInsight && (
        <div className="rounded-xl px-3 py-2.5" style={{ background: "hsl(var(--sage-light))" }}>
          <p className="text-[0.68rem] tracking-[0.1em] uppercase text-muted-foreground mb-1">{t("jordemoder.ammevejleder")}</p>
          <p className="text-[0.82rem] font-medium" style={{ color: "hsl(var(--moss))" }}>{nursingInsight.icon} {nursingInsight.line1}</p>
          <p className="text-[0.75rem]" style={{ color: "hsl(var(--moss))" }}>{nursingInsight.line2}</p>
        </div>
      )}

      {/* Health visit reminder */}
      {healthReminder && (
        <div className="rounded-xl px-3 py-2.5" style={{ background: "hsl(var(--sand-light, var(--cream)))", border: "1px solid hsl(var(--stone-light))" }}>
          <p className="text-[0.78rem] leading-relaxed" style={{ color: "hsl(var(--bark))" }}>{healthReminder.icon} {healthReminder.text}</p>
        </div>
      )}
    </div>
  );
}

function getFarSupportTip(birthType: string | undefined, ageWeeks: number, en: boolean): { title: string; body: string } | null {
  if (ageWeeks < 1) {
    if (birthType === "kejsersnit") return {
      title: en ? "C-section: she cannot lift" : "Kejsersnit: hun må ikke løfte",
      body: en ? "Take all lifting above the baby's weight yourself for the next 6 weeks. It's not symbolic — it's medically necessary for her healing." : "Tag alt løft over babyens vægt dig selv de næste 6 uger. Det er ikke symbolsk — det er medicinsk nødvendigt for hendes heling.",
    };
    return {
      title: en ? "Her body is starting to heal" : "Hendes krop er i gang med at hele",
      body: en ? "Watch for signs of anything unusual: heavy bleeding, fever, pain at stitches. Tell her to let you know if something doesn't feel right." : "Hold øje med tegn på noget unormalt: kraftig blødning, feber, smerter ved sting. Sig til hende at hun skal fortælle dig, hvis noget ikke føles rigtigt.",
    };
  }
  if (ageWeeks < 6) return {
    title: en ? "Baby blues is real" : "Babybluesen er reel",
    body: en ? "Hormones crash in weeks 1–2. It's not weakness — it's chemistry. Ask specifically: 'What can I do right now?' rather than 'Are you okay?'" : "Hormonerne styrtdykker uge 1–2. Det er ikke svaghed — det er kemi. Spørg konkret: 'Hvad kan jeg gøre nu?' frem for 'er du okay?'",
  };
  return {
    title: en ? "Her body is still recovering" : "Hendes krop restituerer stadig",
    body: en ? "Full recovery takes 6–8 months. Fatigue and soreness are still normal now — even if she doesn't say it out loud." : "Fuld restitution tager 6–8 måneder. Træthed og ømhed er stadig normal nu — selv om hun ikke siger det højt.",
  };
}
