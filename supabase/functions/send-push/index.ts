import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// ── APNs JWT ───────────────────────────────────────────────────────────────────

function b64url(data: Uint8Array | string): string {
  const bytes = typeof data === "string"
    ? new TextEncoder().encode(data)
    : data;
  let binary = "";
  bytes.forEach(b => binary += String.fromCharCode(b));
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function generateApnsJwt(teamId: string, keyId: string, privateKeyP8: string): Promise<string> {
  const header = b64url(JSON.stringify({ alg: "ES256", kid: keyId }));
  const payload = b64url(JSON.stringify({ iss: teamId, iat: Math.floor(Date.now() / 1000) }));
  const message = `${header}.${payload}`;

  // Strip PEM headers and whitespace
  const pemBody = privateKeyP8
    .replace(/-----BEGIN PRIVATE KEY-----/g, "")
    .replace(/-----END PRIVATE KEY-----/g, "")
    .replace(/\s+/g, "");

  const keyData = Uint8Array.from(atob(pemBody), c => c.charCodeAt(0));

  const cryptoKey = await crypto.subtle.importKey(
    "pkcs8",
    keyData,
    { name: "ECDSA", namedCurve: "P-256" },
    false,
    ["sign"],
  );

  const signature = await crypto.subtle.sign(
    { name: "ECDSA", hash: "SHA-256" },
    cryptoKey,
    new TextEncoder().encode(message),
  );

  return `${message}.${b64url(new Uint8Array(signature))}`;
}

// ── Send one APNs push ─────────────────────────────────────────────────────────

async function sendApns(
  token: string,
  title: string,
  body: string,
  data: Record<string, string>,
  jwt: string,
  bundleId: string,
  production: boolean,
): Promise<void> {
  const host = production
    ? "https://api.push.apple.com"
    : "https://api.sandbox.push.apple.com";

  const payload = JSON.stringify({
    aps: {
      alert: { title, body },
      sound: "default",
      badge: 1,
    },
    ...data,
  });

  const res = await fetch(`${host}/3/device/${token}`, {
    method: "POST",
    headers: {
      authorization: `bearer ${jwt}`,
      "apns-topic": bundleId,
      "apns-push-type": "alert",
      "content-type": "application/json",
    },
    body: payload,
  });

  if (!res.ok) {
    const err = await res.text();
    console.error("APNs error", res.status, err);
  }
}

// ── Main handler ───────────────────────────────────────────────────────────────

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { to_user_id, title, body, data = {} } = await req.json() as {
      to_user_id: string;
      title: string;
      body: string;
      data?: Record<string, string>;
    };

    if (!to_user_id || !title || !body) {
      return new Response(JSON.stringify({ error: "Missing fields" }), {
        status: 400, headers: { ...corsHeaders, "content-type": "application/json" },
      });
    }

    const APNS_KEY_ID       = Deno.env.get("APNS_KEY_ID") ?? "";
    const APNS_TEAM_ID      = Deno.env.get("APNS_TEAM_ID") ?? "";
    const APNS_PRIVATE_KEY  = Deno.env.get("APNS_PRIVATE_KEY") ?? "";
    const APNS_BUNDLE_ID    = Deno.env.get("APNS_BUNDLE_ID") ?? "dk.meloparents.app";
    const APNS_PRODUCTION   = Deno.env.get("APNS_PRODUCTION") === "true";

    if (!APNS_KEY_ID || !APNS_TEAM_ID || !APNS_PRIVATE_KEY) {
      return new Response(JSON.stringify({ error: "APNs not configured" }), {
        status: 500, headers: { ...corsHeaders, "content-type": "application/json" },
      });
    }

    // Use service role to read device tokens
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    const { data: tokens, error } = await supabase
      .from("device_tokens")
      .select("token")
      .eq("user_id", to_user_id)
      .eq("platform", "ios");

    if (error || !tokens?.length) {
      return new Response(JSON.stringify({ sent: 0 }), {
        headers: { ...corsHeaders, "content-type": "application/json" },
      });
    }

    const jwt = await generateApnsJwt(APNS_TEAM_ID, APNS_KEY_ID, APNS_PRIVATE_KEY);

    await Promise.allSettled(
      tokens.map(row => sendApns(row.token, title, body, data, jwt, APNS_BUNDLE_ID, APNS_PRODUCTION)),
    );

    return new Response(JSON.stringify({ sent: tokens.length }), {
      headers: { ...corsHeaders, "content-type": "application/json" },
    });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500, headers: { ...corsHeaders, "content-type": "application/json" },
    });
  }
});
