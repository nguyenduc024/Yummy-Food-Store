import { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router';
import { SlidersHorizontal, X, ChevronDown, Info } from 'lucide-react';
import { dishes, restaurants, categories, Dish } from '../data/mockData';
import { DishCard } from './DishCard';
import { RestaurantCard } from './RestaurantCard';
import { DishDetailModal } from './DishDetailModal';

const sortOptions = [
  { value: 'recommended', label: 'Được đề xuất' },
  { value: 'fastest', label: 'Giao hàng nhanh nhất' },
  { value: 'cheapest', label: 'Giá thấp nhất' },
  { value: 'rating', label: 'Điểm cao nhất' },
  { value: 'nearest', label: 'Gần nhất' },
  { value: 'delivery_fee', label: 'Phí giao thấp nhất' },
  { value: 'popular', label: 'Được đặt nhiều nhất' },
];

const cuisineFilters = ['Phở', 'Bún', 'Cơm', 'Cà phê', 'Trà sữa', 'Bánh mì', 'Lẩu'];
const priceRanges = [
  { label: 'Dưới 50K', min: 0, max: 50000 },
  { label: '50K – 100K', min: 50000, max: 100000 },
  { label: '100K – 200K', min: 100000, max: 200000 },
  { label: 'Trên 200K', min: 200000, max: Infinity },
];
const ratingFilters = ['4.5+', '4.0+', '3.5+'];

export function DiscoveryPage() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const tab = searchParams.get('tab') || 'dishes';
  const categoryParam = searchParams.get('category') || '';

  const [activeTab, setActiveTab] = useState<'dishes' | 'restaurants'>(tab === 'restaurants' ? 'restaurants' : 'dishes');
  const [sortBy, setSortBy] = useState('recommended');
  const [selectedCuisines, setSelectedCuisines] = useState<string[]>([]);
  const [selectedPrice, setSelectedPrice] = useState<number | null>(null);
  const [selectedRating, setSelectedRating] = useState<string | null>(null);
  const [openNow, setOpenNow] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedDish, setSelectedDish] = useState<Dish | null>(null);

  const toggleCuisine = (c: string) => {
    setSelectedCuisines(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c]);
  };

  const filteredDishes = useMemo(() => {
    let result = [...dishes];
    if (query) result = result.filter(d => d.name.toLowerCase().includes(query.toLowerCase()) || d.restaurantName.toLowerCase().includes(query.toLowerCase()) || d.description.toLowerCase().includes(query.toLowerCase()));
    if (categoryParam) result = result.filter(d => d.category === categoryParam);
    if (selectedPrice !== null) {
      const range = priceRanges[selectedPrice];
      result = result.filter(d => d.price >= range.min && d.price <= range.max);
    }
    if (selectedRating) {
      const min = parseFloat(selectedRating);
      result = result.filter(d => d.rating >= min);
    }
    switch (sortBy) {
      case 'cheapest': result.sort((a, b) => a.price - b.price); break;
      case 'rating': result.sort((a, b) => b.rating - a.rating); break;
      case 'fastest': result.sort((a, b) => parseInt(a.deliveryTime) - parseInt(b.deliveryTime)); break;
      default: break;
    }
    return result;
  }, [query, categoryParam, selectedPrice, selectedRating, sortBy]);

  const filteredRestaurants = useMemo(() => {
    let result = [...restaurants];
    if (query) result = result.filter(r => r.name.toLowerCase().includes(query.toLowerCase()) || r.cuisine.toLowerCase().includes(query.toLowerCase()));
    if (openNow) result = result.filter(r => r.isOpen);
    if (selectedRating) {
      const min = parseFloat(selectedRating);
      result = result.filter(r => r.rating >= min);
    }
    switch (sortBy) {
      case 'rating': result.sort((a, b) => b.rating - a.rating); break;
      case 'nearest': result.sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance)); break;
      case 'delivery_fee': result.sort((a, b) => a.deliveryFee - b.deliveryFee); break;
      default: break;
    }
    return result;
  }, [query, openNow, selectedRating, sortBy]);

  const hasFilters = selectedCuisines.length > 0 || selectedPrice !== null || selectedRating !== null || openNow;

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-6 pb-24 lg:pb-6">
      {/* Header */}
      <div className="mb-6">
        {query ? (
          <div>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', letterSpacing: '0.1em', color: 'var(--muted-foreground)', marginBottom: '4px' }}>
              ─── KẾT QUẢ TÌM KIẾM
            </p>
            <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 'clamp(22px, 4vw, 36px)', lineHeight: 1 }}>
              "{query}"
            </h1>
            <p className="text-muted-foreground text-sm mt-1" style={{ fontFamily: 'var(--font-mono)' }}>
              {filteredDishes.length} món · {filteredRestaurants.length} nhà hàng
            </p>
          </div>
        ) : (
          <div>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', letterSpacing: '0.1em', color: 'var(--muted-foreground)', marginBottom: '4px' }}>
              ─── KHÁM PHÁ
            </p>
            <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 'clamp(22px, 4vw, 36px)', lineHeight: 1 }}>
              Tất Cả Món Ăn
            </h1>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b-2 border-foreground mb-6">
        {(['dishes', 'restaurants'] as const).map(t => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            className={`px-6 py-2.5 border-b-2 -mb-0.5 transition-colors ${activeTab === t ? 'border-foreground bg-foreground text-background' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
            style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', fontWeight: 700, letterSpacing: '0.05em' }}
          >
            {t === 'dishes' ? 'MÓN ĂN' : 'NHÀ HÀNG'}
          </button>
        ))}
      </div>

      <div className="lg:grid lg:grid-cols-[240px,1fr] lg:gap-8">
        {/* ── Sidebar filters (desktop) ── */}
        <aside className="hidden lg:block">
          <div className="sticky top-20 space-y-6">
            {/* Sort */}
            <div>
              <h3 className="text-xs uppercase tracking-wider text-muted-foreground mb-3" style={{ fontFamily: 'var(--font-mono)' }}>Sắp xếp theo</h3>
              <div className="space-y-1">
                {sortOptions.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setSortBy(opt.value)}
                    className={`w-full text-left px-3 py-2 text-sm border transition-colors ${sortBy === opt.value ? 'bg-foreground text-background border-foreground' : 'border-transparent hover:border-border'}`}
                    style={{ fontFamily: 'var(--font-body)' }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-2 border-t border-dashed border-border pt-2" style={{ fontFamily: 'var(--font-mono)', fontSize: '10px' }}>
                <Info size={10} className="inline mr-1" />
                Sorted by delivery speed, price, rating, and distance.
              </p>
            </div>

            {/* Category filter */}
            {activeTab === 'dishes' && (
              <div>
                <h3 className="text-xs uppercase tracking-wider text-muted-foreground mb-3" style={{ fontFamily: 'var(--font-mono)' }}>Loại món</h3>
                <div className="flex flex-wrap gap-2">
                  {categories.map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => toggleCuisine(cat.id)}
                      className={`px-3 py-1 text-xs border-2 transition-all ${selectedCuisines.includes(cat.id) ? 'bg-foreground text-background border-foreground' : 'border-border hover:border-foreground'}`}
                      style={{ fontFamily: 'var(--font-mono)' }}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Price range */}
            {activeTab === 'dishes' && (
              <div>
                <h3 className="text-xs uppercase tracking-wider text-muted-foreground mb-3" style={{ fontFamily: 'var(--font-mono)' }}>Khoảng giá</h3>
                <div className="space-y-1">
                  {priceRanges.map((range, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedPrice(selectedPrice === i ? null : i)}
                      className={`w-full text-left px-3 py-2 text-sm border transition-colors ${selectedPrice === i ? 'bg-foreground text-background border-foreground' : 'border-transparent hover:border-border'}`}
                      style={{ fontFamily: 'var(--font-mono)', fontSize: '12px' }}
                    >
                      {range.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Rating */}
            <div>
              <h3 className="text-xs uppercase tracking-wider text-muted-foreground mb-3" style={{ fontFamily: 'var(--font-mono)' }}>Điểm đánh giá</h3>
              <div className="space-y-1">
                {ratingFilters.map(r => (
                  <button
                    key={r}
                    onClick={() => setSelectedRating(selectedRating === r ? null : r)}
                    className={`w-full text-left px-3 py-2 text-sm border transition-colors ${selectedRating === r ? 'bg-foreground text-background border-foreground' : 'border-transparent hover:border-border'}`}
                    style={{ fontFamily: 'var(--font-mono)', fontSize: '12px' }}
                  >
                    ★ {r}
                  </button>
                ))}
              </div>
            </div>

            {/* Open now */}
            {activeTab === 'restaurants' && (
              <div>
                <button
                  onClick={() => setOpenNow(!openNow)}
                  className={`flex items-center gap-2 w-full px-3 py-2 text-sm border-2 transition-all ${openNow ? 'bg-foreground text-background border-foreground' : 'border-border'}`}
                  style={{ fontFamily: 'var(--font-mono)', fontSize: '12px' }}
                >
                  <div className={`w-4 h-4 border-2 flex items-center justify-center ${openNow ? 'bg-background border-background' : 'border-foreground'}`}>
                    {openNow && <div className="w-2 h-2 bg-foreground" />}
                  </div>
                  Đang mở cửa
                </button>
              </div>
            )}

            {/* Clear filters */}
            {hasFilters && (
              <button
                onClick={() => { setSelectedCuisines([]); setSelectedPrice(null); setSelectedRating(null); setOpenNow(false); }}
                className="w-full border border-accent text-accent px-3 py-2 text-xs hover:bg-accent hover:text-accent-foreground transition-all"
                style={{ fontFamily: 'var(--font-mono)' }}
              >
                XÓA BỘ LỌC
              </button>
            )}
          </div>
        </aside>

        {/* ── Main content ── */}
        <div>
          {/* Mobile filter toggle */}
          <div className="lg:hidden flex items-center gap-3 mb-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-3 py-2 border-2 text-sm ${showFilters ? 'bg-foreground text-background border-foreground' : 'border-foreground'}`}
              style={{ fontFamily: 'var(--font-mono)', fontSize: '12px' }}
            >
              <SlidersHorizontal size={14} />
              BỘ LỌC {hasFilters && <span className="bg-accent text-accent-foreground w-4 h-4 text-xs flex items-center justify-center">{[selectedCuisines.length, selectedPrice !== null ? 1 : 0, selectedRating ? 1 : 0, openNow ? 1 : 0].reduce((a, b) => a + b)}</span>}
            </button>

            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className="flex-1 border-2 border-foreground px-3 py-2 text-sm bg-background outline-none"
              style={{ fontFamily: 'var(--font-mono)', fontSize: '12px' }}
            >
              {sortOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          {/* Mobile filters panel */}
          {showFilters && (
            <div className="lg:hidden border-2 border-foreground p-4 mb-4 space-y-4">
              <div className="flex items-center justify-between">
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', fontWeight: 700 }}>BỘ LỌC</span>
                <button onClick={() => setShowFilters(false)}><X size={16} /></button>
              </div>
              <div className="flex flex-wrap gap-2">
                {priceRanges.map((range, i) => (
                  <button key={i} onClick={() => setSelectedPrice(selectedPrice === i ? null : i)}
                    className={`px-3 py-1 text-xs border-2 ${selectedPrice === i ? 'bg-foreground text-background border-foreground' : 'border-border'}`}
                    style={{ fontFamily: 'var(--font-mono)' }}>
                    {range.label}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                {ratingFilters.map(r => (
                  <button key={r} onClick={() => setSelectedRating(selectedRating === r ? null : r)}
                    className={`px-3 py-1 text-xs border-2 ${selectedRating === r ? 'bg-foreground text-background border-foreground' : 'border-border'}`}
                    style={{ fontFamily: 'var(--font-mono)' }}>
                    ★ {r}
                  </button>
                ))}
              </div>
              {hasFilters && (
                <button onClick={() => { setSelectedCuisines([]); setSelectedPrice(null); setSelectedRating(null); setOpenNow(false); }}
                  className="text-xs border border-accent text-accent px-3 py-1.5"
                  style={{ fontFamily: 'var(--font-mono)' }}>
                  XÓA TẤT CẢ
                </button>
              )}
            </div>
          )}

          {/* Results count */}
          <p className="text-xs text-muted-foreground mb-4 flex items-center gap-1" style={{ fontFamily: 'var(--font-mono)' }}>
            <Info size={11} />
            {activeTab === 'dishes' ? `${filteredDishes.length} món` : `${filteredRestaurants.length} nhà hàng`}
            {' '}· Narrow it down by price, time, rating, or distance.
          </p>

          {/* Grid */}
          {activeTab === 'dishes' ? (
            filteredDishes.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredDishes.map(dish => (
                  <DishCard key={dish.id} dish={dish} onSelect={setSelectedDish} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 border-2 border-dashed border-border">
                <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '20px' }}>Không tìm thấy món nào.</p>
                <p className="text-muted-foreground text-sm mt-2" style={{ fontFamily: 'var(--font-mono)' }}>Thử một cơn thèm khác nhé.</p>
              </div>
            )
          ) : (
            filteredRestaurants.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {filteredRestaurants.map(r => (
                  <RestaurantCard key={r.id} restaurant={r} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 border-2 border-dashed border-border">
                <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '20px' }}>Không tìm thấy nhà hàng.</p>
                <p className="text-muted-foreground text-sm mt-2" style={{ fontFamily: 'var(--font-mono)' }}>Thử mở rộng bộ lọc.</p>
              </div>
            )
          )}
        </div>
      </div>

      <DishDetailModal dish={selectedDish} onClose={() => setSelectedDish(null)} />
    </div>
  );
}
