import { useState, useEffect } from 'react';
import { DollarSign, Package, Wallet, CheckCircle, TrendingUp } from 'lucide-react';
import { getSellerDashboard, getSellerWallet } from '../../api';
import SellerSidebar from '../../components/layout/SellerSidebar';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

export default function DashboardPage() {
  const [dashboard, setDashboard] = useState(null);
  const [wallet, setWallet] = useState({ availableBalance: 0, pendingBalance: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [dash, w] = await Promise.all([getSellerDashboard(), getSellerWallet()]);
      setDashboard(dash);
      setWallet(w);
    } catch {
      setDashboard(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="seller-layout">
      <SellerSidebar />
      <main className="seller-main">
        <div className="seller-page-header">
          <div>
            <h1 className="seller-page-title">Dashboard</h1>
            <p className="seller-page-subtitle">Satış istatistikleriniz ve finansal özet.</p>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={loadData}>Yenile</button>
        </div>

        {loading ? <LoadingSpinner /> : (
          <>
            {/* KPI Cards */}
            <div className="stat-grid">
              <div className="stat-card">
                <div className="stat-card-icon" style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>
                  <DollarSign size={22} />
                </div>
                <div className="stat-card-value">
                  {dashboard ? (dashboard.totalSales || 0).toLocaleString('tr-TR', { minimumFractionDigits: 2 }) : '0,00'} TL
                </div>
                <div className="stat-card-label">Toplam Satış</div>
              </div>

              <div className="stat-card">
                <div className="stat-card-icon" style={{ background: 'var(--info-bg)', color: 'var(--info)' }}>
                  <Package size={22} />
                </div>
                <div className="stat-card-value">{dashboard?.totalOrdersCount || 0}</div>
                <div className="stat-card-label">Toplam Sipariş</div>
              </div>

              <div className="stat-card">
                <div className="stat-card-icon" style={{ background: 'var(--warning-bg)', color: 'var(--warning)' }}>
                  <Wallet size={22} />
                </div>
                <div className="stat-card-value">
                  {wallet.pendingBalance.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL
                </div>
                <div className="stat-card-label">Bekleyen Bakiye</div>
              </div>

              <div className="stat-card">
                <div className="stat-card-icon" style={{ background: 'var(--success-bg)', color: 'var(--success)' }}>
                  <CheckCircle size={22} />
                </div>
                <div className="stat-card-value">
                  {wallet.availableBalance.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL
                </div>
                <div className="stat-card-label">Çekilebilir Bakiye</div>
              </div>
            </div>

            {/* Charts + Recent */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24 }}>
              {/* Chart */}
              <div className="card">
                <div className="card-body">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                    <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 16, fontWeight: 700 }}>Satış Trendi</h3>
                    <span className="badge badge-delivered" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <TrendingUp size={12} /> +12.4%
                    </span>
                  </div>
                  <div style={{ height: 200, display: 'flex', alignItems: 'flex-end', gap: 12, paddingBottom: 24, position: 'relative' }}>
                    {['Pzt','Sal','Çar','Per','Cum','Cmt','Paz'].map((day, i) => {
                      const heights = [30, 45, 35, 65, 50, 85, 95];
                      const isHigh = i >= 5;
                      return (
                        <div key={day} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                          <div style={{
                            width: '100%', height: `${heights[i]}%`,
                            background: isHigh ? 'var(--primary)' : 'var(--bg)',
                            borderRadius: '6px 6px 0 0',
                            transition: 'height 0.5s ease'
                          }} />
                          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{day}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Recent Orders */}
              <div className="card">
                <div className="card-body">
                  <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 16, fontWeight: 700, marginBottom: 20 }}>Son Siparişler</h3>
                  {dashboard?.recentOrders?.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                      {dashboard.recentOrders.slice(0, 4).map((order, idx) => (
                        <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 12, borderBottom: idx < 3 ? '1px solid var(--divider)' : 'none' }}>
                          <div>
                            <div style={{ fontWeight: 600, fontSize: 13 }}>{order.orderNumber}</div>
                            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{order.customer}</div>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--primary)' }}>
                              {order.amount?.toFixed(2)} TL
                            </div>
                            <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{order.date}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)', fontSize: 13 }}>
                      Henüz sipariş yok.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
