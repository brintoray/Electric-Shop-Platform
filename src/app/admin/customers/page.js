'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCustomers(data || []);
    } catch (error) {
      console.error('Error fetching customers:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.8rem', marginBottom: '8px' }}>কাস্টমার তালিকা</h1>
        <p style={{ color: 'var(--text-muted)' }}>রেজিস্টার্ড সব কাস্টমারের তথ্য</p>
      </div>

      <div className="glass-card" style={{ padding: '24px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>লোড হচ্ছে...</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '12px 16px', fontWeight: 500 }}>নাম</th>
                  <th style={{ padding: '12px 16px', fontWeight: 500 }}>ফোন</th>
                  <th style={{ padding: '12px 16px', fontWeight: 500 }}>শহর</th>
                  <th style={{ padding: '12px 16px', fontWeight: 500 }}>রোল</th>
                  <th style={{ padding: '12px 16px', fontWeight: 500 }}>যোগদানের তারিখ</th>
                </tr>
              </thead>
              <tbody>
                {customers.map(customer => (
                  <tr key={customer.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '12px 16px', fontWeight: 500 }}>{customer.full_name || 'সেট করা নেই'}</td>
                    <td style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>{customer.phone || '-'}</td>
                    <td style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>{customer.city || '-'}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', background: customer.role === 'admin' ? 'rgba(139,92,246,0.1)' : 'rgba(59,130,246,0.1)', color: customer.role === 'admin' ? 'var(--accent-purple)' : 'var(--accent-blue)' }}>
                        {customer.role || 'customer'}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>
                      {new Date(customer.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
