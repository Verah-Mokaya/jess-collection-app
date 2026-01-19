'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/lib/language-context';
import { getSupabaseClient } from '@/lib/supabase-client';
import Header from '@/components/header';
import Footer from '@/components/footer';
import { Package, Check } from 'lucide-react';

interface Order {
  id: string;
  order_number: string;
  total_amount: number;
  status: string;
  created_at: string;
  user_id: string;
  items: any[];
}

export default function AdminOrdersPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAccess = async () => {
      try {
        const supabase = getSupabaseClient();
        const { data: { session } } = await supabase.auth.getSession();

        if (!session?.user) {
          router.push('/login');
          return;
        }

        const { data: userData } = await supabase
          .from('users')
          .select('is_admin')
          .eq('id', session.user.id)
          .single();

        if (!userData?.is_admin) {
          router.push('/');
          return;
        }

        setIsAdmin(true);
        fetchOrders();
      } catch (err) {
        console.error('Failed to check access:', err);
      }
    };

    checkAccess();
  }, [router]);

  const fetchOrders = async () => {
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (err) {
      console.error('Failed to fetch orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const supabase = getSupabaseClient();
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);

      if (error) throw error;
      fetchOrders();
    } catch (err) {
      console.error('Failed to update order:', err);
    }
  };

  if (!isAdmin) return null;

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-3xl font-bold text-foreground mb-8">Manage Orders</h1>

          {loading ? (
            <p>Loading...</p>
          ) : (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              {orders.length === 0 ? (
                <div className="p-8 text-center text-gray-600">
                  No orders yet
                </div>
              ) : (
                <table className="w-full">
                  <thead className="bg-gray-100 border-b">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-semibold">Order ID</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold">Total</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold">Status</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold">Date</th>
                      <th className="px-6 py-3 text-center text-sm font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map(order => (
                      <tr key={order.id} className="border-b hover:bg-gray-50">
                        <td className="px-6 py-3 font-mono text-sm">{order.id.substring(0, 8)}</td>
                        <td className="px-6 py-3 font-bold text-primary">${order.total_amount.toFixed(2)}</td>
                        <td className="px-6 py-3">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            order.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                            order.status === 'shipped' ? 'bg-purple-100 text-purple-800' :
                            order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="px-6 py-3 text-sm">
                          {new Date(order.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-3 text-center">
                          <div className="flex gap-2 justify-center">
                            {order.status !== 'delivered' && (
                              <>
                                {order.status === 'pending' && (
                                  <button
                                    onClick={() => updateOrderStatus(order.id, 'processing')}
                                    className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 transition"
                                  >
                                    Process
                                  </button>
                                )}
                                {order.status === 'processing' && (
                                  <button
                                    onClick={() => updateOrderStatus(order.id, 'shipped')}
                                    className="px-3 py-1 bg-purple-500 text-white rounded text-sm hover:bg-purple-600 transition flex items-center gap-1"
                                  >
                                    <Package className="w-4 h-4" />
                                    Ship
                                  </button>
                                )}
                                {order.status === 'shipped' && (
                                  <button
                                    onClick={() => updateOrderStatus(order.id, 'delivered')}
                                    className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600 transition flex items-center gap-1"
                                  >
                                    <Check className="w-4 h-4" />
                                    Deliver
                                  </button>
                                )}
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}
