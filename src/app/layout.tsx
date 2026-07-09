import type { Metadata, Viewport } from "next";
import { Chakra_Petch } from "next/font/google";
import { LanguageProvider } from "../context/LanguageContext";
import "../index.css";

const chakraPetch = Chakra_Petch({
  subsets: ["latin"],
  weight: ["600"],
  variable: "--font-chakra-petch",
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
    <html lang="en" className={`scroll-smooth bg-background text-foreground ${chakraPetch.variable}`}>
      <body className="antialiased bg-background min-h-screen">
        <LanguageProvider>
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}
