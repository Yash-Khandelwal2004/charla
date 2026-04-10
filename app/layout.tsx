import type { Metadata } from "next";
import { Bricolage_Grotesque, Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "sonner";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { ThemeProvider } from "@/components/ThemeProvider";

const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Charla",
  description: "Your AI-powered career & learning companion platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${bricolage.variable} ${inter.variable} antialiased`}>
        <ThemeProvider>
          <ClerkProvider appearance={{
            variables: {
              colorPrimary: '#3b82f6',
              colorBackground: 'var(--surface-1)',
              colorInputBackground: 'var(--surface-2)',
              colorInputText: 'var(--foreground)',
              colorText: 'var(--foreground)',
              colorTextSecondary: 'var(--muted-foreground)',
              colorNeutral: 'var(--muted-foreground)',
            },
            elements: {
              card: { backgroundColor: 'var(--surface-1)', border: '1px solid var(--surface-3)' },
              formButtonPrimary: { backgroundColor: '#3b82f6' },
            }
          }}>
            <Navbar />
            {children}
            <Toaster
              position="bottom-right"
              toastOptions={{
                style: {
                  backgroundColor: 'var(--surface-1)',
                  border: '1px solid var(--surface-3)',
                  color: 'var(--foreground)',
                  fontFamily: 'var(--font-inter)',
                },
              }}
            />
          </ClerkProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}