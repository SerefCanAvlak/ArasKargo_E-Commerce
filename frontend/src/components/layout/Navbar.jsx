import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ShoppingCart, User, Heart, LogOut, ChevronDown, Menu, Truck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getCategories } from '../../api';
import logoImg from '../../assets/Aras_Isletmem_Logo.png';

export default function Navbar({ cartCount = 0, onCartOpen, searchQuery, onSearchChange }) {
  const { isAuthenticated, isSeller, isCustomer, userEmail, logout } = useAuth();
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState({ id: '', name: 'Tüm Kategoriler' });
  const dropdownRef = useRef(null);
  const profileDropdownRef = useRef(null);

  useEffect(() => {
    loadCategories();

    // Close dropdown on click outside
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
        setShowProfileDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadCategories = async () => {
    try {
      const data = await getCategories();
      setCategories(data || []);
    } catch { }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleLogoClick = () => {
    onSearchChange?.('');
    setSelectedCategory({ id: '', name: 'Tüm Kategoriler' });
    navigate('/');
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery) params.set('q', searchQuery);
    if (selectedCategory.id) params.set('category', selectedCategory.name);
    navigate(`/products?${params.toString()}`);
  };

  const handleCategoryClick = (catName) => {
    onSearchChange?.(catName);
    setSelectedCategory(categories.find(c => c.name === catName) || { id: '', name: 'Tüm Kategoriler' });
    navigate(`/products?category=${encodeURIComponent(catName)}`);
  };

  return (
    <nav className="navbar">
      {/* Top Header Row */}
      <div className="navbar-top">
        <div className="navbar-inner-top">
          {/* Logo & Tagline */}
          <div onClick={handleLogoClick} className="navbar-brand" style={{ cursor: 'pointer' }}>
            <img src={logoImg} alt="Aras İşletmem" style={{ height: '40px', width: 'auto', objectFit: 'contain' }} />
          </div>

          {/* Search with Category Select Dropdown */}
          <form onSubmit={handleSearchSubmit} className="navbar-search-container" style={{ position: 'relative' }} ref={dropdownRef}>
            <div
              className="navbar-search-dropdown"
              onClick={() => setShowDropdown(!showDropdown)}
              style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, userSelect: 'none' }}
            >
              <span>{selectedCategory.name}</span>
              <ChevronDown size={14} />
            </div>

            {showDropdown && (
              <div
                className="dropdown-menu-list"
                style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  width: '210px',
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)',
                  boxShadow: 'var(--shadow-md)',
                  zIndex: 999,
                  marginTop: 6,
                  padding: '6px 0',
                  maxHeight: '300px',
                  overflowY: 'auto'
                }}
              >
                <div
                  onClick={() => {
                    setSelectedCategory({ id: '', name: 'Tüm Kategoriler' });
                    setShowDropdown(false);
                  }}
                  style={{
                    padding: '8px 16px',
                    fontSize: 13,
                    cursor: 'pointer',
                    background: selectedCategory.id === '' ? 'var(--bg)' : 'transparent',
                    fontWeight: selectedCategory.id === '' ? 700 : 500,
                    transition: 'var(--transition)'
                  }}
                  onMouseEnter={(e) => e.target.style.background = 'var(--bg)'}
                  onMouseLeave={(e) => e.target.style.background = selectedCategory.id === '' ? 'var(--bg)' : 'transparent'}
                >
                  Tüm Kategoriler
                </div>
                {categories.map(cat => {
                  const isActive = selectedCategory.id === cat.id;
                  return (
                    <div
                      key={cat.id}
                      onClick={() => {
                        setSelectedCategory(cat);
                        setShowDropdown(false);
                      }}
                      style={{
                        padding: '8px 16px',
                        fontSize: 13,
                        cursor: 'pointer',
                        background: isActive ? 'var(--bg)' : 'transparent',
                        fontWeight: isActive ? 700 : 500,
                        transition: 'var(--transition)'
                      }}
                      onMouseEnter={(e) => e.target.style.background = 'var(--bg)'}
                      onMouseLeave={(e) => e.target.style.background = isActive ? 'var(--bg)' : 'transparent'}
                    >
                      {cat.name}
                    </div>
                  );
                })}
              </div>
            )}

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
              <div className="profile-dropdown-container" ref={profileDropdownRef}>
                <div
                  className="navbar-action-item user-active"
                  onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                  style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
                >
                  <User size={20} />
                  <span>{userEmail ? userEmail.split('@')[0] : 'Hesabım'}</span>
                </div>

                {showProfileDropdown && (
                  <div className="profile-dropdown-menu">
                    <div className="profile-dropdown-header">
                      Giriş Yapılan Hesap
                      <div className="profile-dropdown-email">{userEmail}</div>
                    </div>
                    {isSeller && (
                      <Link to="/seller/dashboard" className="profile-dropdown-item" onClick={() => setShowProfileDropdown(false)}>
                        <User size={16} />
                        <span>Satıcı Paneli</span>
                      </Link>
                    )}
                    <Link to="/tracking" className="profile-dropdown-item" onClick={() => setShowProfileDropdown(false)}>
                      <Truck size={16} />
                      <span>Kargom Nerede</span>
                    </Link>
                    <button className="profile-dropdown-item" onClick={() => { handleLogout(); setShowProfileDropdown(false); }}>
                      <LogOut size={16} style={{ color: 'var(--danger)' }} />
                      <span style={{ color: 'var(--danger)' }}>Çıkış Yap</span>
                    </button>
                  </div>
                )}
              </div>
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
