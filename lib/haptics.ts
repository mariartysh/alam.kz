"use client";

type Haptic = { notificationOccurred: (t: "success" | "error" | "warning") => void; selectionChanged: () => void };

function haptic(): Haptic | undefined {
  return (window as unknown as { Telegram?: { WebApp?: { HapticFeedback?: Haptic } } }).Telegram?.WebApp?.HapticFeedback;
}

export const haptics = {
  success: () => haptic()?.notificationOccurred("success"),
  error: () => haptic()?.notificationOccurred("error"),
  select: () => haptic()?.selectionChanged(),
};
