import { useEffect } from "react";
import { Capacitor } from "@capacitor/core";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";

async function saveToken(userId: string, token: string): Promise<void> {
  await supabase.from("device_tokens").upsert(
    { user_id: userId, token, platform: "ios", updated_at: new Date().toISOString() },
    { onConflict: "user_id,token" },
  );
}

/**
 * Registers for APNs push notifications and saves the device token to Supabase.
 * Only runs on native iOS (no-op in browser).
 */
export function usePushNotifications() {
  const { user } = useAuth();

  useEffect(() => {
    if (!user || !Capacitor.isNativePlatform()) return;

    let cleanup: (() => void) | undefined;

    (async () => {
      try {
        // Dynamically import to avoid errors in browser/web builds
        const { PushNotifications } = await import("@capacitor/push-notifications");

        const { receive } = await PushNotifications.checkPermissions();

        if (receive === "prompt" || receive === "prompt-with-rationale") {
          const { receive: granted } = await PushNotifications.requestPermissions();
          if (granted !== "granted") return;
        } else if (receive !== "granted") {
          return;
        }

        await PushNotifications.register();

        // Token received — save to Supabase
        const regListener = await PushNotifications.addListener(
          "registration",
          async ({ value: token }) => {
            await saveToken(user.id, token);
          },
        );

        // Notification tapped while app was in background/closed
        const actionListener = await PushNotifications.addListener(
          "pushNotificationActionPerformed",
          (action) => {
            const route = action.notification.data?.route as string | undefined;
            if (route) {
              // Navigate programmatically — dispatch a custom event the router can listen to
              window.dispatchEvent(new CustomEvent("push-navigate", { detail: { route } }));
            }
          },
        );

        cleanup = () => {
          regListener.remove();
          actionListener.remove();
        };
      } catch (err) {
        // Plugin not available in dev/browser — ignore
        console.debug("Push notifications unavailable:", err);
      }
    })();

    return () => cleanup?.();
  }, [user]);
}
