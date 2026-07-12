import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ShoppingCart, Heart, Truck, ShieldCheck, ChevronRight,
  Info, Award, MessageSquare, Zap, Clock, ThumbsUp, Sparkles, Smile, RefreshCw
} from 'lucide-react';
import { getProductBySlug, getProducts } from '../api';
import LoadingSpinner from '../components/ui/LoadingSpinner';

export default function ProductDetailPage({ onAddToCart, favorites = [], onToggleFavorite }) {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState('');
  const [qty, setQty] = useState(1);
  const [activeTab, setActiveTab] = useState('desc');
  const [recommendations, setRecommendations] = useState([]);

  useEffect(() => {
    if (slug) {
      loadProductAndRecs();
    }
  }, [slug]);

  const loadProductAndRecs = async () => {
    setLoading(true);
    try {
      const data = await getProductBySlug(slug);
      setProduct(data);
      if (data) {
        setActiveImage(data.coverImage || data.images?.[0] || '');
        
        // Fetch recommendations
        const recData = await getProducts(1, 10);
        const filtered = (recData.items || recData || []).filter(p => p.id !== data.id);
        setRecommendations(filtered.slice(0, 4));
      }
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

  const mainImageToShow = activeImage || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800';

  const handleBuyNow = async () => {
    const success = await onAddToCart(product.id, qty);
    if (success) {
      navigate('/checkout');
    }
  };

  return (
    <div className="product-detail-v2-page">
      <div className="container">
        {/* 1. Breadcrumbs */}
        <div className="breadcrumbs">
          <Link to="/">Ana Sayfa</Link>
          <ChevronRight size={12} />
          <Link to={`/products?category=${encodeURIComponent(product.categoryName || 'Genel')}`}>
            {product.categoryName || 'Genel'}
          </Link>
          <ChevronRight size={12} />
          <span className="active">{product.title}</span>
        </div>

        {/* 2. Main Detail Area */}
        <div className="product-detail-v2-grid">
          {/* Left Column: Image Gallery (Vertical thumbnails + Main Image) */}
          <div className="product-gallery-v2">
            {/* Vertical thumbnails */}
            {product.images?.length > 0 && (
              <div className="gallery-v2-thumbnails">
                {product.images.map((imgUrl, index) => {
                  const isActive = activeImage === imgUrl;
                  return (
                    <div
                      key={index}
                      className={`thumbnail-v2-item ${isActive ? 'active' : ''}`}
                      onMouseEnter={() => setActiveImage(imgUrl)}
                      onClick={() => setActiveImage(imgUrl)}
                    >
                      <img src={imgUrl} alt="" />
                    </div>
                  );
                })}
              </div>
            )}

            {/* Main large image */}
            <div className="gallery-v2-main">
              <span className="badge-kargo-bedava">
                <Truck size={14} /> Kargo Bedava
              </span>
              <button 
                className="gallery-fav-btn" 
                title={product && favorites.includes(product.id) ? "Favorilerimden Çıkar" : "Favorilere Ekle"} 
                onClick={() => product && onToggleFavorite?.(product.id)}
              >
                <Heart size={18} style={{ 
                  color: product && favorites.includes(product.id) ? '#dc2626' : undefined, 
                  fill: product && favorites.includes(product.id) ? '#dc2626' : 'transparent' 
                }} />
              </button>
              <img src={mainImageToShow} alt={product.title} />
              
              <div className="zoom-indicator">🔍 Büyüt</div>
            </div>
          </div>

          {/* Middle Column: Product details & Add to Cart */}
          <div className="product-info-v2">
            <h1 className="product-v2-title">{product.title}</h1>
            
            <div className="product-v2-seller-row">
              <span 
                className="seller-name-link" 
                onClick={() => navigate(`/store/${product.sellerId}`)}
                style={{ cursor: 'pointer' }}
              >
                {product.sellerName || 'Mağaza'}
              </span>
              <span className="store-rating-badge">9.2</span>
              <span className="review-count">(132 değerlendirme)</span>
            </div>

            {/* Pricing */}
            <div className="product-v2-price-container">
              <div className="price-row">
                <span className="v2-actual-price">
                  {product.price.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL
                </span>
                <span className="v2-discount-badge">%20 indirim</span>
              </div>
              <div className="v2-previous-price">
                {(product.price * 1.25).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL
              </div>
            </div>

            {/* Best price guarantee */}
            <div className="best-price-badge">
              <Info size={14} />
              <span>En uygun fiyat garantisi</span>
            </div>

            {/* Fast Tags */}
            <div className="fast-tags-grid">
              <div className="fast-tag-item">
                <Clock size={16} />
                <div>
                  <strong>Hızlı Gönderi</strong>
                  <span>1-2 iş günü</span>
                </div>
              </div>
              <div className="fast-tag-item">
                <RefreshCw size={16} />
                <div>
                  <strong>Kolay İade</strong>
                  <span>14 gün içinde</span>
                </div>
              </div>
              <div className="fast-tag-item">
                <Truck size={16} />
                <div>
                  <strong>Aras Kargo</strong>
                  <span>ile güvenli teslimat</span>
                </div>
              </div>
              <div className="fast-tag-item">
                <Zap size={16} />
                <div>
                  <strong>Paketleme</strong>
                  <span>Özenli paketleme</span>
                </div>
              </div>
            </div>


            {/* Quantity & Buy CTAs */}
            <div className="product-v2-cta-row">
              <div className="qty-selector-v2">
                <button onClick={() => setQty(prev => Math.max(1, prev - 1))}>−</button>
                <span>{qty}</span>
                <button onClick={() => setQty(prev => prev + 1)}>+</button>
              </div>

              <button 
                className="btn btn-primary btn-lg btn-red-primary" 
                style={{ flex: 1.5 }}
                onClick={() => {
                  onAddToCart(product.id, qty);
                }}
              >
                Sepete Ekle
              </button>

              <button className="btn btn-outline-primary btn-lg btn-buy-now" style={{ flex: 1 }} onClick={handleBuyNow}>
                Hemen Al
              </button>
            </div>

            <div className="social-alert-fire">
              🔥 Bu ürün şu anda <strong>28 kişinin</strong> sepetinde!
            </div>
          </div>

          {/* Right Column: Seller info card */}
          <div className="product-seller-sidebar-card">
            <div className="seller-profile-row">
              <div className="seller-avatar-circle">
                {product.sellerName ? (product.sellerName.split(' ').length >= 2 ? (product.sellerName.split(' ')[0][0] + product.sellerName.split(' ')[1][0]).toUpperCase() : product.sellerName.slice(0, 2).toUpperCase()) : 'M'}
              </div>
              <div className="seller-info-details">
                <span className="seller-title-label">Mağaza</span>
                <h4>{product.sellerName || 'Mağaza'}</h4>
                <span className="rating-mini-badge">9.2</span>
              </div>
            </div>

            <button 
              className="btn btn-secondary btn-full" 
              style={{ margin: '16px 0' }}
              onClick={() => navigate(`/store/${product.sellerId}`)}
            >
              Mağazaya Git <ChevronRight size={14} />
            </button>

            <div className="seller-checklist">
              <div className="check-item"><ThumbsUp size={16} /> %98 Başarılı Satıcı</div>
              <div className="check-item"><MessageSquare size={16} /> Hızlı Yanıt (Ortalama 1 saat)</div>
              <div className="check-item"><Award size={16} /> Güvenli Alışveriş (256 bit SSL)</div>
              <div className="check-item"><Truck size={16} /> Aras ile Entegre Lojistik</div>
            </div>
          </div>
        </div>

        {/* 3. Bottom Description & Tabs / Trust Badges Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 40, marginTop: 56 }}>
          {/* Tabs Section */}
          <div>
            <div className="product-tabs-header">
              <div className={`tab-item ${activeTab === 'desc' ? 'active' : ''}`} onClick={() => setActiveTab('desc')}>Açıklama</div>
              <div className={`tab-item ${activeTab === 'shipping' ? 'active' : ''}`} onClick={() => setActiveTab('shipping')}>Kargo & Teslimat</div>
              <div className={`tab-item ${activeTab === 'return' ? 'active' : ''}`} onClick={() => setActiveTab('return')}>İade Koşulları</div>
              <div className={`tab-item ${activeTab === 'reviews' ? 'active' : ''}`} onClick={() => setActiveTab('reviews')}>Yorumlar (132)</div>
            </div>
            
            <div className="product-tab-content">
              {activeTab === 'desc' && (
                <p style={{ lineHeight: 1.8, color: 'var(--text-secondary)' }}>
                  {product.description || 'Bu ürün için henüz detaylı bir açıklama girilmemiştir.'}
                </p>
              )}

              {activeTab === 'shipping' && (
                <p style={{ lineHeight: 1.8, color: 'var(--text-secondary)' }}>
                  Siparişiniz Aras Kargo entegrasyonuyla doğrudan satıcı tarafından hazırlanır ve en geç 48 saat içerisinde kargolanır. Siparişiniz kargoya verildikten sonra kargo takip kodunuz SMS ile bildirilecektir.
                </p>
              )}

              {activeTab === 'return' && (
                <p style={{ lineHeight: 1.8, color: 'var(--text-secondary)' }}>
                  Aras İşletmem güvencesiyle satın aldığınız ürünleri teslim aldığınız tarihten itibaren 14 gün içerisinde ücretsiz olarak iade edebilirsiniz. Kırık veya hasarlı gelen ürünler için teslimat sırasında tutanak tutulması rica olunur.
                </p>
              )}

              {activeTab === 'reviews' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div style={{ background: 'var(--bg)', padding: 16, borderRadius: 'var(--radius-md)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <strong>Ahmet K.</strong>
                      <span style={{ color: 'var(--warning)', fontWeight: 700 }}>★ ★ ★ ★ ★</span>
                    </div>
                    <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Paketleme harikaydı, kupa beklediğimden de güzel geldi. Satıcıya ve Aras Kargo'ya teşekkürler.</p>
                  </div>
                  <div style={{ background: 'var(--bg)', padding: 16, borderRadius: 'var(--radius-md)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <strong>Merve T.</strong>
                      <span style={{ color: 'var(--warning)', fontWeight: 700 }}>★ ★ ★ ★ ☆</span>
                    </div>
                    <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>El yapımı olduğu için ufak tefek pürüzleri var ama çok doğal duruyor, beğendim.</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Trust Badges Widget */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 20, background: 'var(--surface)', display: 'flex', alignItems: 'center', gap: 14 }}>
              <div className="support-icon-circle" style={{ width: 44, height: 44, borderRadius: '50%' }}><ShieldCheck size={20} /></div>
              <div>
                <h4 style={{ fontSize: 13, fontWeight: 700 }}>Güvenli Alışveriş</h4>
                <p style={{ fontSize: 11, color: 'var(--text-secondary)' }}>256 bit SSL ile koruma</p>
              </div>
            </div>
            <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 20, background: 'var(--surface)', display: 'flex', alignItems: 'center', gap: 14 }}>
              <div className="support-icon-circle" style={{ width: 44, height: 44, borderRadius: '50%' }}><RefreshCw size={20} /></div>
              <div>
                <h4 style={{ fontSize: 13, fontWeight: 700 }}>Kolay İade</h4>
                <p style={{ fontSize: 11, color: 'var(--text-secondary)' }}>14 gün içinde kolay iade</p>
              </div>
            </div>
            <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 20, background: 'var(--surface)', display: 'flex', alignItems: 'center', gap: 14 }}>
              <div className="support-icon-circle" style={{ width: 44, height: 44, borderRadius: '50%' }}><Smile size={20} /></div>
              <div>
                <h4 style={{ fontSize: 13, fontWeight: 700 }}>7/24 Destek</h4>
                <p style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Her zaman yanınızdayız</p>
              </div>
            </div>
          </div>
        </div>

        {/* 4. Recommendations slider ("Bu ürünü inceleyenler bunları da beğendi") */}
        {recommendations.length > 0 && (
          <section className="recommendations-section" style={{ marginTop: 72, borderTop: '1px solid var(--border)', paddingTop: 48 }}>
            <div className="section-title-row">
              <h3 style={{ fontSize: 20, fontWeight: 800 }}>Bu ürünü inceleyenler bunları da beğendi</h3>
              <span className="see-all-link">Tümünü Gör <ChevronRight size={14} /></span>
            </div>
            <div className="stores-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', gap: 24, marginTop: 20 }}>
              {recommendations.map((recProd) => {
                const recImg = recProd.coverImage || recProd.images?.[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300';
                return (
                  <div 
                    key={recProd.id} 
                    className="card" 
                    style={{ overflow: 'hidden', cursor: 'pointer' }}
                    onClick={() => {
                      navigate(`/products/${recProd.slug}`);
                      window.scrollTo(0, 0);
                    }}
                  >
                    <div style={{ aspectRatio: '1.2/1', overflow: 'hidden', background: 'var(--bg)' }}>
                      <img src={recImg} alt={recProd.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <div className="card-body" style={{ padding: 14 }}>
                      <h4 style={{ fontSize: 13, fontWeight: 600, display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {recProd.title}
                      </h4>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                        <span style={{ fontWeight: 700, color: 'var(--primary)', fontSize: 15, fontFamily: 'var(--font-heading)' }}>
                          {recProd.price.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
