import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, MapPin, Truck } from 'lucide-react';
import { createOrder, clearBasket } from '../api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/ui/Toast';
import mascotSuccessImg from '../assets/mascot_success.png';

const SEEDED_CUSTOMER_ID = 'a1b2c3d4-e5f6-4a5b-8c7d-9e0f1a2b3c4d';

export default function CheckoutPage({ cart, products, onClearCart }) {
  const navigate = useNavigate();
  const { isAuthenticated, isCustomer } = useAuth();
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');

  useEffect(() => {
    if (!isAuthenticated || !isCustomer) {
      addToast('Ödeme sayfasına erişmek için üye girişi yapmalısınız.', 'warning');
      navigate('/login');
    }
  }, [isAuthenticated, isCustomer, navigate, addToast]);

  const [form, setForm] = useState({
    firstName: '', lastName: '',
    phone: '', email: '',
    city: '', district: '', address: '',
    cardNumber: '', cardExpiry: '', cardCvc: ''
  });

  const getProduct = (id) => products.find(p => p.id === id) || { title: '?', price: 0, images: [] };
  const total = cart.reduce((s, i) => s + getProduct(i.productId).price * i.quantity, 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (cart.length === 0) return;
    setLoading(true);

    try {
      let lastOrderNum = '';
      for (const item of cart) {
        const prod = getProduct(item.productId);
        const data = await createOrder(item.productId, SEEDED_CUSTOMER_ID, prod.price * item.quantity, item.quantity);
        lastOrderNum = data.orderNumber;
      }

      if (isAuthenticated && isCustomer) {
        try { await clearBasket(); } catch {}
      }

      onClearCart();
      setOrderNumber(lastOrderNum || '#' + Math.floor(1000 + Math.random() * 9000));
      setOrderSuccess(true);
      addToast('Siparişiniz başarıyla alındı! 🎉');
    } catch (err) {
      addToast('Sipariş oluşturulamadı: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  if (orderSuccess) {
    return (
      <div className="container page-content" style={{ maxWidth: 600, margin: '0 auto', textAlign: 'center', padding: '80px 24px' }}>
        <img 
          src={mascotSuccessImg} 
          alt="Sipariş Başarılı Maskotu" 
          style={{ 
            display: 'block',
            margin: '0 auto 24px',
            maxHeight: 180, 
            objectFit: 'contain',
            filter: 'drop-shadow(0 12px 24px rgba(0,0,0,0.15))'
          }} 
        />
        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 28, fontWeight: 700, marginBottom: 8 }}>
          Siparişiniz Alındı!
        </h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>
          Siparişiniz başarıyla oluşturuldu. Aras Kargo ile en kısa sürede teslim edilecektir.
        </p>
        <div style={{
          background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)',
          padding: 20, marginBottom: 32
        }}>
          <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Sipariş Numarası</div>
          <div style={{ fontFamily: 'monospace', fontSize: 24, fontWeight: 700, color: 'var(--primary)', marginTop: 4 }}>
            {orderNumber}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          <button className="btn btn-primary btn-red-primary" onClick={() => navigate('/siparislerim')}>Siparişlerimi Gör</button>
          <button className="btn btn-secondary" onClick={() => navigate('/')}>Ana Sayfaya Dön</button>
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="container page-content">
        <div className="empty-state">
          <h3>Sepetiniz boş</h3>
          <p>Ödeme yapabilmek için sepetinize ürün eklemeniz gerekmektedir.</p>
          <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => navigate('/')}>
            Alışverişe Başla
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container page-content">
      <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 24, fontWeight: 700, marginBottom: 32 }}>
        Siparişi Tamamla
      </h1>
      <form onSubmit={handleSubmit}>
        <div className="checkout-layout">
          {/* Left — Forms */}
          <div>
            {/* Address */}
            <div className="card" style={{ marginBottom: 24 }}>
              <div className="card-body">
                <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <MapPin size={18} style={{ color: 'var(--primary)' }} /> Teslimat Adresi
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div className="form-group">
                    <label className="form-label">Ad</label>
                    <input className="form-input" value={form.firstName} onChange={e => setForm({...form, firstName: e.target.value})} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Soyad</label>
                    <input className="form-input" value={form.lastName} onChange={e => setForm({...form, lastName: e.target.value})} required />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div className="form-group">
                    <label className="form-label">Telefon</label>
                    <input className="form-input" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">E-posta</label>
                    <input className="form-input" type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div className="form-group">
                    <label className="form-label">İl</label>
                    <input className="form-input" value={form.city} onChange={e => setForm({...form, city: e.target.value})} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">İlçe</label>
                    <input className="form-input" value={form.district} onChange={e => setForm({...form, district: e.target.value})} required />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Açık Adres</label>
                  <input className="form-input" value={form.address} onChange={e => setForm({...form, address: e.target.value})} required />
                </div>
              </div>
            </div>

            {/* Payment */}
            <div className="card">
              <div className="card-body">
                <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <CreditCard size={18} style={{ color: 'var(--primary)' }} /> Ödeme Bilgileri
                </h3>
                <div className="form-group">
                  <label className="form-label">Kart Numarası</label>
                  <input className="form-input" placeholder="0000 0000 0000 0000" value={form.cardNumber} onChange={e => setForm({...form, cardNumber: e.target.value})} required />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div className="form-group">
                    <label className="form-label">Son Kullanma</label>
                    <input className="form-input" placeholder="AA/YY" value={form.cardExpiry} onChange={e => setForm({...form, cardExpiry: e.target.value})} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">CVC</label>
                    <input className="form-input" placeholder="000" value={form.cardCvc} onChange={e => setForm({...form, cardCvc: e.target.value})} required />
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--text-muted)', marginTop: 8 }}>
                  <Truck size={14} /> Ödeme simülasyondur, gerçek bir ücretlendirme yapılmaz.
                </div>
              </div>
            </div>
          </div>

          {/* Right — Summary */}
          <div className="order-summary">
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>Sipariş Özeti</h3>
            {cart.map((item, idx) => {
              const prod = getProduct(item.productId);
              return (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--divider)', fontSize: 13 }}>
                  <div>
                    <div style={{ fontWeight: 600 }}>{prod.title}</div>
                    <div style={{ color: 'var(--text-muted)' }}>x{item.quantity}</div>
                  </div>
                  <div style={{ fontWeight: 700 }}>
                    {(prod.price * item.quantity).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL
                  </div>
                </div>
              );
            })}
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--divider)', fontSize: 13, color: 'var(--text-secondary)' }}>
              <span>Kargo</span>
              <span style={{ color: 'var(--success)', fontWeight: 600 }}>Ücretsiz</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '16px 0 0', fontSize: 18, fontWeight: 700 }}>
              <span>Toplam</span>
              <span style={{ color: 'var(--primary)', fontFamily: 'var(--font-heading)' }}>
                {total.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL
              </span>
            </div>
            <button
              type="submit"
              className="btn btn-primary btn-full btn-lg"
              style={{ marginTop: 20 }}
              disabled={loading}
            >
              {loading ? 'İşleniyor...' : 'Siparişi Onayla'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
