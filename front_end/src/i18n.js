import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import translationKR from './locales/kr/translation.json';
import translationEN from './locales/en/translation.json';

const resources = {
  kr: {
    translation: translationKR
  },
  en: {
    translation: translationEN
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'kr', // 기본 언어를 한국어로 설정
    fallbackLng: 'kr',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;