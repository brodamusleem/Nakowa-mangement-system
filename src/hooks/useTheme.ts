import { useEffect } from "react"
import { useThemeStore } from "@/state/themeStore"

/**
 * useTheme — reads and sets the app theme (light / dark / system).
 * Syncs with the <html> class so Tailwind dark mode works.
 */
export function useTheme() {
  const { theme, setTheme } = useThemeStore()

  useEffect(() => {
    const root = document.documentElement
    root.classList.remove("light", "dark")

    if (theme === "system") {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
      root.classList.add(prefersDark ? "dark" : "light")
    } else {
      root.classList.add(theme)
    }
  }, [theme])

  return { theme, setTheme }
}
