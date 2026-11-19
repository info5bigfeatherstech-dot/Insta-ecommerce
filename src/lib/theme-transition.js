/**
 * Smoothly transitions the application theme.
 * Uses the native View Transitions API for GPU-accelerated cross-fading when supported,
 * and falls back to a temporary CSS transition class for all other browsers.
 *
 * @param {Function} setTheme - next-themes setTheme dispatch function
 * @param {string} targetTheme - "light" | "dark" | "system"
 */
export function changeThemeWithTransition(setTheme, targetTheme) {
  if (typeof document === "undefined") {
    setTheme(targetTheme);
    return;
  }

  // Respect user preference for reduced motion
  const isReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (document.startViewTransition && !isReducedMotion) {
    document.startViewTransition(() => {
      setTheme(targetTheme);
    });
    return;
  }

  // Fallback: Apply temporary transition class to smoothly animate color tokens
  document.documentElement.classList.add("theme-transitioning");
  setTheme(targetTheme);
  window.setTimeout(() => {
    document.documentElement.classList.remove("theme-transitioning");
  }, 350);
}
