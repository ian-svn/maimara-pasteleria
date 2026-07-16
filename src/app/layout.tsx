import type { Metadata } from "next";
import { Great_Vibes, Inter } from "next/font/google";
import { ThemeProvider } from "@/context/ThemeContext";
import { ThemeScript } from "@/components/ThemeScript";
import "./globals.css";

const greatVibes = Great_Vibes({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-great-vibes",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Maimará | Pastelería Artesanal",
  description:
    "Mesas dulces, tortas de diseño, tartas y galletitas decoradas. Parque Chacabuco, CABA.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body
        className={`${greatVibes.variable} ${inter.variable} min-h-screen antialiased`}
      >
        <ThemeScript />
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
