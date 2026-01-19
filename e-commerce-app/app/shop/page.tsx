'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useLanguage } from '@/lib/language-context';
import { useCart } from '@/lib/cart-context';
import { getSupabaseClient } from '@/lib/supabase-client';
import Header from '@/components/header';
import Footer from '@/components/footer';
import { ShoppingCart, Star } from 'lucide-react';
import Loading from './loading';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image_url: string;
  stock_quantity: number;
}

function ShopContent() {
  const { t } = useLanguage();
  const { addToCart } = useCart();
  const searchParams = useSearchParams();
  const category = searchParams.get('category');

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(category || 'all');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const supabase = getSupabaseClient();
        let query = supabase.from('products').select('*');

        if (selectedCategory !== 'all') {
          query = query.eq('category', selectedCategory);
        }

        const { data, error } = await query;
        if (error) throw error;

        setProducts(data || []);
      } catch (err) {
        console.error('Failed to fetch products:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [selectedCategory]);

  const handleAddToCart = (product: Product) => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      image: product.image_url,
      category: product.category,
    });
    alert(t('itemAdded'));
  };

  const categories = ['all', 'clothing', 'shoes', 'jewellery', 'handbags'];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-grow max-w-7xl mx-auto w-full px-4 py-12">
        {/* Category Filter */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-6">{t('shop')}</h1>
          <div className="flex flex-wrap gap-4">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-6 py-2 rounded-lg font-medium transition ${
                  selectedCategory === cat
                    ? 'bg-primary text-white'
                    : 'bg-gray-200 text-foreground hover:bg-gray-300'
                }`}
              >
                {t(cat === 'all' ? 'allProducts' : cat)}
              </button>
            ))}
          </div>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <p className="text-xl text-gray-500">Loading products...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-xl text-gray-500">{t('allProducts')} not found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map(product => (
              <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition duration-300 flex flex-col h-full">
                {/* Product Image */}
                <div className="relative bg-gray-200 h-64 overflow-hidden group">
                  <img
                    src={product.image_url || '/placeholder.png'}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                  {product.stock_quantity === 0 && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <span className="text-white font-bold text-lg">{t('outOfStock')}</span>
                    </div>
                  )}
                  {product.stock_quantity > 0 && product.stock_quantity < 5 && (
                    <div className="absolute top-3 right-3 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                      Low Stock
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div className="p-5 flex flex-col flex-grow">
                  <div className="mb-2">
                    <span className="text-xs uppercase tracking-wider text-primary font-semibold">{product.category}</span>
                  </div>
                  
                  <h3 className="font-bold text-foreground mb-3 line-clamp-2 text-lg">{product.name}</h3>
                  
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{product.description}</p>

                  {/* Price */}
                  <div className="mb-4">
                    <span className="text-3xl font-bold text-primary">${product.price.toFixed(2)}</span>
                  </div>

                  {/* Stock Status */}
                  <div className="mb-4">
                    <p className={`text-sm font-semibold ${product.stock_quantity > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {product.stock_quantity > 0 ? `In Stock (${product.stock_quantity})` : 'Out of Stock'}
                    </p>
                  </div>

                  <div className="space-y-2 mt-auto">
                    {/* View Details */}
                    <Link
                      href={`/product/${product.id}`}
                      className="block text-center bg-primary text-white py-2 rounded-lg font-semibold hover:bg-primary/90 transition"
                    >
                      {t('viewDetails')}
                    </Link>

                    {/* Add to Cart Button */}
                    <button
                      onClick={() => handleAddToCart(product)}
                      disabled={product.stock_quantity === 0}
                      className="w-full bg-white border-2 border-primary text-primary py-2 rounded-lg font-semibold hover:bg-primary hover:text-white transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      {t('addToCart')}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={<Loading />}>
      <ShopContent />
    </Suspense>
  );
}