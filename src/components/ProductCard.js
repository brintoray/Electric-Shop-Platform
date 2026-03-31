'use client';

import Link from 'next/link';
import { FiShoppingCart, FiHeart, FiStar } from 'react-icons/fi';
import { useCartStore } from '@/store/cartStore';
import { useAuth } from '@/components/AuthProvider';

export default function ProductCard({ product }) {
  const { user } = useAuth();
  const addItem = useCartStore((s) => s.addItem);

  const discountedPrice = product.discount
    ? product.price * (1 - product.discount / 100)
    : product.price;

  return (
    <div className="glass-card product-card">
      {product.badge && (
        <div className="product-card-badge">
          <span className={`badge badge-${product.badge}`}>
            {product.badge === 'sale' ? `${product.discount}% OFF` : product.badge === 'new' ? 'নতুন' : '🔥 হিট'}
          </span>
        </div>
      )}

      <button className="product-card-wishlist" aria-label="Add to wishlist">
        <FiHeart />
      </button>

      <Link href={`/products/${product.id}`}>
        <div className="product-card-img">
          <img src={product.image} alt={product.title} />
        </div>
      </Link>

      <div className="product-card-body">
        <div className="product-card-category">{product.category}</div>
        <Link href={`/products/${product.id}`}>
          <h3 className="product-card-title">{product.title}</h3>
        </Link>

        <div className="product-card-rating">
          <div className="stars">
            {[...Array(5)].map((_, i) => (
              <FiStar
                key={i}
                size={14}
                fill={i < Math.floor(product.rating || 4) ? '#f59e0b' : 'none'}
                stroke={i < Math.floor(product.rating || 4) ? '#f59e0b' : '#64748b'}
              />
            ))}
          </div>
          <span>({product.reviews || 0})</span>
        </div>

        <div className="product-card-footer">
          <div>
            <span className="price">৳{Math.round(discountedPrice).toLocaleString()}</span>
            {product.discount > 0 && (
              <span className="price-old">৳{product.price.toLocaleString()}</span>
            )}
          </div>
          <button
            className="product-card-add"
            onClick={(e) => {
              e.preventDefault();
              addItem(product, user?.id);
            }}
            id={`add-to-cart-${product.id}`}
          >
            <FiShoppingCart size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
