import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, ShoppingBag, Truck, Wallet, LogOut, Store } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import logoImg from '../../assets/Aras_Isletmem_Logo.png';

const menuItems = [
  { path: '/seller/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/seller/products', label: 'Ürünlerim', icon: ShoppingBag },
  { path: '/seller/orders', label: 'Siparişler', icon: Truck },
  { path: '/seller/wallet', label: 'Cüzdanım', icon: Wallet },
];

export default function SellerSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { userEmail, logout } = useAuth();

  const initials = userEmail
    ? userEmail.split('@')[0].slice(0, 2).toUpperCase()
    : 'SL';

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <aside className="seller-sidebar">
      <div className="seller-sidebar-brand" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 6 }}>
        <img src={logoImg} alt="Aras İşletmem" style={{ height: '34px', width: 'auto', objectFit: 'contain' }} />
        <span style={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: 1.5, fontWeight: 700, color: 'var(--primary)', paddingLeft: 2 }}>Satıcı Paneli</span>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map(item => (
          <Link
            key={item.path}
            to={item.path}
            className={`sidebar-link ${location.pathname === item.path ? 'active' : ''}`}
          >
            <item.icon size={18} />
            {item.label}
          </Link>
        ))}

        <div style={{ height: 1, background: 'var(--divider)', margin: '16px 0' }} />

        <Link to="/" className="sidebar-link">
          <Store size={18} />
          Mağaza Vitrinine Git
        </Link>
      </nav>

      <div className="sidebar-footer">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div className="sidebar-user">
            <div className="sidebar-avatar">{initials}</div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600 }}>
                {userEmail ? userEmail.split('@')[0] : 'Satıcı'}
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Kurumsal Ortak</div>
            </div>
          </div>
          <button className="btn btn-ghost btn-icon" onClick={handleLogout} title="Çıkış Yap">
            <LogOut size={16} style={{ color: 'var(--danger)' }} />
          </button>
        </div>
      </div>
    </aside>
  );
}
