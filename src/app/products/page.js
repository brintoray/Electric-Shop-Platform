'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { FiSearch } from 'react-icons/fi';
import ProductCard from '@/components/ProductCard';
import { supabase } from '@/lib/supabase';

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('default');

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const [{ data: prods }, { data: cats }] = await Promise.all([
        supabase.from('products').select('*, categories(name, slug, icon)').order('created_at', { ascending: false }),
        supabase.from('categories').select('*').order('name'),
      ]);
      setProducts((prods || []).map(p => ({
        id: p.id, title: p.title, category: p.categories?.name || '', categorySlug: p.categories?.slug || '',
        price: Number(p.price), discount: p.discount || 0, rating: Number(p.rating) || 0,
        reviews: p.reviews_count || 0, badge: p.badge, image: p.image_url || '', stock: p.stock || 0,
      })));
      setCategories(cats || []);
      setLoading(false);
    }
    fetchData();
  }, []);

  const filtered = useMemo(() => {
    let result = products.filter(p => {
      const matchesSearch = p.title?.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || p.categorySlug === selectedCategory;
      return matchesSearch && matchesCategory;
    });

    if (sortBy === 'price-low') result.sort((a, b) => a.price - b.price);
    else if (sortBy === 'price-high') result.sort((a, b) => b.price - a.price);
    else if (sortBy === 'rating') result.sort((a, b) => b.rating - a.rating);
    
    return result;
  }, [products, search, selectedCategory, sortBy]);

  return (
    <div className="container" style={{ padding: '40px 20px 80px' }}>
      <div className="page-header" style={{ textAlign: 'center', marginBottom: '48px' }}>
        <div className="breadcrumb" style={{ justifyContent: 'center' }}>
          <Link href="/">হোম</Link> <span>/</span> <span>সব প্রোডাক্ট</span>
        </div>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '12px' }}>আমাদের পণ্যসমূহ</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>{filtered.length}টি সেরা ইলেকট্রনিক পণ্য আপনার জন্য</p>
      </div>

      <div className="glass-card" style={{ 
        padding: '24px', marginBottom: '40px', 
        display: 'flex', gap: '20px', flexWrap: 'wrap', 
        alignItems: 'center', background: 'rgba(255,255,255,0.03)',
        border: '1px solid var(--border-color)', borderRadius: '20px'
      }}>
        <div style={{ position: 'relative', flex: '1', minWidth: '280px' }}>
          <FiSearch style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--accent-blue)', fontSize: '1.2rem' }} />
          <input 
            className="input" 
            placeholder="আপনার কাঙ্ক্ষিত পণ্যটি খুঁজুন..." 
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
            style={{ paddingLeft: '48px', height: '54px', borderRadius: '12px', fontSize: '1rem', border: '1px solid var(--border-color)', background: 'rgba(0,0,0,0.2)' }}
            id="product-search-input" 
          />
        </div>
        
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{ minWidth: '160px' }}>
            <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px', marginLeft: '4px' }}>ক্যাটাগরি</label>
            <select 
              className="input" 
              style={{ height: '48px', borderRadius: '10px', background: 'rgba(0,0,0,0.2)', cursor: 'pointer' }} 
              value={selectedCategory} 
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="all">সব ক্যাটাগরি</option>
              {categories.map(c => <option key={c.id} value={c.slug}>{c.name}</option>)}
            </select>
          </div>
          
          <div style={{ minWidth: '160px' }}>
            <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px', marginLeft: '4px' }}>সর্ট করুন</label>
            <select 
              className="input" 
              style={{ height: '48px', borderRadius: '10px', background: 'rgba(0,0,0,0.2)', cursor: 'pointer' }} 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="default">নতুন পণ্য আগে</option>
              <option value="price-low">দাম: কম → বেশি</option>
              <option value="price-high">দাম: বেশি → কম</option>
              <option value="rating">সেরা রেটিং</option>
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="loading-spinner" style={{ minHeight: '300px' }}><div className="spinner"></div></div>
      ) : filtered.length > 0 ? (
        <div className="grid-products" style={{ gap: '30px' }}>
          {filtered.map(product => <ProductCard key={product.id} product={product} />)}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '80px 20px', background: 'rgba(255,255,255,0.02)', borderRadius: '24px', border: '1px dashed var(--border-color)' }}>
          <div style={{ fontSize: '4rem', marginBottom: '20px', opacity: 0.5 }}>🔍</div>
          <h2 style={{ marginBottom: '12px' }}>দুঃখিত! কোনো পণ্য পাওয়া যায়নি</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>আপনার সার্চ কিওয়ার্ড পরিবর্তন করে আবার চেষ্টা করুন।</p>
          <button className="btn btn-secondary" onClick={() => {setSearch(''); setSelectedCategory('all');}}>ফিল্টার রিসেট করুন</button>
        </div>
      )}
    </div>
  );
}
