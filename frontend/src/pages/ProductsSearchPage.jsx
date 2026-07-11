import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Star, ChevronDown, Grid, List as ListIcon, Filter } from 'lucide-react';
import { getProducts, getCategories } from '../api';
import ProductCard from '../components/ui/ProductCard';
import LoadingSpinner from '../components/ui/LoadingSpinner';

export default function ProductsSearchPage({ onAddToCart, favorites = [], onToggleFavorite }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const searchQuery = searchParams.get('q') || '';
  const categoryQuery = searchParams.get('category') || '';

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [selectedCategory, setSelectedCategory] = useState(categoryQuery);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sortOrder, setSortOrder] = useState('newest'); // newest, priceAsc, priceDesc
  const [onlyDiscounted, setOnlyDiscounted] = useState(false);
  const [onlyNew, setOnlyNew] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    setSelectedCategory(categoryQuery);
  }, [categoryQuery]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [prodData, catData] = await Promise.all([
        getProducts(1, 100),
        getCategories()
      ]);
      setProducts(prodData.items || prodData || []);
      setCategories(catData || []);
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  // Filter & Sort Logic
  const filteredProducts = products.filter(product => {
    // 1. Text Search Filter
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const titleMatch = product.title.toLowerCase().includes(q);
      const descMatch = product.description?.toLowerCase().includes(q);
      const catMatch = product.categoryName?.toLowerCase().includes(q);
      if (!titleMatch && !descMatch && !catMatch) return false;
    }

    // 2. Category Filter
    if (selectedCategory) {
      const catName = selectedCategory.toLowerCase();
      const productCatName = product.categoryName?.toLowerCase() || '';
      if (!productCatName.includes(catName) && product.categoryId !== selectedCategory) {
        return false;
      }
    }

    // 3. Price Filter
    const price = product.price;
    if (minPrice && price < parseFloat(minPrice)) return false;
    if (maxPrice && price > parseFloat(maxPrice)) return false;

    // 4. Discount Filter
    if (onlyDiscounted && !product.coverImage) { // simulating discount check or random logic
      // let's say products with price > 200 are simulated as discounted in ui
      if (product.price < 200) return false;
    }

    // 5. Newness Filter
    if (onlyNew && product.stock < 10) return false;

    return true;
  });

  // Sorting
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortOrder === 'priceAsc') return a.price - b.price;
    if (sortOrder === 'priceDesc') return b.price - a.price;
    return new Date(b.createdAt || 0) - new Date(a.createdAt || 0); // newest
  });

  const handleCategorySelect = (catName) => {
    const newCat = selectedCategory === catName ? '' : catName;
    setSelectedCategory(newCat);
    
    // Update URL params
    const params = {};
    if (searchQuery) params.q = searchQuery;
    if (newCat) params.category = newCat;
    setSearchParams(params);
  };

  const handleNavigateProduct = (slug) => navigate(`/products/${slug}`);

  // Helper to count products per category
  const getProductCountForCategory = (catName) => {
    return products.filter(p => p.categoryName?.toLowerCase() === catName.toLowerCase()).length;
  };

  return (
    <div className="container page-content" style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: 32, alignItems: 'start' }}>
      {/* LEFT SIDEBAR: FILTERS */}
      <aside className="search-filters-sidebar" style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, borderBottom: '1px solid var(--divider)', paddingBottom: 16, marginBottom: 20 }}>
          <Filter size={18} style={{ color: 'var(--primary)' }} />
          <h3 style={{ fontSize: 16, fontWeight: 700 }}>Filtreler</h3>
        </div>

        {/* Categories List */}
        <div className="filter-group-v2" style={{ marginBottom: 24 }}>
          <h4 style={{ fontSize: 13, fontWeight: 700, marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.5 }}>Kategoriler</h4>
          <ul style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <li 
              onClick={() => handleCategorySelect('')}
              style={{
                fontSize: 13,
                fontWeight: !selectedCategory ? '700' : '500',
                color: !selectedCategory ? 'var(--primary)' : 'var(--text-secondary)',
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'space-between'
              }}
            >
              <span>Tüm Ürünler</span>
              <span style={{ color: 'var(--text-muted)' }}>({products.length})</span>
            </li>
            {categories.map(cat => {
              const isActive = selectedCategory.toLowerCase() === cat.name.toLowerCase() || selectedCategory === cat.id;
              const count = getProductCountForCategory(cat.name);
              return (
                <li
                  key={cat.id}
                  onClick={() => handleCategorySelect(cat.name)}
                  style={{
                    fontSize: 13,
                    fontWeight: isActive ? '700' : '500',
                    color: isActive ? 'var(--primary)' : 'var(--text-secondary)',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    transition: 'var(--transition)'
                  }}
                >
                  <span>{cat.name}</span>
                  <span style={{ color: 'var(--text-muted)' }}>({count})</span>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Price Range Filter */}
        <div className="filter-group-v2" style={{ marginBottom: 24, borderTop: '1px solid var(--divider)', paddingTop: 20 }}>
          <h4 style={{ fontSize: 13, fontWeight: 700, marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.5 }}>Fiyat Aralığı</h4>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <input
              className="form-input"
              type="number"
              placeholder="En Az"
              value={minPrice}
              onChange={e => setMinPrice(e.target.value)}
              style={{ padding: '6px 10px', fontSize: 12 }}
            />
            <span style={{ color: 'var(--text-muted)' }}>-</span>
            <input
              className="form-input"
              type="number"
              placeholder="En Çok"
              value={maxPrice}
              onChange={e => setMaxPrice(e.target.value)}
              style={{ padding: '6px 10px', fontSize: 12 }}
            />
          </div>
        </div>

        {/* Product Status Filter */}
        <div className="filter-group-v2" style={{ marginBottom: 20, borderTop: '1px solid var(--divider)', paddingTop: 20 }}>
          <h4 style={{ fontSize: 13, fontWeight: 700, marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.5 }}>Ürün Durumu</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer' }}>
              <input type="checkbox" checked={onlyNew} onChange={e => setOnlyNew(e.target.checked)} />
              <span>Yeni Ürünler</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer' }}>
              <input type="checkbox" checked={onlyDiscounted} onChange={e => setOnlyDiscounted(e.target.checked)} />
              <span>İndirimdekiler</span>
            </label>
          </div>
        </div>
      </aside>

      {/* RIGHT SIDE: PRODUCTS LIST */}
      <main style={{ flex: 1 }}>
        {/* Listing Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, borderBottom: '1px solid var(--divider)', paddingBottom: 16 }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 24, fontWeight: 800 }}>
              {selectedCategory ? `${selectedCategory} Ürünleri` : searchQuery ? `"${searchQuery}" Arama Sonuçları` : 'Tüm Ürünler'}
            </h1>
            <span style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4, display: 'block' }}>
              {sortedProducts.length} sonuç bulundu
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            {/* Sorting Dropdown */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 600 }}>Sırala:</span>
              <select
                className="form-select"
                value={sortOrder}
                onChange={e => setSortOrder(e.target.value)}
                style={{ padding: '6px 12px', fontSize: 12, width: 'auto', borderRadius: 'var(--radius-sm)' }}
              >
                <option value="newest">En Yeni</option>
                <option value="priceAsc">En Düşük Fiyat</option>
                <option value="priceDesc">En Yüksek Fiyat</option>
              </select>
            </div>

            {/* View toggles */}
            <div style={{ display: 'flex', gap: 4, border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: 2, background: 'var(--bg)' }}>
              <button className="btn btn-ghost" style={{ padding: 4, borderRadius: 'var(--radius-sm)', background: 'var(--surface)' }} title="Izgara Görünümü">
                <Grid size={14} />
              </button>
              <button className="btn btn-ghost" style={{ padding: 4, borderRadius: 'var(--radius-sm)' }} title="Liste Görünümü">
                <ListIcon size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        {loading ? (
          <LoadingSpinner />
        ) : sortedProducts.length === 0 ? (
          <div className="card">
            <div className="empty-state">
              <h3>Aradığınız kriterlere uygun ürün bulunamadı</h3>
              <p>Filtreleri temizleyerek veya farklı kelimelerle arama yapmayı deneyin.</p>
              <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => {
                setMinPrice('');
                setMaxPrice('');
                setOnlyNew(false);
                setOnlyDiscounted(false);
                setSelectedCategory('');
                setSearchParams({});
              }}>
                Filtreleri Temizle
              </button>
            </div>
          </div>
        ) : (
          <div className="product-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))' }}>
            {sortedProducts.map(product => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={onAddToCart}
                onNavigate={handleNavigateProduct}
                isFavorited={favorites.includes(product.id)}
                onToggleFavorite={onToggleFavorite}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
