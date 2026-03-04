/**
 * Native Bridge — Capacitor plugin wrappers with web fallbacks.
 *
 * Every function is safe to call from the web (gracefully degrades).
 * When running inside the Capacitor native shell, it uses real native APIs.
 */

/* ── Detection ── */

export function isNative(): boolean {
  if (typeof window === "undefined") return false;
  // Capacitor injects this on the window object
  return "Capacitor" in window;
}

export function isIOS(): boolean {
  if (typeof navigator === "undefined") return false;
  return /iPhone|iPad|iPod/.test(navigator.userAgent);
}

/* ── Haptics ── */

type HapticImpact = "light" | "medium" | "heavy";
type HapticNotification = "success" | "warning" | "error";

/**
 * Trigger a haptic impact feedback.
 * Falls back to no-op on web.
 */
export async function hapticImpact(style: HapticImpact = "medium"): Promise<void> {
  try {
    if (isNative()) {
      const { Haptics, ImpactStyle } = await import("@capacitor/haptics");
      const map = {
        light: ImpactStyle.Light,
        medium: ImpactStyle.Medium,
        heavy: ImpactStyle.Heavy,
      } as const;
      await Haptics.impact({ style: map[style] });
    }
  } catch {
    // Silently fail — haptics not available
  }
}

/**
 * Trigger a haptic notification feedback.
 * Falls back to no-op on web.
 */
export async function hapticNotification(type: HapticNotification = "success"): Promise<void> {
  try {
    if (isNative()) {
      const { Haptics, NotificationType } = await import("@capacitor/haptics");
      const map = {
        success: NotificationType.Success,
        warning: NotificationType.Warning,
        error: NotificationType.Error,
      } as const;
      await Haptics.notification({ type: map[type] });
    }
  } catch {
    // Silently fail
  }
}

/**
 * Trigger a light selection haptic (e.g. tap to select an item).
 */
export async function hapticSelection(): Promise<void> {
  try {
    if (isNative()) {
      const { Haptics } = await import("@capacitor/haptics");
      await Haptics.selectionStart();
      await Haptics.selectionChanged();
      await Haptics.selectionEnd();
    }
  } catch {
    // Silently fail
  }
}

/* ── Share ── */

interface ShareOptions {
  title?: string;
  text?: string;
  url: string;
}

/**
 * Native share sheet. Falls back to Web Share API, then clipboard copy.
 * Returns true if shared/copied, false if cancelled.
 */
export async function nativeShare(opts: ShareOptions): Promise<boolean> {
  try {
    if (isNative()) {
      const { Share } = await import("@capacitor/share");
      await Share.share({
        title: opts.title,
        text: opts.text,
        url: opts.url,
        dialogTitle: opts.title,
      });
      return true;
    }

    // Web fallback — navigator.share
    if (typeof navigator !== "undefined" && navigator.share) {
      await navigator.share({
        title: opts.title,
        text: opts.text,
        url: opts.url,
      });
      return true;
    }

    // Last resort — clipboard
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      await navigator.clipboard.writeText(opts.url);
      return true;
    }

    return false;
  } catch {
    return false;
  }
}

/* ── Status Bar ── */

/**
 * Set the status bar style (light or dark text).
 * Only works in Capacitor native shell.
 */
export async function setStatusBarStyle(style: "light" | "dark"): Promise<void> {
  try {
    if (isNative()) {
      const { StatusBar, Style } = await import("@capacitor/status-bar");
      await StatusBar.setStyle({
        style: style === "dark" ? Style.Dark : Style.Light,
      });
    }
  } catch {
    // Silently fail
  }
}

/**
 * Set the status bar background color.
 * Only works in Capacitor native shell (Android primarily).
 */
export async function setStatusBarColor(color: string): Promise<void> {
  try {
    if (isNative()) {
      const { StatusBar } = await import("@capacitor/status-bar");
      await StatusBar.setBackgroundColor({ color });
    }
  } catch {
    // Silently fail
  }
}

/* ── Splash Screen ── */

/**
 * Hide the native splash screen.
 * Call after your app's first meaningful paint.
 */
export async function hideSplash(): Promise<void> {
  try {
    if (isNative()) {
      const { SplashScreen } = await import("@capacitor/splash-screen");
      await SplashScreen.hide();
    }
  } catch {
    // Silently fail
  }
}
