'use client';

import { useState, useEffect } from 'react';
import { FiBarChart2, FiPieChart, FiTrendingUp } from 'react-icons/fi';
import { createBrowserClient } from '@supabase/ssr';

export default function AdminReportsPage() {
  const [loading, setLoading] = useState(true);
  const [monthlySales, setMonthlySales] = useState(0);
  const [topProduct, setTopProduct] = useState('কোনো অর্ডার নেই');
  const [totalOrders, setTotalOrders] = useState(0);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  useEffect(() => {
    async function fetchReports() {
      try {
        setLoading(true);
        // Fetch all non-cancelled orders
        const { data: orders } = await supabase
          .from('orders')
          .select('total, created_at, status')
          .neq('status', 'cancelled');
          
        if (orders) {
          const now = new Date();
          const currentMonth = now.getMonth();
          const currentYear = now.getFullYear();
          
          let monthTotal = 0;
          orders.forEach(o => {
            const date = new Date(o.created_at);
            if (date.getMonth() === currentMonth && date.getFullYear() === currentYear) {
              monthTotal += Number(o.total || 0);
            }
          });
          setMonthlySales(monthTotal);
          setTotalOrders(orders.length);
        }

        // Fetch order items for top product
        const { data: items } = await supabase
          .from('order_items')
          .select('quantity, products(title)');
          
        if (items && items.length > 0) {
          const productCounts = {};
          items.forEach(item => {
            const title = item.products?.title || 'অজানা প্রোডাক্ট';
            productCounts[title] = (productCounts[title] || 0) + item.quantity;
          });
          
          let maxQ = 0;
          let topP = 'কোনো অর্ডার নেই';
          for (const [title, q] of Object.entries(productCounts)) {
            if (q > maxQ) {
              maxQ = q;
              topP = title;
            }
          }
          setTopProduct(topP);
        }
      } catch (error) {
        console.error('Error fetching reports:', error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchReports();
  }, [supabase]);

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.8rem', marginBottom: '8px' }}>সেলস রিপোর্টস</h1>
        <p style={{ color: 'var(--text-muted)' }}>দোকানের বিক্রয় এবং পারফরম্যান্স রিপোর্ট</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginBottom: '32px' }}>
        <div className="glass-card" style={{ padding: '30px 24px', textAlign: 'center' }}>
          <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(59,130,246,0.1)', color: 'var(--accent-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: '1.5rem' }}>
            <FiTrendingUp />
          </div>
          <h3 style={{ color: 'var(--text-muted)', fontSize: '1rem', marginBottom: '8px' }}>চলতি মাসের বিক্রি</h3>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--accent-cyan)' }}>
            {loading ? '...' : `৳ ${monthlySales.toLocaleString()}`}
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '8px' }}>(এই মাসের মোট সেল)</p>
        </div>

        <div className="glass-card" style={{ padding: '30px 24px', textAlign: 'center' }}>
          <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(16,185,129,0.1)', color: 'var(--accent-green)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: '1.5rem' }}>
            <FiPieChart />
          </div>
          <h3 style={{ color: 'var(--text-muted)', fontSize: '1rem', marginBottom: '8px' }}>সর্বোচ্চ বিক্রিত পণ্য</h3>
          <div style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--text-primary)', minHeight: '30px' }}>
            {loading ? 'লোড হচ্ছে...' : topProduct}
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '8px' }}>টপ সেলিং প্রোডাক্ট</p>
        </div>

        <div className="glass-card" style={{ padding: '30px 24px', textAlign: 'center' }}>
          <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(139,92,246,0.1)', color: 'var(--accent-purple)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: '1.5rem' }}>
            <FiBarChart2 />
          </div>
          <h3 style={{ color: 'var(--text-muted)', fontSize: '1rem', marginBottom: '8px' }}>মোট সফল অর্ডার</h3>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            {loading ? '...' : totalOrders}
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '8px' }}>শুরু থেকে আজ পর্যন্ত</p>
        </div>
      </div>

      <div className="glass-card" style={{ padding: '40px', textAlign: 'center' }}>
        <p style={{ color: 'var(--text-muted)', marginBottom: '16px' }}>অ্যাডভান্সড চার্ট এবং ডেটা ভিজ্যুয়ালাইজেশন শীঘ্রই যোগ করা হবে</p>
        <button className="btn btn-secondary">রিপোর্ট ডাউনলোড করুন (CSV)</button>
      </div>
    </div>
  );
}
