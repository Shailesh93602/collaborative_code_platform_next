import { getDictionary } from '@/get-dictionaries';
import { Locale } from '@/i18n-config';
import RegisterComponent from './Register';

export default async function RegisterPage(props: { params: Promise<{ lang: Locale }> }) {
  const { lang } = await props.params;

  const dictionary = await getDictionary(lang);

  return <RegisterComponent dictionary={dictionary?.auth} />;
}
