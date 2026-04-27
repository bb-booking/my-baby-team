import { supabase } from "@/integrations/supabase/client";

/** Fire-and-forget push to a partner's device. Silent on failure. */
export async function notifyPartner(
  partnerUserId: string,
  title: string,
  body: string,
  data: Record<string, string> = {},
): Promise<void> {
  if (!partnerUserId) return;
  try {
    await supabase.functions.invoke("send-push", {
      body: { to_user_id: partnerUserId, title, body, data },
    });
  } catch {
    // Push is best-effort — never throw
  }
}
