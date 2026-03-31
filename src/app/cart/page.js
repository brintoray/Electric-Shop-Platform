'use client';

import Link from 'next/link';
import { FiTrash2, FiPlus, FiMinus, FiShoppingBag, FiArrowRight } from 'react-icons/fi';
import { useCartStore } from '@/store/cartStore';
import { useAuth } from '@/components/AuthProvider';

export default function CartPage() {
  const { user } = useAuth();
  const { items, removeItem, updateQuantity, clearCart } = useCartStore();
  const totalPrice = items.reduce((sum, item) => sum + (item.price || 0) * (1 - (item.discount || 0) / 100) * (item.quantity || 0), 0);
  const shipping = totalPrice >= 5000 ? 0 : 120;

  if (items.length === 0) {
    return (
      <div className="container cart-empty" style={{ padding: '100px 20px' }}>
        <div className="cart-empty-icon">🛒</div>
        <h2>আপনার কার্ট খালি</h2>
        <p>কিছু দারুণ পণ্য যোগ করুন!</p>
        <Link href="/products" className="btn btn-primary btn-lg">
          <FiShoppingBag /> শপিং শুরু করুন
        </Link>
      </div>
    );
  }

  return (
    <div className="container cart-page">
      <div className="page-header">
        <div className="breadcrumb">
          <Link href="/">হোম</Link> <span>/</span> <span>কার্ট</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <h1>শপিং কার্ট ({items.length}টি পণ্য)</h1>
          <button className="btn btn-secondary btn-sm" onClick={() => clearCart(user?.id)} style={{ color: 'var(--accent-red)' }}>
            <FiTrash2 /> সব মুছুন
          </button>
        </div>
      </div>

      <div className="cart-grid">
        <div>
          {items.map((item) => {
            const itemPrice = (item.price || 0) * (1 - (item.discount || 0) / 100);
            return (
              <div key={item.id} className="glass-card cart-item" style={{ marginBottom: '16px' }}>
                <div className="cart-item-img">
                  <img src={item.image} alt={item.title} />
                </div>
                <div className="cart-item-info">
                  <Link href={`/products/${item.id}`}>
                    <h3 className="cart-item-title">{item.title}</h3>
                  </Link>
                  <p className="cart-item-cat">{item.category}</p>
                  <div className="cart-item-actions">
                    <div className="cart-qty">
                      <button onClick={() => updateQuantity(item.id, item.quantity - 1, user?.id)}><FiMinus /></button>
                      <span>{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, item.quantity + 1, user?.id)}><FiPlus /></button>
                    </div>
                    <span className="price">৳{Math.round(itemPrice * item.quantity).toLocaleString()}</span>
                    <button className="cart-remove" onClick={() => removeItem(item.id, user?.id)} aria-label="Remove"><FiTrash2 /></button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="cart-summary">
          <div className="glass-card cart-summary-inner">
            <h3 style={{ marginBottom: '20px', fontSize: '1.2rem' }}>অর্ডার সারসংক্ষেপ</h3>
            <div className="cart-summary-row">
              <span>সাবটোটাল</span>
              <span>৳{Math.round(totalPrice).toLocaleString()}</span>
            </div>
            <div className="cart-summary-row">
              <span>ডেলিভারি চার্জ</span>
              <span style={{ color: shipping === 0 ? 'var(--accent-green)' : 'inherit' }}>
                {shipping === 0 ? 'ফ্রি' : `৳${shipping}`}
              </span>
            </div>
            <div className="cart-summary-total">
              <span>মোট</span>
              <span className="price">৳{Math.round(totalPrice + shipping).toLocaleString()}</span>
            </div>
            <Link href="/checkout" className="btn btn-primary btn-lg" style={{ width: '100%', marginTop: '20px' }}>
              চেকআউট করুন <FiArrowRight />
            </Link>
            <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '12px' }}>
              🔒 নিরাপদ পেমেন্ট গ্যারান্টি
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
