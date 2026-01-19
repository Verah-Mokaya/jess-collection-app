'use client';

import Link from 'next/link';
import { useLanguage } from '@/lib/language-context';
import { useCart } from '@/lib/cart-context';
import Header from '@/components/header';
import Footer from '@/components/footer';
import { Trash2, Plus, Minus } from 'lucide-react';

export default function CartPage() {
  const { t } = useLanguage();
  const { items, removeFromCart, updateQuantity, total } = useCart();

  return (
    <>
      <Header />
      <div className="min-h-screen flex flex-col bg-gray-50">
        <main className="flex-grow max-w-7xl mx-auto w-full px-4 py-12">
          <h1 className="text-3xl font-bold text-foreground mb-8">{t('yourCart')}</h1>

          {items.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <p className="text-xl text-gray-500 mb-6">{t('emptyCart')}</p>
              <Link
                href="/shop"
                className="inline-block px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition"
              >
                {t('continueShop')}
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Cart Items */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-lg shadow overflow-hidden">
                  {items.map(item => (
                    <div
                      key={item.id}
                      className="border-b last:border-b-0 p-4 flex gap-4 items-start hover:bg-gray-50 transition"
                    >
                      {/* Product Image */}
                      <div className="w-24 h-24 bg-gray-200 rounded flex-shrink-0 overflow-hidden">
                        <img
                          src={item.image || '/placeholder.png'}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Product Details */}
                      <div className="flex-grow">
                        <h3 className="font-semibold text-foreground mb-2">{item.name}</h3>
                        <p className="text-sm text-gray-600 mb-2">{t('category')}: {item.category}</p>
                        <p className="text-lg font-bold text-primary">${item.price}</p>
                      </div>

                      {/* Quantity */}
                      <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-2">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="p-1 hover:bg-gray-300 rounded transition"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-8 text-center font-semibold">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="p-1 hover:bg-gray-300 rounded transition"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Subtotal & Remove */}
                      <div className="text-right">
                        <p className="font-semibold text-foreground mb-2">
                          ${(item.price * item.quantity).toFixed(2)}
                        </p>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-red-500 hover:text-red-700 transition flex items-center gap-1 text-sm"
                        >
                          <Trash2 className="w-4 h-4" />
                          {t('removeItem')}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-lg shadow p-6 sticky top-20">
                  <h2 className="text-xl font-bold text-foreground mb-6">{t('orderSummary')}</h2>

                  <div className="space-y-3 mb-6 pb-6 border-b">
                    <div className="flex justify-between">
                      <span className="text-gray-600">{t('subtotal')}</span>
                      <span className="font-semibold">${total.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">{t('shipping')}</span>
                      <span className="font-semibold">$0.00</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">{t('tax')}</span>
                      <span className="font-semibold">${(total * 0.1).toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="flex justify-between mb-6 text-lg font-bold">
                    <span>{t('total')}</span>
                    <span className="text-primary">${(total + total * 0.1).toFixed(2)}</span>
                  </div>

                  <Link
                    href="/checkout"
                    className="block w-full text-center bg-primary text-white py-3 rounded-lg font-semibold hover:bg-primary/90 transition mb-3"
                  >
                    {t('checkout')}
                  </Link>

                  <Link
                    href="/shop"
                    className="block w-full text-center border border-primary text-primary py-3 rounded-lg font-semibold hover:bg-primary/5 transition"
                  >
                    {t('continueShop')}
                  </Link>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
      <Footer />
    </>
  );
}
