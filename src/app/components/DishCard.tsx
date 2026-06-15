import { Star, Clock, MapPin, Plus } from 'lucide-react';
import { Dish } from '../data/mockData';
import { useCart } from './CartContext';

interface DishCardProps {
  dish: Dish;
  onSelect: (dish: Dish) => void;
}

function formatPrice(price: number) {
  return price.toLocaleString('vi-VN') + '₫';
}

const labelColors: Record<string, string> = {
  'Top rated': 'bg-foreground text-background',
  'Fastest delivery': 'bg-foreground text-background',
  'Best value': 'bg-accent text-accent-foreground',
  'Popular nearby': 'bg-foreground text-background',
  'Lowest delivery fee': 'bg-foreground text-background',
};

export function DishCard({ dish, onSelect }: DishCardProps) {
  const { addItem } = useCart();

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    addItem({
      dishId: dish.id,
      dishName: dish.name,
      restaurantId: dish.restaurantId,
      restaurantName: dish.restaurantName,
      price: dish.price,
      quantity: 1,
      image: dish.image,
    });
  };

  return (
    <div
      className="border-2 border-foreground bg-card cursor-pointer group hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_#111111] transition-all duration-150"
      onClick={() => onSelect(dish)}
    >
      {/* Image */}
      <div className="relative overflow-hidden">
        <img
          src={dish.image}
          alt={dish.name}
          className="w-full h-44 object-cover group-hover:scale-105 transition-transform duration-300"
          style={{ filter: 'grayscale(15%) contrast(1.05)' }}
        />
        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {dish.isSponsored && (
            <span className="stamp-badge text-muted-foreground bg-muted/90 text-xs border-muted-foreground">
              Sponsored
            </span>
          )}
          {dish.label && !dish.isSponsored && (
            <span className={`stamp-badge text-xs ${labelColors[dish.label] || 'bg-foreground text-background'}`}>
              {dish.label}
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-3 space-y-2">
        {/* Name + price */}
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-sm font-medium leading-tight flex-1" style={{ fontFamily: 'var(--font-body)', fontWeight: 600 }}>
            {dish.name}
          </h3>
          <span className="shrink-0" style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '15px', color: 'var(--accent)' }}>
            {formatPrice(dish.price)}
          </span>
        </div>

        {/* Restaurant */}
        <p className="text-xs text-muted-foreground" style={{ fontFamily: 'var(--font-mono)' }}>
          {dish.restaurantName}
        </p>

        {/* Description */}
        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2" style={{ fontFamily: 'var(--font-body)' }}>
          {dish.description}
        </p>

        {/* Meta row */}
        <div className="flex items-center gap-3 pt-1 border-t border-dashed border-border">
          <div className="flex items-center gap-1 text-xs" style={{ fontFamily: 'var(--font-mono)', color: '#d97706' }}>
            <Star size={11} fill="currentColor" />
            <span>{dish.rating}</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground" style={{ fontFamily: 'var(--font-mono)' }}>
            <Clock size={11} />
            <span>{dish.deliveryTime}</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground" style={{ fontFamily: 'var(--font-mono)' }}>
            <MapPin size={11} />
            <span>{dish.distance}</span>
          </div>
          <button
            onClick={handleAdd}
            className="ml-auto w-8 h-8 flex items-center justify-center bg-foreground text-background hover:bg-accent transition-colors shrink-0"
          >
            <Plus size={14} />
          </button>
        </div>

        {/* Label reason */}
        {dish.labelReason && (
          <p className="text-xs text-muted-foreground pt-1 border-t border-dashed border-border leading-relaxed" style={{ fontFamily: 'var(--font-mono)', fontSize: '10px' }}>
            {dish.labelReason}
          </p>
        )}
      </div>
    </div>
  );
}
