import fs from 'fs';
import path from 'path';

const LOCALES_DIR = path.join(process.cwd(), 'public', 'locales');

export function getTranslations(locale: string, namespace: string): Record<string, string> {
  const filePath = path.join(LOCALES_DIR, locale, `${namespace}.json`);
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(fileContent);
}

export function updateTranslation(
  locale: string,
  namespace: string,
  key: string,
  value: string
): void {
  const filePath = path.join(LOCALES_DIR, locale, `${namespace}.json`);
  const translations = getTranslations(locale, namespace);
  translations[key] = value;
  fs.writeFileSync(filePath, JSON.stringify(translations, null, 2));
}

export function addTranslation(
  locale: string,
  namespace: string,
  key: string,
  value: string
): void {
  updateTranslation(locale, namespace, key, value);
}

export function removeTranslation(locale: string, namespace: string, key: string): void {
  const filePath = path.join(LOCALES_DIR, locale, `${namespace}.json`);
  const translations = getTranslations(locale, namespace);
  delete translations[key];
  fs.writeFileSync(filePath, JSON.stringify(translations, null, 2));
}
