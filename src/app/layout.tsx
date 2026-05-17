import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ProfileProvider } from "@/src/contexts/ProfileContext";
import { InboxProvider } from "@/src/contexts/InboxContext";
import FCMHandler from "@/src/components/FCMHandler";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "まちっぷ",
  description:
    "町活性化アプリ「まちっぷ」。イベント共有や掲示板で町を盛り上げよう！",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Machip",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: "#f97316",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans text-gray-900 flex flex-col md:flex-row select-none bg-white md:bg-gray-50 overflow-hidden antialiased`}
        style={{ height: "100dvh" }}
      >
        <ProfileProvider>
          <InboxProvider>
            <FCMHandler />
            {children}
          </InboxProvider>
        </ProfileProvider>
      </body>
    </html>
  );
}
