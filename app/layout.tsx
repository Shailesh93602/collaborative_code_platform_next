import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/contexts/ThemeContext.context";
import { CollaborationProvider } from "@/components/collaboration-provider";
import { Web3Provider } from "@/components/web3-provider";
import { Toaster } from "@/components/ui/toaster";
import { SessionProvider } from "next-auth/react";
import { ProjectProvider } from "@/contexts/ProjectContext.context";
import { QueryClient, QueryClientProvider } from "react-query";
import ErrorBoundary from "@/components/ErrorBoundary";
import * as Sentry from "@sentry/nextjs";
import { UserProfile } from "@/components/user-profile";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { LayoutCustomizer } from "@/components/layout-customizer";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 1.0,
});

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Advanced Collaborative Code Platform",
  description:
    "Real-time collaborative code execution, analysis, and visualization",
};

const queryClient = new QueryClient();

export default function RootLayout({
  children,
}: {
  readonly children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-primary text-primary-foreground px-4 py-2 rounded"
        >
          Skip to main content
        </a>
        <ErrorBoundary
          fallback={<div>Something went wrong. Please try again later.</div>}
        >
          <SessionProvider>
            <QueryClientProvider client={queryClient}>
              <ThemeProvider>
                <Web3Provider>
                  <ProjectProvider>
                    <CollaborationProvider>
                      <header className="flex justify-between items-center p-4 bg-background border-b">
                        <h1 className="text-2xl font-bold">
                          Collaborative Code Platform
                        </h1>
                        <div className="flex items-center space-x-4">
                          <ThemeSwitcher />
                          <LayoutCustomizer />
                          <UserProfile />
                        </div>
                      </header>
                      <main id="main-content" className="main-content">
                        {children}
                      </main>
                      <Toaster />
                    </CollaborationProvider>
                  </ProjectProvider>
                </Web3Provider>
              </ThemeProvider>
            </QueryClientProvider>
          </SessionProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
