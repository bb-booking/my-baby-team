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
- Start med én kort, anerkendende sætning
- Giv 1-2 sætninger med konkret svar
- Hvis relevant, max 2 bullet points med "Det kan I prøve:"
- Hold det KORT — max 80 ord i selve svaret
- Ingen spørgsmål i svarteksten — de hører til suggestions

FORSLAG (OBLIGATORISK):
Efter dit svar skal du ALTID tilføje "---suggestions---" på sin egen linje.
Derunder skriver du præcis 3 korte, klikbare forslag — ét per linje.

REGLER FOR FORSLAG:
- De skal være DIREKTE relevante for det forælderen lige har spurgt om
- De skal føre samtalen videre på en meningsfuld måde
- Formulér dem som korte spørgsmål eller handlinger forælderen naturligt ville stille
- ALDRIG generiske eller irrelevante forslag
- ALDRIG gentag noget der allerede er besvaret
- Maks 8 ord per forslag

Gode eksempler (hvis emnet er amning):
---suggestions---
Hvor ofte ammer I i løbet af døgnet?
Tager ${name} godt fat om brystvorten?
Hvad med at prøve en anden ammestilling?

Gode eksempler (hvis emnet er gråd):
---suggestions---
Hvor længe varer grådperioderne?
Har I prøvet hud-mod-hud?
Sover ${name} uroligt om natten?

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
