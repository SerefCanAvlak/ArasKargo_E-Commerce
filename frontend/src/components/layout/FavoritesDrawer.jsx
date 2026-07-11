import { Heart, X, Trash2, ShoppingCart } from 'lucide-react';

export default function FavoritesDrawer({ isOpen, onClose, favorites, products, onRemove, onAddToCart }) {
  if (!isOpen) return null;

  const getProduct = (productId) =>
    products.find(p => p.id === productId);

  // Filter existing products that are favorited
  const favoriteProducts = favorites
    .map(id => getProduct(id))
    .filter(p => p !== undefined);

  return (
    <>
      <div className="cart-overlay" onClick={onClose} />
      <div className="cart-drawer">
        <div className="cart-drawer-header">
          <h3>
            <Heart size={20} style={{ marginRight: 8, verticalAlign: 'middle', color: '#dc2626', fill: '#dc2626' }} />
            Favorilerim ({favoriteProducts.length})
          </h3>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="cart-drawer-body">
          {favoriteProducts.length === 0 ? (
            <div className="empty-state" style={{ padding: '60px 0' }}>
              <Heart size={40} style={{ color: 'var(--text-muted)' }} />
              <h3>Henüz favori ürününüz yok</h3>
              <p>Beğendiğiniz ürünlerin üzerindeki kalp ikonuna tıklayarak favorilerinize ekleyin.</p>
            </div>
          ) : (
            favoriteProducts.map((prod) => {
              const imgSrc = prod.coverImage || (prod.images && prod.images[0]) || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200';
              return (
                <div key={prod.id} className="cart-item">
                  <img src={imgSrc} alt="" className="cart-item-img" />
                  <div className="cart-item-info">
                    <div className="cart-item-title" style={{ fontWeight: 600 }}>{prod.title}</div>
                    <div className="cart-item-price" style={{ color: 'var(--primary)', marginTop: 4 }}>
                      {prod.price.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <button 
                      className="btn btn-primary btn-sm btn-icon" 
                      onClick={() => {
                        onAddToCart(prod.id);
                        // Optionally remove from favorites or keep it
                      }} 
                      title="Sepete Ekle"
                      style={{ padding: '6px 10px', display: 'inline-flex', gap: 4, alignItems: 'center' }}
                    >
                      <ShoppingCart size={14} />
                      <span style={{ fontSize: 11 }}>Ekle</span>
                    </button>
                    <button className="btn btn-ghost btn-icon" onClick={() => onRemove(prod.id)} title="Favorilerden Kaldır">
                      <Trash2 size={16} style={{ color: 'var(--danger)' }} />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </>
  );
}
