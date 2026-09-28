import type { Metadata, Viewport } from "next";
import { Fraunces, IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";
import { CookieConsent } from "@/components/landing/CookieConsent";
import { TestModeButton } from "@/components/testmode/TestModeButton";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
});

const plexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-plex-sans",
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-plex-mono",
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://raccordement-assistance.fr";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Raccordement Assistance — Préparez votre raccordement électrique",
    template: "%s — Raccordement Assistance",
  },
  description:
    "Préparez votre demande de raccordement électrique en quelques minutes avec Lydie. Service indépendant, non affilié à Enedis.",
  manifest: "/manifest.json",
  openGraph: {
    type: "website",
    locale: "fr_FR",
    siteName: "Raccordement Assistance",
    title: "Raccordement Assistance — Préparez votre raccordement électrique",
    description:
      "Préparez votre demande de raccordement électrique en quelques minutes avec Lydie. Service indépendant, non affilié à Enedis.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0b1f3a",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${fraunces.variable} ${plexSans.variable} ${plexMono.variable}`}>
      <body className="flex min-h-screen flex-col font-sans antialiased">
        <a
          href="#contenu-principal"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-m focus:bg-accent focus:px-4 focus:py-2 focus:text-accent-ink"
        >
          Aller au contenu principal
        </a>
        <Header />
        <main id="contenu-principal" className="flex-1">
          {children}
        </main>
        <Footer />
        <CookieConsent />
        <TestModeButton />
      </body>
    </html>
  );
}
