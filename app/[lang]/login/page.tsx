import { getDictionary } from '@/get-dictionaries';
import { Locale } from '@/i18n-config';
import LoginPageComponent from './Login';

export default async function LoginPage(props: { params: Promise<{ lang: Locale }> }) {
  const { lang } = await props.params;

  const dictionary = await getDictionary(lang);

  return <LoginPageComponent dictionary={dictionary?.auth} />;
}
