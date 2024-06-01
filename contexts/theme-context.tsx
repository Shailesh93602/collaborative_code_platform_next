"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

type Theme = "light" | "dark" | "system";
type Layout = "default" | "compact" | "wide";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  layout: Layout;
  setLayout: (layout: Layout) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("system");
  const [layout, setLayout] = useState<Layout>("default");

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as Theme;
    const savedLayout = localStorage.getItem("layout") as Layout;
    if (savedTheme) setTheme(savedTheme);
    if (savedLayout) setLayout(savedLayout);
  }, []);

  useEffect(() => {
    localStorage.setItem("theme", theme);
    localStorage.setItem("layout", layout);

    if (
      theme === "dark" ||
      (theme === "system" &&
        window.matchMedia("(prefers-color-scheme: dark)").matches)
    ) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }

    document.documentElement.setAttribute("data-layout", layout);
  }, [theme, layout]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, layout, setLayout }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
