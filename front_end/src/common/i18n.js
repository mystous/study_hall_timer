import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import translationKR from '../locales/kr/translation.json';
import translationEN from '../locales/en/translation.json';
import translationCH from '../locales/ch/translation.json';
import translationJP from '../locales/jp/translation.json';
const resources = {
  kr: {
    translation: translationKR
  },
  en: {
    translation: translationEN
  },
  ch: {
    translation: translationCH
  },
  jp: {
    translation: translationJP
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