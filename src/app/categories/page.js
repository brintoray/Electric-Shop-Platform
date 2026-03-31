'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading-spinner"><div className="spinner"></div></div>;
  }

  return (
    <div className="container" style={{ padding: '40px 20px 80px' }}>
      <div className="page-header">
        <div className="breadcrumb"><Link href="/">হোম</Link> <span>/</span> <span>ক্যাটাগরি</span></div>
        <h1>সব ক্যাটাগরি</h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>আপনার পছন্দের ক্যাটাগরি থেকে প্রোডাক্ট খুঁজে নিন</p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
        gap: '24px'
      }}>
        {categories.map((cat) => (
          <Link href={`/products?category=${cat.id}`} key={cat.id} style={{ textDecoration: 'none' }}>
            <div className="glass-card category-card" style={{ padding: '30px 20px', textAlign: 'center', transition: 'var(--transition)', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ fontSize: '3rem', marginBottom: '16px' }}>
                {cat.icon || '📦'}
              </div>
              <h3 style={{ fontSize: '1.2rem', color: 'var(--text-primary)', marginBottom: '8px' }}>{cat.name}</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{cat.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
