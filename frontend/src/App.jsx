import { useState, useEffect, useCallback } from 'react';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { useToast } from './components/ui/Toast';
import { getBasket, addToBasket, updateBasketItem, removeBasketItem, getProducts } from './api';

import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import CartDrawer from './components/cart/CartDrawer';
import FavoritesDrawer from './components/layout/FavoritesDrawer';

import HomePage from './pages/HomePage';
import ProductDetailPage from './pages/ProductDetailPage';
import CheckoutPage from './pages/CheckoutPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProductsSearchPage from './pages/ProductsSearchPage';
import SellerStorePage from './pages/SellerStorePage';
import CargoTrackingPage from './pages/CargoTrackingPage';

import DashboardPage from './pages/seller/DashboardPage';
import ProductsPage from './pages/seller/ProductsPage';
import OrdersPage from './pages/seller/OrdersPage';
import WalletPage from './pages/seller/WalletPage';

function App() {
  const { isAuthenticated, isCustomer } = useAuth();
  const { addToast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  const [cart, setCart] = useState([]);
  const [products, setProducts] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [favsOpen, setFavsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [favorites, setFavorites] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('favorites') || '[]');
    } catch {
      return [];
    }
  });

  const handleToggleFavorite = useCallback((productId) => {
    const isAlreadyFav = favorites.includes(productId);
    if (isAlreadyFav) {
      addToast('Ürün favorilerinizden kaldırıldı.', 'info');
    } else {
      addToast('Ürün favorilerinize eklendi! ❤️');
    }

    setFavorites(prev => {
      const updated = prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId];
      localStorage.setItem('favorites', JSON.stringify(updated));
      return updated;
    });
  }, [addToast, favorites]);

  const isSellerRoute = location.pathname.startsWith('/seller');
  const isAuthRoute = location.pathname === '/login' || location.pathname === '/register';

  // Load products for cart reference
  useEffect(() => {
    getProducts(1, 100)
      .then(data => setProducts(data.items || data || []))
      .catch(() => {});
  }, []);

  // Fetch cart when authenticated as customer
  useEffect(() => {
    if (isAuthenticated && isCustomer) {
      fetchCart();
    }
  }, [isAuthenticated, isCustomer]);

  const fetchCart = async () => {
    try {
      const data = await getBasket();
      setCart(data.items || []);
    } catch {
      // silently fail
    }
  };

  const handleAddToCart = useCallback(async (productId, quantity = 1) => {
    if (!isAuthenticated || !isCustomer) {
      addToast('Alışveriş yapabilmek için üye girişi yapmalısınız.', 'warning');
      navigate('/login');
      return false;
    }

    try {
      await addToBasket(productId, quantity);
      addToast('Ürün sepete eklendi! 🛒');
      fetchCart();
      return true;
    } catch (err) {
      addToast('Sepete eklenemedi: ' + err.message, 'error');
      return false;
    }
  }, [isAuthenticated, isCustomer, addToast]);

  const handleUpdateQty = async (productId, newQty) => {
    if (newQty <= 0) {
      handleRemove(productId);
      return;
    }

    if (!isAuthenticated || !isCustomer) {
      setCart(prev => prev.map(i => i.productId === productId ? { ...i, quantity: newQty } : i));
      return;
    }

    try {
      await updateBasketItem(productId, newQty);
      fetchCart();
    } catch {}
  };

  const handleRemove = async (productId) => {
    if (!isAuthenticated || !isCustomer) {
      setCart(prev => prev.filter(i => i.productId !== productId));
      addToast('Ürün sepetten çıkarıldı.');
      return;
    }

    try {
      await removeBasketItem(productId);
      addToast('Ürün sepetten çıkarıldı.');
      fetchCart();
    } catch {}
  };

  const handleClearCart = () => setCart([]);

  const cartCount = cart.reduce((s, i) => s + i.quantity, 0);

  // Seller pages — no navbar/footer
  if (isSellerRoute) {
    return (
      <Routes>
        <Route path="/seller/dashboard" element={<DashboardPage />} />
        <Route path="/seller/products" element={<ProductsPage />} />
        <Route path="/seller/orders" element={<OrdersPage />} />
        <Route path="/seller/wallet" element={<WalletPage />} />
      </Routes>
    );
  }

  // Auth pages — no navbar/footer
  if (isAuthRoute) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Routes>
    );
  }

  // Public pages with navbar + footer
  return (
    <>
      <Navbar 
        cartCount={cart.reduce((sum, item) => sum + item.quantity, 0)} 
        onCartOpen={() => setCartOpen(true)}
        favoritesCount={favorites.length}
        onFavoritesOpen={() => setFavsOpen(true)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      <Routes>
        <Route path="/" element={<HomePage searchQuery={searchQuery} onSearchChange={setSearchQuery} onAddToCart={handleAddToCart} favorites={favorites} onToggleFavorite={handleToggleFavorite} />} />
        <Route path="/products" element={<ProductsSearchPage onAddToCart={handleAddToCart} favorites={favorites} onToggleFavorite={handleToggleFavorite} />} />
        <Route path="/products/:slug" element={<ProductDetailPage onAddToCart={handleAddToCart} favorites={favorites} onToggleFavorite={handleToggleFavorite} />} />
        <Route path="/store/:sellerId" element={<SellerStorePage onAddToCart={handleAddToCart} favorites={favorites} onToggleFavorite={handleToggleFavorite} />} />
        <Route path="/tracking" element={<CargoTrackingPage />} />
        <Route path="/tracking/:trackingNumber" element={<CargoTrackingPage />} />
        <Route path="/checkout" element={
          <CheckoutPage cart={cart} products={products} onClearCart={handleClearCart} />
        } />
      </Routes>

      <Footer />

      <CartDrawer
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        cart={cart}
        products={products}
        onUpdateQty={handleUpdateQty}
        onRemove={handleRemove}
      />

      <FavoritesDrawer
        isOpen={favsOpen}
        onClose={() => setFavsOpen(false)}
        favorites={favorites}
        products={products}
        onRemove={handleToggleFavorite}
        onAddToCart={handleAddToCart}
      />
    </>
  );
}

export default App;
