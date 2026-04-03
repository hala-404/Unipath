import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { translations, resolve } from "../i18n";

const LanguageContext = createContext();

const STORAGE_KEY = "unipath_lang";

/**
 * Detect initial language: stored preference → browser language → English.
 */
function getInitialLang() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored && translations[stored]) return stored;

  const browser = navigator.language?.slice(0, 2);
  if (browser === "ar") return "ar";
  if (browser === "zh") return "zh";
  return "en";
}

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(getInitialLang);

  const setLang = useCallback((code) => {
    if (!translations[code]) return;
    localStorage.setItem(STORAGE_KEY, code);
    setLangState(code);
  }, []);

  // Apply dir attribute and lang attribute to <html> whenever language changes
  useEffect(() => {
    const dir = translations[lang]?.dir || "ltr";
    document.documentElement.setAttribute("dir", dir);
    document.documentElement.setAttribute("lang", lang);
  }, [lang]);

  /**
   * Translation helper.
   *   t("nav.home")           → resolved string
   *   t("tracker.daysLeft", { count: 5 }) → interpolated string
   */
  const t = useCallback(
    (key, vars) => {
      let value = resolve(translations[lang], key);

      // Fallback to English if key missing in current lang
      if (value === key) {
        value = resolve(translations.en, key);
      }

      // Simple {var} interpolation
      if (vars && typeof value === "string") {
        Object.entries(vars).forEach(([k, v]) => {
          value = value.replace(new RegExp(`\\{${k}\\}`, "g"), v);
        });
      }

      return value;
    },
    [lang]
  );

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

/**
 * Hook to use language context.
 *   const { t, lang, setLang } = useLanguage();
 */
export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return ctx;
}
