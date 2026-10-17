import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { siteName, siteUrl } from "./site";

const spaceGrotesk = localFont({
  src: "./fonts/SpaceGrotesk-VariableFont_wght.woff2",
  variable: "--font-space-grotesk",
  display: "swap",
  weight: "300 700",
});

const title = "Single-page developer portfolio | Royer Adames";
const description =
  "Adam Keyes' sample front-end developer portfolio with skills, projects and a contact form, built for the Frontend Mentor challenge.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title,
  description,
  alternates: { canonical: siteUrl },
  openGraph: { type: "website", siteName, url: siteUrl, title, description, locale: "en" },
};

export const viewport: Viewport = { themeColor: "#151515" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={spaceGrotesk.variable}>
      <body>{children}</body>
    </html>
  );
}
