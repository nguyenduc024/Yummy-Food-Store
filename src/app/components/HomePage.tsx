import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Search, ArrowRight, Star, Clock, Truck, ChevronRight } from 'lucide-react';
import { categories, dishes, restaurants } from '../data/mockData';
import { DishCard } from './DishCard';
import { RestaurantCard } from './RestaurantCard';
import { DishDetailModal } from './DishDetailModal';
import { Dish } from '../data/mockData';

export function HomePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedDish, setSelectedDish] = useState<Dish | null>(null);
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/discover?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleCategoryClick = (id: string) => {
    setSelectedCategory(id === selectedCategory ? null : id);
    navigate(`/discover?category=${id}`);
  };

  const budgetDishes = dishes.filter(d => d.price < 60000);
  const fastDishes = dishes.filter(d => d.deliveryTime.includes('10'));
  const topRatedDishes = dishes.filter(d => d.rating >= 4.7);
  const openRestaurants = restaurants.filter(r => r.isOpen);
  const newRestaurants = restaurants.slice(-2);

  return (
    <div className="pb-24 lg:pb-0">
      {/* ── HERO ─────────────────────────────────────────────────────── */}
      <section className="border-b-2 border-foreground bg-foreground text-background relative overflow-hidden">
        {/* Newspaper halftone texture */}
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: `radial-gradient(circle, #F6F1E8 1px, transparent 1px)`,
          backgroundSize: '12px 12px',
        }} />

        <div className="max-w-7xl mx-auto px-4 lg:px-8 py-14 lg:py-20 relative">
          <div className="lg:grid lg:grid-cols-2 lg:gap-16 items-center">
            {/* Left: Copy */}
            <div className="space-y-6">
              {/* Stamp label */}
              <div className="inline-flex items-center gap-2 border border-background/40 px-3 py-1">
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', letterSpacing: '0.1em', color: 'rgba(246,241,232,0.7)' }}>
                  ĐẶT HÀNG TỪ 80+ NHÀ HÀNG
                </span>
              </div>

              {/* Main headline */}
              <h1 style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 900,
                fontSize: 'clamp(36px, 6vw, 72px)',
                lineHeight: 0.95,
                letterSpacing: '-0.02em',
                color: '#F6F1E8',
              }}>
                CÀNG LƯỚT,<br />
                CÀNG HÚT<br />
                <span style={{ color: '#E53E3E' }}>CÀNG NHIỀU FOODS.</span>
              </h1>

              {/* Subheadline */}
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '16px', color: 'rgba(246,241,232,0.75)', lineHeight: 1.6, maxWidth: '420px' }}>
                So sánh nhà hàng, giá cả, thời gian giao hàng và đánh giá trong một nơi. Không rác, không nhiễu.
              </p>

              {/* Search bar */}
              <form onSubmit={handleSearch}>
                <div className="flex border-2 border-background/60 focus-within:border-[#E53E3E] transition-colors">
                  <input
                    type="text"
                    placeholder="Tìm phở, cà phê, cơm tấm, trà sữa..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="flex-1 px-4 py-3 bg-transparent outline-none text-background placeholder:text-background/40"
                    style={{ fontFamily: 'var(--font-body)', fontSize: '15px' }}
                  />
                  <button type="submit" className="px-5 bg-[#E53E3E] text-background hover:bg-[#D32F2F] transition-colors flex items-center gap-2">
                    <Search size={18} />
                    <span className="hidden sm:inline" style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', letterSpacing: '0.05em' }}>TÌM</span>
                  </button>
                </div>
              </form>

              {/* CTAs */}
              <div className="flex gap-3">
                <button
                  onClick={() => navigate('/discover')}
                  className="flex items-center gap-2 bg-[#E53E3E] text-background px-5 py-2.5 hover:bg-[#D32F2F] transition-colors"
                  style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '13px', letterSpacing: '0.05em' }}
                >
                  ĐẶT HÀNG NGAY <ArrowRight size={16} />
                </button>
                <button
                  onClick={() => navigate('/discover?tab=restaurants')}
                  className="flex items-center gap-2 border border-background/40 px-5 py-2.5 text-background/80 hover:border-background hover:text-background transition-colors"
                  style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', letterSpacing: '0.05em' }}
                >
                  BROWSE RESTAURANTS
                </button>
              </div>
            </div>

            {/* Right: Receipt card */}
            <div className="hidden lg:block">
              <div className="border-2 border-background/20 bg-background/5 p-6 backdrop-blur-sm max-w-sm ml-auto">
                {/* Receipt header */}
                <div className="text-center border-b border-dashed border-background/20 pb-4 mb-4">
                  <p style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', letterSpacing: '0.1em', color: 'rgba(246,241,232,0.5)' }}>
                    ═══════ ORDER PREVIEW ═══════
                  </p>
                  <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '18px', color: '#F6F1E8' }}>
                    Phở Thìn Bờ Hồ
                  </p>
                  <p style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'rgba(246,241,232,0.5)', marginTop: '4px' }}>
                    1.2km — 20–30 phút
                  </p>
                </div>

                {/* Items */}
                <div className="space-y-2 mb-4">
                  {[['Phở Bò Tái', '65,000₫'], ['Phở Đặc Biệt', '85,000₫']].map(([name, price]) => (
                    <div key={name} className="flex justify-between">
                      <span style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'rgba(246,241,232,0.8)' }}>{name}</span>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: '#F6F1E8' }}>{price}</span>
                    </div>
                  ))}
                </div>

                {/* Totals */}
                <div className="border-t border-dashed border-background/20 pt-3 space-y-1">
                  {[['Tạm tính', '150,000₫'], ['Phí giao', '15,000₫'], ['Dịch vụ', '4,500₫']].map(([label, val]) => (
                    <div key={label} className="flex justify-between">
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'rgba(246,241,232,0.5)' }}>{label}</span>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'rgba(246,241,232,0.7)' }}>{val}</span>
                    </div>
                  ))}
                  <div className="flex justify-between border-t border-background/20 pt-2 mt-2">
                    <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '13px', color: '#F6F1E8' }}>TỔNG</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '14px', color: '#E53E3E' }}>169,500₫</span>
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-2 text-xs" style={{ fontFamily: 'var(--font-mono)', color: 'rgba(246,241,232,0.4)', fontSize: '10px' }}>
                  <span>★★★★★</span>
                  <span>4.8 · 2,341 đánh giá</span>
                </div>
              </div>
            </div>
          </div>

          {/* Trust indicators */}
          <div className="mt-10 pt-6 border-t border-background/20 grid grid-cols-3 gap-4">
            {[
              ['80+', 'Nhà hàng & quán ăn'],
              ['4.7★', 'Điểm đánh giá trung bình'],
              ['~22 phút', 'Thời gian giao TB'],
            ].map(([stat, label]) => (
              <div key={stat} className="text-center">
                <p style={{ fontFamily: '"Space Grotesk", sans-serif', fontWeight: 900, fontSize: '24px', color: '#F6F1E8' }}>{stat}</p>
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'rgba(246,241,232,0.5)' }}>{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CATEGORY CHIPS ────────────────────────────────────────────── */}
      <section className="border-b-2 border-foreground bg-secondary">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 py-4">
          <div className="flex gap-2 overflow-x-auto scrollbar-none pb-1">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => handleCategoryClick(cat.id)}
                className={`shrink-0 flex items-center gap-1.5 px-4 py-2 border-2 transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-foreground text-background border-foreground'
                    : 'border-foreground hover:bg-foreground hover:text-background'
                }`}
                style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', fontWeight: 600, letterSpacing: '0.03em', whiteSpace: 'nowrap' }}
              >
                <span>{cat.name}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── POPULAR DISHES ────────────────────────────────────────────── */}
      <section className="border-b-2 border-foreground py-10">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          {/* Section header */}
          <div className="flex items-end justify-between mb-6">
            <div>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', letterSpacing: '0.1em', color: 'var(--muted-foreground)', marginBottom: '4px' }}>
                ─── ĐƯỢC ĐẶT NHIỀU NHẤT
              </p>
              <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 'clamp(22px, 4vw, 36px)', lineHeight: 1 }}>
                Lựa Chọn Của Ngày Hôm Nay
              </h2>
            </div>
            <button onClick={() => navigate('/discover')} className="flex items-center gap-1 text-sm hover:text-accent transition-colors" style={{ fontFamily: 'var(--font-mono)', fontSize: '12px' }}>
              Xem tất cả <ChevronRight size={14} />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {dishes.slice(0, 4).map(dish => (
              <DishCard key={dish.id} dish={dish} onSelect={setSelectedDish} />
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURED RESTAURANTS ──────────────────────────────────────── */}
      <section className="border-b-2 border-foreground py-10 bg-secondary">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="flex items-end justify-between mb-6">
            <div>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', letterSpacing: '0.1em', color: 'var(--muted-foreground)', marginBottom: '4px' }}>
                ─── NHÀ HÀNG NỔI BẬT
              </p>
              <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 'clamp(22px, 4vw, 36px)', lineHeight: 1 }}>
                Đang Mở Gần Bạn
              </h2>
            </div>
            <button onClick={() => navigate('/discover?tab=restaurants')} className="flex items-center gap-1 text-sm hover:text-accent transition-colors" style={{ fontFamily: 'var(--font-mono)', fontSize: '12px' }}>
              Tất cả nhà hàng <ChevronRight size={14} />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {openRestaurants.slice(0, 3).map(r => (
              <RestaurantCard key={r.id} restaurant={r} />
            ))}
          </div>
        </div>
      </section>

      {/* ── BUDGET + FAST PICKS ───────────────────────────────────────── */}
      <section className="border-b-2 border-foreground py-10">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="lg:grid lg:grid-cols-2 lg:gap-10">
            {/* Budget picks */}
            <div>
              <div className="mb-5">
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', letterSpacing: '0.1em', color: 'var(--muted-foreground)', marginBottom: '4px' }}>
                  ─── DƯỚI 60.000₫
                </p>
                <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '26px', lineHeight: 1 }}>
                  Budget Picks
                </h2>
                <p className="text-muted-foreground mt-1" style={{ fontFamily: 'var(--font-mono)', fontSize: '11px' }}>
                  Giá thấp hơn mức trung bình khu vực.
                </p>
              </div>
              <div className="space-y-3">
                {budgetDishes.map(dish => (
                  <div key={dish.id}
                    className="flex gap-3 border border-border p-3 cursor-pointer hover:border-foreground transition-colors group"
                    onClick={() => setSelectedDish(dish)}
                  >
                    <img src={dish.image} alt={dish.name} className="w-16 h-16 object-cover border border-border shrink-0" style={{ filter: 'grayscale(20%)' }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate" style={{ fontFamily: 'var(--font-body)', fontWeight: 600 }}>{dish.name}</p>
                      <p className="text-xs text-muted-foreground" style={{ fontFamily: 'var(--font-mono)' }}>{dish.restaurantName}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '13px', color: 'var(--accent)' }}>
                          {dish.price.toLocaleString('vi-VN')}₫
                        </span>
                        <span className="text-xs text-muted-foreground" style={{ fontFamily: 'var(--font-mono)' }}>{dish.deliveryTime}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 self-center text-xs" style={{ fontFamily: 'var(--font-mono)', color: '#d97706' }}>
                      <Star size={10} fill="currentColor" />
                      <span>{dish.rating}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Fast delivery picks */}
            <div className="mt-10 lg:mt-0">
              <div className="mb-5">
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', letterSpacing: '0.1em', color: 'var(--muted-foreground)', marginBottom: '4px' }}>
                  ─── GIAO TRONG 20 PHÚT
                </p>
                <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '26px', lineHeight: 1 }}>
                  Fast Delivery Picks
                </h2>
                <p className="text-muted-foreground mt-1" style={{ fontFamily: 'var(--font-mono)', fontSize: '11px' }}>
                  Các quán giao hàng nhanh nhất khu vực bạn.
                </p>
              </div>
              <div className="space-y-3">
                {fastDishes.map(dish => (
                  <div key={dish.id}
                    className="flex gap-3 border border-border p-3 cursor-pointer hover:border-foreground transition-colors"
                    onClick={() => setSelectedDish(dish)}
                  >
                    <img src={dish.image} alt={dish.name} className="w-16 h-16 object-cover border border-border shrink-0" style={{ filter: 'grayscale(20%)' }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate" style={{ fontFamily: 'var(--font-body)', fontWeight: 600 }}>{dish.name}</p>
                      <p className="text-xs text-muted-foreground" style={{ fontFamily: 'var(--font-mono)' }}>{dish.restaurantName}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '13px', color: 'var(--accent)' }}>
                          {dish.price.toLocaleString('vi-VN')}₫
                        </span>
                        <span className="flex items-center gap-1 text-xs" style={{ fontFamily: 'var(--font-mono)', color: 'var(--muted-foreground)' }}>
                          <Clock size={10} />{dish.deliveryTime}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── NEW RESTAURANTS ───────────────────────────────────────────── */}
      <section className="border-b-2 border-foreground py-10 bg-secondary">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="mb-6">
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', letterSpacing: '0.1em', color: 'var(--muted-foreground)', marginBottom: '4px' }}>
              ─── MỚI GIA NHẬP
            </p>
            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 'clamp(22px, 4vw, 36px)', lineHeight: 1 }}>
              Nhà Hàng Mới
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {newRestaurants.map(r => (
              <RestaurantCard key={r.id} restaurant={r} />
            ))}
          </div>
        </div>
      </section>

      {/* ── TOP RATED ─────────────────────────────────────────────────── */}
      <section className="py-10">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="flex items-end justify-between mb-6">
            <div>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', letterSpacing: '0.1em', color: 'var(--muted-foreground)', marginBottom: '4px' }}>
                ─── ĐÁNH GIÁ CAO NHẤT
              </p>
              <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 'clamp(22px, 4vw, 36px)', lineHeight: 1 }}>
                Được Đánh Giá Cao
              </h2>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {topRatedDishes.map(dish => (
              <DishCard key={dish.id} dish={dish} onSelect={setSelectedDish} />
            ))}
          </div>
        </div>
      </section>

      {/* Dish Detail Modal */}
      <DishDetailModal dish={selectedDish} onClose={() => setSelectedDish(null)} />
    </div>
  );
}
