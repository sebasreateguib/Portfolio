import type { Metadata } from "next";
import { LanguageProvider } from "../context/LanguageContext";
import "../index.css";

export const metadata: Metadata = {
  title: "Sebastian Reategui - CS Student",
  description: "Portfolio of Sebastian Reategui, a Computer Science student and Full Stack Developer.",
  icons: {
    icon: '/favicon.svg'
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body>
        <LanguageProvider>
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}
