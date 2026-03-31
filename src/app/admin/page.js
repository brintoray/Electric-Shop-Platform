'use client';

import { useState, useEffect } from 'react';
import { FiBox, FiShoppingBag, FiUsers, FiDollarSign, FiArrowUp } from 'react-icons/fi';
import { createBrowserClient } from '@supabase/ssr';

const statusLabels = { pending: 'অপেক্ষমাণ', processing: 'প্রসেসিং', shipped: 'শিপড', delivered: 'ডেলিভার্ড', cancelled: 'বাতিল' };

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [totalSales, setTotalSales] = useState(0);
  const [recentOrders, setRecentOrders] = useState([]);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  useEffect(() => {
    async function fetchStats() {
      try {
        setLoading(true);
        // Products count
        const { count: productsCount } = await supabase
          .from('products')
          .select('*', { count: 'exact', head: true });
          
        if (productsCount !== null) setTotalProducts(productsCount);

        // Customers count
        const { count: customersCount } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })
          .eq('role', 'customer');
          
        if (customersCount !== null) setTotalCustomers(customersCount);

        // Orders & Sales
        const { data: ordersData } = await supabase
          .from('orders')
          .select('*, profiles(full_name)')
          .order('created_at', { ascending: false });

        if (ordersData) {
          setTotalOrders(ordersData.length);
          
          // Calculate Sales (only delivered/shipped/processing/pending, exclude cancelled)
          const sales = ordersData
            .filter(o => o.status !== 'cancelled')
            .reduce((sum, order) => sum + Number(order.total || 0), 0);
          setTotalSales(sales);

          // Get 5 most recent orders for the table
          setRecentOrders(ordersData.slice(0, 5));
        }
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, [supabase]);

  const stats = [
    { icon: <FiDollarSign />, label: 'মোট বিক্রি', value: `৳${totalSales.toLocaleString()}`, change: '+১২%', color: 'rgba(16,185,129,0.15)', iconColor: 'var(--accent-green)' },
    { icon: <FiShoppingBag />, label: 'মোট অর্ডার', value: String(totalOrders), change: '+৫%', color: 'rgba(59,130,246,0.15)', iconColor: 'var(--accent-blue)' },
    { icon: <FiUsers />, label: 'গ্রাহক সংখ্যা', value: String(totalCustomers), change: '+২', color: 'rgba(139,92,246,0.15)', iconColor: 'var(--accent-purple)' },
    { icon: <FiBox />, label: 'মোট প্রোডাক্ট', value: String(totalProducts), change: '+১', color: 'rgba(245,158,11,0.15)', iconColor: 'var(--accent-gold)' },
  ];

  return (
    <div>
      <div className="admin-header">
        <div>
          <h1 style={{ fontSize: '1.8rem', marginBottom: '4px' }}>ড্যাশবোর্ড</h1>
          <p style={{ color: 'var(--text-muted)' }}>আজকের ওভারভিউ</p>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>লোড হচ্ছে...</div>
      ) : (
        <>
          <div className="admin-stats">
            {stats.map((stat, i) => (
              <div key={i} className="glass-card admin-stat-card">
                <div className="admin-stat-card-icon" style={{ background: stat.color, color: stat.iconColor }}>{stat.icon}</div>
                <h3>{stat.value}</h3>
                <p>{stat.label}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--accent-green)', fontSize: '0.8rem', marginTop: '8px' }}>
                  <FiArrowUp size={12} /> {stat.change}
                </div>
              </div>
            ))}
          </div>

          {/* Recent Orders */}
          <div className="glass-card" style={{ overflow: 'hidden' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1.1rem' }}>সাম্প্রতিক অর্ডার</h3>
              <span style={{ color: 'var(--accent-cyan)', fontSize: '0.85rem', cursor: 'pointer' }}>সব দেখুন →</span>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>অর্ডার ID</th>
                    <th>গ্রাহক</th>
                    <th>মোট</th>
                    <th>স্ট্যাটাস</th>
                    <th>তারিখ</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.length === 0 ? (
                    <tr><td colSpan="5" style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>কোনো অর্ডার পাওয়া যায়নি</td></tr>
                  ) : (
                    recentOrders.map((order) => (
                      <tr key={order.id}>
                        <td style={{ fontWeight: 600, color: 'var(--accent-cyan)' }}>#{order.id.slice(0,8)}</td>
                        <td>{order.profiles?.full_name || 'ইউজার'}</td>
                        <td style={{ fontWeight: 600 }}>৳{Number(order.total).toLocaleString()}</td>
                        <td><span className={`status-badge status-${order.status}`}>{statusLabels[order.status] || order.status}</span></td>
                        <td style={{ color: 'var(--text-muted)' }}>{new Date(order.created_at).toLocaleDateString()}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
