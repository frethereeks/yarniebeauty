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

export const metadata: Metadata = {
  title: "Yarniebeauty — Handcrafted Yarn & Crochet",
  description: "Hand-finished yarn, made-to-order crochet pieces, and a crochet academy for those who want to learn the craft.",
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
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
