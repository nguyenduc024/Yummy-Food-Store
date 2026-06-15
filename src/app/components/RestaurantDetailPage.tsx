import { useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { Star, Clock, MapPin, Truck, ChevronLeft, Plus, Info } from 'lucide-react';
import { restaurants, Dish, MenuItem } from '../data/mockData';
import { useCart } from './CartContext';
import { DishDetailModal } from './DishDetailModal';

function formatPrice(price: number) {
  return price.toLocaleString('vi-VN') + '₫';
}

export function RestaurantDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const restaurant = restaurants.find(r => r.id === id);
  const { addItem } = useCart();
  const [activeCategory, setActiveCategory] = useState(0);
  const [selectedDish, setSelectedDish] = useState<Dish | null>(null);

  if (!restaurant) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '36px' }}>Không tìm thấy nhà hàng.</h1>
        <button onClick={() => navigate('/discover')} className="mt-4 border-2 border-foreground px-6 py-2 hover:bg-foreground hover:text-background transition-all" style={{ fontFamily: 'var(--font-mono)', fontSize: '12px' }}>
          QUAY LẠI
        </button>
      </div>
    );
  }

  const handleAddMenuItem = (item: MenuItem) => {
    addItem({
      dishId: item.id,
      dishName: item.name,
      restaurantId: restaurant.id,
      restaurantName: restaurant.name,
      price: item.price,
      quantity: 1,
      image: item.image,
    });
  };

  const handleSelectMenuItem = (item: MenuItem) => {
    const dish: Dish = {
      id: item.id,
      name: item.name,
      restaurantId: restaurant.id,
      restaurantName: restaurant.name,
      price: item.price,
      rating: restaurant.rating,
      deliveryTime: restaurant.deliveryTime,
      distance: restaurant.distance,
      description: item.description,
      category: '',
      image: item.image,
    };
    setSelectedDish(dish);
  };

  return (
    <div className="pb-24 lg:pb-0">
      {/* Back nav */}
      <div className="border-b border-border px-4 lg:px-8 py-3">
        <div className="max-w-7xl mx-auto">
          <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors" style={{ fontFamily: 'var(--font-mono)', fontSize: '12px' }}>
            <ChevronLeft size={14} /> QUAY LẠI
          </button>
        </div>
      </div>

      {/* Hero image */}
      <div className="relative h-48 lg:h-64 overflow-hidden border-b-2 border-foreground">
        <img
          src={restaurant.image}
          alt={restaurant.name}
          className="w-full h-full object-cover"
          style={{ filter: 'grayscale(25%) contrast(1.1)' }}
        />
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 to-transparent" />
        <div className="absolute bottom-0 left-0 p-4 lg:p-6 lg:max-w-7xl lg:w-full lg:mx-auto">
          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 'clamp(24px, 5vw, 48px)', color: '#F6F1E8', lineHeight: 1 }}>
            {restaurant.name}
          </h1>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'rgba(246,241,232,0.7)', marginTop: '4px' }}>
            {restaurant.cuisine}
          </p>
        </div>
      </div>

      {/* Info bar */}
      <div className="border-b-2 border-foreground bg-secondary">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 py-3">
          <div className="flex flex-wrap gap-4 text-sm" style={{ fontFamily: 'var(--font-mono)', fontSize: '12px' }}>
            <div className="flex items-center gap-1" style={{ color: '#d97706' }}>
              <Star size={13} fill="currentColor" />
              <span className="font-bold">{restaurant.rating}</span>
              <span className="text-muted-foreground">({restaurant.reviews.toLocaleString()} đánh giá)</span>
            </div>
            <div className="flex items-center gap-1 text-muted-foreground">
              <Clock size={13} />
              <span>{restaurant.deliveryTime}</span>
            </div>
            <div className="flex items-center gap-1 text-muted-foreground">
              <MapPin size={13} />
              <span>{restaurant.distance}</span>
            </div>
            <div className="flex items-center gap-1 text-muted-foreground">
              <Truck size={13} />
              <span>Phí ship: {formatPrice(restaurant.deliveryFee)}</span>
            </div>
            <div className="flex items-center gap-1 text-muted-foreground">
              <Info size={13} />
              <span>Tối thiểu: {formatPrice(restaurant.minOrder)}</span>
            </div>
            <div className={`ml-auto stamp-badge text-xs ${restaurant.isOpen ? 'text-foreground border-foreground' : 'text-muted-foreground border-muted-foreground'}`}>
              {restaurant.isOpen ? 'ĐANG MỞ' : 'ĐÓNG CỬA'}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-6">
        <div className="lg:grid lg:grid-cols-[1fr,340px] lg:gap-10">
          {/* Menu */}
          <div>
            {/* Category tabs */}
            <div className="flex gap-0 overflow-x-auto scrollbar-none border-b-2 border-foreground mb-6">
              {restaurant.categories.map((cat, i) => (
                <button
                  key={i}
                  onClick={() => setActiveCategory(i)}
                  className={`shrink-0 px-5 py-3 border-b-2 -mb-0.5 transition-all ${activeCategory === i ? 'border-foreground bg-foreground text-background' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
                  style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', fontWeight: 700, letterSpacing: '0.05em' }}
                >
                  {cat.name.toUpperCase()}
                </button>
              ))}
            </div>

            {/* Menu items */}
            <div className="space-y-3">
              {restaurant.categories[activeCategory]?.items.map(item => (
                <div
                  key={item.id}
                  className="flex gap-4 border-2 border-foreground p-4 cursor-pointer hover:shadow-[3px_3px_0px_#111111] transition-all group"
                  onClick={() => handleSelectMenuItem(item)}
                >
                  <div className="flex-1 space-y-1">
                    <div className="flex items-start gap-2">
                      <h3 style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: '15px' }}>
                        {item.name}
                      </h3>
                      {item.isPopular && (
                        <span className="stamp-badge text-xs bg-foreground text-background border-foreground shrink-0">
                          PHỔ BIẾN
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed" style={{ fontFamily: 'var(--font-body)' }}>
                      {item.description}
                    </p>
                    {item.portionSize && (
                      <p className="text-xs text-muted-foreground" style={{ fontFamily: 'var(--font-mono)', fontSize: '10px' }}>
                        Khẩu phần: {item.portionSize}
                      </p>
                    )}
                    <p style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '16px', color: 'var(--accent)', marginTop: '6px' }}>
                      {formatPrice(item.price)}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-3 shrink-0">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-20 h-20 object-cover border border-border"
                      style={{ filter: 'grayscale(15%)' }}
                    />
                    <button
                      onClick={e => { e.stopPropagation(); handleAddMenuItem(item); }}
                      className="w-8 h-8 flex items-center justify-center bg-foreground text-background hover:bg-accent transition-colors"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Reviews section */}
            <div className="mt-10 border-t-2 border-foreground pt-6">
              <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '22px', marginBottom: '16px' }}>
                Đánh Giá Khách Hàng
              </h2>
              <div className="space-y-4">
                {[
                  { name: 'Minh Tuấn', rating: 5, date: '12 thg 6, 2025', text: 'Phở ngon chuẩn vị Hà Nội. Nước dùng trong, ngọt tự nhiên. Giao đúng giờ.' },
                  { name: 'Lan Anh', rating: 4, date: '08 thg 6, 2025', text: 'Tô phở đặc biệt rất đáng tiền. Nhiều thịt. Lần sau sẽ order lại.' },
                  { name: 'Quang Hùng', rating: 5, date: '05 thg 6, 2025', text: 'Giao hàng nhanh hơn dự kiến. Đồ ăn vẫn nóng khi đến. Highly recommend.' },
                ].map((review, i) => (
                  <div key={i} className="border border-border p-4">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <span style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: '14px' }}>{review.name}</span>
                        <p className="text-muted-foreground text-xs mt-0.5" style={{ fontFamily: 'var(--font-mono)' }}>{review.date}</p>
                      </div>
                      <div className="flex items-center gap-0.5" style={{ color: '#d97706' }}>
                        {Array.from({ length: review.rating }).map((_, s) => (
                          <Star key={s} size={12} fill="currentColor" />
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-foreground leading-relaxed" style={{ fontFamily: 'var(--font-body)' }}>{review.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Desktop: Restaurant info sidebar */}
          <div className="hidden lg:block">
            <div className="sticky top-20 space-y-4">
              <div className="border-2 border-foreground p-4 space-y-3">
                <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '18px' }}>Thông tin</h3>
                <div className="text-sm space-y-2 border-t border-dashed border-border pt-3" style={{ fontFamily: 'var(--font-mono)', fontSize: '12px' }}>
                  <div className="flex gap-2">
                    <MapPin size={13} className="shrink-0 mt-0.5 text-muted-foreground" />
                    <span className="text-muted-foreground">{restaurant.address}</span>
                  </div>
                  <div className="flex gap-2">
                    <Clock size={13} className="shrink-0 mt-0.5 text-muted-foreground" />
                    <span className="text-muted-foreground">7:00 – 21:00, Hàng ngày</span>
                  </div>
                  <div className="flex gap-2">
                    <Truck size={13} className="shrink-0 mt-0.5 text-muted-foreground" />
                    <span className="text-muted-foreground">Phí giao: {formatPrice(restaurant.deliveryFee)}</span>
                  </div>
                </div>
              </div>

              <div className="border-2 border-foreground p-4">
                <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '18px', marginBottom: '12px' }}>Món phổ biến</h3>
                <div className="space-y-1">
                  {restaurant.topDishes.map((dish, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm border-b border-dashed border-border py-2 last:border-0" style={{ fontFamily: 'var(--font-mono)', fontSize: '12px' }}>
                      <span className="text-muted-foreground">{String(i + 1).padStart(2, '0')}.</span>
                      <span>{dish}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <DishDetailModal dish={selectedDish} onClose={() => setSelectedDish(null)} />
    </div>
  );
}
