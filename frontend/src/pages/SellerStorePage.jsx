import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Star, ShieldCheck, Truck, Award, Search, Grid, List as ListIcon } from 'lucide-react';
import { getProducts } from '../api';
import ProductCard from '../components/ui/ProductCard';
import LoadingSpinner from '../components/ui/LoadingSpinner';

export default function SellerStorePage({ onAddToCart }) {
  const { sellerId } = useParams();
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [storeName, setStoreName] = useState('Lina Atölye');
  const [storeSearch, setStoreSearch] = useState('');

  useEffect(() => {
    loadStoreProducts();
  }, [sellerId]);

  const loadStoreProducts = async () => {
    setLoading(true);
    try {
      const data = await getProducts(1, 100);
      const allProds = data.items || data || [];
      // Filter products by sellerId
      const storeProds = allProds.filter(p => p.sellerId === sellerId);
      setProducts(storeProds);

      // Dynamically extract store/seller name from the first product
      if (storeProds.length > 0) {
        setStoreName(storeProds[0].sellerName || 'Lina Atölye');
      } else {
        setStoreName('Lina Atölye');
      }
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleNavigateProduct = (slug) => navigate(`/products/${slug}`);

  const filteredProducts = products.filter(p => 
    p.title.toLowerCase().includes(storeSearch.toLowerCase()) ||
    p.description?.toLowerCase().includes(storeSearch.toLowerCase())
  );

  const getStoreInitials = (name) => {
    if (!name) return 'LA';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <div className="container page-content">
      {/* 1. Store Header Banner */}
      <div 
        style={{
          background: 'linear-gradient(135deg, var(--navy) 0%, #1f2937 100%)',
          borderRadius: 'var(--radius-xl)',
          padding: '40px 32px',
          color: '#fff',
          marginBottom: 32,
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 24
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, zIndex: 2 }}>
          <div 
            style={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              background: 'var(--primary)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 28,
              fontWeight: 800,
              border: '4px solid rgba(255,255,255,0.2)',
              boxShadow: 'var(--shadow-lg)'
            }}
          >
            {getStoreInitials(storeName)}
          </div>
          <div>
            <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 28, fontWeight: 800, marginBottom: 6 }}>{storeName}</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              <span 
                style={{
                  background: 'var(--success)',
                  color: '#fff',
                  padding: '2px 8px',
                  borderRadius: 4,
                  fontSize: 12,
                  fontWeight: 700
                }}
              >
                9.2 Mağaza Puanı
              </span>
              <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>
                (132 Değerlendirme)
              </span>
              <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', gap: 4 }}>
                <ShieldCheck size={14} style={{ color: 'var(--success)' }} /> Onaylı Satıcı
              </span>
            </div>
          </div>
        </div>

        {/* Store Trust Badges */}
        <div 
          style={{
            display: 'flex',
            gap: 20,
            zIndex: 2,
            background: 'rgba(255,255,255,0.05)',
            padding: '16px 24px',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid rgba(255,255,255,0.1)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
            <Truck size={18} style={{ color: 'var(--primary)' }} />
            <div>
              <strong style={{ display: 'block', fontSize: 11 }}>Hızlı Gönderim</strong>
              <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 10 }}>24 Saatte Kargo</span>
            </div>
          </div>
          <div style={{ width: 1, background: 'rgba(255,255,255,0.1)' }}></div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
            <Award size={18} style={{ color: 'var(--success)' }} />
            <div>
              <strong style={{ display: 'block', fontSize: 11 }}>Güvenli Alışveriş</strong>
              <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 10 }}>Aras Kargo Güvencesi</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Store Search and Catalog Title Row */}
      <div 
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 24,
          borderBottom: '1px solid var(--divider)',
          paddingBottom: 16,
          flexWrap: 'wrap',
          gap: 16
        }}
      >
        <div>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 20, fontWeight: 700 }}>Mağaza Ürünleri</h2>
          <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
            {filteredProducts.length} ürün listeleniyor
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {/* Search within store */}
          <div 
            style={{
              display: 'flex',
              alignItems: 'center',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              padding: '4px 12px',
              background: 'var(--surface)',
              width: '260px'
            }}
          >
            <input
              type="text"
              placeholder="Mağazada ara..."
              value={storeSearch}
              onChange={e => setStoreSearch(e.target.value)}
              style={{
                border: 'none',
                background: 'transparent',
                outline: 'none',
                fontSize: 13,
                width: '100%',
                color: 'var(--text)'
              }}
            />
            <Search size={16} style={{ color: 'var(--text-muted)' }} />
          </div>

          {/* View Toggles */}
          <div style={{ display: 'flex', gap: 4, border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: 2, background: 'var(--bg)' }}>
            <button className="btn btn-ghost" style={{ padding: 4, borderRadius: 'var(--radius-sm)', background: 'var(--surface)' }} title="Izgara Görünümü">
              <Grid size={14} />
            </button>
            <button className="btn btn-ghost" style={{ padding: 4, borderRadius: 'var(--radius-sm)' }} title="Liste Görünümü">
              <ListIcon size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* 3. Catalog Grid */}
      {loading ? (
        <LoadingSpinner />
      ) : filteredProducts.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <h3>Ürün bulunamadı</h3>
            <p>Mağazada aradığınız kriterlere uygun ürün bulunmamaktadır.</p>
            {storeSearch && (
              <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => setStoreSearch('')}>
                Aramayı Temizle
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="product-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))' }}>
          {filteredProducts.map(product => (
            <ProductCard
              key={product.id}
              product={product}
              onAddToCart={onAddToCart}
              onNavigate={handleNavigateProduct}
            />
          ))}
        </div>
      )}
    </div>
  );
}
