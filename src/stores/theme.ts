import { defineStore } from "pinia";
import { ref, computed } from "vue";

export interface ThemeDef {
  name: string;
  label: string;
  cssClass: string | null;
}

export const THEMES: ThemeDef[] = [
  { name: "dark", label: "深色", cssClass: null },
  { name: "light", label: "浅色", cssClass: "light" },
  { name: "cyberpunk", label: "赛博朋克", cssClass: "cyberpunk" },
  { name: "warm", label: "暖色", cssClass: "warm" },
];

export type ThemeName = (typeof THEMES)[number]["name"];

export const useThemeStore = defineStore("theme", () => {
  const activeThemeName = ref<ThemeName>(
    (localStorage.getItem("theme-mode") as ThemeName) || "dark",
  );

  const isDark = computed(() => activeThemeName.value === "dark");

  const applyTheme = (name: ThemeName) => {
    activeThemeName.value = name;
    localStorage.setItem("theme-mode", name);

    const html = document.documentElement;
    THEMES.forEach((t) => {
      if (t.cssClass) html.classList.remove(t.cssClass);
    });
    const def = THEMES.find((t) => t.name === name);
    if (def?.cssClass) html.classList.add(def.cssClass);
  };

  const toggleTheme = () => {
    const idx = THEMES.findIndex((t) => t.name === activeThemeName.value);
    const next = THEMES[(idx + 1) % THEMES.length];
    applyTheme(next.name);
  };

  const initTheme = () => {
    const saved = localStorage.getItem("theme-mode") as ThemeName | null;
    if (saved && THEMES.some((t) => t.name === saved)) {
      applyTheme(saved);
    } else {
      applyTheme("dark");
    }
  };

  return {
    activeThemeName,
    isDark,
    THEMES,
    applyTheme,
    toggleTheme,
    initTheme,
  };
});
