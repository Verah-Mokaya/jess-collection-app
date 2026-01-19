'use client';

import Link from 'next/link';
import { useLanguage } from '@/lib/language-context';
import { Mail, Phone, MapPin, Facebook, Instagram, Twitter } from 'lucide-react';

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="bg-foreground text-white mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Company Info */}
          <div>
            <h3 className="text-xl font-bold text-primary mb-4">Jess Collection</h3>
            <p className="text-gray-300 mb-4">
              {t('Discover modest and elegant Islamic fashion for women')}
            </p>
            <div className="space-y-2 text-sm text-gray-300">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span>Mogadishu, Somalia</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                <span>+252 123 456 789</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                <span>info@jesscollection.com</span>
              </div>
            </div>
          </div>

          {/* Categories */}
          <div>
            <h4 className="font-bold mb-4">{t('shop')}</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li><Link href="/shop?category=clothing" className="hover:text-primary transition">{t('clothing')}</Link></li>
              <li><Link href="/shop?category=shoes" className="hover:text-primary transition">{t('shoes')}</Link></li>
              <li><Link href="/shop?category=jewelry" className="hover:text-primary transition">{t('jewelry')}</Link></li>
              <li><Link href="/shop?category=handbags" className="hover:text-primary transition">{t('handbags')}</Link></li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="font-bold mb-4">{t('contactUs')}</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li><Link href="#" className="hover:text-primary transition">{t('aboutUs')}</Link></li>
              <li><Link href="#" className="hover:text-primary transition">{t('privacyPolicy')}</Link></li>
              <li><Link href="#" className="hover:text-primary transition">{t('termsConditions')}</Link></li>
              <li><Link href="#" className="hover:text-primary transition">{t('trackOrder')}</Link></li>
            </ul>
          </div>

          {/* Social Links */}
          <div>
            <h4 className="font-bold mb-4">{t('followUs')}</h4>
            <div className="flex gap-4">
              <a
                href="https://facebook.com/jesscollection"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-300 hover:text-primary transition"
              >
                <Facebook className="w-6 h-6" />
              </a>
              <a
                href="https://instagram.com/jesscollection"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-300 hover:text-primary transition"
              >
                <Instagram className="w-6 h-6" />
              </a>
              <a
                href="https://twitter.com/jesscollection"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-300 hover:text-primary transition"
              >
                <Twitter className="w-6 h-6" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-700 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-gray-300 mb-4 md:mb-0">
              {t('copyright')}
            </p>
            <div className="text-sm text-gray-300">
              <span>Secure Payments: </span>
              <span className="text-primary font-bold">Stripe • PayPal • Bank Transfer</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
