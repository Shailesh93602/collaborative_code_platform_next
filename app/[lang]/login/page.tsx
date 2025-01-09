import { getDictionary } from '@/get-dictionaries';
import { Locale } from '@/i18n-config';
import LoginPageWrapper from './LoginWrapper';

export default async function LoginPage(props: { params: Promise<{ lang: Locale }> }) {
  const { lang } = await props.params;

  const dictionary = await getDictionary(lang);

  return <LoginPageWrapper dictionary={dictionary?.auth} />;
}
