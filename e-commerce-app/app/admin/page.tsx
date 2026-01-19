'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useLanguage } from '@/lib/language-context';
import { getSupabaseClient } from '@/lib/supabase-client';
import Header from '@/components/header';
import Footer from '@/components/footer';
import { BarChart3, ShoppingBag, Users, TrendingUp } from 'lucide-react';

interface AdminStats {
  totalOrders: number;
  totalRevenue: number;
  totalCustomers: number;
  totalProducts: number;
}

export default function AdminPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const [stats, setStats] = useState<AdminStats>({
    totalOrders: 0,
    totalRevenue: 0,
    totalCustomers: 0,
    totalProducts: 0,
  });
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdminAccess = async () => {
      try {
        const supabase = getSupabaseClient();
        const { data: { session } } = await supabase.auth.getSession();

        if (!session?.user) {
          router.push('/login?redirect=/admin');
          return;
        }

        // Check if user is admin
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

        // Fetch stats
        const [ordersRes, customersRes, productsRes] = await Promise.all([
          supabase.from('orders').select('id, total_amount', { count: 'exact' }),
          supabase.from('users').select('id', { count: 'exact' }),
          supabase.from('products').select('id', { count: 'exact' }),
        ]);

        const totalRevenue = ordersRes.data?.reduce((sum: number, order: any) => sum + order.total_amount, 0) || 0;

        setStats({
          totalOrders: ordersRes.count || 0,
          totalRevenue,
          totalCustomers: customersRes.count || 0,
          totalProducts: productsRes.count || 0,
        });
      } catch (err) {
        console.error('Failed to check admin access:', err);
      } finally {
        setLoading(false);
      }
    };

    checkAdminAccess();
  }, [router]);

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  if (!isAdmin) {
    return <div className="flex items-center justify-center h-screen">Unauthorized</div>;
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <h1 className="text-3xl font-bold text-foreground mb-8">Admin Dashboard</h1>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Orders</p>
                  <p className="text-3xl font-bold text-foreground">{stats.totalOrders}</p>
                </div>
                <ShoppingBag className="w-12 h-12 text-primary/20" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Revenue</p>
                  <p className="text-3xl font-bold text-foreground">
                    ${stats.totalRevenue.toFixed(2)}
                  </p>
                </div>
                <TrendingUp className="w-12 h-12 text-primary/20" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Customers</p>
                  <p className="text-3xl font-bold text-foreground">{stats.totalCustomers}</p>
                </div>
                <Users className="w-12 h-12 text-primary/20" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Products</p>
                  <p className="text-3xl font-bold text-foreground">{stats.totalProducts}</p>
                </div>
                <BarChart3 className="w-12 h-12 text-primary/20" />
              </div>
            </div>
          </div>

          {/* Admin Menu */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Link href="/admin/products" className="bg-white rounded-lg shadow p-8 hover:shadow-lg transition">
              <ShoppingBag className="w-12 h-12 text-primary mb-4" />
              <h2 className="text-xl font-bold text-foreground mb-2">Manage Products</h2>
              <p className="text-gray-600">Add, edit, or delete products</p>
            </Link>

            <Link href="/admin/orders" className="bg-white rounded-lg shadow p-8 hover:shadow-lg transition">
              <TrendingUp className="w-12 h-12 text-primary mb-4" />
              <h2 className="text-xl font-bold text-foreground mb-2">View Orders</h2>
              <p className="text-gray-600">Manage customer orders and shipments</p>
            </Link>

            <Link href="/admin/customers" className="bg-white rounded-lg shadow p-8 hover:shadow-lg transition">
              <Users className="w-12 h-12 text-primary mb-4" />
              <h2 className="text-xl font-bold text-foreground mb-2">View Customers</h2>
              <p className="text-gray-600">See all customer profiles and details</p>
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
