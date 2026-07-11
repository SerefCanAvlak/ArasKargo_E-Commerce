import { useState, useEffect } from 'react';
import { Wallet, Info } from 'lucide-react';
import { getSellerWallet } from '../../api';
import SellerSidebar from '../../components/layout/SellerSidebar';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { useToast } from '../../components/ui/Toast';

export default function WalletPage() {
  const [wallet, setWallet] = useState({ availableBalance: 0, pendingBalance: 0 });
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  useEffect(() => { loadWallet(); }, []);

  const loadWallet = async () => {
    setLoading(true);
    try {
      const data = await getSellerWallet();
      setWallet(data);
    } catch {
      setWallet({ availableBalance: 0, pendingBalance: 0 });
    } finally {
      setLoading(false);
    }
  };

  const totalBalance = (wallet.availableBalance || 0) + (wallet.pendingBalance || 0);

  return (
    <div className="seller-layout">
      <SellerSidebar />
      <main className="seller-main">
        <div className="seller-page-header">
          <div>
            <h1 className="seller-page-title">Cüzdanım</h1>
            <p className="seller-page-subtitle">Finansal bakiye ve T-SQL Trigger mekanizması.</p>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={loadWallet}>Yenile</button>
        </div>

        {loading ? <LoadingSpinner /> : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {/* Wallet Hero */}
            <div className="wallet-hero">
              <div style={{ position: 'absolute', right: -20, bottom: -20, opacity: 0.12 }}>
                <Wallet size={160} />
              </div>
              <div style={{ position: 'relative', zIndex: 1 }}>
                <h3 style={{ fontSize: 13, textTransform: 'uppercase', letterSpacing: 1, opacity: 0.8, fontWeight: 700 }}>
                  Aras Finans Cüzdan
                </h3>
                <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 44, fontWeight: 800, margin: '12px 0 4px' }}>
                  {totalBalance.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL
                </h1>
                <p style={{ fontSize: 13, opacity: 0.8 }}>Toplam hesap bakiyeniz</p>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32, marginTop: 32, paddingTop: 20, borderTop: '1px solid rgba(255,255,255,0.15)' }}>
                  <div>
                    <span style={{ fontSize: 11, opacity: 0.8, textTransform: 'uppercase' }}>Çekilebilir Bakiye</span>
                    <h2 style={{ fontSize: 24, fontWeight: 700, margin: '4px 0' }}>
                      {wallet.availableBalance.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL
                    </h2>
                  </div>
                  <div>
                    <span style={{ fontSize: 11, opacity: 0.8, textTransform: 'uppercase' }}>Bekleyen (Kargodakiler)</span>
                    <h2 style={{ fontSize: 24, fontWeight: 700, margin: '4px 0' }}>
                      {wallet.pendingBalance.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL
                    </h2>
                  </div>
                </div>
              </div>
            </div>

            {/* Trigger Explanation */}
            <div className="card">
              <div className="card-body">
                <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 16, fontWeight: 700, marginBottom: 20 }}>
                  T-SQL Trigger Mekanizması
                </h3>
                <div style={{
                  display: 'flex', gap: 12, padding: 16,
                  background: 'var(--info-bg)', borderRadius: 'var(--radius-md)',
                  border: '1px solid rgba(59,130,246,0.15)'
                }}>
                  <Info size={20} style={{ color: 'var(--info)', flexShrink: 0, marginTop: 2 }} />
                  <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                    <strong style={{ color: 'var(--text)' }}>Süreç Nasıl Çalışıyor?</strong>
                    <p style={{ marginTop: 6 }}>
                      Müşteri ödeme yaptığında, tutar satıcının cüzdanında <strong>"Bekleyen Bakiye"</strong> alanına aktarılır.
                      Sipariş <strong>"Teslim Edildi"</strong> yapıldığında veritabanındaki{' '}
                      <code style={{ background: 'var(--bg)', padding: '2px 6px', borderRadius: 4, fontSize: 12 }}>
                        TR_UpdateWalletOnOrderDelivery
                      </code>{' '}
                      T-SQL Trigger otomatik devreye girer.
                    </p>
                    <p style={{ marginTop: 6, color: 'var(--success)' }}>
                      Tetikleyici, sipariş tutarını Bekleyen Bakiye'den düşer ve Çekilebilir Bakiye'ye ekler.
                      Uygulama katmanında ek işlem gerekmez!
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 24 }}>
                  <button
                    className="btn btn-primary"
                    disabled={wallet.availableBalance <= 0}
                    onClick={() => addToast('Bakiyeniz banka hesabınıza aktarılmak üzere işleme alındı.')}
                  >
                    Banka Hesabıma Aktar
                  </button>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>IBAN: TR12 3456 7890 ****</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
