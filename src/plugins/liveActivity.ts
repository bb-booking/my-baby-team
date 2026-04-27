import { Capacitor } from "@capacitor/core";

interface StartSleepActivityOptions {
  childName: string;
  startTime: number; // Unix milliseconds
  sleepType: "nap" | "night";
}

export async function startSleepActivity(options: StartSleepActivityOptions): Promise<void> {
  if (!Capacitor.isNativePlatform()) return;
  try {
    const { Plugins } = await import("@capacitor/core");
    const LiveActivity = (Plugins as any)["LiveActivity"];
    if (!LiveActivity) return;
    await LiveActivity.startSleepActivity(options);
  } catch {
    // silent fail — Live Activities are a nice-to-have
  }
}

export async function endSleepActivity(): Promise<void> {
  if (!Capacitor.isNativePlatform()) return;
  try {
    const { Plugins } = await import("@capacitor/core");
    const LiveActivity = (Plugins as any)["LiveActivity"];
    if (!LiveActivity) return;
    await LiveActivity.endSleepActivity();
  } catch {
    // silent fail
  }
}
