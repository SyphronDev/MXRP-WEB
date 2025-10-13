import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://mxrp.site"),
  title: "MXRP ER:LC - La mejor experiencia de roleplay en Roblox",
  description:
    "Únete a MXRP ER:LC, la mejor experiencia de roleplay en Roblox Liberty County. Comunidad activa, eventos especiales y soporte 24/7.",
  keywords: [
    "MXRP",
    "ER:LC",
    "Roblox",
    "roleplay",
    "Liberty County",
    "gaming",
    "community",
  ],
  authors: [{ name: "MXRP Team" }],
  creator: "MXRP",
  publisher: "MXRP",
  icons: {
    icon: "/images/Icon.png",
    shortcut: "/images/Icon.png",
    apple: "/images/Icon.png",
  },
  openGraph: {
    title: "MXRP ER:LC - La mejor experiencia de roleplay en Roblox",
    description:
      "Únete a MXRP ER:LC, la mejor experiencia de roleplay en Roblox Liberty County. Comunidad activa, eventos especiales y soporte 24/7.",
    url: "https://mxrp.site",
    siteName: "MXRP ER:LC",
    images: [
      {
        url: "/images/Icon.png",
        width: 1200,
        height: 1200,
        alt: "MXRP ER:LC - Servidor de Roleplay en Roblox",
      },
    ],
    locale: "es_ES",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "MXRP ER:LC - La mejor experiencia de roleplay en Roblox",
    description:
      "Únete a MXRP ER:LC, la mejor experiencia de roleplay en Roblox Liberty County. Comunidad activa, eventos especiales y soporte 24/7.",
    creator: "@mxrp_erlc",
    images: ["/images/Icon.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "https://mxrp.site",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
      </body>
    </html>
  );
}
