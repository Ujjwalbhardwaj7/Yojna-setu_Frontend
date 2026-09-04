import { useState, useEffect, useCallback } from "react";
import en from "./en";
import hi from "./hi";
import i18n from "./config";

export type Language = "en" | "hi";
export type TranslationKey = keyof typeof en;

const translations = { en, hi };

export function useI18n() {
  const [language, setLanguageState] = useState<Language>(() => {
    const current = (i18n.language || "en").slice(0, 2);
    return (current === "hi" ? "hi" : "en") as Language;
  });

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    i18n.changeLanguage(lang);
  }, []);

  useEffect(() => {
    const handleLangChange = (lng: string) => {
      const lang = (lng || "en").slice(0, 2);
      if (lang === "hi" || lang === "en") {
        setLanguageState(lang as Language);
      }
    };
    i18n.on("languageChanged", handleLangChange);
    return () => {
      i18n.off("languageChanged", handleLangChange);
    };
  }, []);

  const t = useCallback(
    (key: TranslationKey | string): string => {
      const dict = translations[language] || en;
      if (key in dict) {
        return (dict as Record<string, string>)[key];
      }
      if (key in en) {
        return (en as Record<string, string>)[key];
      }
      return key;
    },
    [language]
  );

  return { language, setLanguage, t };
}
