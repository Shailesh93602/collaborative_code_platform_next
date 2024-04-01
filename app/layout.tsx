import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { CollaborationProvider } from "@/components/collaboration-provider";
import { AIProvider } from "@/components/ai-provider";
import { Web3Provider } from "@/components/web3-provider";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Advanced Collaborative Code Platform",
  description:
    "Real-time collaborative code execution, analysis, and visualization",
};

export default function RootLayout({
  children,
}: {
  readonly children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Web3Provider>
            <AIProvider>
              <CollaborationProvider>
                {children}
                <Toaster />
              </CollaborationProvider>
            </AIProvider>
          </Web3Provider>
        </ThemeProvider>
      </body>
    </html>
  );
}
