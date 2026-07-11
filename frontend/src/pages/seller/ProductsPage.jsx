import { useState, useEffect } from 'react';
import { Plus, Copy, ExternalLink, Trash2, X, Upload, CheckCircle2, Image as ImageIcon } from 'lucide-react';
import { getSellerProducts, createProduct, deleteProduct, uploadProductImages } from '../../api';
import SellerSidebar from '../../components/layout/SellerSidebar';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { useToast } from '../../components/ui/Toast';

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const { addToast } = useToast();

  const [form, setForm] = useState({ title: '', description: '', price: '', stock: '' });
  const [uploadedImages, setUploadedImages] = useState([]);
  const [coverImage, setCoverImage] = useState('');
  const [uploading, setUploading] = useState(false);

  useEffect(() => { loadProducts(); }, []);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const data = await getSellerProducts();
      setProducts(data.items || []);
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append('files', files[i]);
    }

    setUploading(true);
    try {
      const result = await uploadProductImages(formData);
      const newUrls = result.urls || [];
      
      setUploadedImages(prev => {
        const updated = [...prev, ...newUrls];
        // Default cover image to the first uploaded one if not already set
        if (!coverImage && updated.length > 0) {
          setCoverImage(updated[0]);
        }
        return updated;
      });
      
      addToast('Görseller başarıyla yüklendi!');
    } catch (err) {
      addToast('Görsel yükleme başarısız: ' + err.message, 'error');
    } finally {
      setUploading(false);
    }
  };

  const removeUploadedImage = (urlToRemove) => {
    setUploadedImages(prev => {
      const updated = prev.filter(url => url !== urlToRemove);
      if (coverImage === urlToRemove) {
        setCoverImage(updated[0] || '');
      }
      return updated;
    });
  };

  const handleAdd = async (e) => {
    e.preventDefault();

    // Validation
    if (!form.title || form.title.trim().length < 3) {
      addToast('Ürün adı en az 3 karakter olmalıdır.', 'error');
      return;
    }
    if (!form.description || form.description.trim().length < 10) {
      addToast('Ürün açıklaması en az 10 karakter olmalıdır.', 'error');
      return;
    }
    const parsedPrice = parseFloat(form.price);
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      addToast('Geçersiz fiyat. Fiyat 0\'dan büyük olmalıdır.', 'error');
      return;
    }
    const parsedStock = parseInt(form.stock);
    if (isNaN(parsedStock) || parsedStock < 0) {
      addToast('Geçersiz stok. Stok en az 0 olmalıdır.', 'error');
      return;
    }
    if (uploadedImages.length === 0) {
      addToast('Lütfen en az bir ürün görseli yükleyin.', 'error');
      return;
    }
    
    try {
      await createProduct({
        title: form.title.trim(),
        description: form.description.trim(),
        price: parsedPrice,
        stock: parsedStock,
        images: uploadedImages,
        coverImage: coverImage || uploadedImages[0]
      });
      
      addToast('Ürün başarıyla eklendi!');
      setModalOpen(false);
      setForm({ title: '', description: '', price: '', stock: '' });
      setUploadedImages([]);
      setCoverImage('');
      loadProducts();
    } catch (err) {
      addToast('Ürün eklenemedi: ' + err.message, 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Bu ürünü silmek istediğinize emin misiniz?')) return;
    try {
      await deleteProduct(id);
      addToast('Ürün silindi.');
      loadProducts();
    } catch (err) {
      addToast('Silme hatası: ' + err.message, 'error');
    }
  };

  const copyLink = (slug) => {
    const link = `${window.location.origin}/products/${slug}`;
    navigator.clipboard.writeText(link);
    addToast('Link kopyalandı! 📋');
  };

  return (
    <div className="seller-layout">
      <SellerSidebar />
      <main className="seller-main">
        <div className="seller-page-header">
          <div>
            <h1 className="seller-page-title">Ürünlerim</h1>
            <p className="seller-page-subtitle">MongoDB kataloğunuzdaki ürünleri yönetin.</p>
          </div>
          <button className="btn btn-primary" onClick={() => setModalOpen(true)}>
            <Plus size={18} /> Yeni Ürün Ekle
          </button>
        </div>

        {loading ? <LoadingSpinner /> : products.length === 0 ? (
          <div className="card">
            <div className="empty-state">
              <h3>Henüz ürün eklenmemiş</h3>
              <p>İlk ürününüzü ekleyerek satışa başlayın.</p>
              <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => setModalOpen(true)}>
                <Plus size={16} /> İlk Ürünü Ekle
              </button>
            </div>
          </div>
        ) : (
          <div className="product-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))' }}>
            {products.map(product => {
              const imgSrc = product.coverImage || product.images?.[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400';
              return (
                <div key={product.id} className="card" style={{ overflow: 'hidden' }}>
                  <div style={{ aspectRatio: '4/3', overflow: 'hidden', background: 'var(--bg)', position: 'relative' }}>
                    <img src={imgSrc} alt={product.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    {product.images?.length > 1 && (
                      <span className="badge badge-received" style={{ position: 'absolute', top: 12, right: 12, border: 'none', background: 'rgba(0,0,0,0.6)', color: '#fff' }}>
                        +{product.images.length - 1} Görsel
                      </span>
                    )}
                  </div>
                  <div className="card-body">
                    <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>{product.title}</h3>
                    <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {product.description}
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                      <span style={{ fontWeight: 700, color: 'var(--primary)', fontFamily: 'var(--font-heading)', fontSize: 18 }}>
                        {product.price.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL
                      </span>
                      <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Stok: {product.stock}</span>
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', background: 'var(--bg)', padding: '4px 8px', borderRadius: 4, marginBottom: 12 }}>
                      Slug: {product.slug}
                    </div>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button className="btn btn-secondary btn-sm" style={{ flex: 1 }} onClick={() => copyLink(product.slug)}>
                        <Copy size={12} /> Linki Kopyala
                      </button>
                      <a href={`/products/${product.slug}`} target="_blank" rel="noreferrer" className="btn btn-secondary btn-sm btn-icon">
                        <ExternalLink size={14} />
                      </a>
                      <button className="btn btn-ghost btn-sm btn-icon" onClick={() => handleDelete(product.id)} title="Sil">
                        <Trash2 size={14} style={{ color: 'var(--danger)' }} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Add Product Modal */}
        {modalOpen && (
          <div className="modal-overlay">
            <div className="modal-content" style={{ maxWidth: 600 }}>
              <div className="modal-header">
                <h3 className="modal-title">Yeni Ürün Ekle</h3>
                <button className="btn btn-ghost btn-icon" onClick={() => setModalOpen(false)}>
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleAdd}>
                <div className="form-group">
                  <label className="form-label">Ürün Adı</label>
                  <input className="form-input" value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="Örn: Pamuklu T-Shirt" required />
                </div>
                <div className="form-group">
                  <label className="form-label">Açıklama</label>
                  <textarea className="form-textarea" value={form.description} onChange={e => setForm({...form, description: e.target.value})} required />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div className="form-group">
                    <label className="form-label">Fiyat (TL)</label>
                    <input className="form-input" type="number" step="0.01" value={form.price} onChange={e => setForm({...form, price: e.target.value})} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Stok</label>
                    <input className="form-input" type="number" value={form.stock} onChange={e => setForm({...form, stock: e.target.value})} required />
                  </div>
                </div>

                {/* Multiple Images Upload & Cover Selector Section */}
                <div className="form-group">
                  <label className="form-label">Ürün Görselleri</label>
                  
                  {/* File Upload Zone */}
                  <div style={{
                    border: '2px dashed var(--border)',
                    borderRadius: 'var(--radius-md)',
                    padding: '24px 16px',
                    textAlign: 'center',
                    background: 'var(--bg)',
                    cursor: 'pointer',
                    position: 'relative'
                  }}>
                    <input 
                      type="file" 
                      multiple 
                      accept="image/*" 
                      onChange={handleFileChange}
                      disabled={uploading}
                      style={{
                        position: 'absolute',
                        top: 0, left: 0, width: '100%', height: '100%',
                        opacity: 0, cursor: 'pointer'
                      }}
                    />
                    <Upload size={24} style={{ color: 'var(--text-secondary)', marginBottom: 8 }} />
                    <div style={{ fontSize: 13, fontWeight: 600 }}>Görsel Seçmek İçin Tıklayın</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>Birden fazla dosya seçebilirsiniz (JPG, PNG, WEBP)</div>
                  </div>

                  {uploading && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12, fontSize: 13, color: 'var(--text-secondary)' }}>
                      <LoadingSpinner /> Görseller yükleniyor...
                    </div>
                  )}

                  {/* Uploaded Thumbnails Grid */}
                  {uploadedImages.length > 0 && (
                    <div style={{ marginTop: 16 }}>
                      <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 8, color: 'var(--text-secondary)' }}>
                        Yüklenen Görseller (Kapak resmi seçmek için üzerine tıklayın):
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12 }}>
                        {uploadedImages.map((url, index) => {
                          const isCover = coverImage === url;
                          return (
                            <div 
                              key={index} 
                              onClick={() => setCoverImage(url)}
                              style={{
                                position: 'relative',
                                aspectRatio: '1/1',
                                borderRadius: 'var(--radius-sm)',
                                overflow: 'hidden',
                                border: isCover ? '2px solid var(--primary)' : '1px solid var(--border)',
                                cursor: 'pointer',
                                transition: 'var(--transition)',
                                background: 'var(--bg)'
                              }}
                            >
                              <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                              {isCover && (
                                <div style={{
                                  position: 'absolute', top: 4, left: 4,
                                  background: 'var(--primary)', color: '#fff',
                                  fontSize: 8, fontWeight: 800, padding: '2px 4px',
                                  borderRadius: 2, textTransform: 'uppercase',
                                  display: 'flex', alignItems: 'center', gap: 2
                                }}>
                                  <CheckCircle2 size={8} /> Kapak
                                </div>
                              )}
                              <button 
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeUploadedImage(url);
                                }}
                                style={{
                                  position: 'absolute', top: 4, right: 4,
                                  width: 18, height: 18, borderRadius: '50%',
                                  background: 'rgba(0,0,0,0.6)', border: 'none',
                                  display: 'flex', alignItems: 'center', justify: 'center',
                                  color: '#fff', fontSize: 10, cursor: 'pointer'
                                }}
                              >
                                ✕
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 16 }}>
                  <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)}>İptal</button>
                  <button type="submit" className="btn btn-primary" disabled={uploading}>Ürünü Kaydet</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
