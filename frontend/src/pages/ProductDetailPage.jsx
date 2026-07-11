import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ShoppingCart, ArrowLeft, Truck, ShieldCheck, Package } from 'lucide-react';
import { getProductBySlug } from '../api';
import LoadingSpinner from '../components/ui/LoadingSpinner';

export default function ProductDetailPage({ onAddToCart }) {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (slug) loadProduct();
  }, [slug]);

  const loadProduct = async () => {
    setLoading(true);
    try {
      const data = await getProductBySlug(slug);
      setProduct(data);
    } catch {
      setProduct(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="container page-content"><LoadingSpinner /></div>;
  if (!product) return (
    <div className="container page-content">
      <div className="empty-state">
        <h3>Ürün bulunamadı</h3>
        <p>Bu ürün artık mevcut değil veya kaldırılmış olabilir.</p>
        <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => navigate('/')}>
          Ana Sayfaya Dön
        </button>
      </div>
    </div>
  );

  const imgSrc = product.images?.[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800';

  return (
    <div className="container page-content">
      <button
        className="btn btn-ghost btn-sm"
        style={{ marginBottom: 24 }}
        onClick={() => navigate('/')}
      >
        <ArrowLeft size={16} /> Vitrineye Dön
      </button>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48, alignItems: 'start' }}>
        {/* Image */}
        <div style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-xl)',
          overflow: 'hidden',
          aspectRatio: '1/1'
        }}>
          <img src={imgSrc} alt={product.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>

        {/* Info */}
        <div>
          <h1 style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 28,
            fontWeight: 700,
            lineHeight: 1.3,
            marginBottom: 16
          }}>
            {product.title}
          </h1>

          <div style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 36,
            fontWeight: 800,
            color: 'var(--primary)',
            marginBottom: 8
          }}>
            {product.price.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL
          </div>

          <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 24 }}>
            Stok Durumu: <strong style={{ color: product.stock > 0 ? 'var(--success)' : 'var(--danger)' }}>
              {product.stock > 0 ? `${product.stock} adet mevcut` : 'Tükendi'}
            </strong>
          </div>

          <p style={{ fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 32 }}>
            {product.description}
          </p>

          <button
            className="btn btn-primary btn-lg"
            style={{ width: '100%', marginBottom: 16 }}
            onClick={() => onAddToCart(product.id)}
            disabled={product.stock <= 0}
          >
            <ShoppingCart size={20} /> Sepete Ekle
          </button>

          {/* Trust Items */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
            padding: 20,
            background: 'var(--bg)',
            borderRadius: 'var(--radius-lg)',
            marginTop: 16
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: 'var(--text-secondary)' }}>
              <Truck size={18} style={{ color: 'var(--primary)' }} />
              <span><strong>Aras Kargo</strong> ile güvenli teslimat</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: 'var(--text-secondary)' }}>
              <ShieldCheck size={18} style={{ color: 'var(--primary)' }} />
              <span>Güvenli ödeme sistemi</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: 'var(--text-secondary)' }}>
              <Package size={18} style={{ color: 'var(--primary)' }} />
              <span>Kapınızdan teslim alınır</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
