'use client';

import ProductCard from './ProductCard';

export default function ProductCardWrapper({ product }) {
  // Transform Supabase data to component-friendly format
  const transformed = {
    id: product.id,
    title: product.title,
    category: product.categories?.name || product.category || '',
    categorySlug: product.categories?.slug || product.categorySlug || '',
    price: Number(product.price),
    discount: product.discount || 0,
    rating: Number(product.rating) || 0,
    reviews: product.reviews_count || product.reviews || 0,
    badge: product.badge || null,
    image: product.image_url || product.image || '',
    stock: product.stock || 0,
    specs: product.specs || {},
    description: product.description || '',
  };

  return <ProductCard product={transformed} />;
}
