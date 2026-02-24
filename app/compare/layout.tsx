import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Compare Countries',
  description:
    'Side-by-side comparison of up to 5 countries across economy, health, education, environment, and quality of life indicators.',
  alternates: { canonical: '/compare' },
  openGraph: {
    title: 'Compare Countries | World Rankings',
    description: 'Side-by-side country comparison across 30+ global indicators.',
    url: '/compare',
  },
};

export default function CompareLayout({ children }: { children: React.ReactNode }) {
  return children;
}
