import { Star, Clock, MapPin, Truck, ChevronRight } from 'lucide-react';
import { Restaurant } from '../data/mockData';
import { Link } from 'react-router';

interface RestaurantCardProps {
  restaurant: Restaurant;
}

function formatPrice(price: number) {
  return price.toLocaleString('vi-VN') + '₫';
}

export function RestaurantCard({ restaurant }: RestaurantCardProps) {
  return (
    <Link to={`/restaurant/${restaurant.id}`} className="block border-2 border-foreground bg-card hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_#111111] transition-all duration-150 group">
      {/* Image */}
      <div className="relative overflow-hidden">
        <img
          src={restaurant.image}
          alt={restaurant.name}
          className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-300"
          style={{ filter: 'grayscale(20%) contrast(1.05)' }}
        />
        {/* Open/closed */}
        <div className={`absolute top-2 right-2 stamp-badge text-xs ${restaurant.isOpen ? 'bg-foreground text-background border-foreground' : 'bg-muted text-muted-foreground border-muted-foreground'}`}>
          {restaurant.isOpen ? 'ĐANG MỞ' : 'ĐÓNG CỬA'}
        </div>
      </div>

      {/* Info */}
      <div className="p-3 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '16px', lineHeight: 1.2 }}>
              {restaurant.name}
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5" style={{ fontFamily: 'var(--font-mono)' }}>
              {restaurant.cuisine}
            </p>
          </div>
          <ChevronRight size={16} className="text-muted-foreground shrink-0 mt-1" />
        </div>

        {/* Rating + Meta */}
        <div className="flex flex-wrap gap-3 text-xs border-t border-dashed border-border pt-2" style={{ fontFamily: 'var(--font-mono)' }}>
          <div className="flex items-center gap-1">
            <Star size={11} fill="currentColor" />
            <span className="font-bold">{restaurant.rating}</span>
            <span className="text-muted-foreground">({restaurant.reviews.toLocaleString()})</span>
          </div>
          <div className="flex items-center gap-1 text-muted-foreground">
            <Clock size={11} />
            <span>{restaurant.deliveryTime}</span>
          </div>
          <div className="flex items-center gap-1 text-muted-foreground">
            <MapPin size={11} />
            <span>{restaurant.distance}</span>
          </div>
          <div className="flex items-center gap-1 text-muted-foreground">
            <Truck size={11} />
            <span>{formatPrice(restaurant.deliveryFee)}</span>
          </div>
        </div>

        {/* Min order */}
        <p className="text-xs text-muted-foreground" style={{ fontFamily: 'var(--font-mono)', fontSize: '10px' }}>
          ĐƠN TỐI THIỂU: {formatPrice(restaurant.minOrder)}
        </p>

        {/* Top dishes */}
        <div className="pt-1 flex flex-wrap gap-1">
          {restaurant.topDishes.slice(0, 3).map((dish, i) => (
            <span key={i} className="text-xs border border-border px-2 py-0.5 text-muted-foreground" style={{ fontFamily: 'var(--font-mono)', fontSize: '10px' }}>
              {dish}
            </span>
          ))}
        </div>
      </div>
    </Link>
  );
}
