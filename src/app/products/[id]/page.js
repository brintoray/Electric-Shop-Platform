'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { FiShoppingCart, FiHeart, FiStar, FiCheck, FiTruck } from 'react-icons/fi';
import { useCartStore } from '@/store/cartStore';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/AuthProvider';

export default function ProductDetailPage({ params }) {
  const { id } = use(params);
  const { user } = useAuth();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const addItem = useCartStore((s) => s.addItem);

  useEffect(() => {
    async function fetchProduct() {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('*, categories(name, slug, icon)')
        .eq('id', id)
        .single();

      if (!error && data) {
        setProduct({
          id: data.id, title: data.title,
          category: data.categories?.name || '',
          categorySlug: data.categories?.slug || '',
          price: Number(data.price), discount: data.discount || 0,
          rating: Number(data.rating) || 0, reviews: data.reviews_count || 0,
          badge: data.badge, image: data.image_url || '',
          description: data.description || '', specs: data.specs || {},
          stock: data.stock || 0,
        });
      }
      setLoading(false);
    }
    fetchProduct();
  }, [id]);

  if (loading) return <div className="container" style={{ padding: '100px 20px' }}><div className="loading-spinner"><div className="spinner"></div></div></div>;

  if (!product) {
    return (
      <div className="container empty-state" style={{ padding: '100px 20px' }}>
        <div className="empty-state-icon">😕</div>
        <h2>পণ্য পাওয়া যায়নি</h2>
        <Link href="/products" className="btn btn-primary" style={{ marginTop: '16px' }}>সব প্রোডাক্ট দেখুন</Link>
      </div>
    );
  }

  const discountedPrice = product.discount ? product.price * (1 - product.discount / 100) : product.price;

  return (
    <div className="container product-detail">
      <div className="breadcrumb">
        <Link href="/">হোম</Link> <span>/</span>
        <Link href="/products">প্রোডাক্ট</Link> <span>/</span>
        <span>{product.title}</span>
      </div>

      <div className="product-detail-grid">
        <div className="product-detail-gallery">
          <div className="product-detail-main-img">
            <img src={product.image} alt={product.title} />
          </div>
        </div>

        <div className="product-detail-info">
          <div style={{ marginBottom: '8px' }}>
            {product.badge && (
              <span className={`badge badge-${product.badge}`} style={{ marginRight: '8px' }}>
                {product.badge === 'sale' ? `${product.discount}% OFF` : product.badge === 'new' ? 'নতুন' : '🔥 হিট'}
              </span>
            )}
            <span style={{ color: 'var(--accent-cyan)', fontSize: '0.85rem', fontWeight: 600 }}>{product.category}</span>
          </div>
          <h1>{product.title}</h1>

          <div className="product-detail-meta">
            <div className="stars">
              {[...Array(5)].map((_, i) => (
                <FiStar key={i} size={16} fill={i < Math.floor(product.rating) ? '#f59e0b' : 'none'} stroke={i < Math.floor(product.rating) ? '#f59e0b' : '#64748b'} />
              ))}
            </div>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{product.rating} ({product.reviews} রিভিউ)</span>
          </div>

          <div className="product-detail-price">
            <span className="price" style={{ fontSize: '2rem' }}>৳{Math.round(discountedPrice).toLocaleString()}</span>
            {product.discount > 0 && <span className="price-old" style={{ fontSize: '1.1rem' }}>৳{product.price.toLocaleString()}</span>}
          </div>

          <p className="product-detail-desc">{product.description}</p>

          {product.specs && Object.keys(product.specs).length > 0 && (
            <div className="product-detail-specs">
              <h3>বিস্তারিত তথ্য</h3>
              {Object.entries(product.specs).map(([key, val]) => (
                <div className="spec-row" key={key}><span>{key}</span><span>{val}</span></div>
              ))}
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: product.stock > 0 ? 'var(--accent-green)' : 'var(--accent-red)', fontSize: '0.9rem' }}>
              <FiCheck /> {product.stock > 0 ? `স্টকে আছে (${product.stock}টি)` : 'স্টকে নেই'}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              <FiTruck /> ঢাকায় ১-২ দিনে ডেলিভারি
            </div>
          </div>

          <div className="product-detail-actions">
            <button 
              className="btn btn-primary btn-lg" 
              onClick={() => addItem(product, user?.id)} 
              id="detail-add-to-cart"
            >
              <FiShoppingCart /> কার্টে যোগ করুন
            </button>
            <button className="btn btn-secondary btn-lg"><FiHeart /> পছন্দে রাখুন</button>
          </div>
        </div>
      </div>
    </div>
  );
}
