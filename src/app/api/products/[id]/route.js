import { supabase } from '@/lib/supabase';

export async function GET(request, { params }) {
  const { id } = await params;
  
  const { data, error } = await supabase
    .from('products')
    .select('*, categories(name, slug, icon)')
    .eq('id', id)
    .single();

  if (error) return Response.json({ error: 'Product not found' }, { status: 404 });

  return Response.json({ product: data });
}
