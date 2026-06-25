import { useState, useRef, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { Search, X, ChevronLeft, Clock, TrendingUp, ArrowRight, Star } from 'lucide-react';
import { dishes, restaurants, categories } from '../data/mockData';
import { DishDetailModal } from './DishDetailModal';
import { Dish } from '../data/mockData';

const TRENDING: string[] = [
  'Phở bò', 'Cơm tấm', 'Bánh mì', 'Bún bò Huế',
  'Trà sữa', 'Cà phê sữa đá', 'Lẩu', 'Hủ tiếu',
  'Ăn sáng', 'Gà rán', 'Bánh xèo', 'Bún mắm',
];

const RECENT_KEY = 'yummy_recent_searches';

function getRecent(): string[] {
  try { return JSON.parse(localStorage.getItem(RECENT_KEY) ?? '[]'); }
  catch { return []; }
}

function saveRecent(q: string) {
  const prev = getRecent().filter(s => s.toLowerCase() !== q.toLowerCase());
  localStorage.setItem(RECENT_KEY, JSON.stringify([q, ...prev].slice(0, 6)));
}

function removeRecent(q: string) {
  localStorage.setItem(RECENT_KEY, JSON.stringify(getRecent().filter(s => s !== q)));
}

export function SearchPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') ?? '');
  const [recent, setRecent] = useState<string[]>(getRecent);
  const [selectedDish, setSelectedDish] = useState<Dish | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  const dishSuggestions = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return dishes
      .filter(d =>
        d.name.toLowerCase().includes(q) ||
        d.restaurantName.toLowerCase().includes(q) ||
        d.description.toLowerCase().includes(q)
      )
      .slice(0, 5);
  }, [query]);

  const restaurantSuggestions = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return restaurants
      .filter(r =>
        r.name.toLowerCase().includes(q) ||
        r.cuisine.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q)
      )
      .slice(0, 3);
  }, [query]);

  const hasSuggestions = dishSuggestions.length > 0 || restaurantSuggestions.length > 0;

  const goSearch = (q: string) => {
    if (!q.trim()) return;
    saveRecent(q.trim());
    setRecent(getRecent());
    navigate(`/discover?q=${encodeURIComponent(q.trim())}`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    goSearch(query);
  };

  const handleRemoveRecent = (q: string) => {
    removeRecent(q);
    setRecent(getRecent());
  };

  const handleClearAll = () => {
    localStorage.removeItem(RECENT_KEY);
    setRecent([]);
  };

  const showingEmpty = !query.trim();

  return (
    <>
      <div className="max-w-2xl mx-auto px-4 py-6 pb-24">
        {/* ── Search bar ── */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => navigate(-1)}
            className="shrink-0 w-9 h-9 border-2 border-foreground flex items-center justify-center hover:bg-foreground hover:text-background transition-all"
          >
            <ChevronLeft size={18} />
          </button>

          <form onSubmit={handleSubmit} className="flex-1 flex border-2 border-foreground focus-within:border-accent transition-colors">
            <div className="flex-1 flex items-center px-3 gap-2">
              <Search size={15} className="text-muted-foreground shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Tìm phở, cà phê, cơm tấm..."
                className="flex-1 py-2.5 bg-transparent outline-none placeholder:text-muted-foreground"
                style={{ fontFamily: 'var(--font-body)', fontSize: '15px' }}
              />
              {query && (
                <button
                  type="button"
                  onClick={() => { setQuery(''); inputRef.current?.focus(); }}
                  className="text-muted-foreground hover:text-foreground transition-colors shrink-0"
                >
                  <X size={14} />
                </button>
              )}
            </div>
            <button
              type="submit"
              className="px-4 bg-foreground text-background hover:bg-accent transition-colors shrink-0"
              style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', fontWeight: 700 }}
            >
              TÌM
            </button>
          </form>
        </div>

        {/* ── Live suggestions ── */}
        {query.trim() && hasSuggestions && (
          <div className="border-2 border-foreground mb-6">
            {dishSuggestions.length > 0 && (
              <>
                <p className="px-4 py-2 border-b border-border bg-secondary" style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', letterSpacing: '0.1em', color: 'var(--muted-foreground)' }}>
                  MÓN ĂN — {dishSuggestions.length} gợi ý
                </p>
                {dishSuggestions.map(dish => (
                  <button
                    key={dish.id}
                    onClick={() => setSelectedDish(dish)}
                    className="w-full flex items-center gap-3 px-4 py-3 border-b border-border hover:bg-secondary transition-colors text-left"
                  >
                    <img
                      src={dish.image}
                      alt={dish.name}
                      className="w-11 h-11 object-cover border border-border shrink-0"
                      style={{ filter: 'grayscale(20%)' }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate" style={{ fontFamily: 'var(--font-body)', fontWeight: 600 }}>{dish.name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5" style={{ fontFamily: 'var(--font-mono)' }}>{dish.restaurantName}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', fontWeight: 700, color: 'var(--accent)' }}>
                        {dish.price.toLocaleString('vi-VN')}₫
                      </p>
                      <p className="flex items-center gap-0.5 text-xs justify-end mt-0.5" style={{ fontFamily: 'var(--font-mono)', color: '#d97706' }}>
                        <Star size={9} fill="currentColor" />{dish.rating}
                      </p>
                    </div>
                  </button>
                ))}
              </>
            )}

            {restaurantSuggestions.length > 0 && (
              <>
                <p className="px-4 py-2 border-b border-border bg-secondary" style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', letterSpacing: '0.1em', color: 'var(--muted-foreground)' }}>
                  NHÀ HÀNG — {restaurantSuggestions.length} gợi ý
                </p>
                {restaurantSuggestions.map(r => (
                  <button
                    key={r.id}
                    onClick={() => navigate(`/restaurant/${r.id}`)}
                    className="w-full flex items-center gap-3 px-4 py-3 border-b border-border hover:bg-secondary transition-colors text-left"
                  >
                    <img
                      src={r.image}
                      alt={r.name}
                      className="w-11 h-11 object-cover border border-border shrink-0"
                      style={{ filter: 'grayscale(20%)' }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate" style={{ fontFamily: 'var(--font-body)', fontWeight: 600 }}>{r.name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5" style={{ fontFamily: 'var(--font-mono)' }}>
                        {r.cuisine} · {r.distance} · {r.isOpen ? 'Đang mở' : 'Đã đóng'}
                      </p>
                    </div>
                    <div className="flex items-center gap-0.5 shrink-0" style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: '#d97706' }}>
                      <Star size={10} fill="currentColor" />{r.rating}
                    </div>
                  </button>
                ))}
              </>
            )}

            {/* See all */}
            <button
              onClick={() => goSearch(query)}
              className="w-full flex items-center justify-center gap-2 py-3 bg-secondary hover:bg-foreground hover:text-background transition-colors border-t border-border"
              style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', fontWeight: 700, letterSpacing: '0.04em' }}
            >
              <Search size={13} />
              XEM TẤT CẢ KẾT QUẢ CHO "{query}"
              <ArrowRight size={13} />
            </button>
          </div>
        )}

        {/* No suggestions */}
        {query.trim() && !hasSuggestions && (
          <div className="border-2 border-dashed border-border p-8 text-center mb-6">
            <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '18px' }}>Không tìm thấy gợi ý.</p>
            <p className="text-muted-foreground mt-1" style={{ fontFamily: 'var(--font-mono)', fontSize: '12px' }}>
              Nhấn <strong>TÌM</strong> để tìm kiếm toàn bộ.
            </p>
          </div>
        )}

        {/* ── Recent searches ── */}
        {showingEmpty && recent.length > 0 && (
          <div className="mb-7">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1.5">
                <Clock size={12} className="text-muted-foreground" />
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', letterSpacing: '0.1em', color: 'var(--muted-foreground)' }}>TÌM KIẾM GẦN ĐÂY</p>
              </div>
              <button
                onClick={handleClearAll}
                className="text-accent hover:underline"
                style={{ fontFamily: 'var(--font-mono)', fontSize: '10px' }}
              >
                XÓA TẤT CẢ
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {recent.map(r => (
                <div key={r} className="flex items-center border border-border hover:border-foreground transition-colors">
                  <button
                    onClick={() => { setQuery(r); goSearch(r); }}
                    className="flex items-center gap-1.5 pl-3 pr-2 py-1.5 hover:bg-secondary transition-colors"
                    style={{ fontFamily: 'var(--font-body)', fontSize: '13px' }}
                  >
                    <Clock size={11} className="text-muted-foreground shrink-0" />
                    {r}
                  </button>
                  <button
                    onClick={() => handleRemoveRecent(r)}
                    className="pr-2.5 pl-1.5 py-1.5 text-muted-foreground hover:text-foreground transition-colors border-l border-border"
                  >
                    <X size={11} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Categories ── */}
        {showingEmpty && (
          <div className="mb-7">
            <p className="mb-3" style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', letterSpacing: '0.1em', color: 'var(--muted-foreground)' }}>
              ─── DANH MỤC
            </p>
            <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => navigate(`/discover?category=${cat.id}`)}
                  className="flex flex-col items-center gap-1.5 border-2 border-foreground p-3 hover:bg-foreground hover:text-background transition-all"
                >
                  <span className="text-xl leading-none">{cat.icon}</span>
                  <span className="text-center leading-tight" style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', fontWeight: 600 }}>
                    {cat.name}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Trending searches ── */}
        {showingEmpty && (
          <div>
            <div className="flex items-center gap-1.5 mb-3">
              <TrendingUp size={12} className="text-muted-foreground" />
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', letterSpacing: '0.1em', color: 'var(--muted-foreground)' }}>GỢI Ý TÌM KIẾM</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {TRENDING.map(term => (
                <button
                  key={term}
                  onClick={() => { setQuery(term); goSearch(term); }}
                  className="flex items-center gap-1.5 border border-border px-3 py-1.5 hover:border-foreground hover:bg-secondary transition-all"
                  style={{ fontFamily: 'var(--font-body)', fontSize: '13px' }}
                >
                  <Search size={11} className="text-muted-foreground shrink-0" />
                  {term}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <DishDetailModal dish={selectedDish} onClose={() => setSelectedDish(null)} />
    </>
  );
}
