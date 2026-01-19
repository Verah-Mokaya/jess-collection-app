'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/lib/language-context';
import { getSupabaseClient } from '@/lib/supabase-client';
import Header from '@/components/header';
import Footer from '@/components/footer';
import { Mail, Phone, MapPin } from 'lucide-react';

interface Customer {
  id: string;
  email: string;
  name: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  created_at: string;
}

export default function AdminCustomersPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const [customers, setCustomers] = useState<Customer[]>([]);
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
        fetchCustomers();
      } catch (err) {
        console.error('Failed to check access:', err);
      }
    };

    checkAccess();
  }, [router]);

  const fetchCustomers = async () => {
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCustomers(data || []);
    } catch (err) {
      console.error('Failed to fetch customers:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isAdmin) return null;

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-3xl font-bold text-foreground mb-8">Customers</h1>

          {loading ? (
            <p>Loading...</p>
          ) : (
            <div className="grid gap-6">
              {customers.length === 0 ? (
                <div className="bg-white rounded-lg shadow p-8 text-center text-gray-600">
                  No customers yet
                </div>
              ) : (
                customers.map(customer => (
                  <div key={customer.id} className="bg-white rounded-lg shadow p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="text-lg font-bold text-foreground mb-2">{customer.name}</h3>
                        <div className="space-y-2 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4" />
                            <span>{customer.email}</span>
                          </div>
                          {customer.phone && (
                            <div className="flex items-center gap-2">
                              <Phone className="w-4 h-4" />
                              <span>{customer.phone}</span>
                            </div>
                          )}
                          {customer.address && (
                            <div className="flex items-start gap-2">
                              <MapPin className="w-4 h-4 mt-0.5" />
                              <span>{customer.address}, {customer.city}, {customer.country}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500">Joined</p>
                        <p className="font-semibold text-foreground">
                          {new Date(customer.created_at).toLocaleDateString()}
                        </p>
                        {customer.is_admin && (
                          <span className="inline-block mt-2 px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-semibold">
                            Admin
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}
