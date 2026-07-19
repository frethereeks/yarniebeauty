import type { Metadata } from "next";
import { Cormorant, Manrope } from "next/font/google";
import "./globals.css";
import AntdRegistry from "@/lib/antd-registry";
import { AuthSessionProvider } from "@/components/shared/session-provider";

const cormorant = Cormorant({
  fallback: ["-apple-system", "sans-serif"],
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
});

const manrope = Manrope({
  fallback: ["Georgia", "serif"],
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

/* 
export const metadata: Metadata = {
  title: "Your Site Name",
  description: "A short, catchy description of your website.",
  
  // 1. Base URL config (helps Next.js resolve relative image paths automatically)
  metadataBase: new URL("https://yourdomain.com"),

  // 2. Open Graph (Facebook, LinkedIn, WhatsApp, Discord)
  openGraph: {
    title: "Your Site Name",
    description: "A short, catchy description of your website.",
    url: "https://yourdomain.com",
    siteName: "Your Site Name",
    images: [
      {
        url: "/opengraph-image.png", // Points to public/opengraph-image.png
        width: 1200,
        height: 630,
        alt: "Preview image for Your Site Name",
      },
    ],
    locale: "en_US",
    type: "website",
  },

  // 3. Twitter / X Configuration
  twitter: {
    card: "summary_large_image", // 🔥 This forces the big image layout instead of a small square icon
    title: "Your Site Name",
    description: "A short, catchy description of your website.",
    images: ["/opengraph-image.png"], // Reuse the same image
    creator: "@your_twitter_handle", // Optional
  },
};

*/

export const metadata: Metadata = {
  title: "Yarniebeauty — Handcrafted Yarn & Crochet",
  description: "Yarnie Beauty is all about a crochet making, crochet making is the process of creating fabric or other similar items using a crochet hook to interlock loops of yarn, thread, or other materials. Yarnie Beauty is your plug for hand-finished yarn, made-to-order crochet pieces, and a crochet academy for those who want to learn the craft.",
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  metadataBase: new URL(process.env.NEXTAUTH_URL as string),
  openGraph: {
    title: "Yarniebeauty — Handcrafted Yarn & Crochet",
    description: "Yarnie Beauty is all about a crochet making, crochet making is the process of creating fabric or other similar items using a crochet hook to interlock loops of yarn, thread, or other materials. Yarnie Beauty is your plug for hand-finished yarn, made-to-order crochet pieces, and a crochet academy for those who want to learn the craft.",
    url: process.env.NEXTAUTH_URL as string,
    siteName: "Yarniebeauty — Handcrafted Yarn & Crochet",
    images: [
      {
        url: "/brand/logo-old.jpg", // Points to public/opengraph-image.png
        width: 1200,
        height: 630,
        alt: "Preview image for Yarniebeauty — Handcrafted Yarn & Crochet",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image", // 🔥 This forces the big image layout instead of a small square icon
    title: "Yarniebeauty — Handcrafted Yarn & Crochet",
    description: "Yarnie Beauty is all about a crochet making, crochet making is the process of creating fabric or other similar items using a crochet hook to interlock loops of yarn, thread, or other materials. Yarnie Beauty is your plug for hand-finished yarn, made-to-order crochet pieces, and a crochet academy for those who want to learn the craft.",
    images: ["/brand/logo-old.jpg"], // Reuse the same image
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${cormorant.variable} ${manrope.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-ink text-cream font-body">
        <AuthSessionProvider>
          <AntdRegistry>{children}</AntdRegistry>
        </AuthSessionProvider>
      </body>
    </html>
  );
}
