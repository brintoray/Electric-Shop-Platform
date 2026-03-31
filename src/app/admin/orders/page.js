'use client';

import { useState, useEffect } from 'react';
import { FiSearch, FiFilter, FiX, FiCheckCircle, FiClock, FiTruck, FiPackage } from 'react-icons/fi';
import { supabase } from '@/lib/supabase';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Try fetching orders with a simpler profile join
      const { data, error: qError } = await supabase
        .from('orders')
        .select(`
          *, 
          profiles:user_id (full_name),
          order_items (
            id, quantity, price,
            products (title, images)
          )
        `)
        .order('created_at', { ascending: false });

      if (qError) {
        console.error('Supabase Query Error Detail:', JSON.stringify(qError, null, 2));
        setError(`সুপাবেস ডাটাবেস এরর: ${qError.message || 'Unknown error'}. কোড: ${qError.code || 'None'}`);
        
        // Final fallback: fetch ONLY orders without any joins to ensure at least some data shows up
        const { data: fallbackData, error: fbError } = await supabase
          .from('orders')
          .select('*')
          .order('created_at', { ascending: false });
          
        if (fbError) {
          setError(`ডাটাবেস থেকে কোনো ডাটা পাওয়া যাচ্ছে না: ${fbError.message}. বিবরণ: ${JSON.stringify(fbError)}`);
        } else {
          setOrders(fallbackData || []);
          setError(`সতর্কবার্তা: হাই-লেভেল ডাটা লোড হয়নি, সিম্পল ডাটা দেখানো হচ্ছে।`);
        }
        return;
      }
      setOrders(data || []);
    } catch (err) {
      console.error('Unexpected error:', err);
      setError('অর্ডার লোড করতে কোনো সমস্যা হয়েছে।');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (orderId, newStatus) => {
    try {
      setUpdating(true);
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);

      if (error) throw error;
      
      setOrders(prevOrders => prevOrders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
      if (selectedOrder?.id === orderId) {
        setSelectedOrder(prev => ({ ...prev, status: newStatus }));
      }
    } catch (err) {
      console.error('Error updating status:', err);
      alert(`স্ট্যাটাস আপডেট করতে সমস্যা হয়েছে: ${err.message || 'Unknown error'}`);
    } finally {
      setUpdating(false);
    }
  };

  const getStatusBadge = (status) => {
    const colors = {
      pending: { bg: 'rgba(6,182,212,0.1)', text: 'var(--accent-cyan)' },
      processing: { bg: 'rgba(59,130,246,0.1)', text: 'var(--accent-blue)' },
      shipped: { bg: 'rgba(139,92,246,0.1)', text: 'var(--accent-purple)' },
      delivered: { bg: 'rgba(16,185,129,0.1)', text: 'var(--accent-green)' },
      cancelled: { bg: 'rgba(239,68,68,0.1)', text: 'var(--accent-red)' }
    };
    const color = colors[status] || { bg: 'var(--bg-secondary)', text: 'var(--text-muted)' };
    return (
      <span style={{ background: color.bg, color: color.text, padding: '4px 10px', borderRadius: '50px', fontSize: '0.8rem', fontWeight: 600, textTransform: 'capitalize' }}>
        {status}
      </span>
    );
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', marginBottom: '8px' }}>অর্ডার লিস্ট</h1>
          <p style={{ color: 'var(--text-muted)' }}>কাস্টমারদের সব অর্ডার ম্যানেজ করুন</p>
        </div>
        <button onClick={fetchOrders} className="btn btn-secondary" style={{ fontSize: '0.85rem' }}>রিফ্রেশ করুন</button>
      </div>

      {error && (
        <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--accent-red)', color: 'var(--accent-red)', padding: '12px 16px', borderRadius: '8px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FiAlertCircle /> {error}
        </div>
      )}

      <div className="glass-card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div style={{ position: 'relative', width: '300px' }}>
            <FiSearch style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input type="text" className="input" placeholder="অর্ডার আইডি খুঁজুন..." style={{ paddingLeft: '40px', marginBottom: 0 }} />
          </div>
          <button className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FiFilter /> ফিল্টার
          </button>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>লোড হচ্ছে...</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '12px 16px', fontWeight: 500 }}>অর্ডার আইডি</th>
                  <th style={{ padding: '12px 16px', fontWeight: 500 }}>কাস্টমার</th>
                  <th style={{ padding: '12px 16px', fontWeight: 500 }}>তারিখ</th>
                  <th style={{ padding: '12px 16px', fontWeight: 500 }}>পেমেন্ট</th>
                  <th style={{ padding: '12px 16px', fontWeight: 500 }}>মোট</th>
                  <th style={{ padding: '12px 16px', fontWeight: 500 }}>স্ট্যাটাস</th>
                  <th style={{ padding: '12px 16px', fontWeight: 500, textAlign: 'right' }}>অ্যাকশন</th>
                </tr>
              </thead>
              <tbody>
                {orders.length === 0 ? (
                  <tr><td colSpan="7" style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>কোনো অর্ডার পাওয়া যায়নি</td></tr>
                ) : (
                  orders.map(order => (
                    <tr key={order.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '12px 16px', fontWeight: 600, fontFamily: 'monospace' }}>#{order.id.slice(0,8)}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <div>{order.profiles?.full_name || 'ইউজার'}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{order.phone}</div>
                      </td>
                      <td style={{ padding: '12px 16px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                        {new Date(order.created_at).toLocaleDateString()}
                      </td>
                      <td style={{ padding: '12px 16px', textTransform: 'uppercase', fontSize: '0.85rem', fontWeight: 600 }}>
                        <div style={{ color: order.payment_method === 'bkash' ? '#e2136e' : 'var(--accent-blue)' }}>{order.payment_method}</div>
                        {order.trx_id && <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>TX: {order.trx_id}</div>}
                      </td>
                      <td style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--accent-cyan)' }}>৳{order.total}</td>
                      <td style={{ padding: '12px 16px' }}>{getStatusBadge(order.status)}</td>
                      <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                        <button 
                          onClick={() => setSelectedOrder(order)}
                          className="btn btn-secondary" 
                          style={{ padding: '6px 12px', fontSize: '0.85rem' }}
                        >
                          বিস্তারিত
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
          background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(5px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px'
        }}>
          <div className="glass-card" style={{ 
            width: '100%', maxWidth: '700px', maxHeight: '90vh', overflowY: 'auto', 
            background: 'var(--bg-glass)', border: '1px solid var(--border-color)', 
            borderRadius: 'var(--radius-lg)' 
          }}>
            <div style={{ padding: '24px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, background: 'rgba(10,15,30,0.9)', backdropFilter: 'blur(10px)', zIndex: 10 }}>
              <div>
                <h2 style={{ fontSize: '1.4rem' }}>অর্ডার #{selectedOrder.id.slice(0,8)}</h2>
                <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  {new Date(selectedOrder.created_at).toLocaleString()}
                </div>
              </div>
              <button 
                onClick={() => setSelectedOrder(null)} 
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '8px' }}
              >
                <FiX size={24} />
              </button>
            </div>

            <div style={{ padding: '24px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '32px' }}>
                <div style={{ background: 'var(--bg-secondary)', padding: '16px', borderRadius: '8px' }}>
                  <h3 style={{ fontSize: '1rem', color: 'var(--text-muted)', marginBottom: '12px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>কাস্টমার তথ্য</h3>
                  <div style={{ fontWeight: 600, fontSize: '1.1rem', color: 'var(--accent-cyan)' }}>{selectedOrder.profiles?.full_name || 'ইউজার'}</div>
                  <div style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>📞 {selectedOrder.phone}</div>
                </div>

                  <div style={{ background: 'var(--bg-secondary)', padding: '16px', borderRadius: '8px' }}>
                  <h3 style={{ fontSize: '1rem', color: 'var(--text-muted)', marginBottom: '12px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>ডেলিভারি ঠিকানা</h3>
                  <div style={{ fontWeight: 600 }}>{selectedOrder.shipping_city}</div>
                  <div style={{ color: 'var(--text-secondary)' }}>{selectedOrder.shipping_address}</div>
                  {selectedOrder.notes && (
                    <div style={{ marginTop: '8px', padding: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', fontSize: '0.9rem' }}>
                      <strong>নোট: </strong> {selectedOrder.notes}
                    </div>
                  )}
                </div>
              </div>

              {selectedOrder.payment_method === 'bkash' && (
                <div style={{ background: 'rgba(226, 19, 110, 0.05)', border: '1px solid rgba(226, 19, 110, 0.2)', padding: '20px', borderRadius: '12px', marginBottom: '32px' }}>
                  <h3 style={{ fontSize: '1.1rem', color: '#e2136e', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ background: '#e2136e', color: 'white', fontWeight: 900, fontSize: '0.7rem', padding: '2px 6px', borderRadius: '4px' }}>bKash</div>
                    পেমেন্ট ভেরিফিকেশন
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    <div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '4px' }}>বিকাশ নম্বর (যেখান থেকে পাঠানো হয়েছে)</div>
                      <div style={{ fontSize: '1.2rem', fontWeight: 600, letterSpacing: '1px' }}>{selectedOrder.payment_phone || 'প্রদান করা হয়নি'}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '4px' }}>ট্রানজেকশন আইডি (TrxID)</div>
                      <div style={{ fontSize: '1.2rem', fontWeight: 600, color: '#e2136e', letterSpacing: '1px', fontFamily: 'monospace', textTransform: 'uppercase' }}>{selectedOrder.trx_id || 'প্রদান করা হয়নি'}</div>
                    </div>
                  </div>
                  <div style={{ marginTop: '16px', fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <FiAlertCircle size={14} /> আপনার বিকাশ স্টেটমেন্টের সাথে এই TrxID মিলিয়ে দেখুন।
                  </div>
                </div>
              )}

              <h3 style={{ fontSize: '1.1rem', marginBottom: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>অর্ডার করা প্রোডাক্ট</h3>
              <div style={{ marginBottom: '32px' }}>
                {(selectedOrder.order_items || []).map(item => (
                  <div key={item.id} style={{ display: 'flex', gap: '16px', background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '8px', marginBottom: '8px', alignItems: 'center' }}>
                    <div style={{ width: '50px', height: '50px', background: 'var(--bg-glass)', borderRadius: '6px', padding: '4px' }}>
                      {item.products?.images && (
                        <img 
                          src={Array.isArray(item.products.images) ? item.products.images[0] : item.products.images} 
                          alt={item.products.title} 
                          style={{ width: '100%', height: '100%', objectFit: 'contain' }} 
                        />
                      )}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 500 }}>{item.products?.title || 'অজানা প্রোডাক্ট'}</div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        পরিমাণ: {item.quantity} × ৳{item.price}
                      </div>
                    </div>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                      ৳{item.quantity * item.price}
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(6,182,212,0.1)', padding: '16px 24px', borderRadius: '8px', marginBottom: '32px', border: '1px solid rgba(6,182,212,0.3)' }}>
                <div>
                  <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '4px' }}>মোট বিল ও পেমেন্ট:</div>
                  <div style={{ fontWeight: 600, textTransform: 'uppercase', color: selectedOrder.payment_method === 'bkash' ? '#e2136e' : 'var(--accent-blue)' }}>{selectedOrder.payment_method === 'bkash' ? 'bKash Paid' : 'Cash On Delivery'}</div>
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--accent-cyan)' }}>
                  ৳{selectedOrder.total}
                </div>
              </div>

              <h3 style={{ fontSize: '1.1rem', marginBottom: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>স্ট্যাটাস পরিবর্তন করুন</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px' }}>
                {[
                  { value: 'pending', label: 'পেন্ডিং' },
                  { value: 'processing', label: 'প্রসেসিং' },
                  { value: 'shipped', label: 'শিফট' },
                  { value: 'delivered', label: 'ডেলিভার' },
                  { value: 'cancelled', label: 'বাতিল' }
                ].map(item => {
                  let icon = <FiClock />;
                  if (item.value === 'processing') icon = <FiPackage />;
                  else if (item.value === 'shipped') icon = <FiTruck />;
                  else if (item.value === 'delivered') icon = <FiCheckCircle />;
                  else if (item.value === 'cancelled') icon = <FiX />;

                  return (
                    <button
                      key={item.value}
                      onClick={() => updateStatus(selectedOrder.id, item.value)}
                      disabled={updating || selectedOrder.status === item.value}
                      style={{
                        padding: '12px 8px',
                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
                        background: selectedOrder.status === item.value ? 'rgba(255,255,255,0.1)' : 'transparent',
                        border: selectedOrder.status === item.value 
                          ? '1px solid var(--accent-cyan)' 
                          : '1px solid var(--border-color)',
                        borderRadius: '8px', color: 'var(--text-primary)', cursor: selectedOrder.status === item.value || updating ? 'not-allowed' : 'pointer',
                        fontSize: '0.8rem', transition: '0.2s'
                      }}
                      className={selectedOrder.status !== item.value ? 'hover-glow' : ''}
                    >
                      <span style={{ fontSize: '1.2rem', color: selectedOrder.status === item.value ? 'var(--accent-cyan)' : 'var(--text-muted)' }}>{icon}</span>
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
