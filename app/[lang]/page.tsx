import HomeComponent from './Home';
import { getDictionary } from '@/get-dictionaries';
import { Locale } from '@/i18n-config';

export default async function Home(props: { params: Promise<{ lang: Locale }> }) {
  const { lang } = await props.params;

  const dictionary = await getDictionary(lang);

  return <HomeComponent dictionary={dictionary} lang={lang} />;
}
