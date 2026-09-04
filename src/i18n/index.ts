import { useCallback, useEffect, useState } from "react";
import en from "./en";
import hi from "./hi";
import i18n from "./config";

export type Language = "en" | "hi";
export type TranslationKey = keyof typeof en;
export type TranslationValues = Record<string, string | number | undefined>;

const translations = { en, hi };

function getLanguage(value: string | undefined): Language {
  return value?.slice(0, 2) === "hi" ? "hi" : "en";
}

export function localizeStatus(status: string, t: (key: TranslationKey, values?: TranslationValues) => string): string {
  const labels: Record<string, TranslationKey> = {
    Eligible: "eligible",
    "Potentially Eligible": "potentiallyEligible",
    "Not Eligible": "notEligible",
    "More Information Required": "moreInformationRequired",
  };
  return labels[status] ? t(labels[status]) : status;
}

export function useI18n() {
  const [language, setLanguageState] = useState<Language>(() => getLanguage(i18n.language));

  const setLanguage = useCallback((lang: Language) => {
    window.localStorage.setItem("yojanasetu-language", lang);
    document.documentElement.lang = lang;
    setLanguageState(lang);
    void i18n.changeLanguage(lang);
  }, []);

  useEffect(() => { document.documentElement.lang = language; }, [language]);
  useEffect(() => {
    const handleLanguageChange = (nextLanguage: string) => setLanguageState(getLanguage(nextLanguage));
    i18n.on("languageChanged", handleLanguageChange);
    return () => i18n.off("languageChanged", handleLanguageChange);
  }, []);

  const t = useCallback((key: TranslationKey, values: TranslationValues = {}): string => {
    const template = translations[language][key] ?? en[key];
    return template.replace(/{{(\w+)}}/g, (_match, name: string) => String(values[name] ?? ""));
  }, [language]);

  return { language, setLanguage, t };
}
