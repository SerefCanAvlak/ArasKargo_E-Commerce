import { useState, useEffect } from 'react';
import { Plus, Copy, ExternalLink, Trash2, X } from 'lucide-react';
import { getSellerProducts, createProduct, deleteProduct } from '../../api';
import SellerSidebar from '../../components/layout/SellerSidebar';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { useToast } from '../../components/ui/Toast';

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const { addToast } = useToast();

  const [form, setForm] = useState({
    title: '', description: '', price: '', stock: '',
    imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=60'
  });

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

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      await createProduct({
        title: form.title,
        description: form.description,
        price: parseFloat(form.price),
        stock: parseInt(form.stock),
        images: [form.imageUrl]
      });
      addToast('Ürün başarıyla eklendi!');
      setModalOpen(false);
      setForm({ title: '', description: '', price: '', stock: '', imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=60' });
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
              const imgSrc = product.images?.[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400';
              return (
                <div key={product.id} className="card" style={{ overflow: 'hidden' }}>
                  <div style={{ aspectRatio: '4/3', overflow: 'hidden', background: 'var(--bg)' }}>
                    <img src={imgSrc} alt={product.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
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
            <div className="modal-content">
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
                <div className="form-group">
                  <label className="form-label">Görsel URL</label>
                  <input className="form-input" value={form.imageUrl} onChange={e => setForm({...form, imageUrl: e.target.value})} required />
                  {form.imageUrl && (
                    <div style={{ marginTop: 8, borderRadius: 'var(--radius-md)', overflow: 'hidden', height: 120, background: 'var(--bg)' }}>
                      <img src={form.imageUrl} alt="Önizleme" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  )}
                </div>
                <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 8 }}>
                  <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)}>İptal</button>
                  <button type="submit" className="btn btn-primary">Ürünü Kaydet</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
