import { type Language } from "../lib/cookies";
import t from "../i18n";

interface LanguageToggleProps {
  language: Language;
  onToggle: () => void;
}

export function LanguageToggle({ language, onToggle }: LanguageToggleProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="action-button gap-2"
      aria-label={`${t("switchTo", language)} ${language === "en" ? t("languageGerman", language) : t("languageEnglish", language)}`}
    >
      <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-slate-950 text-white dark:bg-white dark:text-slate-950">
        {language === "en"
          ? t("languageShortEN", language)
          : t("languageShortDE", language)}
      </span>
      <span className="mono-face text-xs uppercase tracking-[0.24em]">
        {language === "en"
          ? t("languageEnglish", language)
          : t("languageGerman", language)}
      </span>
    </button>
  );
}

export default LanguageToggle;
