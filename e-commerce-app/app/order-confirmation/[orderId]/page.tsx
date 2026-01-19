'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useLanguage } from '@/lib/language-context';
import { getSupabaseClient } from '@/lib/supabase-client';
import Header from '@/components/header';
import Footer from '@/components/footer';
import { CheckCircle, Package, MessageCircle, Send } from 'lucide-react';

interface Order {
  id: string;
  order_number: string;
  total_amount: number;
  status: string;
  created_at: string;
  items: any[];
  shipping_address: string;
}

export default function OrderConfirmationPage() {
  const { t } = useLanguage();
  const params = useParams();
  const orderId = params.orderId as string;
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const supabase = getSupabaseClient();
        const { data, error } = await supabase
          .from('orders')
          .select('*')
          .eq('id', orderId)
          .single();

        if (error) throw error;
        setOrder(data);
      } catch (err) {
        console.error('Failed to fetch order:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-lg text-gray-600">Loading...</p>
        </div>
        <Footer />
      </>
    );
  }

  if (!order) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-lg text-gray-600">Order not found</p>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-3xl mx-auto px-4">
          {/* Success Message */}
          <div className="bg-white rounded-lg shadow p-8 text-center mb-8">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-foreground mb-2">
              {t('orderPlaced')}!
            </h1>
            <p className="text-gray-600 mb-4">
              Thank you for your order. We will process it shortly.
            </p>
            <p className="text-sm text-gray-500">
              Order number: <span className="font-mono font-bold">{order.id}</span>
            </p>
          </div>

          {/* Order Details */}
          <div className="bg-white rounded-lg shadow p-8 mb-8">
            <h2 className="text-xl font-bold text-foreground mb-6">{t('orderDetails')}</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div>
                <p className="text-sm text-gray-600 mb-1">{t('orderNumber')}</p>
                <p className="font-bold text-foreground">{order.id}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">{t('orderDate')}</p>
                <p className="font-bold text-foreground">
                  {new Date(order.created_at).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">{t('orderStatus')}</p>
                <p className="font-bold text-primary capitalize">{order.status}</p>
              </div>
            </div>

            {/* Items */}
            <div className="mb-8 pb-8 border-b">
              <h3 className="font-semibold text-foreground mb-4">{t('products')}</h3>
              <div className="space-y-3">
                {order.items && order.items.map((item: any, idx: number) => (
                  <div key={idx} className="flex justify-between py-2">
                    <span className="text-gray-600">
                      Product #{item.product_id} x {item.quantity}
                    </span>
                    <span className="font-semibold">
                      ${(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Total */}
            <div className="flex justify-between text-lg font-bold mb-4">
              <span>{t('total')}</span>
              <span className="text-primary">${order.total_amount.toFixed(2)}</span>
            </div>

            {/* Shipping Address */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-2">{t('shippingAddress')}</p>
              <p className="font-semibold text-foreground">{order.shipping_address}</p>
            </div>
          </div>

          {/* Tracking & Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            {/* Tracking */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center gap-3 mb-4">
                <Package className="w-6 h-6 text-primary" />
                <h3 className="font-bold text-foreground">{t('trackOrder')}</h3>
              </div>
              <p className="text-gray-600 mb-4">
                Your order will be shipped soon. You will receive a tracking number via email.
              </p>
              <Link
                href={`/order/${order.id}`}
                className="inline-block px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition"
              >
                {t('trackOrder')}
              </Link>
            </div>

            {/* Contact Us */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-bold text-foreground mb-4">{t('contactUs')}</h3>
              <p className="text-gray-600 mb-4">
                Have questions? Reach out to us on your preferred platform.
              </p>
              <div className="flex gap-3">
                <a
                  href="https://wa.me/252123456789?text=I%20have%20a%20question%20about%20order"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition text-sm"
                >
                  <MessageCircle className="w-4 h-4" />
                  WhatsApp
                </a>
                <a
                  href="https://instagram.com/jesscollection"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-3 py-2 bg-pink-500 text-white rounded hover:bg-pink-600 transition text-sm"
                >
                  <Send className="w-4 h-4" />
                  Instagram
                </a>
              </div>
            </div>
          </div>

          {/* Continue Shopping */}
          <div className="text-center">
            <Link
              href="/shop"
              className="inline-block px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition"
            >
              {t('continueShop')}
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
