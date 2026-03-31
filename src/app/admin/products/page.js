'use client';

import { useState, useEffect, useRef } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiX, FiUploadCloud } from 'react-icons/fi';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/AuthProvider';

export default function AdminProductsPage() {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Form State
  const [formLoading, setFormLoading] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [editId, setEditId] = useState(null);
  const [existingImages, setExistingImages] = useState(null);
  const fileInputRef = useRef(null);
  const [formData, setFormData] = useState({
    name: '',
    category_id: '',
    description: '',
    price: '',
    stock: '',
  });

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select(`*, categories(name)`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data } = await supabase.from('categories').select('id, name');
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.price || !formData.category_id) return alert('আবশ্যক ঘরগুলো পূরণ করুন');
    
    setFormLoading(true);
    try {
      let imageUrl = existingImages ? existingImages[0] : null;

      // Upload new Image if selected
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const filePath = `${fileName}`;
        
        const { error: uploadError } = await supabase.storage
          .from('products')
          .upload(filePath, imageFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('products')
          .getPublicUrl(filePath);
          
        imageUrl = publicUrl;
      }

      const imagesArray = imageUrl ? [imageUrl] : ['https://via.placeholder.com/300'];
      
      const payload = {
        name: formData.name,
        category_id: formData.category_id,
        description: formData.description,
        price: Number(formData.price),
        stock: Number(formData.stock || 0),
        images: imagesArray,
      };

      if (editId) {
        // Update existing product
        const { error: updateError } = await supabase
          .from('products')
          .update(payload)
          .eq('id', editId);
        if (updateError) throw updateError;
        alert('প্রোডাক্ট সফলভাবে আপডেট হয়েছে!');
      } else {
        // Insert new product
        const { error: insertError } = await supabase
          .from('products')
          .insert(payload);
        if (insertError) throw insertError;
        alert('প্রোডাক্ট সফলভাবে আপলোড হয়েছে!');
      }

      closeModal();
      fetchProducts();

    } catch (error) {
      console.error('Submission Error:', error);
      alert('প্রোডাক্ট সেভ করতে সমস্যা হয়েছে: ' + error.message);
    } finally {
      setFormLoading(false);
    }
  };

  const openAddModal = () => {
    setEditId(null);
    setFormData({ name: '', category_id: '', description: '', price: '', stock: '' });
    setImageFile(null);
    setImagePreview(null);
    setExistingImages(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditId(null);
    setFormData({ name: '', category_id: '', description: '', price: '', stock: '' });
    setImageFile(null);
    setImagePreview(null);
    setExistingImages(null);
  };

  const handleEdit = (product) => {
    setEditId(product.id);
    setFormData({
      name: product.name,
      category_id: product.category_id,
      description: product.description || '',
      price: product.price,
      stock: product.stock,
    });
    setExistingImages(product.images);
    setImagePreview(product.images?.[0] || null);
    setIsModalOpen(true);
  };

  const handleDelete = async (id, images) => {
    if (!window.confirm('আপনি কি নিশ্চিত যে এই প্রোডাক্ট ডিলিট করতে চান?')) return;
    try {
      // Delete image from storage if it exists and is from our bucket
      if (images && images.length > 0 && images[0].includes('supabase.co')) {
        // Extract filename from URL (assumes standard Supabase URL format)
        const parts = images[0].split('/');
        const fileName = parts[parts.length - 1];
        if (fileName) {
          await supabase.storage.from('products').remove([fileName]);
        }
      }

      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw error;
      setProducts(products.filter(p => p.id !== id));
    } catch (error) {
      console.error(error);
      alert('ডিলিট করতে সমস্যা হয়েছে।');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', marginBottom: '8px' }}>প্রোডাক্ট ম্যানেজমেন্ট</h1>
          <p style={{ color: 'var(--text-muted)' }}>সব প্রোডাক্ট দেখুন এবং স্টোরেজ থেকে নতুন ছবি আপলোড করুন</p>
        </div>
        <button className="btn btn-primary" onClick={openAddModal} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FiPlus /> নতুন প্রোডাক্ট
        </button>
      </div>

      <div className="glass-card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div style={{ position: 'relative', width: '300px' }}>
            <FiSearch style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input type="text" className="input" placeholder="প্রোডাক্ট খুঁজুন..." style={{ paddingLeft: '40px', marginBottom: 0 }} />
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>লোড হচ্ছে...</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '12px 16px', fontWeight: 500 }}>ছবি</th>
                  <th style={{ padding: '12px 16px', fontWeight: 500 }}>নাম</th>
                  <th style={{ padding: '12px 16px', fontWeight: 500 }}>ক্যাটাগরি</th>
                  <th style={{ padding: '12px 16px', fontWeight: 500 }}>দাম</th>
                  <th style={{ padding: '12px 16px', fontWeight: 500 }}>স্টক</th>
                  <th style={{ padding: '12px 16px', fontWeight: 500, textAlign: 'right' }}>অ্যাকশন</th>
                </tr>
              </thead>
              <tbody>
                {products.length === 0 ? (
                  <tr><td colSpan="6" style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>কোনো প্রোডাক্ট পাওয়া যায়নি</td></tr>
                ) : (
                  products.map(product => (
                    <tr key={product.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ width: '40px', height: '40px', background: 'var(--bg-primary)', borderRadius: 'var(--radius-sm)', padding: '2px' }}>
                          <img src={product.images?.[0] || 'https://via.placeholder.com/40'} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '4px' }} />
                        </div>
                      </td>
                      <td style={{ padding: '12px 16px', fontWeight: 500 }}>{product.name}</td>
                      <td style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>{product.categories?.name || '-'}</td>
                      <td style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--accent-cyan)' }}>৳{product.price}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', background: product.stock > 0 ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', color: product.stock > 0 ? 'var(--accent-green)' : 'var(--accent-red)' }}>
                          {product.stock > 0 ? `${product.stock} টি` : 'আউট অফ স্টক'}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                          <button onClick={() => handleEdit(product)} style={{ background: 'rgba(56,189,248,0.1)', color: 'var(--accent-blue)', border: 'none', width: '32px', height: '32px', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: '0.2s' }}><FiEdit2 size={14} /></button>
                          <button onClick={() => handleDelete(product.id, product.images)} style={{ background: 'rgba(239,68,68,0.1)', color: 'var(--accent-red)', border: 'none', width: '32px', height: '32px', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: '0.2s' }}><FiTrash2 size={14} /></button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* --- ADD PRODUCT MODAL --- */}
      {isModalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(5px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div className="glass-card" style={{ width: '100%', maxWidth: '600px', padding: '32px', position: 'relative', maxHeight: '90vh', overflowY: 'auto' }}>
            <button onClick={closeModal} style={{ position: 'absolute', right: '24px', top: '24px', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.2rem' }}>
              <FiX />
            </button>
            <h2 style={{ marginBottom: '24px' }}>{editId ? 'প্রোডাক্ট আপডেট করুন' : 'নতুন প্রোডাক্ট যোগ করুন'}</h2>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Image Upload Area */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>প্রোডাক্ট ছবি আপলোড</label>
                <div 
                  onClick={() => fileInputRef.current.click()}
                  style={{ 
                    border: '2px dashed var(--border-color)', borderRadius: 'var(--radius-md)', padding: '32px', 
                    textAlign: 'center', cursor: 'pointer', transition: 'var(--transition)', background: 'var(--bg-glass)'
                  }}>
                  {imagePreview ? (
                    <img src={imagePreview} alt="Preview" style={{ maxHeight: '150px', objectFit: 'contain', margin: '0 auto' }} />
                  ) : (
                    <div style={{ color: 'var(--text-muted)' }}>
                      <FiUploadCloud size={40} style={{ marginBottom: '8px', color: 'var(--accent-blue)' }} />
                      <p>ক্লিক করে ছবি নির্বাচন করুন</p>
                    </div>
                  )}
                </div>
                <input type="file" ref={fileInputRef} onChange={handleImageChange} accept="image/*" style={{ display: 'none' }} />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>প্রোডাক্টের নাম *</label>
                <input type="text" name="name" className="input" value={formData.name} onChange={handleInputChange} required />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>ক্যাটাগরি *</label>
                  <select name="category_id" className="input" value={formData.category_id} onChange={handleInputChange} required>
                    <option value="">নির্বাচন করুন</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>দাম (৳) *</label>
                  <input type="number" name="price" className="input" value={formData.price} onChange={handleInputChange} required />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>স্টক পরিমাণ</label>
                  <input type="number" name="stock" className="input" value={formData.stock} onChange={handleInputChange} />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '8px' }}>
                <label>বিস্তারিত বিবরণ</label>
                <textarea name="description" className="input" rows="3" value={formData.description} onChange={handleInputChange}></textarea>
              </div>

              <button type="submit" className="btn btn-primary btn-lg" disabled={formLoading}>
                {formLoading ? 'সেভ হচ্ছে...' : (editId ? 'আপডেট করুন' : 'প্রোডাক্ট সেভ করুন')}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
