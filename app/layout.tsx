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
      "Únete a MXRP ER:LC, la mejor experiencia de roleplay en Roblox Liberty County.",
    type: "website",
    locale: "es_ES",
  },
  twitter: {
    card: "summary_large_image",
    title: "MXRP ER:LC - La mejor experiencia de roleplay en Roblox",
    description:
      "Únete a MXRP ER:LC, la mejor experiencia de roleplay en Roblox Liberty County.",
    creator: "@mxrp_erlc",
  },
  robots: {
    index: true,
    follow: true,
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
