import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

/**
 * Content Expert — generates and validates age-appropriate content
 * using the full expert panel. Used for:
 * - Knowledge cards (Råd & Guides)
 * - Week insights
 * - Partner nudges
 * - Milestone descriptions
 * - Activity suggestions
 */
serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { type, babyAgeWeeks, role, phase, childName } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const name = childName || "barnet";
    const ageMonths = Math.floor((babyAgeWeeks || 0) / 4.33);

    const expertSystemPrompt = `Du er et tværfagligt ekspertpanel bestående af:
- Sundhedsplejerske (amning, ernæring, trivsel)
- Jordemoder (graviditet, fødsel, restitution)
- Børnelæge (sygdom, udvikling, vaccinationer)
- Børne- og forældrepsykolog (tilknytning, følelser, PPD)
- Parterapeut for nye forældre (kommunikation, roller, intimitet)
- Kolik- og børnesygdomsekspert (kolik, refluks, allergi)
- Gamification-specialist (motivation, progression, mestring)
- PhD-forsker i forældreskab (evidens, myter vs. fakta)
- Mental load-specialist (opgavefordeling, usynligt arbejde)
- Børnesøvn-specialist (søvnvinduer, rutiner, regressioner)

KONTEKST:
- Barnets navn: ${name}
- Alder: ${babyAgeWeeks || 0} uger (${ageMonths} måneder)
- Fase: ${phase === "pregnant" ? "Gravid" : phase === "newborn" ? "Nyfødt (0-3 mdr)" : "Baby (3-12 mdr)"}
- Forælder: ${role === "mor" ? "Mor" : "Far/partner"}

KVALITETSKRAV:
- Al information SKAL være evidensbaseret og korrekt for den præcise alder
- Nævn ALDRIG milepæle/råd fra en anden aldersgruppe
- Tilpas til forælderens rolle (${role === "mor" ? "mor" : "far"})
- Tonen er varm, støttende og ikke-dømmende
- Normalisér usikkerhed

Svar ALTID i gyldig JSON.`;

    let userPrompt = "";

    switch (type) {
      case "knowledge_cards":
        userPrompt = `Generér 4 videnskort tilpasset ${name} (${babyAgeWeeks} uger) og ${role === "mor" ? "mor" : "far"}.

Returnér JSON-array med objekter:
[
  {
    "emoji": "relevant emoji",
    "category": "kort kategorinavn",
    "title": "fængende titel (max 6 ord)",
    "body": "konkret, evidensbaseret råd (max 2 sætninger)"
  }
]

Dæk forskellige ekspertområder. Mindst ét kort skal være rollespecifikt for ${role === "mor" ? "mor" : "far"}.`;
        break;

      case "week_insight":
        userPrompt = `Generér ugens indsigt for et barn på ${babyAgeWeeks} uger.

Returnér JSON:
{
  "insight": "Hvad der sker udviklings- og trivselsmæssigt lige nu (max 2 sætninger, evidensbaseret)",
  "milestone": "En kort milepæl hvis relevant, ellers null"
}`;
        break;

      case "partner_nudges":
        userPrompt = `Generér 2-3 partner-nudges for ${role === "mor" ? "mor" : "far"} med et barn på ${babyAgeWeeks} uger.

Returnér JSON-array:
[
  {
    "title": "Konkret handling (max 8 ord)",
    "hint": "Hvorfor det er vigtigt + lille tip (max 1 sætning)"
  }
]

Basér på forskning i forældresamarbejde, mental load og tilknytning. Tilpas til ${role === "mor" ? "mors" : "fars"} perspektiv.`;
        break;

      case "activity_suggestions": {
        const { category } = await req.json().catch(() => ({}));
        const catMap: Record<string, string> = {
          "udenfor": "udendørs aktiviteter i naturen, frisk luft, ture, sanseoplevelser udenfor",
          "indenfor": "indendørs leg, regndagsaktiviteter, leg i hjemmet",
          "udviklende": "udviklende leg der styrker motorik, sanser, sprog og kognition",
          "kreativitet": "kreativ udfoldelse med musik, sang, farver, lyde og bevægelse",
          "naerhed": "rolige nærhedsaktiviteter som massage, hud-mod-hud, stille samvær, babyyoga",
          "social": "leg med andre børn, søskende, bedsteforældre, legegrupper, social interaktion",
        };
        // Re-parse body to get category since we already consumed it
        const catDesc = catMap[category] || "varierede aktiviteter";
        userPrompt = `Generér 3-4 alderstilpassede aktiviteter for ${name} (${babyAgeWeeks} uger) som ${role === "mor" ? "mor" : "far"} kan lave.

KATEGORI: ${catDesc}

Returnér JSON-array:
[
  {
    "emoji": "relevant emoji",
    "title": "Aktivitetsnavn",
    "description": "Kort, konkret beskrivelse af hvad man gør (max 2 sætninger)",
    "why": "Kort faglig begrundelse for hvorfor det er godt lige nu (1 sætning)",
    "duration": "ca. antal minutter"
  }
]

VIGTIGT:
- Aktiviteterne SKAL matche barnets præcise udviklingsstadie (${babyAgeWeeks} uger / ${ageMonths} måneder)
- Alle forslag SKAL passe til kategorien "${catDesc}"
- Vær konkret og praktisk — trætte forældre skal nemt kunne følge dem
- Undgå gentagelser og generiske forslag`;
        break;
      }

      case "sleep_guidance":
        userPrompt = `Generér søvnvejledning for ${name} (${babyAgeWeeks} uger).

Returnér JSON:
{
  "wakeWindow": "anbefalet vågentid i minutter",
  "napsPerDay": "antal lure",
  "nightSleep": "forventet nattesøvn i timer",
  "tips": ["tip 1", "tip 2"],
  "currentRegression": "beskrivelse hvis relevant, ellers null"
}

Basér på aktuel søvnforskning (Mindell, Hysing).`;
        break;

      default:
        return new Response(JSON.stringify({ error: "Ukendt indholdstype" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: expertSystemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "For mange forespørgsler. Prøv igen om lidt." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI-credits opbrugt." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("Content expert error:", response.status, t);
      return new Response(JSON.stringify({ error: "Fejl ved generering af indhold" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";

    // Parse JSON from response (handle markdown code blocks)
    let parsed;
    try {
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/) || [null, content];
      parsed = JSON.parse(jsonMatch[1].trim());
    } catch {
      console.error("Failed to parse AI response as JSON:", content);
      return new Response(JSON.stringify({ error: "Ugyldigt svar fra ekspertpanelet", raw: content }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ data: parsed }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("content-expert error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Ukendt fejl" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
