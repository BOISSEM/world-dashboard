import { Metadata } from 'next';

export const siteMetadata: Metadata = {
  metadataBase: new URL('https://www.shitholecountries.fr'),
  title: {
    default: 'World Rankings - Compare 197 Countries by 30+ Indicators',
    template: '%s | World Rankings',
  },
  description:
    'Interactive world map comparing 197 countries across 30+ global indicators including economy, health, education, environment, happiness, and quality of life.',
  keywords: [
    'country comparison',
    'world rankings',
    'global indicators',
    'country statistics',
    'quality of life index',
    'GDP comparison',
    'freedom index',
    'happiness ranking',
    'environmental performance',
    'education index',
    'health statistics',
    'country data',
    'world map',
    'data visualization',
  ],
  authors: [{ name: 'World Rankings Team' }],
  creator: 'World Rankings',
  publisher: 'World Rankings',
  alternates: {
    canonical: 'https://www.shitholecountries.fr',
  },
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://www.shitholecountries.fr',
    siteName: 'World Rankings',
    title: 'World Rankings - Compare Countries by 30+ Indicators',
    description:
      'Interactive comparison of 197 countries across economy, health, education, environment, and more.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'World Rankings - Country Comparison Tool',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'World Rankings - Compare Countries',
    description: 'Interactive world map with 30+ indicators for 197 countries',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};
