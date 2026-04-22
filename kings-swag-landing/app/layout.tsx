import { Orbitron, JetBrains_Mono, Italiana, Syne } from "next/font/google";
import "./globals.css";

const orbitron = Orbitron({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["400", "500", "600", "700", "800", "900"],
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["300", "400", "500", "600", "700"],
});

const italiana = Italiana({
  subsets: ["latin"],
  variable: "--font-serif",
  weight: ["400"],
});

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata = {
  title: "B.L.A.S.T. — Sovereign Command Center // Dubai Node",
  description: "Autonomous Strategist Intelligence Platform for Elite Real Estate Operations",
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${orbitron.variable} ${mono.variable} ${italiana.variable} ${syne.variable}`}
    >
      <body className="font-sans antialiased text-white bg-obsidian selection:bg-gold/30">
        {children}
      </body>
    </html>
  );
}
