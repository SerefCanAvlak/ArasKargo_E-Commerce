import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Truck, ShieldCheck, CreditCard, Zap, ArrowRight,
  ShoppingBag, Sparkles, Smile, Star, Mail, CheckCircle2,
  ChevronRight, Heart, Gift
} from 'lucide-react';
import { getProducts } from '../api';
import ProductCard from '../components/ui/ProductCard';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { useToast } from '../components/ui/Toast';

export default function HomePage({ searchQuery, onSearchChange, onAddToCart }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [emailSub, setEmailSub] = useState('');

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const data = await getProducts(1, 10); // limit to 10 products
      setProducts(data.items || data || []);
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!emailSub) return;
    addToast('Bültene başarıyla kayıt oldunuz! 📬');
    setEmailSub('');
  };

  const filtered = searchQuery
    ? products.filter(p =>
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.categoryName?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : products;

  const handleNavigate = (slug) => navigate(`/products/${slug}`);

  // Sample static categories matching screenshot
  const categoriesList = [
    { name: 'Kadın', icon: '👜', query: 'Kadın' },
    { name: 'Erkek', icon: '👕', query: 'Erkek' },
    { name: 'Ev & Yaşam', icon: '🛋️', query: 'Ev' },
    { name: 'Kozmetik', icon: '🧴', query: 'Kozmetik' },
    { name: 'Elektronik', icon: '🎧', query: 'Elektronik' },
    { name: 'Spor & Outdoor', icon: '🏋️', query: 'Spor' },
    { name: 'Hobi & Oyuncak', icon: '🧸', query: 'Hobi' },
    { name: 'Kitap & Kırtasiye', icon: '📚', query: 'Kitap' },
    { name: 'Fırsatlar', icon: '🏷️', query: 'Fırsat' }
  ];

  // Sample popular stores from screenshot
  const popularStores = [
    { name: 'Lina Atölye', desc: 'El yapımı ürünler', rating: 4.9, img: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=200&auto=format&fit=crop&q=60' },
    { name: 'Bella Butik', desc: 'Kadın giyim', rating: 4.8, img: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=200&auto=format&fit=crop&q=60' },
    { name: 'Minimal Home', desc: 'Ev dekorasyon', rating: 4.9, img: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=200&auto=format&fit=crop&q=60' },
    { name: 'Craftoria', desc: 'Hobi & el işi', rating: 4.8, img: 'https://images.unsplash.com/photo-1528698827591-e19ccd7bc23d?w=200&auto=format&fit=crop&q=60' },
    { name: 'Doğa Defteri', desc: 'Sürdürülebilir yaşam', rating: 4.9, img: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=200&auto=format&fit=crop&q=60' },
    { name: 'TechPlus', desc: 'Elektronik', rating: 4.7, img: 'https://images.unsplash.com/photo-1468495244122-4a6c3104de0f?w=200&auto=format&fit=crop&q=60' }
  ];

  return (
    <div className="home-v2">
      {/* 1. HERO BANNER SECTION */}
      <section className="hero-v2">
        <div className="hero-v2-container">
          <div className="hero-v2-grid">
            {/* Left Column */}
            <div className="hero-v2-left">
              <h2>
                Girişimcilerin ürünleri <span className="highlight-red">Aras güvencesiyle</span> her yere ulaşsın.
              </h2>
              <p>
                Kendi mağazanı aç, ürünlerini milyonlara ulaştır. Aras ile kolay gönder, mutlu müşteri kazan.
              </p>
              
              <div className="hero-v2-actions">
                <button 
                  className="btn btn-primary btn-lg btn-red-primary"
                  onClick={() => {
                    document.getElementById('products-section')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  Alışverişe Başla
                </button>
                <button className="btn btn-secondary btn-lg btn-white-outline" onClick={() => navigate('/login')}>
                  Mağaza Yönetimi
                </button>
              </div>

              {/* Badges */}
              <div className="hero-v2-badges">
                <div className="hero-badge-item">
                  <div className="hero-badge-icon"><Smile size={18} /></div>
                  <div className="hero-badge-text">
                    <strong>Satıcı Dostu</strong>
                    <span>Düşük komisyon, yüksek destek</span>
                  </div>
                </div>
                <div className="hero-badge-item">
                  <div className="hero-badge-icon"><Truck size={18} /></div>
                  <div className="hero-badge-text">
                    <strong>Hızlı ve Güvenli Teslimat</strong>
                    <span>Aras kalitesiyle teslimat güvencesi</span>
                  </div>
                </div>
                <div className="hero-badge-item">
                  <div className="hero-badge-icon"><Gift size={18} /></div>
                  <div className="hero-badge-text">
                    <strong>Kolay İade</strong>
                    <span>14 gün içinde kolay iade</span>
                  </div>
                </div>
                <div className="hero-badge-item">
                  <div className="hero-badge-icon"><Zap size={18} /></div>
                  <div className="hero-badge-text">
                    <strong>Kargo Takibi</strong>
                    <span>Tüm gönderilerini anlık takip et</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column (Image + floating card) */}
            <div className="hero-v2-right">
              <div className="hero-image-wrapper">
                <img src="/hero_entrepreneur.png" alt="Entrepreneur working with Aras branded delivery packaging" />
                
                {/* Floating "Kargon Bizden" card */}
                <div className="hero-floating-card">
                  <div className="floating-card-tag">Kargon Bizden</div>
                  <h4>En uygun fiyatlarla kapından alalım, her yere ulaştıralım.</h4>
                  <button className="btn-floating-action" onClick={() => navigate('/login')}>
                    Kurye Çağır <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. CATEGORIES SECTION ("Kategorilere Göz At") */}
      <section className="categories-section">
        <div className="categories-container">
          <div className="section-title-row">
            <h3>Kategorilere Göz At</h3>
            <span className="see-all-link">Tümünü Gör <ChevronRight size={14} /></span>
          </div>
          <div className="categories-grid">
            {categoriesList.map((cat, idx) => (
              <div 
                key={idx} 
                className="category-circle-card"
                onClick={() => {
                  onSearchChange?.(cat.query);
                  document.getElementById('products-section')?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                <div className="category-circle-icon">{cat.icon}</div>
                <span>{cat.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. THREE PROMOTIONAL BANNER CARDS */}
      <section className="promos-section">
        <div className="promos-container">
          <div className="promos-grid">
            {/* Card 1 - Sell Online */}
            <div className="promo-card bg-white border-card">
              <div className="promo-card-body">
                <h3>Mağazanı Aç, Hemen Satışa Başla!</h3>
                <p>Kolay mağaza açılışı ile binlerce müşteriye ulaş.</p>
                <button className="btn btn-secondary btn-sm" onClick={() => navigate('/login')}>
                  Giriş Yap / Yönet
                </button>
              </div>
              <div className="promo-card-mockup flex-center">
                <span style={{ fontSize: 60 }}>📱</span>
              </div>
            </div>

            {/* Card 2 - Integrated Logistics */}
            <div className="promo-card bg-navy text-white">
              <div className="promo-card-body">
                <h3>Aras ile Entegre Lojistik</h3>
                <p>Siparişlerini otomatik kargoya ver, sende işine odaklan.</p>
                <div className="promo-ticks">
                  <div className="tick-item"><CheckCircle2 size={14} /> Kapıdan alım kolaylığı</div>
                  <div className="tick-item"><CheckCircle2 size={14} /> Uygun kargo fiyatları</div>
                  <div className="tick-item"><CheckCircle2 size={14} /> Anlık takip ve bilgilendirme</div>
                </div>
                <button className="btn btn-outline-primary btn-sm btn-white-border" onClick={() => {
                  addToast('Lojistik entegrasyonu detay sayfasına yönlendiriliyorsunuz...', 'info');
                }}>
                  Detaylı Bilgi
                </button>
              </div>
              <div className="promo-card-mockup flex-center">
                <span style={{ fontSize: 60 }}>📦</span>
              </div>
            </div>

            {/* Card 3 - Special support for women entrepreneurs */}
            <div className="promo-card bg-white border-card">
              <div className="promo-card-body">
                <h3>Girişimci Kadınlara Özel Destek</h3>
                <p>Kadın girişimcilerin yanındayız!</p>
                <div className="promo-ticks dark-ticks">
                  <div className="tick-item"><CheckCircle2 size={14} /> Düşük komisyon</div>
                  <div className="tick-item"><CheckCircle2 size={14} /> Eğitim ve mentorluk desteği</div>
                  <div className="tick-item"><CheckCircle2 size={14} /> Öne çıkan fırsatlar</div>
                </div>
                <button className="btn btn-secondary btn-sm" onClick={() => {
                  addToast('Kadın girişimci destek platformu yüklendi.', 'info');
                }}>
                  Keşfet
                </button>
              </div>
              <div className="promo-card-mockup flex-center">
                <span style={{ fontSize: 60 }}>👩‍💼</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. POPULAR STORES ("Popüler Mağazalar") */}
      <section className="stores-section">
        <div className="stores-container">
          <div className="section-title-row">
            <h3>Popüler Mağazalar</h3>
            <span className="see-all-link">Tüm Mağazalar <ChevronRight size={14} /></span>
          </div>
          <div className="stores-grid">
            {popularStores.map((store, idx) => (
              <div key={idx} className="store-card">
                <div className="store-img-wrapper">
                  <img src={store.img} alt={store.name} />
                </div>
                <div className="store-card-body">
                  <h4>{store.name}</h4>
                  <p>{store.desc}</p>
                  <div className="store-rating">
                    <Star size={12} className="star-filled" />
                    <span>{store.rating}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. PRODUCT CATALOG Grid */}
      <div className="container page-content" id="products-section" style={{ borderTop: '1px solid var(--divider)', paddingTop: 40 }}>
        <div className="section-header">
          <h2 className="section-title">
            {searchQuery ? `"${searchQuery}" için sonuçlar` : 'Fırsat Ürünleri'}
            <span style={{ fontSize: 14, fontWeight: 400, color: 'var(--text-muted)', marginLeft: 8 }}>
              ({filtered.length} ürün listeleniyor)
            </span>
          </h2>
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <h3>Ürün bulunamadı</h3>
            <p>Farklı kelimeler veya kategoriler seçerek aramayı deneyin.</p>
          </div>
        ) : (
          <div className="product-grid">
            {filtered.map(product => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={onAddToCart}
                onNavigate={handleNavigate}
              />
            ))}
          </div>
        )}
      </div>

      {/* 6. WHY ARAS ISLETMEM? ("Neden Aras İşletmem?") */}
      <section className="why-section">
        <div className="why-container">
          <h3>Neden Aras İşletmem?</h3>
          <div className="why-grid">
            <div className="why-item">
              <div className="why-icon"><Truck size={20} /></div>
              <h4>Türkiye'nin Her Yerine</h4>
              <p>Geniş teslimat ağı</p>
            </div>
            <div className="why-item">
              <div className="why-icon"><CreditCard size={20} /></div>
              <h4>Uygun Fiyatlı Kargo</h4>
              <p>Özel anlaşmalı tarifeler</p>
            </div>
            <div className="why-item">
              <div className="why-icon"><ShieldCheck size={20} /></div>
              <h4>Güvenli Teslimat</h4>
              <p>Aras güvencesiyle</p>
            </div>
            <div className="why-item">
              <div className="why-icon"><Sparkles size={20} /></div>
              <h4>Kolay Entegrasyon</h4>
              <p>E-ticaret altyapıları ile uyumlu</p>
            </div>
            <div className="why-item">
              <div className="why-icon"><Smile size={20} /></div>
              <h4>7/24 Destek</h4>
              <p>Her zaman yanınızdayız</p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. NEWSLETTER SECTION */}
      <section className="newsletter-section-v2">
        <div className="newsletter-v2-container">
          <div className="newsletter-v2-grid">
            <div className="newsletter-v2-left">
              <h3>Fırsatlardan ve kampanyalardan ilk sen haberdar ol!</h3>
              <form onSubmit={handleSubscribe} className="newsletter-v2-form">
                <input 
                  type="email" 
                  placeholder="E-posta adresinizi girin" 
                  value={emailSub}
                  onChange={e => setEmailSub(e.target.value)}
                  required 
                />
                <button type="submit" className="btn btn-primary btn-red-primary">Abone Ol</button>
              </form>
            </div>
            <div className="newsletter-v2-right flex-center">
              <div className="mockup-packages">
                {/* Simulated envelope/cargo package */}
                <div className="package-envelope">
                  <Mail size={32} />
                  <span>Kampanyalar</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
