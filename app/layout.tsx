import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { siteMetadata } from './metadata';
import GoogleAnalytics from './components/GoogleAnalytics';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = siteMetadata;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* Google Analytics - À ajouter après */}
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="canonical" href="https://shitholecountries.fr" />
      </head>
      <body className={inter.className}>
        <GoogleAnalytics gaId="G-70BHHGBDLR" />
        {children}
      </body>
    </html>
  );
}
