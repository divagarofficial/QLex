import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";

import AuroraBackground from "@/components/effects/AuroraBackground";
import { PopupProvider } from "@/components/popup/PopupContext";
import Footer from "@/components/common/Footer";
import SplashOverlay from "@/components/common/SplashOverlay";
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
  title: "QLex — Upload to Pickup",
  description:
    "The next generation campus printing platform. Upload documents, skip the queue, pay online and collect your prints effortlessly.",
  openGraph: {
    title: "QLex — Upload to Pickup",
    description:
      "The next generation campus printing platform. Upload documents, skip the queue, pay online and collect your prints effortlessly.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col min-h-screen`}
      >
        <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
        <PopupProvider>
          <SplashOverlay />
          <AuroraBackground />

          <div className="flex-1 flex flex-col">
            {children}
          </div>

          <Footer />
        </PopupProvider>
      </body>
    </html>
  );
}
