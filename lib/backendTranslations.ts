import i18next from 'i18next';
import Backend from 'i18next-fs-backend';
import path from 'path';

i18next.use(Backend).init({
  backend: {
    loadPath: path.join(process.cwd(), 'public/locales/{{lng}}/{{ns}}.json'),
  },
  fallbackLng: 'en',
  preload: ['en', 'hi', 'gu'],
  ns: ['common', 'errors', 'api'],
  defaultNS: 'common',
});

export const t = (key: string, options?: any) => i18next.t(key, options);

export const changeLanguage = (lng: string) => i18next.changeLanguage(lng);
