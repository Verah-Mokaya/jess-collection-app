'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useLanguage } from '@/lib/language-context';
import { Menu, X, ShoppingCart, User, LogOut } from 'lucide-react';
import { getSupabaseClient } from '@/lib/supabase-client';

export default function Header() {
  const { language, setLanguage, t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    const supabase = getSupabaseClient();
    
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
    });

    return () => subscription?.unsubscribe();
  }, []);

  const handleLogout = async () => {
    const supabase = getSupabaseClient();
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="text-2xl font-bold text-primary">Jess</div>
            <div className="text-sm text-gray-600">Collection</div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="/shop" className="text-foreground hover:text-primary transition">
              {t('shop')}
            </Link>
            <Link href="/shop?category=clothing" className="text-foreground hover:text-primary transition">
              {t('clothing')}
            </Link>
            <Link href="/shop?category=shoes" className="text-foreground hover:text-primary transition">
              {t('shoes')}
            </Link>
            <Link href="/shop?category=jewelry" className="text-foreground hover:text-primary transition">
              {t('jewelry')}
            </Link>
            <Link href="/shop?category=handbags" className="text-foreground hover:text-primary transition">
              {t('handbags')}
            </Link>
          </div>

          {/* Right Side Icons */}
          <div className="flex items-center gap-4">
            {/* Language Selector */}
            <div className="flex gap-2">
              <button
                onClick={() => setLanguage('en')}
                className={`px-3 py-1 rounded ${language === 'en' ? 'bg-primary text-white' : 'bg-gray-200'}`}
              >
                EN
              </button>
              <button
                onClick={() => setLanguage('so')}
                className={`px-3 py-1 rounded ${language === 'so' ? 'bg-primary text-white' : 'bg-gray-200'}`}
              >
                SO
              </button>
            </div>

            {/* Cart */}
            <Link href="/cart" className="relative">
              <ShoppingCart className="w-6 h-6 text-primary hover:text-primary/80 transition" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Auth */}
            {user ? (
              <div className="flex items-center gap-3">
                <Link href="/account" className="flex items-center gap-2 text-foreground hover:text-primary">
                  <User className="w-5 h-5" />
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-foreground hover:text-primary transition"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Link href="/login" className="px-4 py-2 text-primary hover:bg-primary/10 rounded transition">
                  {t('login')}
                </Link>
                <Link href="/signup" className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90 transition">
                  {t('signup')}
                </Link>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden mt-4 space-y-3">
            <Link href="/shop" className="block text-foreground hover:text-primary">
              {t('shop')}
            </Link>
            <Link href="/shop?category=clothing" className="block text-foreground hover:text-primary">
              {t('clothing')}
            </Link>
            <Link href="/shop?category=shoes" className="block text-foreground hover:text-primary">
              {t('shoes')}
            </Link>
            <Link href="/shop?category=jewelry" className="block text-foreground hover:text-primary">
              {t('jewelry')}
            </Link>
            <Link href="/shop?category=handbags" className="block text-foreground hover:text-primary">
              {t('handbags')}
            </Link>
          </div>
        )}
      </nav>
    </header>
  );
}
