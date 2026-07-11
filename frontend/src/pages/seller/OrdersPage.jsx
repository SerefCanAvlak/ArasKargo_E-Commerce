import { useState, useEffect } from 'react';
import { Truck, Check, CheckCircle, XCircle } from 'lucide-react';
import { getOrders, getProducts as fetchProducts, callCourier, updateOrderStatus } from '../../api';
import SellerSidebar from '../../components/layout/SellerSidebar';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { useToast } from '../../components/ui/Toast';

const statusMap = {
  1: { label: 'Ödeme Alındı', cls: 'badge-received' },
  2: { label: 'Hazırlanıyor', cls: 'badge-preparing' },
  3: { label: 'Kargoda', cls: 'badge-incargo' },
  4: { label: 'Teslim Edildi', cls: 'badge-delivered' },
  5: { label: 'İptal Edildi', cls: 'badge-cancelled' },
};

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [ords, prods] = await Promise.all([getOrders(), fetchProducts(1, 100)]);
      setOrders(ords || []);
      setProducts(prods.items || prods || []);
    } catch {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const getProductTitle = (id) => {
    const p = products.find(pr => pr.id === id);
    return p ? p.title : 'Ürün';
  };

  const handleCallCourier = async (orderId) => {
    try {
      const data = await callCourier(orderId);
      addToast(`📦 ${data.message} Takip No: ${data.cargoTrackingNumber}`);
      loadData();
    } catch (err) {
      addToast('Kurye çağırma hatası: ' + err.message, 'error');
    }
  };

  const handleDeliver = async (orderId) => {
    try {
      await updateOrderStatus(orderId, 4);
      addToast('Sipariş teslim edildi! T-SQL Trigger çalıştı ⚡');
      setTimeout(loadData, 500);
    } catch (err) {
      addToast('Güncelleme hatası: ' + err.message, 'error');
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Siparişi iptal etmek istediğinize emin misiniz?')) return;
    try {
      await updateOrderStatus(orderId, 5);
      addToast('Sipariş başarıyla iptal edildi.');
      setTimeout(loadData, 500);
    } catch (err) {
      addToast('İptal hatası: ' + err.message, 'error');
    }
  };

  return (
    <div className="seller-layout">
      <SellerSidebar />
      <main className="seller-main">
        <div className="seller-page-header">
          <div>
            <h1 className="seller-page-title">Siparişler & Kargo</h1>
            <p className="seller-page-subtitle">Lojistik süreçlerinizi yönetin.</p>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={loadData}>Yenile</button>
        </div>

        {loading ? <LoadingSpinner /> : orders.length === 0 ? (
          <div className="card">
            <div className="empty-state">
              <Truck size={40} />
              <h3>Henüz sipariş yok</h3>
              <p>Müşteriler sipariş verdiğinde burada görünecektir.</p>
            </div>
          </div>
        ) : (
          <div className="card">
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Sipariş No</th>
                    <th>Ürün</th>
                    <th>Tutar</th>
                    <th>Kargo Kodu</th>
                    <th>Durum</th>
                    <th style={{ textAlign: 'right' }}>İşlemler</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map(order => {
                    const status = statusMap[order.orderStatus] || statusMap[1];
                    return (
                      <tr key={order.id}>
                        <td style={{ fontWeight: 600 }}>{order.orderNumber}</td>
                        <td>{getProductTitle(order.productId)}</td>
                        <td style={{ fontWeight: 700, color: 'var(--primary)' }}>
                          {(order.totalAmount || 0).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL
                        </td>
                        <td>
                          {order.cargoTrackingNumber ? (
                            <code style={{ fontSize: 12, padding: '3px 8px', background: 'var(--bg)', borderRadius: 4, border: '1px solid var(--border)' }}>
                              {order.cargoTrackingNumber}
                            </code>
                          ) : (
                            <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>Bekleniyor...</span>
                          )}
                        </td>
                        <td>
                          <span className={`badge ${status.cls}`}>{status.label}</span>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', gap: 8 }}>
                            {order.orderStatus <= 2 && (
                              <>
                                <button className="btn btn-primary btn-sm" onClick={() => handleCallCourier(order.id)}>
                                  <Truck size={14} /> Kurye Çağır
                                </button>
                                <button className="btn btn-danger btn-sm" onClick={() => handleCancelOrder(order.id)}>
                                  <XCircle size={14} /> İptal Et
                                </button>
                              </>
                            )}
                            {order.orderStatus === 3 && (
                              <button className="btn btn-success btn-sm" onClick={() => handleDeliver(order.id)} title="T-SQL Trigger'ı çalıştırır">
                                <Check size={14} /> Teslim Et
                              </button>
                            )}
                            {order.orderStatus === 4 && (
                              <span style={{ fontSize: 12, color: 'var(--success)', display: 'flex', alignItems: 'center', gap: 4, fontWeight: 600 }}>
                                <CheckCircle size={14} /> Tamamlandı
                              </span>
                            )}
                            {order.orderStatus === 5 && (
                              <span style={{ fontSize: 12, color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: 4, fontWeight: 600 }}>
                                <XCircle size={14} /> İptal Edildi
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
