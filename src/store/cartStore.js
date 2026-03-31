'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { supabase } from '@/lib/supabase';

export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      
      // Sync items with database
      syncWithDB: async (userId) => {
        if (!userId) return;
        
        try {
          const { data, error } = await supabase
            .from('cart_items')
            .select(`
              id,
              quantity,
              products (*)
            `)
            .eq('user_id', userId);
            
          if (data && !error) {
            const formattedItems = data.map(item => ({
              ...item.products,
              quantity: item.quantity,
              db_id: item.id
            }));
            set({ items: formattedItems });
          }
        } catch (err) {
          console.error("Cart sync error:", err);
        }
      },

      addItem: async (product, userId = null) => {
        const items = get().items;
        const existing = items.find(item => item.id === product.id);
        
        // Local state update first for speed
        if (existing) {
          set({
            items: items.map(item =>
              item.id === product.id
                ? { ...item, quantity: (item.quantity || 1) + 1 }
                : item
            ),
          });
        } else {
          set({ items: [...items, { ...product, quantity: 1 }] });
        }

        // DB persistent update if logged in
        if (userId) {
          if (existing) {
            await supabase
              .from('cart_items')
              .update({ quantity: existing.quantity + 1 })
              .eq('user_id', userId)
              .eq('product_id', product.id);
          } else {
            await supabase
              .from('cart_items')
              .insert({ user_id: userId, product_id: product.id, quantity: 1 });
          }
        }
      },
      
      removeItem: async (id, userId = null) => {
        set({ items: get().items.filter(item => item.id !== id) });
        
        if (userId) {
          await supabase
            .from('cart_items')
            .delete()
            .eq('user_id', userId)
            .eq('product_id', id);
        }
      },
      
      updateQuantity: async (id, quantity, userId = null) => {
        if (quantity <= 0) {
          get().removeItem(id, userId);
          return;
        }
        
        set({
          items: get().items.map(item =>
            item.id === id ? { ...item, quantity } : item
          ),
        });

        if (userId) {
          await supabase
            .from('cart_items')
            .update({ quantity })
            .eq('user_id', userId)
            .eq('product_id', id);
        }
      },
      
      clearCart: async (userId = null) => {
        set({ items: [] });
        if (userId) {
          await supabase
            .from('cart_items')
            .delete()
            .eq('user_id', userId);
        }
      },
      
      getTotalItems: () => {
        return get().items.reduce((sum, item) => sum + (item.quantity || 0), 0);
      },
      
      getTotalPrice: () => {
        return get().items.reduce(
          (sum, item) => sum + (item.price || 0) * (1 - (item.discount || 0) / 100) * (item.quantity || 0),
          0
        );
      },
    }),
    {
      name: 'electric-shop-cart-v2',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
