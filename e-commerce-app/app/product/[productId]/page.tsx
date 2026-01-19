'use client';

import React from "react"

import { useEffect, useState, Suspense } from 'react';
import { useParams } from 'next/navigation';
import { useLanguage } from '@/lib/language-context';
import { useCart } from '@/lib/cart-context';
import { getSupabaseClient } from '@/lib/supabase-client';
import Header from '@/components/header';
import Footer from '@/components/footer';
import { Star, ShoppingCart, Heart } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  category: string;
  image_url: string;
  stock_quantity: number;
}

interface Review {
  id: string;
  user_name: string;
  rating: number;
  comment: string;
  created_at: string;
  verified: boolean;
}

function ProductContent() {
  const { t } = useLanguage();
  const { addToCart } = useCart();
  const params = useParams();
  const productId = params.productId as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewData, setReviewData] = useState({
    rating: 5,
    comment: '',
  });
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const supabase = getSupabaseClient();

        // Get user
        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user);

        // Fetch product
        const { data: productData, error: productError } = await supabase
          .from('products')
          .select('*')
          .eq('id', productId)
          .single();

        if (productError) throw productError;
        setProduct(productData);

        // Fetch reviews
        const { data: reviewsData, error: reviewsError } = await supabase
          .from('reviews')
          .select('*')
          .eq('product_id', productId)
          .order('created_at', { ascending: false });

        if (reviewsError) throw reviewsError;
        setReviews(reviewsData || []);
      } catch (err) {
        console.error('Failed to fetch data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [productId]);

  const getSizesForProduct = () => {
    if (product?.category === 'shoes') {
      return ['5', '6', '7', '8', '9', '10', '11'];
    }
    if (product?.category === 'clothing') {
      return ['XS', 'S', 'M', 'L', 'XL', '2XL'];
    }
    return [];
  };

  const handleAddToCart = () => {
    if (!product) return;

    const sizes = getSizesForProduct();
    if (sizes.length > 0 && !selectedSize) {
      alert('Please select a size');
      return;
    }

    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      quantity,
      image: product.image_url,
      category: product.category,
      size: selectedSize || undefined,
    });

    alert(t('itemAdded'));
    setQuantity(1);
    setSelectedSize('');
  };

  const incrementQuantity = () => {
    if (product && quantity < product.stock_quantity) {
      setQuantity(quantity + 1);
    }
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      alert('Please login to submit a review');
      return;
    }

    try {
      const supabase = getSupabaseClient();
      const { error } = await supabase
        .from('reviews')
        .insert([
          {
            product_id: productId,
            user_id: user.id,
            user_name: user.email,
            rating: reviewData.rating,
            comment: reviewData.comment,
            verified: true,
          }
        ]);

      if (error) throw error;

      setReviewData({ rating: 5, comment: '' });
      setShowReviewForm(false);

      // Refresh reviews
      const { data } = await supabase
        .from('reviews')
        .select('*')
        .eq('product_id', productId)
        .order('created_at', { ascending: false });

      setReviews(data || []);
    } catch (err) {
      console.error('Failed to submit review:', err);
    }
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="flex items-center justify-center h-96">Loading...</div>
        <Footer />
      </>
    );
  }

  if (!product) {
    return (
      <>
        <Header />
        <div className="flex items-center justify-center h-96">Product not found</div>
        <Footer />
      </>
    );
  }

  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : product.rating.toFixed(1);

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
            {/* Product Image */}
            <div className="bg-white rounded-lg shadow p-8 flex items-center justify-center h-96 lg:h-auto">
              <img
                src={product.image_url || '/placeholder.png'}
                alt={product.name}
                className="w-full h-full object-contain"
              />
            </div>

            {/* Product Info */}
            <div className="bg-white rounded-lg shadow p-8">
              <div className="mb-4">
                <span className="text-sm text-gray-600 capitalize">{product.category}</span>
              </div>

              <h1 className="text-3xl font-bold text-foreground mb-4">{product.name}</h1>

              {/* Rating */}
              <div className="flex items-center gap-3 mb-6">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${
                        i < Math.floor(parseFloat(avgRating))
                          ? 'fill-primary text-primary'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-lg font-semibold">{avgRating}</span>
                <span className="text-gray-600">({reviews.length} reviews)</span>
              </div>

              <p className="text-gray-600 mb-6">{product.description}</p>

              {/* Price & Stock */}
              <div className="mb-6 pb-6 border-b">
                <p className="text-4xl font-bold text-primary mb-2">${product.price}</p>
                <p className={`text-lg font-semibold ${product.stock_quantity > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {product.stock_quantity > 0 ? `${t('inStock')} (${product.stock_quantity})` : t('outOfStock')}
                </p>
              </div>

              {/* Quantity & Add to Cart */}
              {product.stock_quantity > 0 && (
                <div className="space-y-4">
                  {/* Size Selection */}
                  {getSizesForProduct().length > 0 && (
                    <div>
                      <label className="block font-semibold mb-3">
                        {product.category === 'shoes' ? 'Shoe Size' : 'Size'}
                      </label>
                      <div className="grid grid-cols-4 gap-2">
                        {getSizesForProduct().map(size => (
                          <button
                            key={size}
                            onClick={() => setSelectedSize(size)}
                            className={`py-2 px-3 border-2 rounded-lg font-semibold transition ${
                              selectedSize === size
                                ? 'border-primary bg-primary text-white'
                                : 'border-gray-300 hover:border-primary'
                            }`}
                          >
                            {size}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Quantity Control */}
                  <div>
                    <label className="block font-semibold mb-3">{t('quantity')}</label>
                    <div className="flex items-center gap-4">
                      <button
                        onClick={decrementQuantity}
                        className="w-12 h-12 border-2 border-primary text-primary rounded-lg font-bold hover:bg-primary hover:text-white transition"
                      >
                        −
                      </button>
                      <input
                        type="number"
                        value={quantity}
                        readOnly
                        className="w-16 text-center py-2 border-2 border-gray-300 rounded-lg font-semibold"
                      />
                      <button
                        onClick={incrementQuantity}
                        className="w-12 h-12 border-2 border-primary text-primary rounded-lg font-bold hover:bg-primary hover:text-white transition"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={handleAddToCart}
                    className="w-full bg-primary text-white py-3 rounded-lg font-semibold hover:bg-primary/90 transition flex items-center justify-center gap-2"
                  >
                    <ShoppingCart className="w-5 h-5" />
                    {t('addToCart')}
                  </button>

                  <button className="w-full border-2 border-primary text-primary py-3 rounded-lg font-semibold hover:bg-primary/5 transition flex items-center justify-center gap-2">
                    <Heart className="w-5 h-5" />
                    Add to Wishlist
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Reviews Section */}
          <div className="bg-white rounded-lg shadow p-8">
            <h2 className="text-2xl font-bold text-foreground mb-6">{t('reviews')}</h2>

            {/* Add Review Button */}
            {user && !showReviewForm && (
              <button
                onClick={() => setShowReviewForm(true)}
                className="mb-6 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition"
              >
                {t('writeReview')}
              </button>
            )}

            {/* Review Form */}
            {showReviewForm && user && (
              <form onSubmit={handleSubmitReview} className="mb-8 p-6 bg-gray-50 rounded-lg">
                <div className="mb-4">
                  <label className="block font-semibold mb-2">{t('yourRating')}</label>
                  <select
                    value={reviewData.rating}
                    onChange={(e) => setReviewData({...reviewData, rating: parseInt(e.target.value)})}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value={5}>5 - Excellent</option>
                    <option value={4}>4 - Good</option>
                    <option value={3}>3 - Average</option>
                    <option value={2}>2 - Poor</option>
                    <option value={1}>1 - Terrible</option>
                  </select>
                </div>

                <div className="mb-4">
                  <label className="block font-semibold mb-2">{t('yourReview')}</label>
                  <textarea
                    value={reviewData.comment}
                    onChange={(e) => setReviewData({...reviewData, comment: e.target.value})}
                    placeholder="Share your experience with this product..."
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    rows={4}
                    required
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition"
                  >
                    {t('submitReview')}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowReviewForm(false)}
                    className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400 transition"
                  >
                    {t('cancel')}
                  </button>
                </div>
              </form>
            )}

            {/* Reviews List */}
            {reviews.length === 0 ? (
              <p className="text-gray-600">No reviews yet. Be the first to review this product!</p>
            ) : (
              <div className="space-y-6">
                {reviews.map(review => (
                  <div key={review.id} className="border-b pb-6 last:border-b-0">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-semibold text-foreground">{review.user_name}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(review.created_at).toLocaleDateString()}
                          {review.verified && ' • Verified Purchase'}
                        </p>
                      </div>
                      <div className="flex">
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
                    </div>
                    <p className="text-gray-700">{review.comment}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default function ProductDetailPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ProductContent />
    </Suspense>
  );
}
