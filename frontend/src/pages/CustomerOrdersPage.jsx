import { useState, useEffect } from 'react';
import { ShoppingBag, Truck } from 'lucide-react';
import { getCustomerOrders, getProducts } from '../api';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const statusMap = {
  1: { label: 'Ödeme Alındı', cls: 'badge-received', desc: 'Siparişiniz alındı, satıcının hazırlaması bekleniyor.' },
  2: { label: 'Hazırlanıyor', cls: 'badge-preparing', desc: 'Satıcı siparişinizi paketliyor.' },
  3: { label: 'Kargoda', cls: 'badge-incargo', desc: 'Aras Kargo kuryesi siparişinizi teslim aldı.' },
  4: { label: 'Teslim Edildi', cls: 'badge-delivered', desc: 'Siparişiniz başarıyla teslim edildi!' },
  5: { label: 'İptal Edildi', cls: 'badge-cancelled', desc: 'Sipariş iptal edildi.' },
};

export default function CustomerOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const [ords, prods] = await Promise.all([
        getCustomerOrders(),
        getProducts(1, 100)
      ]);
      setOrders(ords || []);
      setProducts(prods.items || prods || []);
    } catch (err) {
      console.error(err);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const getProductInfo = (id) => {
    return products.find(p => p.id === id) || { title: 'Ürün Bilgisi Yükleniyor...', coverImage: '', price: 0 };
  };

  return (
    <div style={{ maxWidth: 1000, margin: '40px auto', padding: '0 20px', minHeight: '80vh' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32 }}>
        <div style={{ background: 'var(--primary-light)', color: 'var(--primary)', padding: 12, borderRadius: 'var(--radius-md)' }}>
          <ShoppingBag size={24} />
        </div>
        <div>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 24, fontWeight: 800, color: 'var(--text)' }}>Siparişlerim</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Tüm alışveriş geçmişinizi ve kargo durumlarınızı buradan takip edebilirsiniz.</p>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : orders.length === 0 ? (
        <div className="card" style={{ padding: 48, textAlign: 'center' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
            <Truck size={48} style={{ color: 'var(--text-muted)', opacity: 0.5 }} />
            <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)' }}>Henüz Siparişiniz Yok</h3>
            <p style={{ color: 'var(--text-muted)', maxWidth: 400, fontSize: 14 }}>
              Aras İşletmem platformundan henüz bir sipariş vermediniz. Alışverişe başlamak için ana sayfayı ziyaret edin.
            </p>
            <a href="/" className="btn btn-primary" style={{ marginTop: 8 }}>Alışverişe Başla</a>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {orders.map((order) => {
            const prod = getProductInfo(order.productId);
            const status = statusMap[order.orderStatus] || { label: 'Bilinmeyen Durum', cls: 'badge-received', desc: '' };

            return (
              <div key={order.id} className="card" style={{ overflow: 'hidden' }}>
                {/* Order Header */}
                <div style={{
                  background: 'var(--bg)',
                  padding: '16px 24px',
                  borderBottom: '1px solid var(--border)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: 12
                }}>
                  <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
                    <div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Sipariş Numarası</div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', fontFamily: 'monospace' }}>#{order.orderNumber}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Toplam Tutar</div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--primary)' }}>{order.totalAmount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL</div>
                    </div>
                  </div>
                  <div>
                    <span className={`badge ${status.cls}`} style={{ fontSize: 12, padding: '6px 12px', fontWeight: 700 }}>
                      {status.label}
                    </span>
                  </div>
                </div>

                {/* Order Body */}
                <div style={{ padding: 24, display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'center' }}>
                  <div style={{ width: 80, height: 80, borderRadius: 'var(--radius-sm)', overflow: 'hidden', border: '1px solid var(--border)', flexShrink: 0, background: 'var(--bg)' }}>
                    <img
                      src={prod.coverImage || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200'}
                      alt=""
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </div>
                  <div style={{ flex: 1, minWidth: 200 }}>
                    <h4 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>{prod.title}</h4>
                    <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Adet: <strong>{order.quantity}</strong></p>
                  </div>
                  
                  {/* Shipping info or helper */}
                  <div style={{
                    minWidth: 260,
                    padding: 16,
                    background: 'var(--bg)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border)',
                    fontSize: 13
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, fontWeight: 600, color: 'var(--text)' }}>
                      <Truck size={16} style={{ color: 'var(--primary)' }} />
                      <span>Aras Kargo Kargo Durumu</span>
                    </div>
                    <p style={{ color: 'var(--text-muted)', fontSize: 12, marginBottom: 8 }}>{status.desc}</p>
                    
                    {order.cargoTrackingNumber ? (
                      <div style={{ background: 'var(--card-bg)', padding: '8px 12px', borderRadius: 'var(--radius-sm)', border: '1px dashed var(--primary)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Takip No:</span>
                        <strong style={{ fontSize: 13, color: 'var(--text)', fontFamily: 'monospace' }}>{order.cargoTrackingNumber}</strong>
                      </div>
                    ) : order.orderStatus < 3 ? (
                      <span style={{ color: 'var(--text-muted)', fontSize: 11, fontStyle: 'italic' }}>Kargo kodu bekleniyor...</span>
                    ) : null}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
