import { supabase } from '@/lib/supabase';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');
  const search = searchParams.get('search');
  const sort = searchParams.get('sort');

  let query = supabase.from('products').select('*, categories(name, slug, icon)');

  if (search) query = query.ilike('title', `%${search}%`);
  if (sort === 'price-low') query = query.order('price', { ascending: true });
  else if (sort === 'price-high') query = query.order('price', { ascending: false });
  else if (sort === 'rating') query = query.order('rating', { ascending: false });
  else query = query.order('created_at', { ascending: false });

  const { data, error } = await query;
  if (error) return Response.json({ error: error.message }, { status: 500 });

  let result = data || [];
  if (category && category !== 'all') {
    result = result.filter(p => p.categories?.slug === category);
  }

  return Response.json({ products: result, total: result.length });
}
