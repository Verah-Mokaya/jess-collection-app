'use client';

import React from "react"

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useLanguage } from '@/lib/language-context';
import { getSupabaseClient } from '@/lib/supabase-client';
import Header from '@/components/header';
import Footer from '@/components/footer';
import { Edit, Trash2, Plus } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  category: string;
  stock_quantity: number;
  image_url: string;
}

export default function AdminProductsPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    category: 'clothing',
    stock_quantity: '',
    image_url: '',
    description: '',
  });

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
        fetchProducts();
      } catch (err) {
        console.error('Failed to check access:', err);
      }
    };

    checkAccess();
  }, [router]);

  const fetchProducts = async () => {
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase
        .from('products')
        .select('*');

      if (error) throw error;
      setProducts(data || []);
    } catch (err) {
      console.error('Failed to fetch products:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const supabase = getSupabaseClient();

      if (editingId) {
        // Update product
        const { error } = await supabase
          .from('products')
          .update({
            name: formData.name,
            price: parseFloat(formData.price),
            category: formData.category,
            stock_quantity: parseInt(formData.stock_quantity),
            image_url: formData.image_url,
            description: formData.description,
          })
          .eq('id', editingId);

        if (error) throw error;
      } else {
        // Add new product
        const { error } = await supabase
          .from('products')
          .insert([
            {
              name: formData.name,
              price: parseFloat(formData.price),
              category: formData.category,
              stock_quantity: parseInt(formData.stock_quantity),
              image_url: formData.image_url,
              description: formData.description,
            }
          ]);

        if (error) throw error;
      }

      // Reset form
      setShowForm(false);
      setEditingId(null);
      setFormData({
        name: '',
        price: '',
        category: 'clothing',
        stock_quantity: '',
        image_url: '',
        description: '',
      });

      fetchProducts();
    } catch (err) {
      console.error('Failed to save product:', err);
      alert('Failed to save product');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      const supabase = getSupabaseClient();
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) throw error;
      fetchProducts();
    } catch (err) {
      console.error('Failed to delete product:', err);
    }
  };

  if (!isAdmin) return null;

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-foreground">Manage Products</h1>
            <button
              onClick={() => {
                setShowForm(!showForm);
                setEditingId(null);
                setFormData({
                  name: '',
                  price: '',
                  category: 'clothing',
                  stock_quantity: '',
                  image_url: '',
                  description: '',
                });
              }}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition"
            >
              <Plus className="w-5 h-5" />
              Add Product
            </button>
          </div>

          {/* Product Form */}
          {showForm && (
            <div className="bg-white rounded-lg shadow p-6 mb-8">
              <h2 className="text-xl font-bold mb-4">
                {editingId ? 'Edit Product' : 'Add New Product'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Product Name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                    className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <input
                    type="number"
                    placeholder="Price"
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                    required
                    className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="clothing">Clothing</option>
                    <option value="shoes">Shoes</option>
                    <option value="jewellery">Jewellery</option>
                    <option value="handbags">Handbags</option>
                  </select>
                  <input
                    type="number"
                    placeholder="Stock Quantity"
                    value={formData.stock_quantity}
                    onChange={(e) => setFormData({...formData, stock_quantity: e.target.value})}
                    required
                    className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <input
                    type="url"
                    placeholder="Image URL"
                    value={formData.image_url}
                    onChange={(e) => setFormData({...formData, image_url: e.target.value})}
                    className="col-span-2 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <textarea
                    placeholder="Description"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="col-span-2 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition"
                  >
                    {editingId ? 'Update' : 'Add'} Product
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="px-4 py-2 bg-gray-300 text-foreground rounded-lg hover:bg-gray-400 transition"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Products Table */}
          {loading ? (
            <p>Loading...</p>
          ) : (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-100 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Name</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Category</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Price</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Stock</th>
                    <th className="px-6 py-3 text-center text-sm font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map(product => (
                    <tr key={product.id} className="border-b hover:bg-gray-50">
                      <td className="px-6 py-3">{product.name}</td>
                      <td className="px-6 py-3 capitalize">{product.category}</td>
                      <td className="px-6 py-3">${product.price.toFixed(2)}</td>
                      <td className="px-6 py-3">{product.stock_quantity}</td>
                      <td className="px-6 py-3 text-center flex gap-2 justify-center">
                        <button
                          onClick={() => {
                            setEditingId(product.id);
                            setFormData({
                              name: product.name,
                              price: product.price.toString(),
                              category: product.category,
                              stock_quantity: product.stock_quantity.toString(),
                              image_url: product.image_url,
                              description: product.description || '',
                            });
                            setShowForm(true);
                          }}
                          className="p-2 bg-blue-100 text-blue-600 rounded hover:bg-blue-200 transition"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="p-2 bg-red-100 text-red-600 rounded hover:bg-red-200 transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}
