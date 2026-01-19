'use client';

import React, { Suspense } from "react"
import Loading from './loading'; // Import the Loading component

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useLanguage } from '@/lib/language-context';
import { getSupabaseClient } from '@/lib/supabase-client';
import Header from '@/components/header';
import Footer from '@/components/footer';

export default function LoginPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const supabase = getSupabaseClient();
      
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw authError;

      // Check if user is admin
      if (data.user) {
        const { data: userData } = await supabase
          .from('users')
          .select('is_admin')
          .eq('id', data.user.id)
          .single();

        if (userData?.is_admin) {
          router.push('/admin');
        } else {
          router.push('/');
        }
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-primary/5 to-white flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h1 className="text-3xl font-bold text-center mb-2 text-foreground">
              {t('login')}
            </h1>
            <p className="text-center text-gray-600 mb-8">
              {t('noAccount')} <Link href="/signup" className="text-primary font-semibold">{t('signup')}</Link>
            </p>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}

            <Suspense fallback={<Loading />}> {/* Wrap the form in a Suspense boundary */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    {t('email')}
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="your@email.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    {t('password')}
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="••••••••"
                  />
                </div>

                <div className="flex justify-end">
                  <Link href="#" className="text-sm text-primary hover:underline">
                    {t('forgotPassword')}
                  </Link>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary text-white py-3 rounded-lg font-semibold hover:bg-primary/90 transition disabled:opacity-50"
                >
                  {loading ? 'Signing in...' : t('loginButton')}
                </button>
              </form>
            </Suspense>

            <p className="text-center text-sm text-gray-600 mt-6">
              {t('haveAccount')} <Link href="/signup" className="text-primary font-semibold">{t('signup')}</Link>
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
