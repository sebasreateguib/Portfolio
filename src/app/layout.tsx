import type { Metadata, Viewport } from "next";
import { Space_Grotesk } from "next/font/google";
import { LanguageProvider } from "../context/LanguageContext";
import "../index.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-space-grotesk",
});

export const metadata: Metadata = {
  title: "Sebastian Reategui - CS Student",
  description: "Portfolio of Sebastian Reategui, a Computer Science student and Full Stack Developer.",
  icons: {
    icon: '/favicon.svg'
  }
};

export const viewport: Viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`scroll-smooth bg-background text-foreground ${spaceGrotesk.variable}`}>
      <body className="antialiased bg-background min-h-screen">
        <LanguageProvider>
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}
