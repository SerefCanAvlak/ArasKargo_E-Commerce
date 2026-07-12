import { useNavigate } from 'react-router-dom';
import { ShoppingCart, X, Trash2 } from 'lucide-react';
import mascotEmptyImg from '../../assets/mascot_empty.png';

export default function CartDrawer({ isOpen, onClose, cart, products, onUpdateQty, onRemove }) {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const getProduct = (productId) =>
    products.find(p => p.id === productId) || { title: 'Ürün', price: 0, images: [] };

  const total = cart.reduce((sum, item) => {
    const prod = getProduct(item.productId);
    return sum + (prod.price * item.quantity);
  }, 0);

  const handleCheckout = () => {
    onClose();
    navigate('/checkout');
  };

  return (
    <>
      <div className="cart-overlay" onClick={onClose} />
      <div className="cart-drawer">
        <div className="cart-drawer-header">
          <h3><ShoppingCart size={20} style={{ marginRight: 8, verticalAlign: 'middle' }} />Sepetim</h3>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="cart-drawer-body">
          {cart.length === 0 ? (
            <div className="empty-state" style={{ padding: '32px 16px', textAlign: 'center' }}>
              <img 
                src={mascotEmptyImg} 
                alt="Boş Sepet Maskotu" 
                style={{ 
                  display: 'block',
                  margin: '0 auto 16px',
                  maxHeight: 140, 
                  objectFit: 'contain',
                  filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.15))'
                }} 
              />
              <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>Sepetiniz Boş</h3>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', maxWidth: 220, margin: '0 auto' }}>
                Beğendiğiniz ürünleri sepete ekleyerek alışverişe başlayın.
              </p>
            </div>
          ) : (
            cart.map((item, idx) => {
              const prod = getProduct(item.productId);
              const imgSrc = prod.images?.[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200';
              return (
                <div key={idx} className="cart-item">
                  <img src={imgSrc} alt="" className="cart-item-img" />
                  <div className="cart-item-info">
                    <div className="cart-item-title">{prod.title}</div>
                    <div className="cart-item-price">
                      {(prod.price * item.quantity).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div className="qty-control">
                      <button className="qty-btn" onClick={() => onUpdateQty(item.productId, item.quantity - 1)}>−</button>
                      <span className="qty-value">{item.quantity}</span>
                      <button className="qty-btn" onClick={() => onUpdateQty(item.productId, item.quantity + 1)}>+</button>
                    </div>
                    <button className="btn btn-ghost btn-icon" onClick={() => onRemove(item.productId)} title="Kaldır">
                      <Trash2 size={16} style={{ color: 'var(--danger)' }} />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {cart.length > 0 && (
          <div className="cart-drawer-footer">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <span style={{ fontWeight: 600, fontSize: 15 }}>Toplam</span>
              <span style={{ fontWeight: 700, fontSize: 20, color: 'var(--primary)', fontFamily: 'var(--font-heading)' }}>
                {total.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL
              </span>
            </div>
            <button className="btn btn-primary btn-full btn-lg" onClick={handleCheckout}>
              Siparişi Tamamla
            </button>
          </div>
        )}
      </div>
    </>
  );
}
