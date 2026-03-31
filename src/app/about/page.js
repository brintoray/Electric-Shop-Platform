import Link from 'next/link';
import { FiTarget, FiAward, FiShield, FiUsers, FiTruck } from 'react-icons/fi';

export const metadata = {
  title: 'আমাদের সম্পর্কে | Electric Shop',
  description: 'বাংলাদেশের বিশ্বস্ত ইলেকট্রনিক্স ই-কমার্স প্ল্যাটফর্ম।',
};

export default function AboutPage() {
  return (
    <div className="container" style={{ padding: '40px 20px 80px' }}>
      <div className="page-header text-center" style={{ maxWidth: '800px', margin: '0 auto 60px' }}>
        <h1 style={{ fontSize: '3rem', marginBottom: '16px', background: 'var(--gradient-main)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>TechNova সম্পর্কে</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', lineHeight: 1.6 }}>আমরা বাংলাদেশের অন্যতম বিশ্বস্ত টেকনোলজি ও ইলেকট্রনিক্স শপ। আমাদের লক্ষ্য সাশ্রয়ী মূল্যে অরিজিনাল ও সেরা মানের প্রোডাক্ট গ্রাহকদের কাছে পৌঁছে দেওয়া।</p>
      </div>

      <div className="glass-card" style={{ padding: '40px', marginBottom: '60px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '40px', alignItems: 'center' }}>
          <div>
            <h2 style={{ marginBottom: '20px', color: 'var(--accent-blue)' }}>আমাদের গল্প</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: 1.7 }}>২০২X সালে প্রতিষ্ঠিত হওয়ার পর থেকে TechNova সবসময় গ্রাহকের সন্তুষ্টিকে সর্বোচ্চ অগ্রাধিকার দিয়ে আসছে। একটি ছোট স্টার্টআপ থেকে আজ আমরা দেশের முன்னணி গ্যাজেট ও ইলেকট্রনিক্স রিটেইলার।</p>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>আমরা বিশ্বাস করি প্রযুক্তি মানুষের জীবনকে সহজ করে। তাই প্রতিনিয়ত লেটেস্ট সব স্মার্টফোন, ল্যাপটপ, অডিও ডিভাইস এবং স্মার্ট হোম সলিউশন আমরা আপনাদের জন্য নিয়ে আসছি।</p>
          </div>
          <div style={{ background: 'var(--bg-glass)', borderRadius: 'var(--radius-lg)', padding: '20px', display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
            <div style={{ flex: '1 1 calc(50% - 10px)', background: 'var(--bg-secondary)', padding: '24px', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--accent-blue)', marginBottom: '8px' }}>10K+</div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>সন্তুষ্ট গ্রাহক</div>
            </div>
            <div style={{ flex: '1 1 calc(50% - 10px)', background: 'var(--bg-secondary)', padding: '24px', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--accent-purple)', marginBottom: '8px' }}>500+</div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>অরিজিনাল প্রোডাক্ট</div>
            </div>
            <div style={{ flex: '1 1 calc(50% - 10px)', background: 'var(--bg-secondary)', padding: '24px', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--accent-green)', marginBottom: '8px' }}>99%</div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>পজিটিভ রিভিউ</div>
            </div>
            <div style={{ flex: '1 1 calc(50% - 10px)', background: 'var(--bg-secondary)', padding: '24px', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--accent-cyan)', marginBottom: '8px' }}>24/7</div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>সাপোর্ট</div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ textAlign: 'center', marginBottom: '60px' }}>
        <h2 style={{ marginBottom: '40px' }}>কেন আমাদের বেছে নিবেন?</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px' }}>
          <div className="glass-card" style={{ padding: '30px 20px' }}>
            <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(59,130,246,0.1)', color: 'var(--accent-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: '1.5rem' }}>
              <FiShield />
            </div>
            <h3 style={{ marginBottom: '12px' }}>১০০% অরিজিনাল</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.6 }}>আমরা প্রতিটি প্রোডাক্টের অথেন্টিসিটি গ্যারান্টি দিচ্ছি। কোনো ফেক বা কপি প্রোডাক্ট আমরা বিক্রি করি না।</p>
          </div>
          <div className="glass-card" style={{ padding: '30px 20px' }}>
            <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(16,185,129,0.1)', color: 'var(--accent-green)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: '1.5rem' }}>
              <FiAward />
            </div>
            <h3 style={{ marginBottom: '12px' }}>অফিসিয়াল ওয়ারেন্টি</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.6 }}>আমাদের বেশিরভাগ প্রোডাক্টেই রয়েছে ব্র্যান্ডের অফিসিয়াল ওয়ারেন্টি। বিক্রয়োত্তর সেবায় আমরা প্রতিশ্রুতিবদ্ধ।</p>
          </div>
          <div className="glass-card" style={{ padding: '30px 20px' }}>
            <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(139,92,246,0.1)', color: 'var(--accent-purple)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: '1.5rem' }}>
              <FiTruck />
            </div>
            <h3 style={{ marginBottom: '12px' }}>দ্রুততম ডেলিভারি</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.6 }}>সারা বাংলাদেশে আমরা দ্রুততম সময়ে হোম ডেলিভারি নিশ্চিত করি। ঢাকায় ২৪ ঘণ্টা এবং ঢাকার বাইরে ২-৩ দিন।</p>
          </div>
          <div className="glass-card" style={{ padding: '30px 20px' }}>
            <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(6,182,212,0.1)', color: 'var(--accent-cyan)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: '1.5rem' }}>
              <FiUsers />
            </div>
            <h3 style={{ marginBottom: '12px' }}>কাস্টমার সাপোর্ট</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.6 }}>যেকোনো সমস্যায় আমাদের ডেডিকেটেড সাপোর্ট টিম সবসময় আপনার সাহায্যে প্রস্তুত।</p>
          </div>
        </div>
      </div>

      <div className="glass-card" style={{ padding: '40px', textAlign: 'center', background: 'linear-gradient(135deg, rgba(30,30,40,0.8), rgba(40,40,55,0.8))' }}>
        <h2 style={{ marginBottom: '20px' }}>নতুন কিছু খুঁজছেন?</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '30px', maxWidth: '600px', margin: '0 auto 30px' }}>আমাদের বিশাল কালেকশন থেকে আপনার প্রয়োজনীয় গ্যাজেটটি বেছে নিন। আমরা সবসময় সেরা দামে লেটেস্ট প্রোডাক্ট নিয়ে আসি।</p>
        <Link href="/products" className="btn btn-primary btn-lg">শপিং শুরু করুন</Link>
      </div>
    </div>
  );
}
