import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "../components/theme/ThemeProvider";

export const metadata: Metadata = {
  title: "DocuAI",
  description: "AI-powered intelligent document generation platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head><script dangerouslySetInnerHTML={{ __html: `try { var t = localStorage.getItem('docuai-theme'); if (t === 'dark' || t === 'light') document.documentElement.dataset.theme = t; } catch (e) {}` }} /></head>
      <body><ThemeProvider>{children}</ThemeProvider></body>
    </html>
  );
}