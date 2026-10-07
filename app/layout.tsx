import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";

const spaceGrotesk = localFont({
  src: "./fonts/SpaceGrotesk-VariableFont_wght.ttf",
  variable: "--font-space-grotesk",
  display: "swap",
  weight: "300 700",
});

export const metadata: Metadata = {
  title: "Single-page developer portfolio | Royer Adames",
  description:
    "Adam Keyes' sample front-end developer portfolio with skills, projects and a contact form, built for the Frontend Mentor challenge.",
};

export const viewport: Viewport = { themeColor: "#151515" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={spaceGrotesk.variable}>
      <body>{children}</body>
    </html>
  );
}
