'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/lib/language-context';
import { useCart } from '@/lib/cart-context';
import { getSupabaseClient } from '@/lib/supabase-client';
import Header from '@/components/header';
import Footer from '@/components/footer';
import { Star, ShoppingCart, ChevronRight } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  image_url: string;
  rating: number;
  reviews_count: number;
}

export default function HomePage() {
  const { t } = useLanguage();
  const { addToCart } = useCart();
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        const supabase = getSupabaseClient();
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .limit(8);

        if (error) throw error;
        setFeaturedProducts(data || []);
      } catch (err) {
        console.error('Failed to fetch products:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedProducts();
  }, []);

  const handleAddToCart = (product: Product) => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      image: product.image_url,
      category: product.category,
    });
  };

  return (
    <>
      <Header />

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-r from-primary to-primary/80 text-white overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 py-20 md:py-32 relative z-10">
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
                {t('Welcome to Jess Collection')}
              </h1>
              <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
                Discover elegant and modest Islamic fashion for women. From abayas to dresses, shoes to jewelry, find your perfect style.
              </p>
              <div className="flex gap-4 justify-center">
                <Link
                  href="/shop"
                  className="px-8 py-3 bg-white text-primary font-semibold rounded-lg hover:bg-gray-100 transition flex items-center gap-2"
                >
                  {t('shop')}
                  <ChevronRight className="w-5 h-5" />
                </Link>
                <Link
                  href="/shop?category=clothing"
                  className="px-8 py-3 border-2 border-white text-white font-semibold rounded-lg hover:bg-white/10 transition"
                >
                  {t('clothing')}
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Categories Section with Carousel */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-foreground mb-8">
              {t('shop')} By Category
            </h2>

            <div className="overflow-x-auto pb-4">
              <div className="flex gap-6 min-w-min">
                {['clothing', 'shoes', 'jewellery', 'handbags'].map(category => (
                  <Link
                    key={category}
                    href={`/shop?category=${category}`}
                    className="group flex-shrink-0"
                  >
                    <div className="bg-gradient-to-br from-gray-100 to-gray-50 rounded-xl overflow-hidden hover:shadow-lg transition duration-300 h-56 w-56 flex flex-col justify-between p-6 border border-gray-200 hover:border-primary">
                      <div>
                        <h3 className="text-2xl font-bold text-foreground capitalize group-hover:text-primary transition">
                          {category === 'jewellery' ? 'Jewelry' : t(category)}
                        </h3>
                        <p className="text-gray-600 text-sm mt-2">
                          {category === 'clothing' && 'Elegant abayas, hijabs & modest dresses'}
                          {category === 'shoes' && 'Comfortable & stylish footwear'}
                          {category === 'jewellery' && 'Gold, pearls & precious stones'}
                          {category === 'handbags' && 'Premium bags & clutches'}
                        </p>
                      </div>
                      <div className="text-5xl opacity-30 group-hover:opacity-50 transition">
                        {category === 'clothing' && '👗'}
                        {category === 'shoes' && '👠'}
                        {category === 'jewellery' && '💎'}
                        {category === 'handbags' && '👜'}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Featured Products Section */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex justify-between items-center mb-12">
              <h2 className="text-3xl font-bold text-foreground">
                {t('featured')} Products
              </h2>
              <Link
                href="/shop"
                className="text-primary hover:underline font-medium flex items-center gap-2"
              >
                View All <ChevronRight className="w-5 h-5" />
              </Link>
            </div>

            {loading ? (
              <div className="flex justify-center py-12">
                <p className="text-gray-500">Loading products...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {featuredProducts.map(product => (
                  <Link
                    key={product.id}
                    href={`/product/${product.id}`}
                  >
                    <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition duration-300 h-full flex flex-col group cursor-pointer">
                      {/* Product Image */}
                      <div className="relative bg-gray-200 h-64 overflow-hidden">
                        <img
                          src={product.image_url || 'https://via.placeholder.com/300x400?text=Product'}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
                        />
                        <div className="absolute top-3 right-3 bg-primary text-white px-3 py-1 rounded-full text-xs font-semibold">
                          New
                        </div>
                      </div>

                      {/* Product Info */}
                      <div className="p-5 flex flex-col flex-grow">
                        <h3 className="font-bold text-foreground mb-2 line-clamp-2 group-hover:text-primary transition">
                          {product.name}
                        </h3>

                        <p className="text-gray-600 text-sm mb-4 flex-grow">
                          {product.category}
                        </p>

                        {/* Price & Button */}
                        <div className="flex justify-between items-center mt-auto pt-4 border-t border-gray-200">
                          <span className="text-2xl font-bold text-primary">
                            ${product.price.toFixed(2)}
                          </span>
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              handleAddToCart(product);
                            }}
                            className="p-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition"
                          >
                            <ShoppingCart className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Why Choose Us Section */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-center text-foreground mb-12">
              Why Choose Jess Collection
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="text-5xl mb-4">✨</div>
                <h3 className="text-xl font-bold text-foreground mb-2">Premium Quality</h3>
                <p className="text-gray-600">
                  Handpicked items that meet our high standards for quality and style
                </p>
              </div>

              <div className="text-center">
                <div className="text-5xl mb-4">🚚</div>
                <h3 className="text-xl font-bold text-foreground mb-2">Fast Delivery</h3>
                <p className="text-gray-600">
                  Quick and secure shipping to your doorstep across Somalia and internationally
                </p>
              </div>

              <div className="text-center">
                <div className="text-5xl mb-4">💖</div>
                <h3 className="text-xl font-bold text-foreground mb-2">Customer Care</h3>
                <p className="text-gray-600">
                  Dedicated support team ready to assist you on WhatsApp, Instagram, or Email
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
