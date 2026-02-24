'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Check, Globe2, Zap } from 'lucide-react';
import { useUser } from '@clerk/nextjs';

const FREE_FEATURES = [
  'Carte mondiale interactive',
  'Détails pays (score global + indicateurs)',
  'Comparaison 2 pays',
  'Analytics — Top 10 + Régions',
];

const PREMIUM_FEATURES = [
  'Tout ce qui est inclus dans Free',
  'Comparaison jusqu\'à 5 pays',
  'Analytics complet (tous les graphiques)',
  'Filtres de région avancés',
  'Export PDF & CSV (bientôt)',
  'Données historiques (bientôt)',
];

export default function PricingPage() {
  const { isSignedIn } = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();
  const success = searchParams.get('success') === 'true';

  const [plan, setPlan] = useState<'FREE' | 'PREMIUM'>('FREE');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isSignedIn) return;
    fetch('/api/user/plan')
      .then((r) => r.json())
      .then((d) => setPlan(d.plan));
  }, [isSignedIn]);

  async function handleUpgrade() {
    if (!isSignedIn) {
      router.push('/sign-in');
      return;
    }
    setLoading(true);
    const res = await fetch('/api/stripe/create-checkout', { method: 'POST' });
    const { url } = await res.json();
    if (url) window.location.href = url;
    else setLoading(false);
  }

  async function handlePortal() {
    setLoading(true);
    const res = await fetch('/api/stripe/create-portal', { method: 'POST' });
    const { url } = await res.json();
    if (url) window.location.href = url;
    else setLoading(false);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href="/">
            <Button variant="ghost">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Map
            </Button>
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {success && (
          <div className="mb-8 bg-green-50 border border-green-200 rounded-xl p-4 text-center text-green-800 font-medium">
            Bienvenue en Premium ! Votre accès est maintenant actif.
          </div>
        )}

        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Plans & Tarifs</h1>
          <p className="text-lg text-gray-600">
            Comparez les pays avec les données mondiales les plus à jour.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Plan FREE */}
          <Card className="border-2 border-gray-200">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-gray-100 rounded-lg p-2">
                  <Globe2 className="w-5 h-5 text-gray-600" />
                </div>
                <CardTitle className="text-xl">Free</CardTitle>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-bold text-gray-900">0€</span>
                <span className="text-gray-500">/mois</span>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 mb-6">
                {FREE_FEATURES.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-gray-500 mt-0.5 shrink-0" />
                    <span className="text-sm text-gray-700">{f}</span>
                  </li>
                ))}
              </ul>
              {!isSignedIn ? (
                <Link href="/sign-up">
                  <Button variant="outline" className="w-full">
                    Commencer gratuitement
                  </Button>
                </Link>
              ) : (
                <Button variant="outline" className="w-full" disabled>
                  {plan === 'FREE' ? 'Plan actuel' : 'Plan Free'}
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Plan PREMIUM */}
          <Card className="border-2 border-indigo-500 shadow-lg relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <span className="bg-indigo-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
                Recommandé
              </span>
            </div>
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-indigo-100 rounded-lg p-2">
                  <Zap className="w-5 h-5 text-indigo-600" />
                </div>
                <CardTitle className="text-xl text-indigo-700">Premium</CardTitle>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-bold text-gray-900">3€</span>
                <span className="text-gray-500">/an</span>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 mb-6">
                {PREMIUM_FEATURES.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-indigo-600 mt-0.5 shrink-0" />
                    <span className="text-sm text-gray-700">{f}</span>
                  </li>
                ))}
              </ul>

              {plan === 'PREMIUM' ? (
                <Button
                  variant="outline"
                  className="w-full border-indigo-300 text-indigo-700"
                  onClick={handlePortal}
                  disabled={loading}
                >
                  {loading ? 'Chargement...' : 'Gérer mon abonnement'}
                </Button>
              ) : (
                <Button
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
                  onClick={handleUpgrade}
                  disabled={loading}
                >
                  {loading ? 'Chargement...' : 'Passer en Premium'}
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
