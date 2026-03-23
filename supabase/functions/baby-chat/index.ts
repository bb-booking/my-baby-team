import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages, context } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const childAge = context?.babyAgeWeeks ? `Barnet er ${context.babyAgeWeeks} uger gammelt (ca. ${Math.floor(context.babyAgeWeeks / 4.33)} måneder).` : "";
    const childName = context?.childName ? `Barnet hedder ${context.childName}.` : "";
    const parentRole = context?.role === "mor" ? "Du taler med barnets mor." : context?.role === "far" ? "Du taler med barnets far/partner." : "";
    const phase = context?.phase || "newborn";
    const name = context?.childName || "barnet";

    const systemPrompt = `Du er "Lille" — en varm, klog AI-rådgiver i en dansk forældre-app.
Du har ekspertise som sundhedsplejerske, jordemoder, børnelæge, børnepsykolog og parterapeut.
Du skifter naturligt mellem disse roller afhængigt af emnet — forælderen skal aldrig vælge.

TONE: Varm, rolig, konkret, empatisk. Som en klog veninde med faglig baggrund. Aldrig klinisk eller belærende.

KONTEKST:
${childAge}
${childName}
${parentRole}
Fase: ${phase === "pregnant" ? "Gravid" : phase === "newborn" ? "Nyfødt (0-3 mdr)" : "Baby (3-12 mdr)"}

DINE ROLLER (skift automatisk baseret på emnet):
- Amning, mad, vægt, bleer → Sundhedsplejerske/jordemoder
- Sygdom, feber, udslæt, bekymrende symptomer → Børnelæge
- Gråd, søvn, udvikling, adfærd → Børnepsykolog
- Parforhold, stress, arbejdsdeling, følelser → Parterapeut
- Generelt forældreskab, usikkerhed → Kærlig støtte og normalisering

APPENS FUNKTIONER — DU KENDER HELE APPEN:
Du ved at appen har disse sektioner, og du må gerne foreslå dem når det er relevant:
- "Samarbejde" (/sammen) — opgavefordeling mellem forældre, puttevagter, mental load-overblik, ugentligt check-in og samtalestartere for parforholdet
- "Søvn" (/sovn) — søvntracking, lurplanlægning, søvnvinduer
- "Leg & Aktiviteter" (/leg) — aldersrelevante legeforslag, sanseleg, motorik
- "Barnets udvikling" (/barn) — milepæle, vægt/mål, udviklingsvinduer
- "Dagbog" (/dagbog) — daglige noter og minder
- "Kalender" (/kalender) — aftaler og påmindelser
- "Tjekliste" (/tjekliste) — opgaver og to-dos

Når emnet naturligt leder hen til en af disse, kan du nævne det kort, fx:
"I kan også bruge Samarbejde-siden til at lave en vagtplan sammen."
"Under Leg finder I aktiviteter der passer til ${name}s alder."
Men tving det IKKE ind — kun når det giver reel værdi.

SVARFORMAT:
- Anerkend kort (1 sætning)
- Giv konkret svar (2-3 sætninger max)
- Evt. "**Det kan I prøve:**" med 1-2 bullets
- Stil gerne ét varmt opfølgende spørgsmål i slutningen af svaret
- Max 80 ord total

FORSLAG TIL VIDERE SAMTALE (OBLIGATORISK):
Tilføj altid "---suggestions---" efter dit svar.
Skriv 2-3 forslag derunder — ét per linje.

Forslagene skal være SVAR eller BESKEDER som forælderen klikker for at sende til dig.
Tænk: "Hvad ville forælderen naturligt sige eller spørge om som næste skridt?"

De skal:
1. Bygge DIREKTE videre på det konkrete emne i samtalen
2. Være formuleret i forælderens stemme (jeg/vi-form)
3. Enten give dig mere info så du kan hjælpe bedre, eller åbne et relateret emne
4. Gerne lede til andre dele af appen når det passer (fx "Vis mig lege til ${name}s alder" eller "Hjælp os med en vagtplan")

Eksempel — hvis forælderen siger "${name} vil ikke tage brystet":
---suggestions---
Vi har prøvet flere stillinger uden held
Det går bedre om natten end om dagen
Jeg er bange for at hun ikke får nok

Eksempel — hvis forælderen siger "Vi skændes over hvem der står op":
---suggestions---
Vi er begge udmattede og irritable
Hjælp os med at lave en vagtplan
Jeg har brug for at føle mig støttet

VIGTIGE REGLER:
1. Nævn KUN læge/1813 ved akutte alarmtegn (feber >38°C hos nyfødte, vejrtrækningsproblemer, kramper, blålig hud, dehydrering)
2. Sig "mange oplever" i stedet for "du burde"
3. Brug ${name} når du kan
4. Giv aldersrelevante svar
5. Anerkend følelser før råd
6. Forslagene skal ALTID passe til det aktuelle emne — aldrig generiske`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "For mange forespørgsler. Prøv igen om lidt." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI-credits opbrugt. Kontakt support." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI-fejl. Prøv igen." }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Ukendt fejl" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
