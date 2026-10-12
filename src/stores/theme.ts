import { defineStore } from "pinia";
import { ref } from "vue";

export type ThemeMode = "light" | "dark" | "auto";

export const useThemeStore = defineStore("theme", () => {
  const themeMode = ref<ThemeMode>(
    (localStorage.getItem("theme-mode") as ThemeMode) || "auto",
  );

  const isDark = ref(false);

  const applyTheme = (mode: ThemeMode) => {
    themeMode.value = mode;
    localStorage.setItem("theme-mode", mode);

    if (mode === "auto") {
      isDark.value = window.matchMedia("(prefers-color-scheme: dark)").matches;
    } else {
      isDark.value = mode === "dark";
    }

    document.documentElement.classList.toggle("dark", isDark.value);
  };

  const toggleTheme = () => {
    const nextMode: ThemeMode = isDark.value ? "light" : "dark";
    applyTheme(nextMode);
  };

  const initTheme = () => {
    applyTheme(themeMode.value);

    window
      .matchMedia("(prefers-color-scheme: dark)")
      .addEventListener("change", (e) => {
        if (themeMode.value === "auto") {
          isDark.value = e.matches;
          document.documentElement.classList.toggle("dark", e.matches);
        }
      });
  };

  return { themeMode, isDark, applyTheme, toggleTheme, initTheme };
});
