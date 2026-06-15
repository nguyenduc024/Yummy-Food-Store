import { X, Minus, Plus, Trash2, ShoppingBasket, AlertCircle } from 'lucide-react';
import { useCart } from './CartContext';
import { useNavigate } from 'react-router';

function formatPrice(price: number) {
  return price.toLocaleString('vi-VN') + '₫';
}

export function CartDrawer() {
  const { items, isOpen, setIsOpen, updateQuantity, removeItem, totalPrice, totalItems } = useCart();
  const navigate = useNavigate();

  const restaurantCount = new Set(items.map(i => i.restaurantId)).size;
  const deliveryFee = items.length > 0 ? 15000 : 0;
  const serviceFee = Math.round(totalPrice * 0.03);
  const grandTotal = totalPrice + deliveryFee + serviceFee;

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-50 bg-foreground/40" onClick={() => setIsOpen(false)} />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md z-50 bg-background border-l-2 border-foreground flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b-2 border-foreground">
          <div className="flex items-center gap-3">
            <ShoppingBasket size={20} />
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '20px' }}>
              GIỎ HÀNG
            </span>
            {totalItems > 0 && (
              <span className="bg-foreground text-background px-2 py-0.5 text-xs" style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                {totalItems} MÓN
              </span>
            )}
          </div>
          <button onClick={() => setIsOpen(false)} className="border-2 border-foreground p-1 hover:bg-foreground hover:text-background transition-all">
            <X size={18} />
          </button>
        </div>

        {/* Multi-restaurant warning */}
        {restaurantCount > 1 && (
          <div className="mx-4 mt-3 flex gap-2 border border-accent p-2 bg-accent/5">
            <AlertCircle size={14} className="text-accent shrink-0 mt-0.5" />
            <p className="text-xs text-accent" style={{ fontFamily: 'var(--font-mono)' }}>
              Đơn hàng từ {restaurantCount} nhà hàng. Phí giao hàng tính riêng.
            </p>
          </div>
        )}

        {/* Items */}
        <div className="flex-1 overflow-y-auto py-4 px-4 space-y-3">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-muted-foreground">
              <div className="border-2 border-dashed border-border p-8">
                <ShoppingBasket size={40} className="mx-auto mb-3 opacity-40" />
                <p className="text-center text-sm" style={{ fontFamily: 'var(--font-mono)' }}>
                  Khay của bạn vẫn còn trống.
                </p>
              </div>
            </div>
          ) : (
            items.map(item => (
              <div key={item.dishId} className="flex gap-3 border border-border p-3">
                <img src={item.image} alt={item.dishName} className="w-16 h-16 object-cover border border-border shrink-0" style={{ filter: 'grayscale(30%)' }} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate" style={{ fontFamily: 'var(--font-body)' }}>{item.dishName}</p>
                  <p className="text-xs text-muted-foreground mt-0.5" style={{ fontFamily: 'var(--font-mono)' }}>{item.restaurantName}</p>
                  <p className="text-sm mt-1" style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--accent)' }}>
                    {formatPrice(item.price * item.quantity)}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <button onClick={() => removeItem(item.dishId)} className="text-muted-foreground hover:text-accent transition-colors">
                    <Trash2 size={14} />
                  </button>
                  <div className="flex items-center gap-1 border border-foreground">
                    <button onClick={() => updateQuantity(item.dishId, item.quantity - 1)} className="w-7 h-7 flex items-center justify-center hover:bg-foreground hover:text-background transition-all">
                      <Minus size={12} />
                    </button>
                    <span className="w-6 text-center text-sm" style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.dishId, item.quantity + 1)} className="w-7 h-7 flex items-center justify-center hover:bg-foreground hover:text-background transition-all">
                      <Plus size={12} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t-2 border-foreground p-4 space-y-3">
            {/* Voucher */}
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Mã ưu đãi..."
                className="flex-1 border border-border px-3 py-1.5 text-sm bg-secondary outline-none focus:border-foreground transition-colors"
                style={{ fontFamily: 'var(--font-mono)', fontSize: '12px' }}
              />
              <button className="border border-foreground px-3 py-1.5 text-xs hover:bg-foreground hover:text-background transition-all" style={{ fontFamily: 'var(--font-mono)' }}>
                ÁP DỤNG
              </button>
            </div>

            {/* Breakdown */}
            <div className="space-y-1.5 text-sm" style={{ fontFamily: 'var(--font-mono)', fontSize: '13px' }}>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tạm tính</span>
                <span>{formatPrice(totalPrice)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Phí giao hàng</span>
                <span>{formatPrice(deliveryFee)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Phí dịch vụ (3%)</span>
                <span>{formatPrice(serviceFee)}</span>
              </div>
              <div className="border-t border-foreground pt-2 flex justify-between font-bold">
                <span>TỔNG CỘNG</span>
                <span style={{ color: 'var(--accent)' }}>{formatPrice(grandTotal)}</span>
              </div>
            </div>

            <button
              onClick={() => { setIsOpen(false); navigate('/checkout'); }}
              className="w-full bg-foreground text-background py-3 hover:bg-accent transition-colors uppercase tracking-wider"
              style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '14px' }}
            >
              Xác Nhận Đơn — {formatPrice(grandTotal)}
            </button>
          </div>
        )}
      </div>
    </>
  );
}

/* Mobile sticky cart bar */
export function MobileCartBar() {
  const { totalItems, totalPrice, setIsOpen, items } = useCart();
  if (items.length === 0) return null;
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 lg:hidden">
      <button
        onClick={() => setIsOpen(true)}
        className="w-full bg-foreground text-background flex items-center justify-between px-4 py-3 border-t-2 border-foreground"
      >
        <div className="flex items-center gap-2">
          <span className="bg-accent text-accent-foreground w-6 h-6 flex items-center justify-center text-xs" style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
            {totalItems}
          </span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', fontWeight: 700 }}>XEM GIỎ HÀNG</span>
        </div>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '14px', fontWeight: 700 }}>
          {totalPrice.toLocaleString('vi-VN')}₫
        </span>
      </button>
    </div>
  );
}
