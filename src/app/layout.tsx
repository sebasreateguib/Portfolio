import type { Metadata, Viewport } from "next";
import { Space_Grotesk, Geist } from "next/font/google";
import { LanguageProvider } from "../context/LanguageContext";
import "../index.css";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

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
    <html lang="en" className={cn("scroll-smooth", "bg-black", "text-foreground", spaceGrotesk.variable, "font-sans", geist.variable)}>
      <body className="antialiased bg-black min-h-screen">
        <LanguageProvider>
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}
