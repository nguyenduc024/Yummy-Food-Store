import { X, Plus, Minus, Star, Clock, MapPin } from 'lucide-react';
import { useState } from 'react';
import { Dish } from '../data/mockData';
import { useCart } from './CartContext';
import * as Dialog from '@radix-ui/react-dialog';

interface DishDetailModalProps {
  dish: Dish | null;
  onClose: () => void;
}

function formatPrice(price: number) {
  return price.toLocaleString('vi-VN') + '₫';
}

export function DishDetailModal({ dish, onClose }: DishDetailModalProps) {
  const [quantity, setQuantity] = useState(1);
  const [note, setNote] = useState('');
  const { addItem } = useCart();

  if (!dish) return null;

  const handleAdd = () => {
    for (let i = 0; i < quantity; i++) {
      addItem({
        dishId: dish.id,
        dishName: dish.name,
        restaurantId: dish.restaurantId,
        restaurantName: dish.restaurantName,
        price: dish.price,
        quantity: 1,
        image: dish.image,
      });
    }
    onClose();
  };

  return (
    <Dialog.Root open={!!dish} onOpenChange={open => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-foreground/50" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-lg bg-background border-2 border-foreground max-h-[90vh] overflow-y-auto focus:outline-none">
          {/* Image */}
          <div className="relative">
            <img
              src={dish.image}
              alt={dish.name}
              className="w-full h-56 object-cover"
              style={{ filter: 'grayscale(20%) contrast(1.05)' }}
            />
            <Dialog.Close
              className="absolute top-3 right-3 bg-background border-2 border-foreground p-1.5 hover:bg-foreground hover:text-background transition-all"
              onClick={onClose}
            >
              <X size={18} />
            </Dialog.Close>
            {dish.label && (
              <div className="absolute bottom-3 left-3 bg-foreground text-background px-2 py-0.5 stamp-badge text-xs">
                {dish.label}
              </div>
            )}
            {dish.isSponsored && (
              <div className="absolute top-3 left-3 bg-muted text-muted-foreground px-2 py-0.5 stamp-badge text-xs">
                Sponsored
              </div>
            )}
          </div>

          {/* Content */}
          <div className="p-5 space-y-4">
            {/* Title row */}
            <div>
              <Dialog.Title style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '24px', lineHeight: 1.1 }}>
                {dish.name}
              </Dialog.Title>
              <p className="text-muted-foreground text-sm mt-1" style={{ fontFamily: 'var(--font-mono)' }}>
                {dish.restaurantName}
              </p>
            </div>

            {/* Meta */}
            <div className="flex gap-4 text-sm border-y border-dashed border-border py-3" style={{ fontFamily: 'var(--font-mono)', fontSize: '12px' }}>
              <div className="flex items-center gap-1">
                <Star size={12} fill="currentColor" />
                <span>{dish.rating}</span>
              </div>
              <div className="flex items-center gap-1 text-muted-foreground">
                <Clock size={12} />
                <span>{dish.deliveryTime}</span>
              </div>
              <div className="flex items-center gap-1 text-muted-foreground">
                <MapPin size={12} />
                <span>{dish.distance}</span>
              </div>
            </div>

            {/* Price */}
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '28px', fontWeight: 700, color: 'var(--accent)' }}>
              {formatPrice(dish.price)}
            </div>

            {/* Description */}
            <p className="text-sm text-foreground leading-relaxed" style={{ fontFamily: 'var(--font-body)' }}>
              {dish.description}
            </p>

            {/* Label reason */}
            {dish.labelReason && (
              <div className="border border-border bg-secondary p-3 text-xs text-muted-foreground" style={{ fontFamily: 'var(--font-mono)' }}>
                ℹ️ {dish.labelReason}
              </div>
            )}

            {/* Note */}
            <div>
              <label className="text-xs uppercase tracking-wider text-muted-foreground block mb-1" style={{ fontFamily: 'var(--font-mono)' }}>
                Ghi chú cho quán
              </label>
              <textarea
                value={note}
                onChange={e => setNote(e.target.value)}
                placeholder="Ít đường, ít đá, không hành..."
                className="w-full border border-border bg-secondary px-3 py-2 text-sm outline-none focus:border-foreground transition-colors resize-none"
                rows={2}
                style={{ fontFamily: 'var(--font-body)' }}
              />
            </div>

            {/* Quantity + Add */}
            <div className="flex items-center gap-3 pt-2">
              <div className="flex items-center border-2 border-foreground">
                <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="w-10 h-10 flex items-center justify-center hover:bg-foreground hover:text-background transition-all">
                  <Minus size={16} />
                </button>
                <span className="w-10 text-center" style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '16px' }}>{quantity}</span>
                <button onClick={() => setQuantity(q => q + 1)} className="w-10 h-10 flex items-center justify-center hover:bg-foreground hover:text-background transition-all">
                  <Plus size={16} />
                </button>
              </div>
              <button
                onClick={handleAdd}
                className="flex-1 bg-foreground text-background py-3 hover:bg-accent transition-colors uppercase tracking-wider"
                style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '13px' }}
              >
                Thêm vào Giỏ — {formatPrice(dish.price * quantity)}
              </button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
