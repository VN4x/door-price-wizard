import { LANGS, useI18n, type Lang } from "@/lib/i18n";

/** Estonian first, then the other languages we serve. */
export function LanguagePicker() {
  const { lang, setLang } = useI18n();
  return (
    <label className="inline-flex items-center gap-2">
      <span className="sr-only">Language</span>
      <select
        value={lang}
        onChange={(e) => setLang(e.target.value as Lang)}
        className="rounded-xl border border-border bg-background px-2.5 py-2 text-sm font-medium text-foreground outline-none"
      >
        {LANGS.map((l) => (
          <option key={l.id} value={l.id}>
            {l.label}
          </option>
        ))}
      </select>
    </label>
  );
}
