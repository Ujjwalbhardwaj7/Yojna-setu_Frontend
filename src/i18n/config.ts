import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

i18n.use(initReactI18next).init({
  fallbackLng: 'en',
  lng: 'en',
  resources: {
    en: {
      translations: {
        welcome: 'Welcome to YojanaSetu',
      }
    },
    hi: {
      translations: {
        welcome: 'योजनासेतु में आपका स्वागत है',
      }
    }
  },
  ns: ['translations'],
  defaultNS: 'translations'
});

i18n.languages = ['en', 'hi'];

export default i18n;
