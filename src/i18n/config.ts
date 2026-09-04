import i18n from "i18next";
import { initReactI18next } from "react-i18next";

const savedLanguage = typeof window === "undefined" ? null : window.localStorage.getItem("yojanasetu-language");
const browserLanguage = typeof navigator === "undefined" ? "en" : navigator.language.slice(0, 2);
const initialLanguage = savedLanguage === "hi" || (!savedLanguage && browserLanguage === "hi") ? "hi" : "en";

void i18n.use(initReactI18next).init({
  fallbackLng: "en",
  lng: initialLanguage,
  supportedLngs: ["en", "hi"],
  resources: { en: { translations: {} }, hi: { translations: {} } },
  ns: ["translations"],
  defaultNS: "translations",
  interpolation: { escapeValue: false },
});

export default i18n;
