import { createContext, useContext, useState, ReactNode } from 'react';
import { CartItem, restaurants } from '../data/mockData';
import { showClosedRestaurantToast } from './ClosedRestaurantToast';

interface CartContextValue {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (dishId: string) => void;
  updateQuantity: (dishId: string, quantity: number) => void;
  updateNote: (dishId: string, note: string) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const addItem = (newItem: CartItem) => {
    const restaurant = restaurants.find(r => r.id === newItem.restaurantId);
    if (restaurant && !restaurant.isOpen) {
      showClosedRestaurantToast(restaurant.name);
      return;
    }

    setItems(prev => {
      const existing = prev.find(i => i.dishId === newItem.dishId);
      if (existing) {
        return prev.map(i => i.dishId === newItem.dishId ? { ...i, quantity: i.quantity + newItem.quantity } : i);
      }
      return [...prev, newItem];
    });
    setIsOpen(true);
  };

  const removeItem = (dishId: string) => {
    setItems(prev => prev.filter(i => i.dishId !== dishId));
  };

  const updateQuantity = (dishId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(dishId);
      return;
    }
    setItems(prev => prev.map(i => i.dishId === dishId ? { ...i, quantity } : i));
  };

  const updateNote = (dishId: string, note: string) => {
    setItems(prev => prev.map(i => i.dishId === dishId ? { ...i, note: note.trim() || undefined } : i));
  };

  const clearCart = () => setItems([]);

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const totalPrice = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, updateNote, clearCart, totalItems, totalPrice, isOpen, setIsOpen }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
