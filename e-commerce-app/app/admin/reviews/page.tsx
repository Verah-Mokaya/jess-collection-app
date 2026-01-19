'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/lib/language-context';
import { getSupabaseClient } from '@/lib/supabase-client';
import Header from '@/components/header';
import Footer from '@/components/footer';
import { Trash2, Star } from 'lucide-react';

interface Review {
  id: string;
  product_id: string;
  user_id: string;
  rating: number;
  review_text: string;
  created_at: string;
  product_name?: string;
}

export default function AdminReviewsPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const [reviews, setReviews] = useState<Review[]>([]);
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
        fetchReviews();
      } catch (err) {
        console.error('Failed to check access:', err);
      }
    };

    checkAccess();
  }, [router]);

  const fetchReviews = async () => {
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReviews(data || []);
    } catch (err) {
      console.error('Failed to fetch reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this review?')) return;

    try {
      const supabase = getSupabaseClient();
      const { error } = await supabase
        .from('reviews')
        .delete()
        .eq('id', id);

      if (error) throw error;
      fetchReviews();
    } catch (err) {
      console.error('Failed to delete review:', err);
      alert('Failed to delete review');
    }
  };

  if (!isAdmin) return null;

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-3xl font-bold text-foreground mb-8">Manage Reviews</h1>

          {loading ? (
            <p>Loading reviews...</p>
          ) : reviews.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-6 text-center">
              <p className="text-gray-600">No reviews yet</p>
            </div>
          ) : (
            <div className="grid gap-6">
              {reviews.map(review => (
                <div key={review.id} className="bg-white rounded-lg shadow p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < review.rating
                                ? 'fill-primary text-primary'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <p className="text-sm text-gray-500">
                        {new Date(review.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDelete(review.id)}
                      className="p-2 bg-red-100 text-red-600 rounded hover:bg-red-200 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <p className="text-gray-700 mb-2">{review.review_text}</p>
                  
                  <p className="text-sm text-gray-500 mt-4 pt-4 border-t">
                    User ID: {review.user_id}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}
