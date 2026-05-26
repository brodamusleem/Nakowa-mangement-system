import { create } from "zustand";
import { persist } from "zustand/middleware";

type Theme = "light" | "dark" | "auto" | "system";

interface ThemeStore {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set) => ({
      theme:    "auto",
      setTheme: (theme) => set({ theme }),
    }),
    { name: "nakowa_theme" }
  )
);
