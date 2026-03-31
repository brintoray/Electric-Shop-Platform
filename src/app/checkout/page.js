'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FiCheckCircle, FiAlertCircle, FiCreditCard, FiTruck, FiX, FiSearch, FiChevronDown } from 'react-icons/fi';
import { useCartStore } from '@/store/cartStore';
import { useAuth } from '@/components/AuthProvider';
import { supabase } from '@/lib/supabase';

const districts = [
  "Bagerhat", "Bandarban", "Barguna", "Barishal", "Bhola", "Bogra", "Brahmanbaria", "Chandpur", "Chapainawabganj", "Chattogram", "Chuadanga", "Comilla", "Cox's Bazar", "Dhaka", "Dinajpur", "Faridpur", "Feni", "Gaibandha", "Gazipur", "Gopalganj", "Habiganj", "Jamalpur", "Jashore", "Jhalokati", "Jhenaidah", "Joypurhat", "Khagrachari", "Khulna", "Kishoreganj", "Kurigram", "Kushtia", "Lakshmipur", "Lalmonirhat", "Madaripur", "Magura", "Manikganj", "Meherpur", "Moulvibazar", "Munshiganj", "Mymensingh", "Naogaon", "Narail", "Narayanganj", "Narsingdi", "Natore", "Netrokona", "Nilphamari", "Noakhali", "Pabna", "Panchagarh", "Patuakhali", "Pirojpur", "Rajbari", "Rajshahi", "Rangamati", "Rangpur", "Satkhira", "Shariatpur", "Sherpur", "Sirajganj", "Sunamganj", "Sylhet", "Tangail", "Thakurgaon"
];

export default function CheckoutPage() {
  const { items, clearCart } = useCartStore();
  const { user, profile } = useAuth();
  const router = useRouter();
  
  const [form, setForm] = useState({
    name: '',
    phone: '',
    address: '',
    city: '',
    notes: '',
    paymentMethod: 'cod'
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [orderId, setOrderId] = useState(null);
  
  const [citySearch, setCitySearch] = useState('');
  const [isCityDropdownOpen, setIsCityDropdownOpen] = useState(false);
  const [filteredDistricts, setFilteredDistricts] = useState(districts);

  // bKash Modal State
  const [bkash, setBkash] = useState({
    isOpen: false,
    step: 1,
    phone: '',
    otp: '',
    pin: '',
    trxId: '',
    isLoading: false,
    error: ''
  });

  useEffect(() => {
    if (profile) {
      setForm(prev => ({
        ...prev,
        name: profile.full_name || '',
        phone: profile.phone || '',
        address: profile.address || '',
        city: profile.city || '',
      }));
      setCitySearch(profile.city || '');
    }
  }, [profile]);

  useEffect(() => {
    const filtered = districts.filter(d => 
      d.toLowerCase().includes(citySearch.toLowerCase())
    );
    setFilteredDistricts(filtered);
  }, [citySearch]);

  useEffect(() => {
    if (items.length === 0 && !success) {
      router.push('/cart');
    }
  }, [items, success, router]);

  const totalPrice = items.reduce((sum, item) => sum + item.price * (1 - (item.discount || 0) / 100) * item.quantity, 0);
  const shipping = totalPrice >= 5000 ? 0 : 120;
  const finalTotal = totalPrice + shipping;

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const performCheckout = async (orderStatus = 'pending', paymentPhone = null, trxId = null) => {
    setError('');
    setLoading(true);

    try {
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          total: finalTotal,
          shipping_address: form.address,
          shipping_city: form.city,
          phone: form.phone,
          payment_method: form.paymentMethod,
          payment_phone: paymentPhone,
          trx_id: trxId,
          notes: form.notes,
          status: orderStatus
        })
        .select()
        .single();

      if (orderError) throw orderError;

      const orderItems = items.map(item => ({
        order_id: orderData.id,
        product_id: item.id,
        quantity: item.quantity,
        price: item.price * (1 - (item.discount || 0) / 100)
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // Send Confirmation Email
      try {
        await fetch('/api/send-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: user.email,
            orderId: orderData.id.slice(0, 8),
            total: finalTotal,
            items: items.map(i => ({ name: i.title, quantity: i.quantity, price: i.price * (1 - (i.discount || 0) / 100) }))
          }),
        });
      } catch (emailErr) {
        console.error('Email sending failed:', emailErr);
      }

      setOrderId(orderData.id);
      setSuccess(true);
      clearCart();
    } catch (err) {
      console.error('Checkout error:', err);
      setError('অর্ডার সম্পন্ন করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      setError('চেকআউট করার জন্য প্রথমে লগইন করুন।');
      return;
    }

    if (form.paymentMethod === 'bkash') {
      setBkash(prev => ({ ...prev, isOpen: true, step: 1, phone: form.phone, error: '' }));
      return;
    }

    await performCheckout('pending');
  };

  const handleBkashSubmit = async (e) => {
    e.preventDefault();
    setBkash(prev => ({ ...prev, error: '', isLoading: true }));
    
    await new Promise(r => setTimeout(r, 1200));

    if (bkash.step === 1) {
      if (bkash.phone.length < 11) {
        setBkash(prev => ({ ...prev, error: 'সঠিক নম্বর দিন', isLoading: false }));
        return;
      }
      setBkash(prev => ({ ...prev, step: 2, isLoading: false }));
    } else if (bkash.step === 2) {
      if (bkash.otp.length !== 6) {
        setBkash(prev => ({ ...prev, error: '৬ ডিজিটের পিন আবশ্যক', isLoading: false }));
        return;
      }
      setBkash(prev => ({ ...prev, step: 3, isLoading: false }));
    } else if (bkash.step === 3) {
      if (bkash.pin.length < 4) {
        setBkash(prev => ({ ...prev, error: 'সঠিক বিকাশ পিন দিন', isLoading: false }));
        return;
      }
      setBkash(prev => ({ ...prev, step: 4, isLoading: false }));
    } else if (bkash.step === 4) {
      if (bkash.trxId.length < 8) {
        setBkash(prev => ({ ...prev, error: 'সঠিক ট্রানজেকশন আইডি দিন', isLoading: false }));
        return;
      }
      setBkash(prev => ({ ...prev, isOpen: false, isLoading: false }));
      await performCheckout('processing', bkash.phone, bkash.trxId);
    }
  };

  if (success) {
    return (
      <div className="container" style={{ padding: '100px 20px', textAlign: 'center' }}>
        <div style={{ color: 'var(--accent-green)', fontSize: '5rem', marginBottom: '20px' }}><FiCheckCircle style={{ display: 'inline' }} /></div>
        <h1 style={{ marginBottom: '16px' }}>অর্ডার সফল হয়েছে!</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '8px' }}>আপনার অর্ডার প্লেস করা হয়েছে। খুব শীঘ্রই আমরা আপনার সাথে যোগাযোগ করব।</p>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '32px' }}>অর্ডার আইডি: <strong style={{ color: 'var(--accent-cyan)' }}>{orderId}</strong></p>
        {bkash.trxId && (
          <div style={{ background: 'rgba(226, 19, 110, 0.1)', color: '#e2136e', padding: '12px', borderRadius: '8px', display: 'inline-block', marginBottom: '24px', fontWeight: 'bold' }}>
            বিকাশ ট্রানজেকশন ID: {bkash.trxId}
          </div>
        )}
        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
          <Link href="/orders" className="btn btn-secondary">আমার অর্ডারসমূহ</Link>
          <Link href="/products" className="btn btn-primary">আরও শপিং করুন</Link>
        </div>
      </div>
    );
  }

  if (items.length === 0) return null;

  return (
    <div className="container" style={{ padding: '40px 20px 80px' }}>
      <div className="page-header">
        <div className="breadcrumb"><Link href="/">হোম</Link> <span>/</span> <Link href="/cart">কার্ট</Link> <span>/</span> <span>চেকআউট</span></div>
        <h1>চেকআউট</h1>
      </div>

      {!user ? (
        <div className="glass-card" style={{ padding: '40px', textAlign: 'center', marginBottom: '32px' }}>
          <h2 style={{ marginBottom: '16px' }}>লগইন প্রয়োজন</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>চেকআউট করার জন্য আপনাকে আপনার অ্যাকাউন্টে লগইন করতে হবে।</p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
            <Link href="/auth/login?redirect=/checkout" className="btn btn-primary">লগইন করুন</Link>
            <Link href="/auth/signup?redirect=/checkout" className="btn btn-secondary">অ্যাকাউন্ট তৈরি করুন</Link>
          </div>
        </div>
      ) : (
        <div className="shop-layout">
          <div>
            {error && (
              <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 'var(--radius-md)', padding: '12px 16px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-red)', fontSize: '0.9rem' }}>
                <FiAlertCircle /> {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="glass-card" style={{ padding: '32px' }}>
              <h3 style={{ marginBottom: '24px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>ডেলিভারি ঠিকানা</h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>নাম</label>
                  <input type="text" name="name" className="input" value={form.name} onChange={handleChange} required placeholder="আপনার পুরো নাম" />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>মোবাইল নম্বর</label>
                  <input type="tel" name="phone" className="input" value={form.phone} onChange={handleChange} required placeholder="01XXXXXXXXX" />
                </div>
              </div>

              <div className="form-group" style={{ position: 'relative' }}>
                <label>বিভাগ/জেলা</label>
                <div style={{ position: 'relative' }}>
                  <input 
                    type="text" 
                    className="input" 
                    value={citySearch} 
                    onChange={(e) => {
                      setCitySearch(e.target.value);
                      setIsCityDropdownOpen(true);
                    }}
                    onFocus={() => setIsCityDropdownOpen(true)}
                    placeholder="আপনার জেলা খুঁজুন (উদা: Dhaka, Munshiganj)" 
                    style={{ paddingRight: '40px' }}
                    required
                  />
                  <FiSearch style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                </div>
                
                {isCityDropdownOpen && (
                  <div style={{ 
                    position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 100, 
                    background: 'var(--bg-glass)', backdropFilter: 'blur(10px)', 
                    border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)',
                    maxHeight: '200px', overflowY: 'auto', marginTop: '8px', boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
                  }}>
                    {filteredDistricts.length === 0 ? (
                      <div style={{ padding: '12px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>কোনো জেলা পাওয়া যায়নি</div>
                    ) : (
                      filteredDistricts.map(d => (
                        <div 
                          key={d} 
                          onClick={() => {
                            setCitySearch(d);
                            setForm({...form, city: d});
                            setIsCityDropdownOpen(false);
                          }}
                          style={{ padding: '10px 16px', cursor: 'pointer', transition: '0.2s', borderBottom: '1px solid rgba(255,255,255,0.05)' }}
                          className="hover-bg"
                        >
                          {d}
                        </div>
                      ))
                    )}
                  </div>
                )}
                {/* Hidden real select to maintain form functionality if needed */}
                <input type="hidden" name="city" value={form.city} />
              </div>

              <div className="form-group">
                <label>পূর্ণ ঠিকানা</label>
                <textarea name="address" className="input" value={form.address} onChange={handleChange} required placeholder="বাসা নং, রাস্তা, এলাকা..." rows="3"></textarea>
              </div>

              <div className="form-group" style={{ marginBottom: '40px' }}>
                <label>অতিরিক্ত নোট (অপশনাল)</label>
                <textarea name="notes" className="input" value={form.notes} onChange={handleChange} placeholder="ডেলিভারি সংক্রান্ত কোনো নির্দেশ থাকলে দিন" rows="2"></textarea>
              </div>

              <h3 style={{ marginBottom: '24px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>পেমেন্ট মাধ্যম</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', border: '1px solid ' + (form.paymentMethod === 'cod' ? 'var(--accent-blue)' : 'var(--border-color)'), borderRadius: 'var(--radius-md)', cursor: 'pointer', background: form.paymentMethod === 'cod' ? 'rgba(59,130,246,0.05)' : 'transparent', transition: 'var(--transition)' }}>
                  <input type="radio" name="paymentMethod" value="cod" checked={form.paymentMethod === 'cod'} onChange={handleChange} style={{ accentColor: 'var(--accent-blue)', width: '18px', height: '18px' }} />
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
                    <FiTruck size={20} color={form.paymentMethod === 'cod' ? 'var(--accent-blue)' : 'var(--text-muted)'} />
                    <div style={{ fontWeight: 500 }}>ক্যাশ অন ডেলিভারি (COD)</div>
                  </div>
                </label>
                
                <label style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', border: '1px solid ' + (form.paymentMethod === 'bkash' ? '#e2136e' : 'var(--border-color)'), borderRadius: 'var(--radius-md)', cursor: 'pointer', background: form.paymentMethod === 'bkash' ? 'rgba(226, 19, 110, 0.05)' : 'transparent', transition: 'var(--transition)' }}>
                  <input type="radio" name="paymentMethod" value="bkash" checked={form.paymentMethod === 'bkash'} onChange={handleChange} style={{ accentColor: '#e2136e', width: '18px', height: '18px' }} />
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
                    <div style={{ background: '#e2136e', color: 'white', fontWeight: 900, fontSize: '0.8rem', padding: '2px 6px', borderRadius: '4px' }}>bKash</div>
                    <div style={{ fontWeight: 500 }}>বিকাশ পেমেন্ট</div>
                  </div>
                </label>
              </div>

              <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }} disabled={loading}>
                {loading ? 'প্রসেস হচ্ছে...' : form.paymentMethod === 'bkash' ? `বিকাশ দিয়ে ৳${Math.round(finalTotal).toLocaleString()} পেমেন্ট করুন` : `অর্ডার কনফার্ম করুন (৳${Math.round(finalTotal).toLocaleString()})`}
              </button>
            </form>
          </div>

          <div style={{ position: 'sticky', top: '100px', height: 'fit-content' }}>
            <div className="glass-card" style={{ padding: '24px' }}>
              <h3 style={{ marginBottom: '20px' }}>অর্ডার সামারি</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
                {items.map(item => (
                  <div key={item.id} style={{ display: 'flex', gap: '12px', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
                    <div style={{ width: '60px', height: '60px', background: 'var(--bg-glass)', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4px' }}>
                      <img src={item.image} alt={item.title} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '0.9rem', fontWeight: 500 }}>{item.title}</div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>পরিমাণ: {item.quantity} </div>
                      <div style={{ color: 'var(--accent-cyan)', fontWeight: 600, fontSize: '0.95rem' }}>৳{Math.round(item.price * (1 - (item.discount || 0) / 100) * item.quantity).toLocaleString()}</div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', color: 'var(--text-secondary)' }}>
                <span>সাবটোটাল</span>
                <span>৳{Math.round(totalPrice).toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', color: 'var(--text-secondary)' }}>
                <span>ডেলিভারি চার্জ</span>
                <span>{shipping === 0 ? <span style={{ color: 'var(--accent-green)' }}>ফ্রি</span> : `৳${shipping}`}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '16px', borderTop: '1px solid var(--border-color)', fontWeight: 700, fontSize: '1.2rem' }}>
                <span>মোট</span>
                <span className="price">৳{Math.round(finalTotal).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {bkash.isOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
          background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(5px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div style={{
            background: '#e2136e', width: '100%', maxWidth: '380px', height: '550px', 
            borderRadius: '12px', overflow: 'hidden', position: 'relative', 
            boxShadow: '0 20px 40px rgba(226, 19, 110, 0.3)'
          }}>
            <button 
              onClick={() => setBkash({...bkash, isOpen: false})} 
              style={{ position: 'absolute', right: '15px', top: '15px', background: 'none', border: 'none', color: 'white', cursor: 'pointer', zIndex: 10 }}
            >
              <FiX size={24} />
            </button>
            <div style={{ textAlign: 'center', color: 'white', padding: '40px 20px 20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <img src="/images/hero_3d_electronics.png" alt="bKash" style={{ height: '60px', width: '60px', objectFit: 'contain', margin: '0 auto', mixBlendMode: 'screen', filter: 'brightness(200%) grayscale(100%)' }} />
              <div style={{ fontSize: '1.2rem', fontWeight: 600 }}>bKash Payment</div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '10px' }}>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>Merchant</div>
                  <div style={{ fontWeight: 600 }}>Electric Shop</div>
                </div>
                <div style={{ width: '1px', background: 'rgba(255,255,255,0.3)', height: '100%' }}></div>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>Amount</div>
                  <div style={{ fontWeight: 600 }}>৳ {Math.round(finalTotal)}</div>
                </div>
              </div>
            </div>

            <div style={{ background: '#f5f5f5', height: '100%', padding: '24px' }}>
              <div style={{ textAlign: 'center', marginBottom: '16px', color: '#444', fontWeight: 500 }}>
                {bkash.step === 1 && 'আপনার বিকাশ অ্যাকাউন্ট নম্বর দিন'}
                {bkash.step === 2 && 'আপনার মোবাইলে পাঠানো ভেরিফিকেশন কোড দিন'}
                {bkash.step === 3 && 'আপনার বিকাশ পিন নম্বর দিন'}
                {bkash.step === 4 && 'টাকা পাঠানো হয়ে থাকলে ট্রানজেকশন আইডি দিন'}
              </div>
              
              {bkash.error && (
                <div style={{ color: '#e2136e', textAlign: 'center', fontSize: '0.9rem', marginBottom: '12px', background: 'rgba(226, 19, 110, 0.1)', padding: '8px', borderRadius: '4px' }}>
                  {bkash.error}
                </div>
              )}

              <form onSubmit={handleBkashSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {bkash.step === 1 && (
                  <input type="tel" value={bkash.phone} onChange={e => setBkash({...bkash, phone: e.target.value})} placeholder="e.g 01XXXXXXXXX" style={{ width: '100%', padding: '16px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '1.2rem', textAlign: 'center', outline: 'none' }} autoFocus />
                )}
                {bkash.step === 2 && (
                  <input type="text" value={bkash.otp} onChange={e => setBkash({...bkash, otp: e.target.value})} placeholder="X X X X X X" style={{ width: '100%', padding: '16px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '1.2rem', textAlign: 'center', outline: 'none', letterSpacing: '8px' }} autoFocus />
                )}
                {bkash.step === 3 && (
                  <input type="password" value={bkash.pin} onChange={e => setBkash({...bkash, pin: e.target.value})} placeholder="বিকাশ পিন" style={{ width: '100%', padding: '16px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '1.2rem', textAlign: 'center', outline: 'none', letterSpacing: '8px' }} autoFocus />
                )}
                {bkash.step === 4 && (
                  <input type="text" value={bkash.trxId} onChange={e => setBkash({...bkash, trxId: e.target.value})} placeholder="TrxID (e.g. 9J283LA)" style={{ width: '100%', padding: '16px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '1.2rem', textAlign: 'center', outline: 'none', textTransform: 'uppercase' }} autoFocus />
                )}
                
                <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
                  <button type="button" onClick={() => setBkash({...bkash, isOpen: false})} style={{ flex: 1, padding: '14px', background: '#ccc', color: '#333', border: 'none', borderRadius: '4px', fontWeight: 600, cursor: 'pointer' }}>
                    CLOSE
                  </button>
                  <button type="submit" disabled={bkash.isLoading} style={{ flex: 1, padding: '14px', background: '#e2136e', color: 'white', border: 'none', borderRadius: '4px', fontWeight: 600, cursor: bkash.isLoading ? 'not-allowed' : 'pointer' }}>
                    {bkash.isLoading ? 'অপেক্ষা করুন...' : 'CONFIRM'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
