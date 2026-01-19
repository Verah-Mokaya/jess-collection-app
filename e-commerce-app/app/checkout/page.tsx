'use client';

import React from "react"

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useLanguage } from '@/lib/language-context';
import { useCart } from '@/lib/cart-context';
import { getSupabaseClient } from '@/lib/supabase-client';
import Header from '@/components/header';
import Footer from '@/components/footer';
import { MessageCircle, Send } from 'lucide-react';

export default function CheckoutPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const { items, total, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [user, setUser] = useState<any>(null);
  const [paymentMethod, setPaymentMethod] = useState('stripe');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    country: '',
    zipCode: '',
  });

  useEffect(() => {
    const supabase = getSupabaseClient();
    
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        router.push('/login?redirect=/checkout');
        return;
      }
      setUser(session.user);

      // Load user profile
      const { data: userData } = await supabase
        .from('users')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (userData) {
        setFormData(prev => ({
          ...prev,
          email: userData.email,
          firstName: userData.name?.split(' ')[0] || '',
          lastName: userData.name?.split(' ')[1] || '',
          phone: userData.phone || '',
          address: userData.address || '',
          city: userData.city || '',
          country: userData.country || '',
        }));
      }
    };

    checkAuth();
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePlaceOrder = async () => {
    if (!user) return;

    setLoading(true);
    setError('');

    try {
      const finalTotal = total + total * 0.1;
      let paymentIntentId = null;

      // Create payment intent if using Stripe
      if (paymentMethod === 'stripe') {
        const paymentRes = await fetch('/api/create-payment-intent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount: finalTotal,
            currency: 'usd',
          }),
        });

        if (!paymentRes.ok) {
          throw new Error('Failed to create payment intent');
        }

        const paymentData = await paymentRes.json();
        paymentIntentId = paymentData.paymentIntentId;

        // In a real app, you would redirect to Stripe Checkout or use Elements
        // For now, we'll show a message
        alert('Payment flow would redirect to Stripe in production');
      }

      // Create order
      const orderRes = await fetch('/api/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items,
          totalAmount: finalTotal,
          shippingAddress: `${formData.address}, ${formData.city}, ${formData.country} ${formData.zipCode}`,
          paymentMethod,
          paymentIntentId,
        }),
      });

      if (!orderRes.ok) {
        throw new Error('Failed to create order');
      }

      const orderData = await orderRes.json();
      clearCart();
      router.push(`/order-confirmation/${orderData.orderId}`);
    } catch (err: any) {
      setError(err.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  if (items.length === 0) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <p className="text-xl text-gray-600 mb-4">Your cart is empty</p>
            <Link href="/shop" className="text-primary hover:underline">
              Continue shopping
            </Link>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  const finalTotal = total + total * 0.1;

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-3xl font-bold text-foreground mb-8">{t('checkoutTitle')}</h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Checkout Form */}
            <div className="lg:col-span-2 space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                  {error}
                </div>
              )}

              {/* Shipping Address */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold text-foreground mb-4">{t('shippingAddress')}</h2>
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    name="firstName"
                    placeholder={t('name')}
                    value={formData.firstName}
                    onChange={handleChange}
                    className="col-span-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <input
                    type="text"
                    name="lastName"
                    placeholder="Last Name"
                    value={formData.lastName}
                    onChange={handleChange}
                    className="col-span-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <input
                    type="email"
                    name="email"
                    placeholder={t('email')}
                    value={formData.email}
                    onChange={handleChange}
                    disabled
                    className="col-span-2 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-gray-100"
                  />
                  <input
                    type="tel"
                    name="phone"
                    placeholder={t('phone')}
                    value={formData.phone}
                    onChange={handleChange}
                    className="col-span-2 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <input
                    type="text"
                    name="address"
                    placeholder={t('address')}
                    value={formData.address}
                    onChange={handleChange}
                    className="col-span-2 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <input
                    type="text"
                    name="city"
                    placeholder={t('city')}
                    value={formData.city}
                    onChange={handleChange}
                    className="col-span-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <input
                    type="text"
                    name="zipCode"
                    placeholder="ZIP Code"
                    value={formData.zipCode}
                    onChange={handleChange}
                    className="col-span-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <input
                    type="text"
                    name="country"
                    placeholder={t('country')}
                    value={formData.country}
                    onChange={handleChange}
                    className="col-span-2 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              {/* Payment Method */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold text-foreground mb-4">{t('paymentMethod')}</h2>
                <div className="space-y-3 mb-6">
                  {['stripe', 'paypal', 'bank_transfer'].map(method => (
                    <label key={method} className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value={method}
                        checked={paymentMethod === method}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="w-4 h-4 text-primary"
                      />
                      <span className="font-medium text-foreground">
                        {t(method === 'stripe' ? 'creditCard' : method === 'paypal' ? 'paypal' : 'bankTransfer')}
                      </span>
                    </label>
                  ))}
                </div>

                {/* Social Media Contact Options */}
                <div className="border-t pt-6">
                  <h3 className="font-semibold text-foreground mb-4">{t('contactVia')}</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <a
                      href="https://wa.me/252123456789?text=I%20want%20to%20complete%20my%20order"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 px-4 py-3 border border-green-500 text-green-600 rounded-lg hover:bg-green-50 transition"
                    >
                      <MessageCircle className="w-5 h-5" />
                      <span className="text-sm font-medium">{t('whatsapp')}</span>
                    </a>
                    <a
                      href="https://instagram.com/jesscollection"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 px-4 py-3 border border-pink-500 text-pink-600 rounded-lg hover:bg-pink-50 transition"
                    >
                      <Send className="w-5 h-5" />
                      <span className="text-sm font-medium">{t('instagram')}</span>
                    </a>
                    <a
                      href="https://facebook.com/jesscollection"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 px-4 py-3 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition"
                    >
                      <Send className="w-5 h-5" />
                      <span className="text-sm font-medium">{t('facebook')}</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow p-6 sticky top-20">
                <h2 className="text-xl font-bold text-foreground mb-6">{t('orderSummary')}</h2>

                {/* Items List */}
                <div className="space-y-3 mb-6 pb-6 border-b max-h-64 overflow-y-auto">
                  {items.map(item => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="text-gray-600">{item.name} x {item.quantity}</span>
                      <span className="font-semibold">${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                {/* Totals */}
                <div className="space-y-3 mb-6 pb-6 border-b">
                  <div className="flex justify-between">
                    <span className="text-gray-600">{t('subtotal')}</span>
                    <span className="font-semibold">${total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">{t('tax')}</span>
                    <span className="font-semibold">${(total * 0.1).toFixed(2)}</span>
                  </div>
                </div>

                <div className="flex justify-between mb-6 text-lg font-bold">
                  <span>{t('total')}</span>
                  <span className="text-primary">${finalTotal.toFixed(2)}</span>
                </div>

                <button
                  onClick={handlePlaceOrder}
                  disabled={loading}
                  className="w-full bg-primary text-white py-3 rounded-lg font-semibold hover:bg-primary/90 transition disabled:opacity-50"
                >
                  {loading ? 'Processing...' : t('placeOrder')}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
