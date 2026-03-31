'use client';

import { useState, useEffect } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiX } from 'react-icons/fi';
import { supabase } from '@/lib/supabase';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    icon: '📦',
    description: ''
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setFormData({ name: '', slug: '', icon: '📦', description: '' });
    setEditingId(null);
    setIsModalOpen(true);
  };

  const openEditModal = (cat) => {
    setFormData({
      name: cat.name || '',
      slug: cat.slug || '',
      icon: cat.icon || '📦',
      description: cat.description || ''
    });
    setEditingId(cat.id);
    setIsModalOpen(true);
  };

  const handleNameChange = (e) => {
    const val = e.target.value;
    // Auto-generate slug when name changes
    setFormData({
      ...formData,
      name: val,
      slug: val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingId) {
        // Update
        const { error } = await supabase
          .from('categories')
          .update(formData)
          .eq('id', editingId);
        if (error) throw error;
      } else {
        // Create
        const { error } = await supabase
          .from('categories')
          .insert([formData]);
        if (error) throw error;
      }
      
      setIsModalOpen(false);
      fetchCategories();
    } catch (error) {
      console.error('Error saving category:', error);
      alert('ক্যাটাগরি সেভ করতে সমস্যা হয়েছে।');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`আপনি কি "${name}" ক্যাটাগরিটি ডিলিট করতে চান?`)) return;
    
    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      setCategories(categories.filter(c => c.id !== id));
    } catch (error) {
      console.error('Error deleting category:', error);
      alert('ডিলিট করতে সমস্যা হয়েছে। ক্যাটাগরিতে কোনো প্রোডাক্ট থাকলে আগে তা মুছে ফেলুন।');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', marginBottom: '8px' }}>ক্যাটাগরি ম্যানেজমেন্ট</h1>
          <p style={{ color: 'var(--text-muted)' }}>প্রোডাক্ট ক্যাটাগরিগুলো পরিচালনা করুন</p>
        </div>
        <button onClick={openAddModal} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FiPlus /> নতুন ক্যাটাগরি
        </button>
      </div>

      <div className="glass-card" style={{ padding: '24px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>লোড হচ্ছে...</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '12px 16px', fontWeight: 500, width: '60px' }}>আইকন</th>
                  <th style={{ padding: '12px 16px', fontWeight: 500 }}>ক্যাটাগরির নাম</th>
                  <th style={{ padding: '12px 16px', fontWeight: 500 }}>স্নাগ (URL)</th>
                  <th style={{ padding: '12px 16px', fontWeight: 500 }}>বিবরণ</th>
                  <th style={{ padding: '12px 16px', fontWeight: 500, textAlign: 'right' }}>অ্যাকশন</th>
                </tr>
              </thead>
              <tbody>
                {categories.map(cat => (
                  <tr key={cat.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '12px 16px', fontSize: '1.5rem', textAlign: 'center' }}>{cat.icon || '📦'}</td>
                    <td style={{ padding: '12px 16px', fontWeight: 600 }}>{cat.name}</td>
                    <td style={{ padding: '12px 16px', color: 'var(--text-secondary)', fontFamily: 'monospace' }}>{cat.slug}</td>
                    <td style={{ padding: '12px 16px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>{cat.description || '-'}</td>
                    <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        <button onClick={() => openEditModal(cat)} style={{ background: 'rgba(59,130,246,0.1)', color: 'var(--accent-blue)', border: 'none', padding: '6px 12px', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '0.85rem', transition: '0.2s' }} className="hover-glow">
                          <FiEdit2 /> এডিট
                        </button>
                        <button onClick={() => handleDelete(cat.id, cat.name)} style={{ background: 'rgba(239,68,68,0.1)', color: 'var(--accent-red)', border: 'none', padding: '6px 12px', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '0.85rem', transition: '0.2s' }} className="hover-glow">
                          <FiTrash2 /> ডিলিট
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {categories.length === 0 && (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>কোনো ক্যাটাগরি পাওয়া যায়নি</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
          background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(5px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px'
        }}>
          <div className="glass-card" style={{ 
            width: '100%', maxWidth: '500px', 
            background: 'var(--bg-glass)', border: '1px solid var(--border-color)', 
            borderRadius: 'var(--radius-lg)' 
          }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: '1.2rem' }}>{editingId ? 'ক্যাটাগরি এডিট করুন' : 'নতুন ক্যাটাগরি যুক্ত করুন'}</h2>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <FiX size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
              <div className="form-group">
                <label>ক্যাটাগরির নাম</label>
                <input type="text" className="input" value={formData.name} onChange={handleNameChange} required placeholder="যেমন: Smartphones" />
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>স্নাগ (URL Identifier)</label>
                  <input type="text" className="input" value={formData.slug} onChange={e => setFormData({...formData, slug: e.target.value})} required placeholder="smartphones" />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>আইকন (ইমোজি)</label>
                  <input type="text" className="input" value={formData.icon} onChange={e => setFormData({...formData, icon: e.target.value})} placeholder="📱" />
                </div>
              </div>
              
              <div className="form-group" style={{ marginBottom: '32px' }}>
                <label>বিবরণ</label>
                <textarea className="input" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="ক্যাটাগরির বিস্তারিত (ঐচ্ছিক)" rows="3"></textarea>
              </div>
              
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary">বাতিল</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'সংরক্ষণ হচ্ছে...' : 'ক্যাটাগরি সংরক্ষণ করুন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
