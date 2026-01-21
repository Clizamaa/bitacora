"use client"

import { useEffect, useState } from "react"
import { Sun, Moon } from "lucide-react"

export default function ThemeToggle() {
  const [theme, setTheme] = useState("light")

  useEffect(() => {
    const stored = typeof window !== "undefined" ? localStorage.getItem("theme") : null
    const prefersDark = typeof window !== "undefined" && window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches
    const initial = stored || (prefersDark ? "dark" : "light")
    applyTheme(initial)
  }, [])

  const applyTheme = (t) => {
    const root = document.documentElement
    if (t === "dark") {
      root.classList.add("dark")
    } else {
      root.classList.remove("dark")
    }
    localStorage.setItem("theme", t)
    setTheme(t)
  }

  const toggle = () => {
    applyTheme(theme === "dark" ? "light" : "dark")
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Cambiar tema"
      className="fixed top-3 right-3 z-50 inline-flex items-center gap-2 rounded-full border border-border bg-secondary/60 backdrop-blur px-3 py-2 text-foreground shadow-sm hover:bg-secondary/80"
    >
      {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      <span className="text-xs font-medium">{theme === "dark" ? "Light" : "Dark"}</span>
    </button>
  )
}

