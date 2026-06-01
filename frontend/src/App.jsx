import { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Truck, 
  Wallet, 
  UserCheck, 
  Copy, 
  Plus, 
  CheckCircle, 
  AlertCircle, 
  Info, 
  ExternalLink, 
  Check, 
  LogOut, 
  DollarSign, 
  Package, 
  User, 
  Lock,
  ArrowRight,
  TrendingUp,
  MapPin,
  CreditCard,
  Phone
} from 'lucide-react';
import './App.css';

// API Base URL
const API_BASE = 'http://localhost:5086';

// Pre-seeded customer information for checkout simulation
const SEEDED_CUSTOMER_ID = 'a1b2c3d4-e5f6-4a5b-8c7d-9e0f1a2b3c4d';

function App() {
  // Navigation & Auth
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [token, setToken] = useState(localStorage.getItem('aras_seller_token') || '');
  const [currentTab, setCurrentTab] = useState('dashboard'); // 'dashboard' | 'products' | 'orders' | 'wallet' | 'customerPortal'
  const [loginEmail, setLoginEmail] = useState('seller@arasisletmem.com');
  const [loginPassword, setLoginPassword] = useState('123456');
  
  // Data State
  const [dashboard, setDashboard] = useState(null);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [wallet, setWallet] = useState({ availableBalance: 0, pendingBalance: 0 });
  const [loading, setLoading] = useState(false);
  
  // Modal & Forms State
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [newProduct, setNewProduct] = useState({
    title: '',
    description: '',
    price: '',
    stock: '',
    imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=60' // Default beautiful modern gadget image
  });
  
  // Public Customer Portal State
  const [checkoutProduct, setCheckoutProduct] = useState(null);
  const [checkoutForm, setCheckoutForm] = useState({
    firstName: 'Ali',
    lastName: 'Yılmaz',
    email: 'ali.yilmaz@example.com',
    phoneNumber: '05321112233',
    city: 'İstanbul',
    district: 'Kadıköy',
    address: 'Örnek Mah. Test Sok. No:1',
    cardNumber: '4355 8812 9901 2234',
    cardExpiry: '12/28',
    cardCvc: '445'
  });
  
  // Notifications
  const [toasts, setToasts] = useState([]);
  const [isDemoMode, setIsDemoMode] = useState(false);

  // Add toast helper
  const addToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  // Sync token to localstorage
  useEffect(() => {
    if (token) {
      localStorage.setItem('aras_seller_token', token);
      setIsAuthenticated(true);
    } else {
      localStorage.removeItem('aras_seller_token');
      setIsAuthenticated(false);
    }
  }, [token]);

  // Load All Dashboard and App Data when Auth changes
  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated, currentTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Test backend connection
      const response = await fetch(`${API_BASE}/api/seller/dashboard`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) {
        throw new Error('API Offline / Unauthorized');
      }

      setIsDemoMode(false);
      
      // Fetch Dashboard
      const dashData = await response.json();
      setDashboard(dashData);

      // Fetch Wallet
      const walletRes = await fetch(`${API_BASE}/api/seller/wallet`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (walletRes.ok) {
        const wData = await walletRes.json();
        setWallet(wData);
      }

      // Fetch Products
      const prodRes = await fetch(`${API_BASE}/api/products`);
      if (prodRes.ok) {
        const pData = await prodRes.json();
        setProducts(pData.items || pData || []);
      }

      // Fetch Orders
      const ordRes = await fetch(`${API_BASE}/api/orders`);
      if (ordRes.ok) {
        const oData = await ordRes.json();
        setOrders(oData || []);
      }

    } catch (error) {
      console.warn('API connection failed. Running in visual demo mode.', error);
      setIsDemoMode(true);
      loadMockData();
    } finally {
      setLoading(false);
    }
  };

  // Pre-fill gorgeous high-fidelity Mock Data for local representation if backend is down
  const loadMockData = () => {
    setWallet({ availableBalance: 1500.00, pendingBalance: 350.00 });
    
    const mockProds = [
      {
        id: '6643bf2a3f12a456b89c1021',
        title: 'Premium Pamuklu T-Shirt',
        description: '%100 organik pamuklu, minimalist kesim unisex t-shirt.',
        price: 349.90,
        stock: 45,
        slug: 'premium-pamuklu-t-shirt',
        sharedLink: 'http://localhost:5173/products/premium-pamuklu-t-shirt',
        images: ['https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600&auto=format&fit=crop&q=60']
      },
      {
        id: '6643bf2a3f12a456b89c1022',
        title: 'Akıllı Termos Kupa',
        description: 'Sıcaklık göstergeli, paslanmaz çelik sızdırmaz seyahat kupası.',
        price: 599.90,
        stock: 20,
        slug: 'akilli-termos-kupa',
        sharedLink: 'http://localhost:5173/products/akilli-termos-kupa',
        images: ['https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&auto=format&fit=crop&q=60']
      },
      {
        id: '6643bf2a3f12a456b89c1023',
        title: 'El Yapımı Deri Cüzdan',
        description: 'Hakiki deriden üretilmiş, minimalist dikişli kartlık cüzdan.',
        price: 450.00,
        stock: 12,
        slug: 'el-yapimi-deri-cuzdan',
        sharedLink: 'http://localhost:5173/products/el-yapimi-deri-cuzdan',
        images: ['https://images.unsplash.com/photo-1627123424574-724758594e93?w=600&auto=format&fit=crop&q=60']
      }
    ];
    setProducts(mockProds);

    const mockOrds = [
      {
        id: 'o1',
        orderNumber: '#1052',
        productId: '6643bf2a3f12a456b89c1021',
        totalAmount: 349.90,
        orderStatus: 1, // PaymentReceived
        cargoTrackingNumber: null,
        createdAt: new Date().toISOString()
      },
      {
        id: 'o2',
        orderNumber: '#1051',
        productId: '6643bf2a3f12a456b89c1022',
        totalAmount: 599.90,
        orderStatus: 3, // InCargo
        cargoTrackingNumber: 'ARAS-9831094',
        createdAt: new Date(Date.now() - 86400000).toISOString()
      },
      {
        id: 'o3',
        orderNumber: '#1050',
        productId: '6643bf2a3f12a456b89c1023',
        totalAmount: 450.00,
        orderStatus: 4, // Delivered
        cargoTrackingNumber: 'ARAS-1102931',
        createdAt: new Date(Date.now() - 172800000).toISOString()
      }
    ];
    setOrders(mockOrds);

    setDashboard({
      totalSales: 1399.80,
      totalOrdersCount: 3,
      pendingPaymentsCount: 1,
      cargoRequestedCount: 1,
      recentOrders: [
        { orderNumber: "#1052", customer: "Ali Yılmaz", amount: 349.90, date: "2026-06-01", status: "Ödeme Alındı" },
        { orderNumber: "#1051", customer: "Merve Kaya", amount: 599.90, date: "2026-05-31", status: "Kargoda" },
        { orderNumber: "#1050", customer: "Ahmet Koç", amount: 450.00, date: "2026-05-30", status: "Teslim Edildi" }
      ]
    });
  };

  // Perform API Login
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/Auth/seller/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword })
      });

      if (!response.ok) {
        throw new Error('Giriş bilgileri hatalı veya backend çevrimdışı.');
      }

      const data = await response.json();
      setToken(data.token);
      addToast('Giriş başarıyla yapıldı. Aras İşletmem paneline hoş geldiniz!');
    } catch (err) {
      console.warn('Backend login connection failed, bypass to visual demo.', err);
      // Backend is down, let's allow bypass for demo presentation
      setToken('mock-demo-jwt-token-val');
      addToast('Demo Modu: Çevrimdışı bağlantı ile giriş yapıldı.', 'info');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setToken('');
    setIsAuthenticated(false);
    addToast('Oturum sonlandırıldı.');
  };

  // Add Product (MongoDB)
  const handleAddProduct = async (e) => {
    e.preventDefault();
    setLoading(true);
    const payload = {
      title: newProduct.title,
      description: newProduct.description,
      price: parseFloat(newProduct.price),
      stock: parseInt(newProduct.stock),
      images: [newProduct.imageUrl]
    };

    try {
      if (isDemoMode) {
        const createdMock = {
          id: 'mock-' + Math.random().toString(36).substr(2, 9),
          title: payload.title,
          description: payload.description,
          price: payload.price,
          stock: payload.stock,
          slug: payload.title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, ''),
          images: payload.images,
          sharedLink: `http://localhost:5173/products/${payload.title.toLowerCase().replace(/ /g, '-')}`
        };
        setProducts(prev => [createdMock, ...prev]);
        setIsProductModalOpen(false);
        addToast('Demo Modu: Ürün MongoDB simülasyonuna eklendi.');
        return;
      }

      const response = await fetch(`${API_BASE}/api/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error('Ürün eklenemedi.');

      const data = await response.json();
      addToast('Harika! Yeni ürününüz eklendi ve Paylaşım Linki oluşturuldu.');
      setIsProductModalOpen(false);
      setNewProduct({ title: '', description: '', price: '', stock: '', imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=60' });
      fetchData();
    } catch (err) {
      addToast('Ürün ekleme işlemi başarısız: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Copy product share link to clipboard with premium toast feedback
  const copyToClipboard = (link) => {
    navigator.clipboard.writeText(link);
    addToast('Ürün Paylaşım Linki kopyalandı! Sosyal medyada paylaşmaya hazır. 🚀');
  };

  // Call Courier Action (Aras Kargo Integration through RabbitMQ Worker)
  const handleCallCourier = async (orderId) => {
    try {
      if (isDemoMode) {
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, orderStatus: 3, cargoTrackingNumber: 'ARAS-' + Math.floor(1000000 + Math.random() * 9000000) } : o));
        addToast('Kurye Çağrıldı! Kargo durum simülasyonu "Kargoda" olarak güncellendi.', 'success');
        return;
      }

      const res = await fetch(`${API_BASE}/api/orders/${orderId}/call-courier`, {
        method: 'POST'
      });

      if (!res.ok) throw new Error('Kurye çağrılamadı.');
      
      const data = await res.json();
      addToast(`📦 ${data.message} Takip No: ${data.cargoTrackingNumber}`);
      fetchData();
    } catch (err) {
      addToast('Lojistik hatası: ' + err.message, 'error');
    }
  };

  // Simulate Delivering Order (triggers T-SQL trigger on DB update and updates Wallet balances)
  const handleDeliverOrder = async (orderId) => {
    try {
      if (isDemoMode) {
        const order = orders.find(o => o.id === orderId);
        if (order) {
          setOrders(prev => prev.map(o => o.id === orderId ? { ...o, orderStatus: 4 } : o));
          setWallet(w => ({
            availableBalance: w.availableBalance + order.totalAmount,
            pendingBalance: w.pendingBalance - order.totalAmount
          }));
          addToast('Demo Modu: Sipariş teslim edildi! (Cüzdan bakiyeleri simüle edildi)');
        }
        return;
      }

      // 4 represents Delivered in OrderStatus enum
      const res = await fetch(`${API_BASE}/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: '4' 
      });

      if (!res.ok) throw new Error('Durum güncellenemedi.');

      addToast('Sipariş başarıyla "Teslim Edildi" olarak güncellendi! T-SQL Veritabanı tetikleyicisi (Trigger) çalıştı! ⚡');
      
      // Refresh to pull updated Wallet and Order data reflecting trigger action
      setTimeout(() => {
        fetchData();
      }, 500);

    } catch (err) {
      addToast('Güncelleme hatası: ' + err.message, 'error');
    }
  };

  // Customer Checkout Simulation (Places an order)
  const handleCustomerCheckout = async (e) => {
    e.preventDefault();
    if (!checkoutProduct) {
      addToast('Lütfen satın almak istediğiniz ürünü seçin.', 'error');
      return;
    }
    
    setLoading(true);
    
    const payload = {
      productId: checkoutProduct.id,
      customerId: SEEDED_CUSTOMER_ID,
      amount: checkoutProduct.price
    };

    try {
      if (isDemoMode) {
        const newMockOrder = {
          id: 'o-' + Math.random().toString(36).substr(2, 9),
          orderNumber: '#' + Math.floor(1000 + Math.random() * 9000),
          productId: payload.productId,
          totalAmount: payload.amount,
          orderStatus: 1, // PaymentReceived
          cargoTrackingNumber: null,
          createdAt: new Date().toISOString()
        };
        
        setOrders(prev => [newMockOrder, ...prev]);
        addToast('Sipariş başarıyla oluşturuldu! RabbitMQ Consumer simülasyonu başlatıldı.', 'success');
        
        // Simulate RabbitMQ Worker updating status to Preparing in 3 seconds
        setTimeout(() => {
          setOrders(prev => prev.map(o => o.id === newMockOrder.id ? { ...o, orderStatus: 2 } : o));
          addToast(`🐰 RabbitMQ Consumer: Sipariş ${newMockOrder.orderNumber} işlendi! Durum "Hazırlanıyor" yapıldı.`, 'info');
        }, 4000);
        
        setCurrentTab('orders');
        return;
      }

      const res = await fetch(`${API_BASE}/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error('Sipariş oluşturulamadı.');
      
      const data = await res.json();
      addToast(`🎉 Sipariş Alındı! Sipariş No: ${data.orderNumber}. RabbitMQ ile asenkron kargo kodu hazırlanıyor...`, 'success');
      
      setCurrentTab('orders');
      
      // Auto refresh order status after consumer processes it
      setTimeout(() => {
        fetchData();
        addToast('🐰 RabbitMQ Consumer: Sipariş kargo kodu oluşturuldu ve durum güncellendi!', 'info');
      }, 5000);

    } catch (err) {
      addToast('Ödeme hatası: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Helpers
  const getStatusText = (status) => {
    switch (status) {
      case 1: return 'Ödeme Alındı';
      case 2: return 'Hazırlanıyor';
      case 3: return 'Kargoda';
      case 4: return 'Teslim Edildi';
      default: return 'Bilinmiyor';
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 1: return 'received';
      case 2: return 'preparing';
      case 3: return 'incargo';
      case 4: return 'delivered';
      default: return '';
    }
  };

  const getProductTitle = (prodId) => {
    const product = products.find(p => p.id === prodId);
    return product ? product.title : 'Bilinmeyen Ürün';
  };

  // Auth screen renders if not logged in
  if (!isAuthenticated) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '20px' }}>
        <div className="glass-card modal-content" style={{ padding: '40px' }}>
          <div className="brand-section" style={{ justifyContent: 'center', marginBottom: '32px' }}>
            <div className="brand-logo-glow">
              <LayoutDashboard size={24} style={{ color: '#fff' }} />
            </div>
            <div>
              <h2 className="brand-name">ARAS İŞLETMEM</h2>
              <p className="brand-tagline">Satıcı Yönetim Paneli</p>
            </div>
          </div>
          
          <h2 style={{ textAlign: 'center', marginBottom: '24px', fontSize: '22px' }}>Hoş Geldiniz</h2>
          
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label className="form-label">E-Posta Adresi</label>
              <div style={{ position: 'relative' }}>
                <User size={18} style={{ position: 'absolute', left: '16px', top: '14px', color: '#5e6475' }} />
                <input 
                  type="email" 
                  className="form-input" 
                  style={{ paddingLeft: '48px' }} 
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="seller@arasisletmem.com"
                  required
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '32px' }}>
              <label className="form-label">Şifre</label>
              <div style={{ position: 'relative' }}>
                <Lock size={18} style={{ position: 'absolute', left: '16px', top: '14px', color: '#5e6475' }} />
                <input 
                  type="password" 
                  className="form-input" 
                  style={{ paddingLeft: '48px' }} 
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••"
                  required
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary glow-btn" style={{ width: '100%', padding: '14px' }}>
              Giriş Yap <ArrowRight size={18} />
            </button>
          </form>

          <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '8px', padding: '16px', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '8px', border: '1px solid var(--border)' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--primary)' }}>TEST HESAP BİLGİLERİ:</span>
            <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}><b>E-Posta:</b> seller@arasisletmem.com</span>
            <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}><b>Şifre:</b> 123456</span>
          </div>
        </div>

        {/* Floating Toasts */}
        <div className="toast-container">
          {toasts.map(toast => (
            <div key={toast.id} className="toast" style={{ borderLeftColor: toast.type === 'error' ? '#ff3d00' : toast.type === 'info' ? '#00e5ff' : 'var(--primary)' }}>
              {toast.type === 'error' ? <AlertCircle size={18} style={{ color: '#ff3d00' }} /> : toast.type === 'info' ? <Info size={18} style={{ color: '#00e5ff' }} /> : <CheckCircle size={18} style={{ color: 'var(--color-delivered)' }} />}
              <span>{toast.message}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      {/* Sidebar navigation */}
      <aside className="sidebar">
        <div className="brand-section">
          <div className="brand-logo-glow">
            <LayoutDashboard size={24} style={{ color: '#fff' }} />
          </div>
          <div>
            <h2 className="brand-name">ARAS İŞLETMEM</h2>
            <p className="brand-tagline">Güvenli Lojistik</p>
          </div>
        </div>

        {isDemoMode && (
          <div style={{ padding: '8px 12px', background: 'rgba(255, 145, 0, 0.1)', border: '1px solid rgba(255, 145, 0, 0.2)', borderRadius: '8px', marginBottom: '24px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-preparing)' }}>
            <AlertCircle size={14} />
            <span>API Çevrimdışı (Demo Modu)</span>
          </div>
        )}

        <nav style={{ flexGrow: 1 }}>
          <ul className="menu-list">
            <li className={`menu-item ${currentTab === 'dashboard' ? 'active' : ''}`} onClick={() => setCurrentTab('dashboard')}>
              <LayoutDashboard size={20} /> Dashboard
            </li>
            <li className={`menu-item ${currentTab === 'products' ? 'active' : ''}`} onClick={() => setCurrentTab('products')}>
              <ShoppingBag size={20} /> Ürün Kataloğu
            </li>
            <li className={`menu-item ${currentTab === 'orders' ? 'active' : ''}`} onClick={() => setCurrentTab('orders')}>
              <Truck size={20} /> Siparişler & Kargo
            </li>
            <li className={`menu-item ${currentTab === 'wallet' ? 'active' : ''}`} onClick={() => setCurrentTab('wallet')}>
              <Wallet size={20} /> Cüzdanım
            </li>
            <li className={`menu-item ${currentTab === 'customerPortal' ? 'active' : ''}`} onClick={() => setCurrentTab('customerPortal')}>
              <UserCheck size={20} style={{ color: 'var(--color-delivered)' }} /> Müşteri Satın Alım
            </li>
          </ul>
        </nav>

        <div className="sidebar-footer">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
            <div className="user-profile-badge">
              <div className="avatar">TS</div>
              <div className="user-info">
                <span className="user-title">Test Satıcısı</span>
                <span className="user-subtitle">Kurumsal Ortak</span>
              </div>
            </div>
            <button onClick={handleLogout} className="btn btn-secondary" style={{ padding: '8px', minWidth: 'auto', borderRadius: '50%' }} title="Güvenli Çıkış">
              <LogOut size={16} style={{ color: '#ff3d00' }} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Panel Content Area */}
      <main className="main-content">
        <header className="page-header">
          <div>
            <h1 className="page-title">
              {currentTab === 'dashboard' && 'Genel Bakış'}
              {currentTab === 'products' && 'Ürün Kataloğu'}
              {currentTab === 'orders' && 'Sipariş & Lojistik Merkezi'}
              {currentTab === 'wallet' && 'Finansal Cüzdan'}
              {currentTab === 'customerPortal' && 'Müşteri Satın Alma Portal Mock'}
            </h1>
            <p className="page-subtitle">
              {currentTab === 'dashboard' && 'Satışlarınızı, bekleyen cüzdan bakiyelerinizi ve siparişlerinizi gerçek zamanlı analiz edin.'}
              {currentTab === 'products' && 'NoSQL MongoDB altyapısı ile yönetilen ürün kataloğunuz ve paylaşılabilir sosyal medya linkleriniz.'}
              {currentTab === 'orders' && 'Lojistik entegrasyonu. Kargo kuryesi çağırın, siparişleri takip edin ve trigger simülasyonunu yönetin.'}
              {currentTab === 'wallet' && 'Satış gelirleriniz, bekleyen bakiyeleriniz ve veritabanı trigger finansal güncellemeleriniz.'}
              {currentTab === 'customerPortal' && 'Satıcının kopyalayıp paylaştığı linke tıklayan bir müşterinin ödeme ve sipariş deneyim simülasyonu.'}
            </p>
          </div>
          
          <div style={{ display: 'flex', gap: '12px' }}>
            {currentTab === 'products' && (
              <button onClick={() => setIsProductModalOpen(true)} className="btn btn-primary glow-btn">
                <Plus size={18} /> Yeni Ürün Ekle
              </button>
            )}
            <button onClick={fetchData} className={`btn btn-secondary ${loading ? 'pulse-icon' : ''}`}>
              Yenile
            </button>
          </div>
        </header>

        {/* TAB 1: DASHBOARD VIEW */}
        {currentTab === 'dashboard' && (
          <>
            {/* KPI Cards Grid */}
            <div className="stat-grid">
              <div className="glass-card stat-card">
                <div className="stat-icon"><DollarSign size={20} /></div>
                <div className="stat-value">{dashboard ? (dashboard.totalSales || 0).toLocaleString('tr-TR', { minimumFractionDigits: 2 }) : '0,00'} TL</div>
                <div className="stat-label">Toplam Satış Tutarı</div>
              </div>

              <div className="glass-card stat-card">
                <div className="stat-icon" style={{ color: 'var(--color-received)' }}><Package size={20} /></div>
                <div className="stat-value">{dashboard ? dashboard.totalOrdersCount : '0'}</div>
                <div className="stat-label">Toplam Alınan Sipariş</div>
              </div>

              <div className="glass-card stat-card">
                <div className="stat-icon" style={{ color: 'var(--color-preparing)' }}><Wallet size={20} /></div>
                <div className="stat-value">{wallet.pendingBalance.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL</div>
                <div className="stat-label">Cüzdanda Bekleyen Bakiye</div>
              </div>

              <div className="glass-card stat-card">
                <div className="stat-icon" style={{ color: 'var(--color-delivered)' }}><CheckCircle size={20} /></div>
                <div className="stat-value">{wallet.availableBalance.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL</div>
                <div className="stat-label">Çekilebilir Net Bakiye</div>
              </div>
            </div>

            {/* Visual Charts and Activities */}
            <div className="dash-chart-grid">
              {/* Mock visual stats graph representor */}
              <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '18px', fontWeight: 600 }}>Satış Trendi Analizi</h3>
                  <span style={{ fontSize: '12px', color: 'var(--color-delivered)', background: 'var(--color-delivered-bg)', padding: '4px 8px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
                    <TrendingUp size={14} /> +12.4% bu hafta
                  </span>
                </div>
                
                {/* Custom glowing responsive grid chart layout */}
                <div style={{ height: '220px', display: 'flex', alignItems: 'flex-end', gap: '16px', padding: '20px 0 10px', borderBottom: '1px solid var(--border)', position: 'relative' }}>
                  <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', zIndex: 0, pointerEvents: 'none' }}>
                    <div style={{ width: '100%', borderBottom: '1px dashed rgba(255,255,255,0.03)' }}></div>
                    <div style={{ width: '100%', borderBottom: '1px dashed rgba(255,255,255,0.03)' }}></div>
                    <div style={{ width: '100%', borderBottom: '1px dashed rgba(255,255,255,0.03)' }}></div>
                  </div>
                  
                  <div style={{ flex: 1, height: '30%', background: 'rgba(255,255,255,0.05)', borderRadius: '4px 4px 0 0', position: 'relative', display: 'flex', justifyContent: 'center' }}>
                    <span style={{ position: 'absolute', bottom: '-24px', fontSize: '11px', color: 'var(--text-muted)' }}>Pzt</span>
                  </div>
                  <div style={{ flex: 1, height: '45%', background: 'rgba(255,255,255,0.05)', borderRadius: '4px 4px 0 0', position: 'relative', display: 'flex', justifyContent: 'center' }}>
                    <span style={{ position: 'absolute', bottom: '-24px', fontSize: '11px', color: 'var(--text-muted)' }}>Sal</span>
                  </div>
                  <div style={{ flex: 1, height: '35%', background: 'rgba(255,255,255,0.05)', borderRadius: '4px 4px 0 0', position: 'relative', display: 'flex', justifyContent: 'center' }}>
                    <span style={{ position: 'absolute', bottom: '-24px', fontSize: '11px', color: 'var(--text-muted)' }}>Çar</span>
                  </div>
                  <div style={{ flex: 1, height: '65%', background: 'rgba(255,255,255,0.05)', borderRadius: '4px 4px 0 0', position: 'relative', display: 'flex', justifyContent: 'center' }}>
                    <span style={{ position: 'absolute', bottom: '-24px', fontSize: '11px', color: 'var(--text-muted)' }}>Per</span>
                  </div>
                  <div style={{ flex: 1, height: '50%', background: 'rgba(255,255,255,0.05)', borderRadius: '4px 4px 0 0', position: 'relative', display: 'flex', justifyContent: 'center' }}>
                    <span style={{ position: 'absolute', bottom: '-24px', fontSize: '11px', color: 'var(--text-muted)' }}>Cum</span>
                  </div>
                  <div style={{ flex: 1, height: '85%', background: 'var(--primary-gradient)', borderRadius: '4px 4px 0 0', position: 'relative', display: 'flex', justifyContent: 'center', boxShadow: '0 4px 15px rgba(237, 28, 36, 0.2)' }}>
                    <span style={{ position: 'absolute', bottom: '-24px', fontSize: '11px', color: 'var(--text)' }}>Cmt</span>
                  </div>
                  <div style={{ flex: 1, height: '95%', background: 'var(--primary-gradient)', borderRadius: '4px 4px 0 0', position: 'relative', display: 'flex', justifyContent: 'center', boxShadow: '0 4px 20px rgba(237, 28, 36, 0.3)' }}>
                    <span style={{ position: 'absolute', bottom: '-24px', fontSize: '11px', color: 'var(--text)', fontWeight: 600 }}>Paz</span>
                  </div>
                </div>
                
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', textAlign: 'center', marginTop: '10px' }}>
                  Son 7 günlük sipariş oluşturma ve finansal döngü akışı.
                </p>
              </div>

              {/* Recent Actions / Status Panel */}
              <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '18px', fontWeight: 600 }}>Son Hareketler</h3>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {dashboard && dashboard.recentOrders && dashboard.recentOrders.length > 0 ? (
                    dashboard.recentOrders.slice(0, 3).map((item, idx) => (
                      <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '12px', borderBottom: idx !== 2 ? '1px solid var(--border)' : 'none' }}>
                        <div>
                          <p style={{ fontWeight: 600, fontSize: '14px' }}>Sipariş {item.orderNumber}</p>
                          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>Alıcı: {item.customer}</p>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <p style={{ fontWeight: 700, fontSize: '14px', color: 'var(--primary)' }}>{item.amount.toFixed(2)} TL</p>
                          <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{item.date}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
                      Son sipariş hareketi bulunmamaktadır.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}

        {/* TAB 2: PRODUCTS CATALOG (MongoDB) */}
        {currentTab === 'products' && (
          <div>
            {products.length === 0 ? (
              <div className="glass-card" style={{ textAlign: 'center', padding: '80px 20px' }}>
                <ShoppingBag size={48} style={{ color: 'var(--text-muted)', marginBottom: '16px' }} />
                <h3>MongoDB Kataloğunuz Boş</h3>
                <p style={{ color: 'var(--text-secondary)', marginTop: '8px', marginBottom: '24px' }}>
                  Henüz satışa çıkardığınız bir ürün bulunmuyor. Yeni bir ürün ekleyerek başlayabilirsiniz!
                </p>
                <button onClick={() => setIsProductModalOpen(true)} className="btn btn-primary">
                  <Plus size={18} /> İlk Ürünü Ekle
                </button>
              </div>
            ) : (
              <div className="product-grid">
                {products.map(product => (
                  <div key={product.id} className="glass-card product-card">
                    <div className="product-img-wrapper">
                      <img 
                        src={product.images && product.images[0] ? product.images[0] : 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=60'} 
                        alt={product.title} 
                        className="product-img" 
                      />
                    </div>
                    <h3 style={{ fontSize: '18px', fontWeight: 600, fontFamily: 'var(--font-heading)' }}>{product.title}</h3>
                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '6px', height: '36px', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                      {product.description}
                    </p>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px' }}>
                      <span className="product-price">{product.price.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL</span>
                      <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Stok: <b>{product.stock} Adet</b></span>
                    </div>

                    <div className="product-details">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', color: 'var(--text-muted)' }}>
                        <span style={{ background: 'rgba(255,255,255,0.03)', padding: '4px 8px', borderRadius: '4px', display: 'inline-block' }}>
                          Slug: {product.slug}
                        </span>
                      </div>
                      
                      <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                        <button 
                          onClick={() => copyToClipboard(product.sharedLink || `${window.location.origin}/products/${product.slug}`)} 
                          className="btn btn-secondary" 
                          style={{ flexGrow: 1, padding: '10px', fontSize: '12px' }}
                        >
                          <Copy size={14} /> Linki Kopyala
                        </button>
                        
                        <button 
                          onClick={() => {
                            setCheckoutProduct(product);
                            setCurrentTab('customerPortal');
                          }} 
                          className="btn btn-primary"
                          style={{ padding: '10px', minWidth: 'auto' }}
                          title="Müşteri Gözünden Satın Al"
                        >
                          <ExternalLink size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: ORDERS & SHIPPING CENTER */}
        {currentTab === 'orders' && (
          <div className="glass-card">
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '20px', fontWeight: 600, marginBottom: '24px' }}>
              Tüm Alınan Siparişler
            </h3>
            
            {orders.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
                <Truck size={40} style={{ marginBottom: '12px', opacity: 0.5 }} />
                <p>Henüz gelen bir sipariş bulunmamaktadır.</p>
                <p style={{ fontSize: '13px', marginTop: '6px' }}>Müşteri Portalından simülasyon bir sipariş oluşturabilirsiniz.</p>
              </div>
            ) : (
              <div className="table-container">
                <table className="custom-table">
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
                    {orders.map(order => (
                      <tr key={order.id}>
                        <td style={{ fontWeight: 600 }}>{order.orderNumber}</td>
                        <td>{getProductTitle(order.productId)}</td>
                        <td style={{ fontWeight: 700, color: 'var(--primary)' }}>{(order.totalAmount || 0).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL</td>
                        <td>
                          {order.cargoTrackingNumber ? (
                            <span style={{ fontFamily: 'monospace', fontSize: '13px', padding: '4px 8px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', borderRadius: '4px' }}>
                              {order.cargoTrackingNumber}
                            </span>
                          ) : (
                            <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Kod Bekleniyor...</span>
                          )}
                        </td>
                        <td>
                          <span className={`status-badge ${getStatusClass(order.orderStatus)}`}>
                            {getStatusText(order.orderStatus)}
                          </span>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', gap: '8px' }}>
                            {/* Call Courier for local pickups (OrderStatus <= 2: PaymentReceived or Preparing) */}
                            {order.orderStatus <= 2 && (
                              <button 
                                onClick={() => handleCallCourier(order.id)} 
                                className="btn btn-primary glow-btn"
                                style={{ padding: '8px 14px', fontSize: '12px' }}
                              >
                                <Truck size={14} /> Kurye Çağır
                              </button>
                            )}

                            {/* Deliver simulation to trigger T-SQL Trigger inside MSSQL DB */}
                            {order.orderStatus === 3 && (
                              <button 
                                onClick={() => handleDeliverOrder(order.id)} 
                                className="btn btn-accent"
                                style={{ padding: '8px 14px', fontSize: '12px' }}
                                title="Siparişi teslim durumuna güncelleyerek T-SQL Veritabanı Triggerını çalıştırır!"
                              >
                                <Check size={14} /> Siparişi Teslim Et
                              </button>
                            )}
                            
                            {order.orderStatus === 4 && (
                              <span style={{ fontSize: '12px', color: 'var(--color-delivered)', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600, paddingRight: '8px' }}>
                                <CheckCircle size={14} /> Tamamlandı
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: WALLET LEDGER */}
        {currentTab === 'wallet' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
            <div className="glass-card" style={{ background: 'var(--primary-gradient)', border: 'none', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', right: '-20px', bottom: '-20px', opacity: 0.15 }}>
                <Wallet size={180} />
              </div>
              <h3 style={{ fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.8, fontWeight: 700 }}>Aras Finans Cüzdan</h3>
              <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '48px', fontWeight: 800, margin: '16px 0 8px' }}>
                {(wallet.availableBalance + wallet.pendingBalance).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL
              </h1>
              <p style={{ fontSize: '13px', opacity: 0.8 }}>Toplam hesap bakiyeniz.</p>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginTop: '32px', paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.15)' }}>
                <div>
                  <span style={{ fontSize: '12px', opacity: 0.8, textTransform: 'uppercase' }}>Çekilebilir Bakiye</span>
                  <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#fff', margin: '4px 0' }}>
                    {wallet.availableBalance.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL
                  </h2>
                </div>
                <div>
                  <span style={{ fontSize: '12px', opacity: 0.8, textTransform: 'uppercase' }}>Bekleyen Bakiye (Kargodakiler)</span>
                  <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#fff', margin: '4px 0' }}>
                    {wallet.pendingBalance.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL
                  </h2>
                </div>
              </div>
            </div>

            <div className="glass-card">
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '18px', fontWeight: 600, marginBottom: '20px' }}>
                Veritabanı Seviyesinde Finansal Akış (T-SQL Trigger)
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', fontSize: '14px', color: 'var(--text-secondary)' }}>
                <div style={{ display: 'flex', gap: '12px', padding: '16px', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '8px', border: '1px solid var(--border)' }}>
                  <Info size={20} style={{ color: 'var(--color-received)', flexShrink: 0 }} />
                  <div>
                    <b style={{ color: '#fff' }}>Süreç Nasıl Çalışıyor?</b>
                    <p style={{ marginTop: '4px', fontSize: '13px' }}>
                      Müşteri ödeme yaptığında, para doğrudan satıcının cüzdanında <b>"Bekleyen Bakiye"</b> alanına aktarılır.
                      Sipariş Aras Kargo tarafından alıcıya ulaştırılıp durum <b>"Teslim Edildi"</b> yapıldığında veritabanındaki <code>TR_UpdateWalletOnOrderDelivery</code> adlı <b>T-SQL Trigger</b> devreye girer.
                    </p>
                    <p style={{ marginTop: '4px', fontSize: '13px', color: 'var(--color-delivered)' }}>
                      Tetikleyici, sipariş tutarını otomatik olarak Bekleyen Bakiye'den düşer ve Çekilebilir Net Bakiye alanına ekler. Kod tarafında ek iş yapılmasına gerek kalmaz!
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' }}>
                  <button 
                    onClick={() => {
                      addToast('Bakiyeniz anlaşmalı banka hesabınıza aktarılmak üzere işleme alındı.');
                    }} 
                    className="btn btn-primary glow-btn"
                    disabled={wallet.availableBalance <= 0}
                  >
                    Banka Hesabıma Aktar
                  </button>
                  
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Anlaşmalı Banka IBAN: TR123456789</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: CUSTOMER PURCHASE PORTAL (Public checkout representation) */}
        {currentTab === 'customerPortal' && (
          <div className="customer-portal">
            <div className="glass-card" style={{ border: '1px solid rgba(0, 230, 118, 0.25)', boxShadow: '0 0 20px rgba(0, 230, 118, 0.05)' }}>
              <span style={{ color: 'var(--color-delivered)', background: 'var(--color-delivered-bg)', padding: '6px 12px', borderRadius: '12px', fontSize: '12px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '6px', marginBottom: '16px' }}>
                <CheckCircle size={14} /> MÜŞTERİ SATIN ALMA DENEYİMİ
              </span>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '24px', fontWeight: 600 }}>
                Sosyal Medya Satış Entegrasyon Simülasyonu
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '6px' }}>
                Satıcının paylaştığı ürün linkine sosyal medyadan tıklayarak adrese sipariş verme adımını simüle edebilirsiniz.
              </p>
            </div>

            <div className="checkout-grid">
              {/* Product Info showcase */}
              <div className="product-showcase">
                <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '18px', fontWeight: 600, borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
                  Satın Alınacak Ürün
                </h3>

                {checkoutProduct ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div className="product-img-wrapper" style={{ paddingTop: '50%' }}>
                      <img src={checkoutProduct.images && checkoutProduct.images[0] ? checkoutProduct.images[0] : 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=60'} alt={checkoutProduct.title} className="product-img" />
                    </div>
                    <div>
                      <h2 style={{ fontSize: '22px', fontWeight: 700 }}>{checkoutProduct.title}</h2>
                      <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '6px' }}>{checkoutProduct.description}</p>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid var(--border)' }}>
                      <span style={{ fontSize: '14px', fontWeight: 600 }}>Toplam Ödenecek:</span>
                      <span style={{ fontSize: '22px', fontWeight: 800, color: 'var(--primary)' }}>{checkoutProduct.price.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL</span>
                    </div>
                    
                    <button onClick={() => setCheckoutProduct(null)} className="btn btn-secondary" style={{ alignSelf: 'flex-start', fontSize: '12px', padding: '8px 12px' }}>
                      Başka Ürün Seç
                    </button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Lütfen listeden bir ürün seçin:</p>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {products.map(p => (
                        <div 
                          key={p.id} 
                          className={`product-select-card ${checkoutProduct && checkoutProduct.id === p.id ? 'selected' : ''}`}
                          onClick={() => setCheckoutProduct(p)}
                        >
                          <img src={p.images && p.images[0] ? p.images[0] : ''} style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px' }} alt="" />
                          <div style={{ flexGrow: 1, textAlign: 'left' }}>
                            <p style={{ fontWeight: 600, fontSize: '14px' }}>{p.title}</p>
                            <p style={{ color: 'var(--primary)', fontSize: '13px', fontWeight: 700 }}>{p.price.toFixed(2)} TL</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Checkout billing form */}
              <div className="glass-card">
                <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '18px', fontWeight: 600, marginBottom: '20px' }}>
                  Alıcı Adres & Ödeme Bilgileri
                </h3>
                
                <form onSubmit={handleCustomerCheckout}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div className="form-group">
                      <label className="form-label">Ad</label>
                      <input 
                        type="text" 
                        className="form-input" 
                        value={checkoutForm.firstName} 
                        onChange={(e) => setCheckoutForm({...checkoutForm, firstName: e.target.value})}
                        required 
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Soyad</label>
                      <input 
                        type="text" 
                        className="form-input" 
                        value={checkoutForm.lastName} 
                        onChange={(e) => setCheckoutForm({...checkoutForm, lastName: e.target.value})}
                        required 
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '16px' }}>
                    <div className="form-group">
                      <label className="form-label">E-Posta</label>
                      <input 
                        type="email" 
                        className="form-input" 
                        value={checkoutForm.email} 
                        onChange={(e) => setCheckoutForm({...checkoutForm, email: e.target.value})}
                        required 
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Telefon</label>
                      <div style={{ position: 'relative' }}>
                        <Phone size={14} style={{ position: 'absolute', left: '12px', top: '15px', color: '#5e6475' }} />
                        <input 
                          type="text" 
                          className="form-input" 
                          style={{ paddingLeft: '36px' }}
                          value={checkoutForm.phoneNumber} 
                          onChange={(e) => setCheckoutForm({...checkoutForm, phoneNumber: e.target.value})}
                          required 
                        />
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div className="form-group">
                      <label className="form-label">İl</label>
                      <input 
                        type="text" 
                        className="form-input" 
                        value={checkoutForm.city} 
                        onChange={(e) => setCheckoutForm({...checkoutForm, city: e.target.value})}
                        required 
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">İlçe</label>
                      <input 
                        type="text" 
                        className="form-input" 
                        value={checkoutForm.district} 
                        onChange={(e) => setCheckoutForm({...checkoutForm, district: e.target.value})}
                        required 
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Tam Adres</label>
                    <div style={{ position: 'relative' }}>
                      <MapPin size={14} style={{ position: 'absolute', left: '12px', top: '15px', color: '#5e6475' }} />
                      <input 
                        type="text" 
                        className="form-input" 
                        style={{ paddingLeft: '36px' }}
                        value={checkoutForm.address} 
                        onChange={(e) => setCheckoutForm({...checkoutForm, address: e.target.value})}
                        required 
                      />
                    </div>
                  </div>

                  <div style={{ borderTop: '1px solid var(--border)', margin: '24px 0 16px', paddingTop: '16px' }}>
                    <div className="form-group">
                      <label className="form-label">Kart Numarası</label>
                      <div style={{ position: 'relative' }}>
                        <CreditCard size={14} style={{ position: 'absolute', left: '12px', top: '15px', color: '#5e6475' }} />
                        <input 
                          type="text" 
                          className="form-input" 
                          style={{ paddingLeft: '36px' }}
                          value={checkoutForm.cardNumber} 
                          onChange={(e) => setCheckoutForm({...checkoutForm, cardNumber: e.target.value})}
                          required 
                        />
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                      <div className="form-group">
                        <label className="form-label">Son Kullanma</label>
                        <input 
                          type="text" 
                          className="form-input" 
                          placeholder="AA/YY" 
                          value={checkoutForm.cardExpiry} 
                          onChange={(e) => setCheckoutForm({...checkoutForm, cardExpiry: e.target.value})}
                          required 
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">CVC</label>
                        <input 
                          type="text" 
                          className="form-input" 
                          placeholder="123" 
                          value={checkoutForm.cardCvc} 
                          onChange={(e) => setCheckoutForm({...checkoutForm, cardCvc: e.target.value})}
                          required 
                        />
                      </div>
                    </div>
                  </div>

                  <button type="submit" className="btn btn-primary glow-btn" style={{ width: '100%', padding: '14px', marginTop: '12px' }} disabled={loading}>
                    {loading ? 'Sipariş Alınıyor...' : 'Ödemeyi Tamamla ve Sipariş Ver'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Floating Product Create Modal (MongoDB schema based) */}
      {isProductModalOpen && (
        <div className="modal-overlay">
          <div className="glass-card modal-content">
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '22px', fontWeight: 700, marginBottom: '24px' }}>
              Yeni Ürün Tanımla (MongoDB)
            </h3>
            
            <form onSubmit={handleAddProduct}>
              <div className="form-group">
                <label className="form-label">Ürün Adı</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={newProduct.title}
                  onChange={(e) => setNewProduct({ ...newProduct, title: e.target.value })}
                  placeholder="Örn: Pamuklu T-Shirt"
                  required 
                />
              </div>

              <div className="form-group">
                <label className="form-label">Ürün Açıklaması</label>
                <textarea 
                  className="form-textarea" 
                  value={newProduct.description}
                  onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                  placeholder="Ürün materyali, kargo paket içeriği vb..."
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Fiyat (TL)</label>
                  <input 
                    type="number" 
                    step="0.01"
                    className="form-input" 
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                    placeholder="299.90"
                    required 
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Stok Adedi</label>
                  <input 
                    type="number" 
                    className="form-input" 
                    value={newProduct.stock}
                    onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
                    placeholder="50"
                    required 
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '28px' }}>
                <label className="form-label">Görsel URL</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={newProduct.imageUrl}
                  onChange={(e) => setNewProduct({ ...newProduct, imageUrl: e.target.value })}
                  placeholder="https://gorsel-adresi.com/resim.jpg"
                  required 
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setIsProductModalOpen(false)} className="btn btn-secondary">
                  İptal
                </button>
                <button type="submit" className="btn btn-primary glow-btn">
                  Ürünü Kaydet & Link Oluştur
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Floating Toast Notification Popups */}
      <div className="toast-container">
        {toasts.map(toast => (
          <div key={toast.id} className="toast" style={{ borderLeftColor: toast.type === 'error' ? '#ff3d00' : toast.type === 'info' ? '#00e5ff' : 'var(--primary)' }}>
            {toast.type === 'error' ? <AlertCircle size={18} style={{ color: '#ff3d00' }} /> : toast.type === 'info' ? <Info size={18} style={{ color: '#00e5ff' }} /> : <CheckCircle size={18} style={{ color: 'var(--color-delivered)' }} />}
            <span>{toast.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
