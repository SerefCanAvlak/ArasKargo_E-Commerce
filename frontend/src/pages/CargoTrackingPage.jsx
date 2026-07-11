import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Truck, Search, MapPin, CheckCircle, Package, ArrowRight, Clock } from 'lucide-react';
import { getOrders } from '../api';
import LoadingSpinner from '../components/ui/LoadingSpinner';

export default function CargoTrackingPage() {
  const { trackingNumber } = useParams();
  const navigate = useNavigate();

  const [inputCode, setInputCode] = useState(trackingNumber || '');
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (trackingNumber) {
      handleSearch(trackingNumber);
    }
  }, [trackingNumber]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!inputCode.trim()) return;
    navigate(`/tracking/${inputCode.trim()}`);
  };

  const handleSearch = async (code) => {
    setLoading(true);
    setErrorMsg('');
    setOrder(null);
    try {
      const ordersList = await getOrders();
      const cleanCode = code.toUpperCase().trim();
      // Search by tracking number or order number
      const foundOrder = ordersList.find(o => 
        (o.cargoTrackingNumber && o.cargoTrackingNumber.toUpperCase() === cleanCode) ||
        (o.orderNumber && o.orderNumber.toUpperCase() === cleanCode)
      );

      if (foundOrder) {
        setOrder(foundOrder);
      } else {
        setErrorMsg('Girdiğiniz kargo takip numarası veya sipariş kodu bulunamadı.');
      }
    } catch (err) {
      setErrorMsg('Kargo bilgisi sorgulanırken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  // Helper mapping for current active steps
  const getStepStatus = (stepIndex) => {
    if (!order) return 'waiting';
    const status = order.orderStatus;
    if (status >= stepIndex) return 'completed';
    if (status === stepIndex - 1) return 'active';
    return 'waiting';
  };

  return (
    <div className="container page-content" style={{ maxWidth: 800 }}>
      {/* Search Header */}
      <div className="card" style={{ marginBottom: 24, padding: '32px 24px' }}>
        <h2 style={{ textAlign: 'center', marginBottom: 8, fontSize: 24, fontWeight: 800 }}>
          <Truck size={32} style={{ color: 'var(--primary)', verticalAlign: 'middle', marginRight: 10 }} />
          Aras Kargo Gönderi Takip
        </h2>
        <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: 24, fontSize: 14 }}>
          Sipariş numaranızı veya Aras Kargo takip kodunu girerek kargonuzun canlı durumunu sorgulayın.
        </p>

        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: 12, maxWidth: 500, margin: '0 auto' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <input
              type="text"
              className="form-input"
              placeholder="Örn: ARAS-4FBD2D3A"
              value={inputCode}
              onChange={e => setInputCode(e.target.value)}
              style={{ paddingLeft: 40, textTransform: 'uppercase' }}
            />
            <Search size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          </div>
          <button type="submit" className="btn btn-primary" style={{ padding: '0 24px' }} disabled={loading}>
            Sorgula
          </button>
        </form>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : errorMsg ? (
        <div className="card" style={{ textAlign: 'center', padding: '40px 24px', color: 'var(--danger)' }}>
          <p>{errorMsg}</p>
        </div>
      ) : order ? (
        <div>
          {/* Order Brief Info */}
          <div 
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: 16,
              marginBottom: 24
            }}
          >
            <div className="card" style={{ padding: 16 }}>
              <span style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase' }}>Kargo Takip No</span>
              <strong style={{ fontSize: 15, fontFamily: 'monospace', color: 'var(--primary)' }}>
                {order.cargoTrackingNumber || 'Henüz Oluşturulmadı'}
              </strong>
            </div>
            <div className="card" style={{ padding: 16 }}>
              <span style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase' }}>Sipariş Numarası</span>
              <strong style={{ fontSize: 15 }}>{order.orderNumber}</strong>
            </div>
            <div className="card" style={{ padding: 16 }}>
              <span style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase' }}>Kargo Durumu</span>
              <strong 
                style={{ 
                  fontSize: 14,
                  color: order.orderStatus === 4 ? 'var(--success)' : 'var(--primary)'
                }}
              >
                {order.orderStatus === 1 && 'Ödeme Alındı'}
                {order.orderStatus === 2 && 'Hazırlanıyor'}
                {order.orderStatus === 3 && 'Kargoda'}
                {order.orderStatus === 4 && 'Teslim Edildi'}
              </strong>
            </div>
          </div>

          {/* Stepper / Timeline */}
          <div className="card" style={{ padding: 32, marginBottom: 24 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Clock size={18} style={{ color: 'var(--primary)' }} /> Gönderi Hareketleri
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 0, position: 'relative' }}>
              {/* Vertical Connector Line */}
              <div 
                style={{
                  position: 'absolute',
                  left: 19,
                  top: 10,
                  bottom: 30,
                  width: 3,
                  background: 'var(--border)',
                  zIndex: 1
                }}
              >
                {/* Active connection highlight */}
                <div 
                  style={{
                    height: order.orderStatus === 1 ? '0%' : order.orderStatus === 2 ? '33%' : order.orderStatus === 3 ? '66%' : '100%',
                    width: '100%',
                    background: 'var(--primary)',
                    transition: 'height 0.8s ease'
                  }}
                />
              </div>

              {/* Step 1: Sipariş Alındı */}
              <div style={{ display: 'flex', gap: 20, marginBottom: 30, position: 'relative', zIndex: 2 }}>
                <div 
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    background: getStepStatus(1) === 'completed' ? 'var(--primary)' : 'var(--surface)',
                    border: '3px solid ' + (getStepStatus(1) === 'completed' ? 'var(--primary)' : 'var(--border)'),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: getStepStatus(1) === 'completed' ? '#fff' : 'var(--text-muted)',
                    transition: 'all 0.4s'
                  }}
                >
                  <Package size={18} />
                </div>
                <div>
                  <h4 style={{ fontSize: 14, fontWeight: 700, margin: '2px 0 4px' }}>Sipariş Alındı</h4>
                  <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Ödemeniz doğrulandı ve sipariş detaylarınız satıcıya iletildi.</p>
                </div>
              </div>

              {/* Step 2: Hazırlanıyor */}
              <div style={{ display: 'flex', gap: 20, marginBottom: 30, position: 'relative', zIndex: 2 }}>
                <div 
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    background: getStepStatus(2) === 'completed' ? 'var(--primary)' : getStepStatus(2) === 'active' ? 'var(--primary-bg)' : 'var(--surface)',
                    border: '3px solid ' + (getStepStatus(2) === 'completed' ? 'var(--primary)' : getStepStatus(2) === 'active' ? 'var(--primary)' : 'var(--border)'),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: getStepStatus(2) === 'completed' ? '#fff' : getStepStatus(2) === 'active' ? 'var(--primary)' : 'var(--text-muted)',
                    transition: 'all 0.4s'
                  }}
                >
                  <Package size={18} />
                </div>
                <div>
                  <h4 style={{ fontSize: 14, fontWeight: 700, margin: '2px 0 4px' }}>Hazırlanıyor</h4>
                  <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Satıcı siparişi paketliyor ve Aras Kargo kurye çağrı talebini oluşturuyor.</p>
                </div>
              </div>

              {/* Step 3: Kargoda */}
              <div style={{ display: 'flex', gap: 20, marginBottom: 30, position: 'relative', zIndex: 2 }}>
                <div 
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    background: getStepStatus(3) === 'completed' ? 'var(--primary)' : getStepStatus(3) === 'active' ? 'var(--primary-bg)' : 'var(--surface)',
                    border: '3px solid ' + (getStepStatus(3) === 'completed' ? 'var(--primary)' : getStepStatus(3) === 'active' ? 'var(--primary)' : 'var(--border)'),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: getStepStatus(3) === 'completed' ? '#fff' : getStepStatus(3) === 'active' ? 'var(--primary)' : 'var(--text-muted)',
                    transition: 'all 0.4s'
                  }}
                >
                  <Truck size={18} />
                </div>
                <div>
                  <h4 style={{ fontSize: 14, fontWeight: 700, margin: '2px 0 4px' }}>Yolda</h4>
                  <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Aras Kargo kuryesi kargonuzu satıcıdan teslim aldı, transfer merkezine taşınıyor.</p>
                </div>
              </div>

              {/* Step 4: Teslim Edildi */}
              <div style={{ display: 'flex', gap: 20, position: 'relative', zIndex: 2 }}>
                <div 
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    background: getStepStatus(4) === 'completed' ? 'var(--success)' : 'var(--surface)',
                    border: '3px solid ' + (getStepStatus(4) === 'completed' ? 'var(--success)' : 'var(--border)'),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: getStepStatus(4) === 'completed' ? '#fff' : 'var(--text-muted)',
                    transition: 'all 0.4s'
                  }}
                >
                  <CheckCircle size={18} />
                </div>
                <div>
                  <h4 style={{ fontSize: 14, fontWeight: 700, margin: '2px 0 4px' }}>Teslim Edildi</h4>
                  <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Kargonuz alıcı adresine başarıyla teslim edilmiştir.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Simulated Cargo Truck Animation on Map */}
          <div className="card" style={{ padding: 24, overflow: 'hidden', position: 'relative' }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Canlı Taşıma Haritası (Simülasyon)</h3>
            
            <div 
              style={{
                width: '100%',
                height: 180,
                background: '#e5e7eb',
                borderRadius: 'var(--radius-lg)',
                position: 'relative',
                overflow: 'hidden',
                border: '1px solid var(--border)'
              }}
            >
              {/* Background Map Dotted Path */}
              <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 1 }}>
                <path 
                  d="M 100 90 Q 250 40 400 90 T 700 90" 
                  fill="none" 
                  stroke="var(--text-muted)" 
                  strokeWidth="3" 
                  strokeDasharray="6 6" 
                />
                
                {/* Active path highlighting based on shipping progress */}
                {order.orderStatus >= 3 && (
                  <path 
                    d="M 100 90 Q 250 40 400 90 T 700 90" 
                    fill="none" 
                    stroke="var(--primary)" 
                    strokeWidth="3" 
                    strokeDasharray="6 6" 
                    style={{
                      strokeDashoffset: order.orderStatus === 4 ? 0 : 20,
                      animation: order.orderStatus === 3 ? 'dash 2s linear infinite' : 'none'
                    }}
                  />
                )}
              </svg>

              {/* Warehouse Pin (Seller) */}
              <div 
                style={{
                  position: 'absolute',
                  left: 90,
                  top: 75,
                  zIndex: 2,
                  textAlign: 'center'
                }}
              >
                <MapPin size={24} style={{ color: 'var(--primary)' }} />
                <span style={{ fontSize: 10, display: 'block', background: 'rgba(255,255,255,0.8)', padding: '2px 4px', borderRadius: 4, fontWeight: 600 }}>Çıkış</span>
              </div>

              {/* Destination Pin (Buyer) */}
              <div 
                style={{
                  position: 'absolute',
                  right: 90,
                  top: 75,
                  zIndex: 2,
                  textAlign: 'center'
                }}
              >
                <MapPin size={24} style={{ color: 'var(--success)' }} />
                <span style={{ fontSize: 10, display: 'block', background: 'rgba(255,255,255,0.8)', padding: '2px 4px', borderRadius: 4, fontWeight: 600 }}>Alıcı</span>
              </div>

              {/* Kargo Kamyonu (Moving Truck) */}
              <div 
                style={{
                  position: 'absolute',
                  zIndex: 3,
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  background: 'var(--primary)',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: 'var(--shadow-md)',
                  top: 75,
                  // Transition animations for status values
                  left: order.orderStatus <= 2 ? 100 : order.orderStatus === 3 ? 'calc(50% - 16px)' : 'calc(100% - 130px)',
                  top: order.orderStatus <= 2 ? 75 : order.orderStatus === 3 ? 50 : 75,
                  transition: 'left 5s ease, top 5s ease',
                  animation: order.orderStatus === 3 ? 'pulse-cargo 1.5s infinite' : 'none'
                }}
              >
                <Truck size={16} />
              </div>

              {/* Animation helper keyframe styles */}
              <style>{`
                @keyframes pulse-cargo {
                  0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(197, 17, 17, 0.4); }
                  70% { transform: scale(1.1); box-shadow: 0 0 0 10px rgba(197, 17, 17, 0); }
                  100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(197, 17, 17, 0); }
                }
              `}</style>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-secondary)', marginTop: 12 }}>
              <span>Gönderici (Satıcı Deposu)</span>
              {order.orderStatus === 3 && (
                <span style={{ color: 'var(--primary)', fontWeight: 600, animation: 'blink 1.5s infinite' }}>Kuryemiz transfer merkezine doğru hareket halindedir...</span>
              )}
              {order.orderStatus === 4 && (
                <span style={{ color: 'var(--success)', fontWeight: 600 }}>Kargo teslim edilmiştir.</span>
              )}
              <span>Alıcı Adresi</span>
            </div>
          </div>
        </div>
      ) : (
        /* Empty Tracking Search Screen */
        <div className="card" style={{ padding: '60px 24px', textAlign: 'center' }}>
          <div 
            style={{
              width: 60, height: 60, borderRadius: '50%', background: 'var(--bg)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px'
            }}
          >
            <Package size={28} style={{ color: 'var(--text-muted)' }} />
          </div>
          <h3>Gönderi Takip Kodu Girin</h3>
          <p style={{ color: 'var(--text-secondary)', maxWidth: 400, margin: '8px auto 0', fontSize: 13 }}>
            Sipariş verdiğinizde oluşturulan sipariş numarasını (# ile başlayan) veya kargo takip numarasını yukarıdaki alana girerek kargonuzu takip edebilirsiniz.
          </p>
        </div>
      )}
    </div>
  );
}
