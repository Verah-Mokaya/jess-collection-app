'use client';

import { useEffect, useState, Suspense } from 'react';
import { useParams } from 'next/navigation';
import { useLanguage } from '@/lib/language-context';
import { getSupabaseClient } from '@/lib/supabase-client';
import Header from '@/components/header';
import Footer from '@/components/footer';
import { Package, Truck, MapPin, CheckCircle, Clock } from 'lucide-react';

interface Order {
  id: string;
  order_number: string;
  total_amount: number;
  status: string;
  created_at: string;
  updated_at: string;
  shipping_address: string;
  tracking_number?: string;
}

interface OrderItem {
  id: string;
  product_id: string;
  quantity: number;
  price_at_purchase: number;
  product_name?: string;
}

function TrackingContent() {
  const { t } = useLanguage();
  const params = useParams();
  const orderId = params.orderId as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
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

        // Fetch order items
        const { data: itemsData, error: itemsError } = await supabase
          .from('order_items')
          .select('*')
          .eq('order_id', orderId);

        if (itemsError) throw itemsError;
        setOrderItems(itemsData || []);
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
        <div className="flex items-center justify-center h-96">Loading...</div>
        <Footer />
      </>
    );
  }

  if (!order) {
    return (
      <>
        <Header />
        <div className="flex items-center justify-center h-96">Order not found</div>
        <Footer />
      </>
    );
  }

  const statuses = ['pending', 'processing', 'shipped', 'delivered'];
  const currentStatusIndex = statuses.indexOf(order.status);

  const getStatusIcon = (status: string, index: number) => {
    if (status === 'pending') return <Clock className="w-6 h-6" />;
    if (status === 'processing') return <Package className="w-6 h-6" />;
    if (status === 'shipped') return <Truck className="w-6 h-6" />;
    if (status === 'delivered') return <CheckCircle className="w-6 h-6" />;
    return <MapPin className="w-6 h-6" />;
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-3xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow p-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Track Your Order</h1>
            <div className="flex gap-4 mb-8">
              <p className="text-gray-600">Order #: <span className="font-semibold">{order.order_number}</span></p>
              <p className="text-gray-600">Date: <span className="font-semibold">{new Date(order.created_at).toLocaleDateString()}</span></p>
            </div>

            {/* Timeline */}
            <div className="relative mb-12">
              {/* Progress Line */}
              <div className="absolute top-8 left-8 right-8 h-1 bg-gray-200">
                <div
                  className="h-full bg-primary transition-all duration-500"
                  style={{
                    width: `${((currentStatusIndex + 1) / statuses.length) * 100}%`
                  }}
                />
              </div>

              {/* Status Nodes */}
              <div className="relative flex justify-between">
                {statuses.map((status, index) => (
                  <div key={status} className="flex flex-col items-center">
                    {/* Circle */}
                    <div
                      className={`w-16 h-16 rounded-full flex items-center justify-center relative z-10 ${
                        index <= currentStatusIndex
                          ? 'bg-primary text-white'
                          : 'bg-gray-200 text-gray-400'
                      }`}
                    >
                      {getStatusIcon(status, index)}
                    </div>

                    {/* Label */}
                    <p className="mt-4 text-center text-sm font-semibold text-foreground capitalize">
                      {status}
                    </p>

                    {/* Status Date */}
                    {status === 'pending' && (
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(order.created_at).toLocaleDateString()}
                      </p>
                    )}
                    {status === 'delivered' && (
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(order.updated_at).toLocaleDateString() || 'Coming soon'}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Current Status Details */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
              <h2 className="font-bold text-foreground mb-2 capitalize">{order.status}</h2>
              <p className="text-gray-600 mb-4">
                {order.status === 'pending' && 'Your order has been received and is being prepared.'}
                {order.status === 'processing' && 'Your order is being packaged and will ship soon.'}
                {order.status === 'shipped' && `Your order is on its way! Tracking #: ${order.tracking_number || 'Coming soon'}`}
                {order.status === 'delivered' && 'Your order has been delivered. Thank you for shopping with us!'}
              </p>
              {order.status === 'shipped' && order.tracking_number && (
                <p className="text-sm text-gray-600">
                  Tracking #: {order.tracking_number}
                </p>
              )}
            </div>

            {/* Order Details */}
            <div className="border-t pt-8">
              <h2 className="text-xl font-bold text-foreground mb-4">Order Details</h2>

              {/* Items */}
              <div className="mb-6">
                <h3 className="font-semibold text-foreground mb-3">Items</h3>
                <div className="space-y-3">
                  {orderItems.length > 0 ? (
                    orderItems.map((item) => (
                      <div key={item.id} className="flex justify-between py-3 border-b">
                        <div>
                          <p className="text-gray-700 font-medium">Product x {item.quantity}</p>
                          <p className="text-sm text-gray-500">Price: ${item.price_at_purchase.toFixed(2)} each</p>
                        </div>
                        <span className="font-semibold">
                          ${(item.price_at_purchase * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500">No items found</p>
                  )}
                </div>
              </div>

              {/* Shipping Address */}
              <div className="mb-6">
                <h3 className="font-semibold text-foreground mb-2">Shipping Address</h3>
                <p className="text-gray-600">{order.shipping_address}</p>
              </div>

              {/* Total */}
              <div className="flex justify-between font-bold text-lg bg-gray-100 p-4 rounded">
                <span>Total</span>
                <span className="text-primary">${order.total_amount.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default function OrderTrackingPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <TrackingContent />
    </Suspense>
  );
}
