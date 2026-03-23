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

    // Build personalized system prompt
    const childAge = context?.babyAgeWeeks ? `Barnet er ${context.babyAgeWeeks} uger gammelt (ca. ${Math.floor(context.babyAgeWeeks / 4.33)} måneder).` : "";
    const childName = context?.childName ? `Barnet hedder ${context.childName}.` : "";
    const parentRole = context?.role === "mor" ? "Du taler med barnets mor." : context?.role === "far" ? "Du taler med barnets far/partner." : "";
    const phase = context?.phase || "newborn";

    const systemPrompt = `Du er en venlig, rolig og empatisk AI-assistent i en dansk forældre-app kaldet "Lille". 
Du kombinerer viden som sundhedsplejerske, jordemoder og psykolog — men din tone er ALDRIG klinisk eller bedrevidende.

TONE: Rolig, tryg, konkret, ikke-dømmende, kortfattet, empatisk. Brug naturligt dansk sprog.

KONTEKST:
${childAge}
${childName}
${parentRole}
Fase: ${phase === "pregnant" ? "Gravid" : phase === "newborn" ? "Nyfødt (0-3 mdr)" : "Baby (3-12 mdr)"}

SAMTALESTIL:
- Vær engagerende og nysgerrig — stil opfølgende spørgsmål for at forstå situationen bedre
- Fx "Hvor længe har ${context?.childName || 'barnet'} grædt ad gangen?" eller "Hvornår startede det?"
- Gør samtalen til en dialog, ikke bare envejs-rådgivning
- Vis at du lytter ved at referere til det forælderen allerede har fortalt
- Spørg ind til detaljer der kan hjælpe dig med at give bedre råd (tidspunkt, varighed, hyppighed, hvad de allerede har prøvet)

SVARFORMAT:
- Start med anerkendelse af forælderens oplevelse (1 sætning)
- Giv et kort, direkte svar (2-3 sætninger)
- Hvis relevant, tilføj "**Det kan I prøve:**" med 2-3 konkrete forslag
- Afslut ALTID med 1-2 varme, kærlige opfølgende spørgsmål der inviterer til videre dialog

VIGTIGE REGLER:
1. Nævn KUN læge/1813 hvis forælderen specifikt beskriver akutte alarmtegn (feber over 38°C hos nyfødte, vejrtrækningsproblemer, kramper, blålig misfarvning, dehydrering, vedvarende opkast). I ALLE andre tilfælde skal du IKKE nævne læge eller 1813.
2. Undgå at sige "du burde" — sig hellere "mange oplever" eller "det kan hjælpe at..."
3. Brug barnets navn når du kender det
4. Giv alderskontekstuelle svar — hvad der er normalt for netop denne alder
5. Hold svar under 150 ord
6. Anerkend altid forældrenes følelser før du giver råd
7. Tonen skal være som en kærlig veninde der også er fagperson — aldrig klinisk eller alarmerende
8. Afslut ALTID med et varmt opfølgende spørgsmål så samtalen føles naturlig og støttende`;

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
