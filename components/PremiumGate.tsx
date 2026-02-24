'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Lock } from 'lucide-react';

interface PremiumGateProps {
  plan: 'FREE' | 'PREMIUM';
  children: React.ReactNode;
  title?: string;
  description?: string;
}

export default function PremiumGate({ plan, children, title, description }: PremiumGateProps) {
  if (plan === 'PREMIUM') return <>{children}</>;

  return (
    <div className="relative">
      <div className="pointer-events-none select-none opacity-30 blur-sm">
        {children}
      </div>
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/70 rounded-lg">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center max-w-sm mx-4">
          <div className="bg-indigo-100 rounded-full p-3 w-12 h-12 flex items-center justify-center mx-auto mb-4">
            <Lock className="w-6 h-6 text-indigo-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {title ?? 'Fonctionnalité Premium'}
          </h3>
          <p className="text-sm text-gray-600 mb-6">
            {description ?? 'Passez en Premium pour accéder à cette fonctionnalité.'}
          </p>
          <Link href="/pricing">
            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white w-full">
              Voir les plans
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
