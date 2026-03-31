import { supabase } from './supabase';

// Fetch all categories
export async function getCategories() {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('name');
  if (error) { console.error('Categories fetch error:', error); return []; }
  return data;
}

// Fetch all products with category info
export async function getProducts({ category, search, sort, featured } = {}) {
  let query = supabase
    .from('products')
    .select('*, categories(name, slug, icon)');

  if (category && category !== 'all') {
    query = query.eq('categories.slug', category);
  }
  if (search) {
    query = query.ilike('title', `%${search}%`);
  }
  if (featured) {
    query = query.eq('is_featured', true);
  }
  if (sort === 'price-low') query = query.order('price', { ascending: true });
  else if (sort === 'price-high') query = query.order('price', { ascending: false });
  else if (sort === 'rating') query = query.order('rating', { ascending: false });
  else query = query.order('created_at', { ascending: false });

  const { data, error } = await query;
  if (error) { console.error('Products fetch error:', error); return []; }

  // Filter by category slug (since we joined)
  if (category && category !== 'all') {
    return data.filter(p => p.categories && p.categories.slug === category);
  }
  return data;
}

// Fetch single product
export async function getProduct(id) {
  const { data, error } = await supabase
    .from('products')
    .select('*, categories(name, slug, icon)')
    .eq('id', id)
    .single();
  if (error) { console.error('Product fetch error:', error); return null; }
  return data;
}

// Fetch product by slug
export async function getProductBySlug(slug) {
  const { data, error } = await supabase
    .from('products')
    .select('*, categories(name, slug, icon)')
    .eq('slug', slug)
    .single();
  if (error) { console.error('Product fetch error:', error); return null; }
  return data;
}

// Fetch reviews for a product
export async function getReviews(productId) {
  const { data, error } = await supabase
    .from('reviews')
    .select('*, profiles(full_name, avatar_url)')
    .eq('product_id', productId)
    .order('created_at', { ascending: false });
  if (error) { console.error('Reviews fetch error:', error); return []; }
  return data;
}

// Static fallback data (for SSR without Supabase)
export const fallbackCategories = [
  { id: 'mobile', name: 'মোবাইল ফোন', icon: '📱', slug: 'mobile', product_count: 2 },
  { id: 'laptop', name: 'ল্যাপটপ', icon: '💻', slug: 'laptop', product_count: 1 },
  { id: 'headphone', name: 'হেডফোন', icon: '🎧', slug: 'headphone', product_count: 1 },
  { id: 'camera', name: 'ক্যামেরা', icon: '📷', slug: 'camera', product_count: 1 },
  { id: 'smartwatch', name: 'স্মার্টওয়াচ', icon: '⌚', slug: 'smartwatch', product_count: 1 },
  { id: 'speaker', name: 'স্পিকার', icon: '🔊', slug: 'speaker', product_count: 1 },
  { id: 'gaming', name: 'গেমিং', icon: '🎮', slug: 'gaming', product_count: 1 },
  { id: 'accessories', name: 'এক্সেসরিজ', icon: '🔌', slug: 'accessories', product_count: 0 },
];
