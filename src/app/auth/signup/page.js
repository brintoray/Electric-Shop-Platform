'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FiUser, FiMail, FiLock, FiPhone, FiEye, FiEyeOff, FiAlertCircle, FiCheck } from 'react-icons/fi';
import { supabase } from '@/lib/supabase';

export default function SignupPage() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (form.password.length < 6) {
      setError('পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে');
      setLoading(false);
      return;
    }

    const { data, error: signUpError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: {
          full_name: form.name,
          phone: form.phone,
        },
      },
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    // Create profile in profiles table
    if (data.user) {
      await supabase.from('profiles').insert({
        id: data.user.id,
        full_name: form.name,
        phone: form.phone,
      });
    }

    setSuccess(true);
    setLoading(false);
  };

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  if (success) {
    return (
      <div className="auth-page">
        <div className="glass-card auth-card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '16px' }}>✅</div>
          <h1>অ্যাকাউন্ট তৈরি হয়েছে!</h1>
          <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>
            আপনার ইমেইলে একটি কনফার্মেশন লিংক পাঠানো হয়েছে। ইমেইল ভেরিফাই করে লগইন করুন।
          </p>
          <Link href="/auth/login" className="btn btn-primary btn-lg" style={{ width: '100%' }}>
            লগইন পেজে যান
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="glass-card auth-card">
        <h1>সাইন আপ করুন</h1>
        <p>নতুন অ্যাকাউন্ট তৈরি করুন</p>

        {error && (
          <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 'var(--radius-md)', padding: '12px 16px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-red)', fontSize: '0.9rem' }}>
            <FiAlertCircle /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {[
            { icon: <FiUser />, label: 'পুরো নাম', type: 'text', field: 'name', placeholder: 'আপনার নাম' },
            { icon: <FiMail />, label: 'ইমেইল', type: 'email', field: 'email', placeholder: 'example@email.com' },
            { icon: <FiPhone />, label: 'মোবাইল নম্বর', type: 'tel', field: 'phone', placeholder: '01XXXXXXXXX' },
          ].map(({ icon, label, type, field, placeholder }) => (
            <div className="form-group" key={field}>
              <label>{label}</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>{icon}</span>
                <input className="input" style={{ paddingLeft: '42px' }} type={type} placeholder={placeholder} value={form[field]} onChange={update(field)} required id={`signup-${field}`} />
              </div>
            </div>
          ))}

          <div className="form-group">
            <label>পাসওয়ার্ড</label>
            <div style={{ position: 'relative' }}>
              <FiLock style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input className="input" style={{ paddingLeft: '42px', paddingRight: '42px' }} type={showPass ? 'text' : 'password'} placeholder="কমপক্ষে ৬ অক্ষর" value={form.password} onChange={update('password')} required id="signup-password" />
              <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                {showPass ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }} disabled={loading} id="signup-submit">
            {loading ? 'অপেক্ষা করুন...' : 'অ্যাকাউন্ট তৈরি করুন'}
          </button>
        </form>

        <div className="auth-footer">
          ইতোমধ্যে অ্যাকাউন্ট আছে? <Link href="/auth/login">লগইন করুন</Link>
        </div>
      </div>
    </div>
  );
}
