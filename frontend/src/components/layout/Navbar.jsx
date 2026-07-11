import { Link, useNavigate } from 'react-router-dom';
import { Search, ShoppingCart, User, Heart, LogOut, ChevronDown, Menu } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Navbar({ cartCount = 0, onCartOpen, searchQuery, onSearchChange }) {
  const { isAuthenticated, isSeller, isCustomer, userEmail, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleLogoClick = () => {
    onSearchChange?.('');
    navigate('/');
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    navigate(`/products?q=${encodeURIComponent(searchQuery || '')}`);
  };

  const handleCategoryClick = (catName) => {
    onSearchChange?.(catName);
    navigate(`/products?category=${encodeURIComponent(catName)}`);
  };

  return (
    <nav className="navbar">
      {/* Top Header Row */}
      <div className="navbar-top">
        <div className="navbar-inner-top">
          {/* Logo & Tagline */}
          <div onClick={handleLogoClick} className="navbar-brand" style={{ cursor: 'pointer' }}>
            <div className="navbar-brand-icon">
              {/* Aras style red chevron logo */}
              <svg viewBox="0 0 100 100" width="24" height="24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 15L70 50L20 85L35 50L20 15Z" fill="#ffffff" />
                <path d="M50 15L90 50L50 85L65 50L50 15Z" fill="rgba(255,255,255,0.6)" />
              </svg>
            </div>
            <div className="navbar-brand-text">
              <h1>aras işletmem</h1>
              <span>Girişimcinin Yanında.</span>
            </div>
          </div>

          {/* Search with Category Select Dropdown */}
          <form onSubmit={handleSearchSubmit} className="navbar-search-container">
            <div className="navbar-search-dropdown" onClick={() => navigate('/products')} style={{ cursor: 'pointer' }}>
              <span>Tüm Kategoriler</span>
              <ChevronDown size={14} />
            </div>
            <div className="navbar-search">
              <input
                type="text"
                placeholder="Ürün, mağaza veya kategori ara..."
                value={searchQuery || ''}
                onChange={(e) => onSearchChange?.(e.target.value)}
              />
              <button type="submit" className="navbar-search-btn" title="Ara">
                <Search size={18} />
              </button>
            </div>
          </form>

          {/* Action Items */}
          <div className="navbar-actions">
            {isAuthenticated ? (
              <>
                {isSeller ? (
                  <Link to="/seller/dashboard" className="navbar-action-item user-active">
                    <User size={20} />
                    <span>Satıcı Paneli</span>
                  </Link>
                ) : (
                  <div className="navbar-action-item user-active">
                    <User size={20} />
                    <span className="user-email-text">{userEmail.split('@')[0]}</span>
                  </div>
                )}
                <button className="navbar-action-item btn-logout-nav" onClick={handleLogout} title="Çıkış Yap">
                  <LogOut size={20} style={{ color: 'var(--primary)' }} />
                  <span>Çıkış</span>
                </button>
              </>
            ) : (
              <Link to="/login" className="navbar-action-item">
                <User size={20} />
                <span>Giriş Yap</span>
              </Link>
            )}

            <Link to="/" className="navbar-action-item">
              <Heart size={20} />
              <span>Favorilerim</span>
            </Link>

            {(isCustomer || !isAuthenticated) && (
              <button className="navbar-action-item navbar-cart-trigger" onClick={onCartOpen}>
                <div style={{ position: 'relative' }}>
                  <ShoppingCart size={20} />
                  {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
                </div>
                <span>Sepetim</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Header Row (Sub-Navbar Categories) */}
      <div className="navbar-bottom-row">
        <div className="navbar-inner-bottom">
          <div className="category-menu-trigger" onClick={() => navigate('/products')} style={{ cursor: 'pointer' }}>
            <Menu size={16} />
            <span>Tüm Kategoriler</span>
          </div>
          <div className="sub-navbar-links">
            <span onClick={() => handleCategoryClick('Kadın')} className="sub-nav-link">Kadın</span>
            <span onClick={() => handleCategoryClick('Erkek')} className="sub-nav-link">Erkek</span>
            <span onClick={() => handleCategoryClick('Ev & Yaşam')} className="sub-nav-link">Ev & Yaşam</span>
            <span onClick={() => handleCategoryClick('Kozmetik')} className="sub-nav-link">Kozmetik</span>
            <span onClick={() => handleCategoryClick('Elektronik')} className="sub-nav-link">Elektronik</span>
            <span onClick={() => handleCategoryClick('Spor & Outdoor')} className="sub-nav-link">Spor & Outdoor</span>
            <span onClick={() => handleCategoryClick('Hobi & Oyuncak')} className="sub-nav-link">Hobi & Oyuncak</span>
            <span onClick={() => handleCategoryClick('Kitap & Kırtasiye')} className="sub-nav-link">Kitap & Kırtasiye</span>
            <span onClick={() => handleCategoryClick('Fırsatlar')} className="sub-nav-link highlight-link">Fırsatlar</span>
          </div>
        </div>
      </div>
    </nav>
  );
}
