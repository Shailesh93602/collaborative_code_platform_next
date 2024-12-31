import { getDictionary } from '@/get-dictionaries';
import { Locale } from '@/i18n-config';
import VerifyEmailComponent from './VerifyEmail';

export default async function VerifyEmailPage(props: { params: Promise<{ lang: Locale }> }) {
  const { lang } = await props.params;

  const dictionary = await getDictionary(lang);

  return <VerifyEmailComponent dictionary={dictionary?.auth} />;
}
