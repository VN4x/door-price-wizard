import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

const KEY = "kv.theme.v1";

/** Light or dark, remembered in this browser. */
export function ThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem(KEY);
    const prefers = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const on = stored ? stored === "dark" : prefers;
    setDark(on);
    document.documentElement.classList.toggle("dark", on);
  }, []);

  const toggle = () => {
    const on = !dark;
    setDark(on);
    document.documentElement.classList.toggle("dark", on);
    try {
      window.localStorage.setItem(KEY, on ? "dark" : "light");
    } catch {
      /* private mode — the choice simply does not persist */
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
      className="grid size-9 place-items-center rounded-xl border border-border text-foreground transition-colors hover:bg-secondary"
    >
      {dark ? <Sun className="size-4" aria-hidden /> : <Moon className="size-4" aria-hidden />}
    </button>
  );
}
