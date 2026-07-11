import { ShoppingCart } from 'lucide-react';

export default function ProductCard({ product, onAddToCart, onNavigate }) {
  const imgSrc = product.images && product.images[0]
    ? product.images[0]
    : 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=60';

  return (
    <div className="product-card" onClick={() => onNavigate(product.slug)}>
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
