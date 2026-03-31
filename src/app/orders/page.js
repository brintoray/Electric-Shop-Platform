'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FiBox, FiClock, FiCheckCircle, FiTruck, FiXCircle } from 'react-icons/fi';
import { useAuth } from '@/components/AuthProvider';
import { supabase } from '@/lib/supabase';

export default function OrdersPage() {
  const { user, profile, loading: authLoading } = useAuth();
  const router = useRouter();
  
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login');
      return;
    }

    if (user) {
      fetchOrders();
    }
  }, [user, authLoading, router]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items(*, products(*))
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'pending': return <FiClock size={20} color="var(--accent-cyan)" />;
      case 'processing': return <FiBox size={20} color="var(--accent-blue)" />;
      case 'shipped': return <FiTruck size={20} color="var(--accent-purple)" />;
      case 'delivered': return <FiCheckCircle size={20} color="var(--accent-green)" />;
      case 'cancelled': return <FiXCircle size={20} color="var(--accent-red)" />;
      default: return <FiClock size={20} color="var(--text-muted)" />;
    }
  };

  const getStatusText = (status) => {
    switch(status) {
      case 'pending': return 'পেন্ডিং';
      case 'processing': return 'প্রক্রিয়াকরণ';
      case 'shipped': return 'শিপড';
      case 'delivered': return 'ডেলিভার্ড';
      case 'cancelled': return 'বাতিল';
      default: return status;
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'pending': return 'rgba(6,182,212,0.1)';
      case 'processing': return 'rgba(59,130,246,0.1)';
      case 'shipped': return 'rgba(139,92,246,0.1)';
      case 'delivered': return 'rgba(16,185,129,0.1)';
      case 'cancelled': return 'rgba(239,68,68,0.1)';
      default: return 'transparent';
    }
  };

  const getStatusTextColor = (status) => {
    switch(status) {
      case 'pending': return 'var(--accent-cyan)';
      case 'processing': return 'var(--accent-blue)';
      case 'shipped': return 'var(--accent-purple)';
      case 'delivered': return 'var(--accent-green)';
      case 'cancelled': return 'var(--accent-red)';
      default: return 'var(--text-primary)';
    }
  };

  if (authLoading || loading) {
    return <div className="loading-spinner"><div className="spinner"></div></div>;
  }

  return (
    <div className="container" style={{ padding: '40px 20px 80px' }}>
      <div className="page-header">
        <div className="breadcrumb"><Link href="/">হোম</Link> <span>/</span> <Link href="/profile">প্রোফাইল</Link> <span>/</span> <span>আমার অর্ডার</span></div>
        <h1>আমার অর্ডারসমূহ</h1>
      </div>

      {orders.length === 0 ? (
        <div className="glass-card" style={{ padding: '60px 20px', textAlign: 'center' }}>
          <div style={{ color: 'var(--text-muted)', fontSize: '4rem', marginBottom: '20px' }}><FiBox style={{ display: 'inline' }} /></div>
          <h2 style={{ marginBottom: '16px' }}>আপনার কোনো অর্ডার নেই</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '32px' }}>আপনি এখনও কোনো কেনাকাটা করেননি। এখনই আমাদের প্রোডাক্ট কালেকশন দেখুন।</p>
          <Link href="/products" className="btn btn-primary">কেনাকাটা শুরু করুন</Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {orders.map((order) => {
            const statusSteps = ['pending', 'processing', 'shipped', 'delivered'];
            const currentStepIndex = statusSteps.indexOf(order.status);
            
            return (
              <div key={order.id} className="glass-card" style={{ padding: '24px', position: 'relative' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px', marginBottom: '20px', flexWrap: 'wrap', gap: '16px' }}>
                  <div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>অর্ডার আইডি</div>
                    <div style={{ fontWeight: 700, fontFamily: 'monospace', fontSize: '1.2rem', color: 'var(--accent-cyan)' }}>#{order.id.slice(0,8)}</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                      {new Date(order.created_at).toLocaleDateString('bn-BD', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                  
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '4px' }}>
                      মোট: <span style={{ color: 'var(--text-primary)' }}>৳{Math.round(order.total).toLocaleString()}</span>
                    </div>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 12px', borderRadius: '50px', background: getStatusColor(order.status), color: getStatusTextColor(order.status), fontWeight: 600, fontSize: '0.85rem' }}>
                      {getStatusIcon(order.status)}
                      {getStatusText(order.status)}
                    </div>
                  </div>
                </div>

                {/* Status Stepper */}
                {order.status !== 'cancelled' && (
                  <div style={{ marginBottom: '30px', padding: '0 10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative', marginBottom: '10px' }}>
                      {/* Progress Line Background */}
                      <div style={{ position: 'absolute', top: '15px', left: '0', height: '2px', width: '100%', background: 'var(--border-color)', zIndex: 0 }}></div>
                      {/* Progress Line Active */}
                      <div style={{ 
                        position: 'absolute', top: '15px', left: '0', height: '2px', 
                        width: `${(currentStepIndex / (statusSteps.length - 1)) * 100}%`, 
                        background: 'var(--accent-blue)', transition: 'width 0.5s ease', zIndex: 1 
                      }}></div>
                      
                      {statusSteps.map((step, idx) => (
                        <div key={step} style={{ zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', width: '25%' }}>
                          <div style={{ 
                            width: '32px', height: '32px', borderRadius: '50%', 
                            background: idx <= currentStepIndex ? 'var(--accent-blue)' : 'var(--bg-secondary)',
                            border: `2px solid ${idx <= currentStepIndex ? 'var(--accent-blue)' : 'var(--border-color)'}`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: idx <= currentStepIndex ? 'white' : 'var(--text-muted)',
                            transition: 'all 0.3s ease',
                            boxShadow: idx === currentStepIndex ? '0 0 15px var(--accent-blue)' : 'none'
                          }}>
                            {idx < currentStepIndex ? <FiCheckCircle size={16} /> : (idx === currentStepIndex ? getStatusIcon(step) : idx + 1)}
                          </div>
                          <div style={{ 
                            marginTop: '8px', fontSize: '0.75rem', 
                            color: idx <= currentStepIndex ? 'var(--text-primary)' : 'var(--text-muted)',
                            fontWeight: idx === currentStepIndex ? 600 : 400
                          }}>
                            {getStatusText(step)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-md)', padding: '16px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {order.order_items?.map((item) => (
                      <div key={item.id} style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                        <div style={{ width: '50px', height: '50px', background: 'var(--bg-primary)', borderRadius: 'var(--radius-sm)', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
                          <img 
                            src={item.products?.images?.[0] || 'https://via.placeholder.com/50'} 
                            alt={item.products?.name} 
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                          />
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 500, fontSize: '0.95rem' }}>{item.products?.name || 'অজানা প্রোডাক্ট'}</div>
                          <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                            {item.quantity} টি × ৳{Math.round(item.price).toLocaleString()}
                          </div>
                        </div>
                        <div style={{ fontWeight: 600, color: 'var(--accent-cyan)' }}>
                          ৳{Math.round(item.price * item.quantity).toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
