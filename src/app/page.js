import Link from 'next/link';
import { FiArrowRight, FiTruck, FiShield, FiHeadphones, FiRefreshCw } from 'react-icons/fi';
import { getProducts, getCategories, fallbackCategories } from '@/lib/data';
import ProductCardWrapper from '@/components/ProductCardWrapper';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  let products = [];
  let categories = fallbackCategories;

  try {
    products = await getProducts();
    const cats = await getCategories();
    if (cats && cats.length > 0) categories = cats;
  } catch (e) {
    console.error('Error fetching data:', e);
  }

  const featuredProducts = products.filter(p => p.is_featured).slice(0, 4);
  const displayProducts = featuredProducts.length > 0 ? featuredProducts : products.slice(0, 4);
  const restProducts = products.slice(4);

  return (
    <>
      {/* HERO SECTION */}
      <section className="hero">
        <div className="container">
          <div className="hero-inner">
            <div>
              <div className="hero-tag">⚡ বাংলাদেশের #১ ইলেকট্রনিক্স শপ</div>
              <h1 className="hero-title">
                সেরা মানের <span>ইলেকট্রনিক</span> পণ্য এখন হাতের মুঠোয়
              </h1>
              <p className="hero-desc">
                সর্বশেষ প্রযুক্তির মোবাইল, ল্যাপটপ, হেডফোন এবং আরও অনেক কিছু — সবচেয়ে কম দামে, ১০০% অরিজিনাল গ্যারান্টি সহ।
              </p>
              <div className="hero-btns">
                <Link href="/products" className="btn btn-primary btn-lg">শপিং করুন <FiArrowRight /></Link>
                <Link href="/products?filter=sale" className="btn btn-gold btn-lg">🔥 অফার দেখুন</Link>
              </div>
              <div className="hero-stats">
                <div><div className="hero-stat-num">10K+</div><div className="hero-stat-label">সন্তুষ্ট গ্রাহক</div></div>
                <div><div className="hero-stat-num">{products.length}+</div><div className="hero-stat-label">প্রোডাক্ট</div></div>
                <div><div className="hero-stat-num">50+</div><div className="hero-stat-label">ব্র্যান্ড</div></div>
              </div>
            </div>
            <div className="hero-visual">
              <div className="hero-visual-glow"></div>
              <img src="/images/hero_3d_electronics.png" alt="Premium floating 3D tech gadgets" className="hero-product-img" />
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES BAR */}
      <section style={{ padding: '40px 0', position: 'relative', zIndex: 1 }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
            {[
              { icon: <FiTruck size={24} />, title: 'ফ্রি ডেলিভারি', desc: '৳5000+ অর্ডারে' },
              { icon: <FiShield size={24} />, title: '১০০% অরিজিনাল', desc: 'গ্যারান্টিড পণ্য' },
              { icon: <FiRefreshCw size={24} />, title: '৭ দিন রিটার্ন', desc: 'সহজ রিটার্ন পলিসি' },
              { icon: <FiHeadphones size={24} />, title: '24/7 সাপোর্ট', desc: 'যেকোনো সময় সাহায্য' },
            ].map((f, i) => (
              <div key={i} className="glass-card" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ color: 'var(--accent-cyan)', flexShrink: 0 }}>{f.icon}</div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{f.title}</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{f.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="section">
        <div className="container">
          <h2 className="section-title">ক্যাটাগরি সমূহ</h2>
          <p className="section-subtitle">আপনার পছন্দের ক্যাটাগরি থেকে প্রোডাক্ট বেছে নিন</p>
          <div className="grid-categories">
            {categories.map((cat) => (
              <Link key={cat.id} href={`/products?category=${cat.slug}`}>
                <div className="glass-card category-card">
                  <div className="category-card-icon">{cat.icon}</div>
                  <div className="category-card-name">{cat.name}</div>
                  <div className="category-card-count">{cat.product_count} পণ্য</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED PRODUCTS */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <h2 className="section-title">🔥 জনপ্রিয় প্রোডাক্ট</h2>
              <p style={{ color: 'var(--text-secondary)' }}>আমাদের সেরা বিক্রি হওয়া পণ্য সমূহ</p>
            </div>
            <Link href="/products" className="btn btn-secondary">সব দেখুন <FiArrowRight /></Link>
          </div>
          <div className="grid-products">
            {displayProducts.map((product) => (
              <ProductCardWrapper key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* SALE BANNER */}
      <section style={{ padding: '60px 0', position: 'relative', zIndex: 1 }}>
        <div className="container">
          <div className="glass-card" style={{ padding: '60px 40px', background: 'linear-gradient(135deg, rgba(245,158,11,0.1), rgba(249,115,22,0.1))', borderColor: 'rgba(245,158,11,0.3)', textAlign: 'center' }}>
            <div style={{ fontSize: '0.9rem', color: 'var(--accent-gold)', fontWeight: 600, marginBottom: '12px' }}>⏰ সীমিত সময়ের অফার</div>
            <h2 style={{ fontSize: '2.5rem', marginBottom: '12px', fontFamily: 'Outfit, sans-serif' }}>সর্বোচ্চ <span style={{ color: 'var(--accent-gold)' }}>20% ছাড়</span> পান</h2>
            <p style={{ color: 'var(--text-secondary)', maxWidth: '500px', margin: '0 auto 28px' }}>সেরা ব্র্যান্ডের ইলেকট্রনিক পণ্যে বিশেষ ছাড়। অফার শেষ হওয়ার আগেই অর্ডার করুন!</p>
            <Link href="/products?filter=sale" className="btn btn-gold btn-lg">অফার দেখুন <FiArrowRight /></Link>
          </div>
        </div>
      </section>

      {/* MORE PRODUCTS */}
      {restProducts.length > 0 && (
        <section className="section" style={{ paddingTop: 0 }}>
          <div className="container">
            <h2 className="section-title">নতুন পণ্য সমূহ</h2>
            <p className="section-subtitle">সর্বশেষ যোগ হওয়া পণ্য দেখুন</p>
            <div className="grid-products">
              {restProducts.map((product) => (
                <ProductCardWrapper key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
