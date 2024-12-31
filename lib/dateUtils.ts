import { format, formatRelative, Locale } from 'date-fns';
import { enUS, hi, gu } from 'date-fns/locale';

const locales: { [key: string]: Locale } = {
  en: enUS,
  hi: hi,
  gu: gu,
};

export function formatDate(date: Date | number, formatString: string, language: string): string {
  return format(date, formatString, { locale: locales[language] });
}

export function formatRelativeDate(
  date: Date | number,
  baseDate: Date | number,
  language: string
): string {
  return formatRelative(date, baseDate, { locale: locales[language] });
}
