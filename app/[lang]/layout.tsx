import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '../globals.css';
import ErrorBoundary from '@/components/ErrorBoundary/index';
import * as Sentry from '@sentry/nextjs';
import { Toaster } from '@/components/ui/toaster';
import App from './App';
import { i18n, type Locale } from '../../i18n-config';
import { getDictionary } from '@/get-dictionaries';

export async function generateStaticParams() {
  return i18n.locales.map((locale) => ({ lang: locale }));
}

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 1.0,
});

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Advanced Collaborative Code Platform',
  description: 'Real-time collaborative code execution, analysis, and visualization',
};

export default async function RootLayout({
  children,
  params,
}: {
  readonly children: React.ReactNode;
  readonly params: Promise<{ lang: Locale }>;
}) {
  const { lang } = await params;
  const dictionaries = await getDictionary(lang);

  return (
    <html lang={lang} suppressHydrationWarning>
      <body className={inter.className}>
        <ErrorBoundary fallback={<div>An error occurred</div>}>
          <App dictionaries={dictionaries} lang={lang}>
            <main className="flex-grow p-4 md:p-6 lg:p-8">
              <div className="container mx-auto">{children}</div>
            </main>
          </App>
          <Toaster />
        </ErrorBoundary>
      </body>
    </html>
  );
}
