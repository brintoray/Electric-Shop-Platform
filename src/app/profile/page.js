'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  FiUser, FiMapPin, FiPhone, FiCheck, FiSearch, 
  FiPackage, FiSettings, FiLogOut, FiEdit3, FiMail,
  FiShoppingBag, FiChevronRight, FiCreditCard
} from 'react-icons/fi';
import { useAuth } from '@/components/AuthProvider';
import { supabase } from '@/lib/supabase';

const districts = [
  "Bagerhat", "Bandarban", "Barguna", "Barishal", "Bhola", "Bogra", "Brahmanbaria", "Chandpur", "Chapainawabganj", "Chattogram", "Chuadanga", "Comilla", "Cox's Bazar", "Dhaka", "Dinajpur", "Faridpur", "Feni", "Gaibandha", "Gazipur", "Gopalganj", "Habiganj", "Jamalpur", "Jashore", "Jhalokati", "Jhenaidah", "Joypurhat", "Khagrachari", "Khulna", "Kishoreganj", "Kurigram", "Kushtia", "Lakshmipur", "Lalmonirhat", "Madaripur", "Magura", "Manikganj", "Meherpur", "Moulvibazar", "Munshiganj", "Mymensingh", "Naogaon", "Narail", "Narayanganj", "Narsingdi", "Natore", "Netrokona", "Nilphamari", "Noakhali", "Pabna", "Panchagarh", "Patuakhali", "Pirojpur", "Rajbari", "Rajshahi", "Rangamati", "Rangpur", "Satkhira", "Shariatpur", "Sherpur", "Sirajganj", "Sunamganj", "Sylhet", "Tangail", "Thakurgaon"
];

export default function ProfilePage() {
  const { user, profile, loading: authLoading, signOut } = useAuth();
  const router = useRouter();
  
  const [form, setForm] = useState({
    full_name: '',
    phone: '',
    address: '',
    city: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [stats, setStats] = useState({ totalOrders: 0, spending: 0 });
  const [citySearch, setCitySearch] = useState('');
  const [isCityDropdownOpen, setIsCityDropdownOpen] = useState(false);
  const [filteredDistricts, setFilteredDistricts] = useState(districts);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login');
    }
    if (profile) {
      setForm({
        full_name: profile.full_name || '',
        phone: profile.phone || '',
        address: profile.address || '',
        city: profile.city || ''
      });
      setCitySearch(profile.city || '');
      fetchStats();
    }
  }, [user, authLoading, profile, router]);

  const fetchStats = async () => {
    if (!user) return;
    const { data } = await supabase.from('orders').select('total').eq('user_id', user.id);
    if (data) {
      const total = data.reduce((sum, o) => sum + o.total, 0);
      setStats({ totalOrders: data.length, spending: total });
    }
  };

  useEffect(() => {
    const filtered = districts.filter(d => d.toLowerCase().includes(citySearch.toLowerCase()));
    setFilteredDistricts(filtered);
  }, [citySearch]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess('');
    const { error } = await supabase.from('profiles').update(form).eq('id', user.id);
    if (!error) {
      setSuccess('প্রোফাইল সফলভাবে আপডেট হয়েছে!');
      setTimeout(() => setSuccess(''), 3000);
    }
    setLoading(false);
  };

  if (authLoading || !user) {
    return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div className="spinner"></div></div>;
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-main)', color: 'var(--text-primary)' }}>
      {/* CSS for responsiveness */}
      <style jsx>{`
        .profile-layout {
          display: grid;
          grid-template-columns: 320px 1fr;
          gap: 32px;
          align-items: flex-start;
        }
        @media (max-width: 992px) {
          .profile-layout {
            grid-template-columns: 1fr;
          }
          .sidebar-sticky {
            position: relative !important;
            top: 0 !important;
          }
        }
      `}</style>

      {/* Dynamic Header Background */}
      <div style={{ height: '200px', background: 'var(--gradient-main)', position: 'relative', opacity: 0.15 }}></div>
      
      <div className="container" style={{ marginTop: '-100px', padding: '0 20px 80px', position: 'relative', zIndex: 10 }}>
        <div className="profile-layout">
          
          {/* Sidebar */}
          <div className="sidebar-sticky" style={{ position: 'sticky', top: '100px' }}>
            <div className="glass-card" style={{ padding: '0', overflow: 'hidden' }}>
              <div style={{ padding: '32px 24px', textAlign: 'center', borderBottom: '1px solid var(--border-color)' }}>
                <div style={{ position: 'relative', width: '100px', height: '100px', margin: '0 auto 16px' }}>
                  <div style={{ width: '100%', height: '100%', borderRadius: '50%', background: 'var(--gradient-main)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', fontWeight: 700, color: 'white', border: '4px solid var(--bg-glass)', boxShadow: 'var(--shadow-lg)' }}>
                    {profile?.full_name ? profile.full_name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                  </div>
                  <div style={{ position: 'absolute', bottom: '5px', right: '5px', background: 'var(--accent-green)', width: '18px', height: '18px', borderRadius: '50%', border: '2px solid white' }}></div>
                </div>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '4px' }}>{profile?.full_name || 'ইউজার'}</h2>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                  <FiMail size={12} /> {user.email}
                </div>
              </div>

              <div style={{ padding: '16px 0' }}>
                <div style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '12px', padding: '16px 32px', background: 'rgba(59, 130, 246, 0.1)', borderLeft: '4px solid var(--accent-blue)', color: 'var(--accent-blue)', fontWeight: 600 }}>
                  <FiUser size={18} /> প্রোফাইল সেটিংস
                </div>
                <Link href="/orders" className="hover-bg" style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '12px', padding: '16px 32px', color: 'var(--text-secondary)', textDecoration: 'none' }}>
                  <FiShoppingBag size={18} /> অর্ডার হিস্ট্রি
                </Link>
                {profile?.role === 'admin' && (
                  <Link href="/admin" className="hover-bg" style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '12px', padding: '16px 32px', color: 'var(--accent-purple)', textDecoration: 'none', fontWeight: 600 }}>
                    <FiSettings size={18} /> অ্যাডমিন প্যানেল
                  </Link>
                )}
                <div style={{ height: '1px', background: 'var(--border-color)', margin: '16px 0' }}></div>
                <button onClick={() => signOut()} className="hover-bg" style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '12px', padding: '16px 32px', background: 'transparent', border: 'none', color: 'var(--accent-red)', cursor: 'pointer' }}>
                  <FiLogOut size={18} /> লগ আউট
                </button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* Stats Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
              <div className="glass-card" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(59, 130, 246, 0.1)', color: 'var(--accent-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <FiPackage size={24} />
                </div>
                <div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>মোট অর্ডার</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 700 }}>{stats.totalOrders} টি</div>
                </div>
              </div>
              <div className="glass-card" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(6, 182, 212, 0.1)', color: 'var(--accent-cyan)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <FiCreditCard size={24} />
                </div>
                <div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>মোট খরচ</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 700 }}>৳{stats.spending.toLocaleString()}</div>
                </div>
              </div>
            </div>

            {/* Profile Form */}
            <div className="glass-card" style={{ padding: '40px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                  <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '4px' }}>প্রোফাইল সেটিংস</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>আপনার ডেলিভারি তথ্য এবং ব্যক্তিগত ডিটেইলস আপডেট করুন</p>
                </div>
                <div style={{ background: 'var(--bg-secondary)', padding: '8px 16px', borderRadius: '50px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FiEdit3 size={14} /> এডিট মোড
                </div>
              </div>

              {success && (
                <div style={{ background: 'rgba(16,185,129,0.1)', color: 'var(--accent-green)', padding: '16px', borderRadius: '12px', marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <FiCheck size={20} /> {success}
                </div>
              )}

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
                  <div className="form-group">
                    <label style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '8px', display: 'block' }}>লগইন ইমেইল</label>
                    <input type="email" className="input" value={user.email} disabled style={{ background: 'rgba(255,255,255,0.03)', color: 'var(--text-muted)' }} />
                  </div>
                  
                  <div className="form-group">
                    <label style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '8px', display: 'block' }}>পুরো নাম</label>
                    <div style={{ position: 'relative' }}>
                      <FiUser style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                      <input type="text" name="full_name" className="input" style={{ paddingLeft: '48px' }} value={form.full_name} onChange={handleChange} required />
                    </div>
                  </div>

                  <div className="form-group">
                    <label style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '8px', display: 'block' }}>মোবাইল নম্বর</label>
                    <div style={{ position: 'relative' }}>
                      <FiPhone style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                      <input type="tel" name="phone" className="input" style={{ paddingLeft: '48px' }} value={form.phone} onChange={handleChange} placeholder="01XXXXXXXXX" />
                    </div>
                  </div>

                  <div className="form-group" style={{ position: 'relative' }}>
                    <label style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '8px', display: 'block' }}>বিভাগ / জেলা</label>
                    <div style={{ position: 'relative' }}>
                      <FiSearch style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                      <input 
                        type="text" 
                        className="input" 
                        style={{ paddingLeft: '48px' }}
                        value={citySearch} 
                        onChange={(e) => { setCitySearch(e.target.value); setIsCityDropdownOpen(true); }}
                        onFocus={() => setIsCityDropdownOpen(true)}
                        placeholder="আপনার জেলা খুঁজুন" 
                        required
                      />
                    </div>
                    {isCityDropdownOpen && (
                      <div style={{ 
                        position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 100, 
                        background: '#151515', border: '1px solid var(--border-color)', borderRadius: '12px',
                        maxHeight: '200px', overflowY: 'auto', marginTop: '10px', boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
                      }}>
                        {filteredDistricts.map(d => (
                          <div key={d} onClick={() => { setCitySearch(d); setForm({...form, city: d}); setIsCityDropdownOpen(false); }} className="hover-bg" style={{ padding: '12px 20px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                            {d} <FiChevronRight size={14} style={{ opacity: 0.3 }} />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="form-group">
                  <label style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '8px', display: 'block' }}>বিস্তারিত ঠিকানা</label>
                  <div style={{ position: 'relative' }}>
                    <FiMapPin style={{ position: 'absolute', left: '16px', top: '18px', color: 'var(--text-muted)' }} />
                    <textarea name="address" className="input" style={{ paddingLeft: '48px', paddingTop: '14px' }} value={form.address} onChange={handleChange} rows="2" placeholder="বাসা নং, রোড, এলাকা..."></textarea>
                  </div>
                </div>

                <button type="submit" className="btn btn-primary btn-lg" style={{ minWidth: '200px', alignSelf: 'flex-start' }} disabled={loading}>
                  {loading ? 'সংরক্ষণ হচ্ছে...' : 'পরিবর্তনগুলো সেভ করুন'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
