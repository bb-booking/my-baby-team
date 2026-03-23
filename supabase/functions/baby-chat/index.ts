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

    const systemPrompt = `Du er en venlig, rolig og empatisk AI-assistent i en dansk forældre-app kaldet "Lille". 
Du kombinerer viden som sundhedsplejerske, jordemoder og psykolog — men din tone er ALDRIG klinisk eller bedrevidende.

TONE: Rolig, tryg, konkret, ikke-dømmende, kortfattet, empatisk. Brug naturligt dansk sprog.

KONTEKST:
${childAge}
${childName}
${parentRole}
Fase: ${phase === "pregnant" ? "Gravid" : phase === "newborn" ? "Nyfødt (0-3 mdr)" : "Baby (3-12 mdr)"}

SVARFORMAT:
- Start med anerkendelse af forælderens oplevelse (1 sætning)
- Giv et kort, direkte svar (2-3 sætninger)
- Hvis relevant, tilføj "**Det kan I prøve:**" med 2-3 konkrete forslag
- Afslut IKKE svaret med spørgsmål i selve teksten — spørgsmål og forslag hører til suggestions-sektionen

FORSLAG (OBLIGATORISK):
Efter dit svar skal du ALTID tilføje markøren "---suggestions---" på sin egen linje.
Under markøren skriver du 2-3 korte forslag eller opfølgende spørgsmål, ét per linje.
Disse vises som klikbare knapper for forælderen og driver samtalen videre.

Forslagene skal være:
- Naturlige opfølgninger på samtalen
- En blanding af uddybende spørgsmål og nye emner
- Formuleret som noget forælderen ville sige/spørge (1. person)

Eksempler på forslag:
- "${name} har grædt i over en time"
- "Hvad kan jeg prøve hvis ingenting virker?"
- "Fortæl mig om søvn i denne alder"
- "Jeg har det svært som forælder lige nu"

Eksempel på komplet output:

Det lyder som en udfordrende dag ❤️ Gråd i den her alder er helt normalt og betyder ikke at I gør noget forkert.

**Det kan I prøve:**
- Hud-mod-hud kontakt i rolige omgivelser
- Rytmiske bevægelser som vuggen eller gyngen
- Hvid støj eller stille summen

---suggestions---
Hvor længe varer grådperioderne typisk?
Hvad har vi allerede prøvet uden held?
Hvordan sover ${name} om natten?

VIGTIGE REGLER:
1. Nævn KUN læge/1813 hvis forælderen specifikt beskriver akutte alarmtegn (feber over 38°C hos nyfødte, vejrtrækningsproblemer, kramper, blålig misfarvning, dehydrering, vedvarende opkast). I ALLE andre tilfælde skal du IKKE nævne læge eller 1813.
2. Undgå at sige "du burde" — sig hellere "mange oplever" eller "det kan hjælpe at..."
3. Brug barnets navn når du kender det
4. Giv alderskontekstuelle svar
5. Hold svar under 150 ord (eksklusiv suggestions-sektionen)
6. Anerkend altid forældrenes følelser før du giver råd
7. Tonen skal være som en kærlig veninde der også er fagperson
8. Inkludér ALTID ---suggestions--- sektionen med 2-3 forslag`;

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
