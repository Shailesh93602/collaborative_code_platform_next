'use client';

import { ThemeProvider } from '@/contexts/ThemeContext.context';
import { Web3Provider } from '@/components/Web3Provider';
import { CollaborationProvider } from '@/components/CollaborationProvider';
import Header from '@/components/Header';
import { SessionProvider } from 'next-auth/react';
import { ProjectProvider } from '@/contexts/ProjectContext.context';
import { QueryClient, QueryClientProvider } from 'react-query';

export default function App({ children, dictionaries, lang }) {
  const queryClient = new QueryClient();
  const dictionary = dictionaries.common;
  return (
    <SessionProvider>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <Web3Provider>
            <ProjectProvider>
              <CollaborationProvider>
                <div className="flex flex-col min-h-screen">
                  <Header dictionaries={dictionaries} lang={lang} />
                  <main className="flex-grow p-4 md:p-6 lg:p-8">
                    <div className="container mx-auto">{children}</div>
                  </main>
                  <footer className="bg-secondary py-4 text-center text-sm text-muted-foreground">
                    <p>
                      &copy; {new Date().getFullYear()} {dictionary.footer.copyright}
                    </p>
                  </footer>
                </div>
              </CollaborationProvider>
            </ProjectProvider>
          </Web3Provider>
        </ThemeProvider>
      </QueryClientProvider>
    </SessionProvider>
  );
}
