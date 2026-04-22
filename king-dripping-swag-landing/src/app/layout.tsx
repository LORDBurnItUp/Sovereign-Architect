import type { Metadata } from "next";
import { Space_Grotesk, Inter } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: {
    default: "King Dripping Swag | Custom Billionaire Command Centers",
    template: "%s | King Dripping Swag",
  },
  description:
    "King Dripping Swag is an elite AI Development & Real-Time Dashboard Agency for the top 0.1%. Bespoke billionaire command centers, autonomous agent swarms, and hyper-scale marketing machines for global elite investors and family offices.",
  keywords: [
    "AI Development Agency",
    "elite AI consulting",
    "billionaire AI strategy",
    "real-time command center",
    "UHNWI dashboard agency",
    "bespoke LLM agency",
    "King Dripping Swag",
    "billionaire intelligence systems",
  ],
  openGraph: {
    title: "King Dripping Swag | Custom Billionaire Command Centers",
    description:
      "Bespoke real-time intelligence systems and hyper-scale marketing machines for the top 0.1%. Global focus.",
    type: "website",
    locale: "en_US",
    siteName: "King Dripping Swag",
    url: "https://kingdrippingswag.io",
    images: [
      {
        url: "https://kingdrippingswag.io/og-image.png",
        width: 1200,
        height: 630,
        alt: "King Dripping Swag — Billionaire AI Agency",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "King Dripping Swag | Custom Billionaire Command Centers",
    description:
      "Real-time intelligence systems for UHNWIs and global family offices.",
    images: ["https://kingdrippingswag.io/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "https://kingdrippingswag.io",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://kingdrippingswag.io/#organization",
      name: "King Dripping Swag",
      url: "https://kingdrippingswag.io",
      logo: {
        "@type": "ImageObject",
        url: "https://kingdrippingswag.io/logo.png",
      },
      description:
        "Elite AI Development & Real-Time Dashboard Agency for the top 0.1%. Custom command systems for UHNWIs and family offices.",
      address: {
        "@type": "PostalAddress",
        addressLocality: "Global",
        addressCountry: "US",
      },
      contactPoint: {
        "@type": "ContactPoint",
        email: "elite@kingdrippingswag.io",
        contactType: "sales",
        areaServed: ["US", "GB", "CH", "DE"],
      },
    },
    {
      "@type": "WebSite",
      "@id": "https://kingdrippingswag.io/#website",
      url: "https://kingdrippingswag.io",
      name: "King Dripping Swag",
      publisher: { "@id": "https://kingdrippingswag.io/#organization" },
    },
    {
      "@type": "Service",
      "@id": "https://kingdrippingswag.io/#service-ai",
      name: "Custom Billionaire Dashboards",
      provider: { "@id": "https://kingdrippingswag.io/#organization" },
      description:
        "Bespoke LLMs, proprietary RAG pipelines, and automated agent swarms for multi-billion dollar family offices.",
      areaServed: "Global",
    },
    {
      "@type": "Service",
      "@id": "https://kingdrippingswag.io/#service-marketing",
      name: "Elite Narrative Control",
      provider: { "@id": "https://kingdrippingswag.io/#organization" },
      description:
        "AI-driven precision campaigns for UHNWIs using narrative control and billionaire-grade lead extraction.",
      areaServed: "Global",
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${inter.variable} h-full antialiased`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className="min-h-full flex flex-col"
        style={{ fontFamily: "var(--font-inter), sans-serif" }}
      >
        {children}
      </body>
    </html>
  );
}
