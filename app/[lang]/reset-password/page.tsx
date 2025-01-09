import { getDictionary } from '@/get-dictionaries';
import { Locale } from '@/i18n-config';
import ResetPasswordPageWrapper from './ResetPasswordWrapper';

export default async function ResetPasswordPage(props: { params: Promise<{ lang: Locale }> }) {
  const { lang } = await props.params;

  const dictionary = await getDictionary(lang);

  return <ResetPasswordPageWrapper dictionary={dictionary?.auth} />;
}
