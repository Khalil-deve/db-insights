import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "DB Insights — Plain English to Database Queries",
  description:
    "Ask questions in plain English and get instant database insights. Powered by local AI (Ollama/Qwen). Supports MySQL, PostgreSQL, and SQLite.",
  keywords: ["database", "AI", "SQL", "natural language", "Ollama", "insights"],
  openGraph: {
    title: "DB Insights — Plain English to Database Queries",
    description: "Ask questions in plain English and get instant database insights.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className={`${inter.variable} ${jetbrainsMono.variable}`} style={{ fontFamily: 'var(--font-inter), sans-serif' }}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
