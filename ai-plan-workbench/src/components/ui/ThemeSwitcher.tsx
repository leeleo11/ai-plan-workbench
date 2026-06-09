"use client";

import { useEffect, useState } from "react";

const themes = [
  { value: "cartoon", label: "动漫卡通 🎈" },
  { value: "mecha", label: "酷炫机甲 🤖" },
  { value: "galaxy", label: "宇宙星河 ✨" },
];

export function ThemeSwitcher() {
  const [currentTheme, setCurrentTheme] = useState("cartoon");

  useEffect(() => {
    const saved = localStorage.getItem("app-theme") || "cartoon";
    setCurrentTheme(saved);
    document.documentElement.setAttribute("data-theme", saved);
  }, []);

  const switchTheme = (theme: string) => {
    setCurrentTheme(theme);
    localStorage.setItem("app-theme", theme);
    document.documentElement.setAttribute("data-theme", theme);
  };

  return (
    <div className="flex flex-wrap gap-2 items-center">
      <span className="text-xs font-bold text-[var(--ink)] opacity-70">主题:</span>
      {themes.map((t) => (
        <button
          key={t.value}
          onClick={() => switchTheme(t.value)}
          className={`px-3 py-1 rounded-full text-xs font-black transition-all duration-300 ${
            currentTheme === t.value
              ? "bg-[var(--mint)] border-2 border-[var(--line)] shadow-sm text-[var(--ink)] scale-105"
              : "bg-[var(--glass-bg)] border border-[var(--glass-border)] text-gray-500 hover:bg-[var(--cream)]"
          }`}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}