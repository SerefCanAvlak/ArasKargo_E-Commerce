import { ShoppingCart, Heart } from 'lucide-react';

export default function ProductCard({ product, onAddToCart, onNavigate, isFavorited, onToggleFavorite }) {
  const imgSrc = product.coverImage || (product.images && product.images[0])
    ? (product.coverImage || product.images[0])
    : 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=60';

  return (
    <div className="product-card" onClick={() => onNavigate(product.slug)} style={{ position: 'relative' }}>
      {/* Floating Heart Button */}
      {onToggleFavorite && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(product.id);
          }}
          style={{
            position: 'absolute',
            top: 12,
            right: 12,
            background: 'rgba(255, 255, 255, 0.9)',
            border: 'none',
            borderRadius: '50%',
            width: 32,
            height: 32,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: 'var(--shadow-sm)',
            zIndex: 10,
            transition: 'transform 0.2s',
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          title={isFavorited ? 'Favorilerimden Çıkar' : 'Favorilerime Ekle'}
        >
          <Heart
            size={16}
            style={{
              color: isFavorited ? '#dc2626' : '#6b7280',
              fill: isFavorited ? '#dc2626' : 'transparent',
              transition: 'all 0.2s'
            }}
          />
        </button>
      )}

      <div className="product-card-img">
        <img src={imgSrc} alt={product.title} loading="lazy" />
      </div>
      <div className="product-card-body">
        <h3 className="product-card-title">{product.title}</h3>
        <div className="product-card-price">
          {product.price.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL
        </div>
        <div className="product-card-stock">
          Stok: {product.stock} adet
        </div>
        <div className="product-card-actions" onClick={(e) => e.stopPropagation()}>
          <button
            className="btn btn-primary btn-sm"
            style={{ flex: 1 }}
            onClick={() => onAddToCart(product.id)}
          >
            <ShoppingCart size={14} /> Sepete Ekle
          </button>
        </div>
      </div>
    </div>
  );
}
