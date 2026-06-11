import type { Metadata } from "next";
import { Bricolage_Grotesque, DM_Sans } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "sonner";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { ThemeProvider } from "@/components/ThemeProvider";

const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
});

const dmSans = DM_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Charla — AI Companion for Career & Learning",
  description:
    "Learn from voice-powered AI companions, prep for interviews, scan resumes, review code — everything a student or professional needs, in one place.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${bricolage.variable} ${dmSans.variable} antialiased`}>
        <ThemeProvider>
          <ClerkProvider appearance={{
            variables: {
              colorPrimary: '#c49843',
              colorBackground: 'var(--surface-1)',
              colorInputBackground: 'var(--surface-2)',
              colorInputText: 'var(--foreground)',
              colorText: 'var(--foreground)',
              colorTextSecondary: 'var(--muted-foreground)',
              colorNeutral: 'var(--muted-foreground)',
            },
            elements: {
              card: { backgroundColor: 'var(--surface-1)', border: '1px solid var(--border)' },
              formButtonPrimary: { backgroundColor: '#c49843' },
            }
          }}>
            <Navbar />
            {children}
            <Toaster
              position="bottom-right"
              toastOptions={{
                style: {
                  backgroundColor: 'var(--surface-1)',
                  border: '1px solid var(--border)',
                  color: 'var(--foreground)',
                  fontFamily: 'var(--font-sans)',
                },
              }}
            />
          </ClerkProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}