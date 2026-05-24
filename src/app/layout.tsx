import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Aaspas - Hyperlocal Community Platform",
  description: "A hyperlocal community platform for Indian neighborhoods, societies, towns, and local areas.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="bg-slate-900 text-slate-800 min-h-full font-sans antialiased flex flex-col items-center justify-center">
        {/* Mobile Viewport Shell */}
        <div className="w-full max-w-md min-h-screen bg-slate-50 flex flex-col relative shadow-2xl overflow-x-hidden md:border-x md:border-slate-800">
          <Providers>{children}</Providers>
        </div>
      </body>
    </html>
  );
}
