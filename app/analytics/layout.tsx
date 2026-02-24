import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Analytics',
  description:
    'Explore global country rankings and regional trends across 30+ indicators. Top performers, regional breakdowns, and cross-indicator analysis for 197 countries.',
  alternates: { canonical: '/analytics' },
  openGraph: {
    title: 'Analytics | World Rankings',
    description: 'Global country rankings and regional trends across 30+ indicators.',
    url: '/analytics',
  },
};

export default function AnalyticsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
