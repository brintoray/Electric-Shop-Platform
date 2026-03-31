'use client';

export default function AdminSettingsPage() {
  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.8rem', marginBottom: '8px' }}>সিস্টেম সেটিংস</h1>
        <p style={{ color: 'var(--text-muted)' }}>ওয়েবসাইট এবং স্টোর কনফিগারেশন</p>
      </div>

      <div className="glass-card" style={{ padding: '32px', maxWidth: '800px' }}>
        <h3 style={{ marginBottom: '24px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>সাধারণ সেটিংস</h3>
        
        <form onSubmit={e => e.preventDefault()}>
          <div className="form-group">
            <label>ওয়েবসাইটের নাম</label>
            <input type="text" className="input" defaultValue="TechNova" />
          </div>

          <div className="form-group">
            <label>সাপোর্ট ইমেইল</label>
            <input type="email" className="input" defaultValue="support@technova.com.bd" />
          </div>

          <div className="form-group">
            <label>যোগাযোগের নম্বর</label>
            <input type="tel" className="input" defaultValue="+880 1234-567890" />
          </div>

          <div className="form-group" style={{ marginBottom: '32px' }}>
            <label>অফিসের ঠিকানা</label>
            <textarea className="input" rows="3" defaultValue="মিরপুর, ঢাকা, বাংলাদেশ"></textarea>
          </div>

          <h3 style={{ marginBottom: '24px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>ডেলিভারি চার্জ</h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '32px' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>ঢাকার ভেতরে (৳)</label>
              <input type="number" className="input" defaultValue="70" />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>ঢাকার বাইরে (৳)</label>
              <input type="number" className="input" defaultValue="120" />
            </div>
          </div>

          <button className="btn btn-primary">সেটিংস সেভ করুন</button>
        </form>
      </div>
    </div>
  );
}
