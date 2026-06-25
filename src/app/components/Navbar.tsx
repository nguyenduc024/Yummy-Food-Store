import { useState, useRef, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router';
import { Search, ShoppingBasket, MapPin, Menu, X, User, Settings, Clock, TrendingUp, Star } from 'lucide-react';
import { useCart } from './CartContext';
import { useAuth } from './AuthContext';
import { categories, dishes, restaurants } from '../data/mockData';
import logoYummy from '../../logo/logo_yummy.png';

const TRENDING = [
  'Phở bò', 'Cơm tấm', 'Bánh mì', 'Bún bò Huế',
  'Trà sữa', 'Cà phê sữa đá', 'Lẩu', 'Hủ tiếu',
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

export function Navbar() {
  const { totalItems, setIsOpen } = useCart();
  const { isAuthenticated } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  // Desktop search state
  const [searchQuery, setSearchQuery] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [recent, setRecent] = useState<string[]>(getRecent);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Mobile search state
  const [mobileQuery, setMobileQuery] = useState('');

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Live suggestions
  const dishSuggestions = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return dishes
      .filter(d => d.name.toLowerCase().includes(q) || d.restaurantName.toLowerCase().includes(q) || d.description.toLowerCase().includes(q))
      .slice(0, 5);
  }, [searchQuery]);

  const restaurantSuggestions = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return restaurants
      .filter(r => r.name.toLowerCase().includes(q) || r.cuisine.toLowerCase().includes(q))
      .slice(0, 3);
  }, [searchQuery]);

  const hasSuggestions = dishSuggestions.length > 0 || restaurantSuggestions.length > 0;

  const commitSearch = (q: string) => {
    if (!q.trim()) return;
    saveRecent(q.trim());
    setRecent(getRecent());
    navigate(`/discover?q=${encodeURIComponent(q.trim())}`);
    setDropdownOpen(false);
    setSearchQuery('');
  };

  const handleDesktopSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    commitSearch(searchQuery);
  };

  const handleMobileSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (mobileQuery.trim()) {
      navigate(`/discover?q=${encodeURIComponent(mobileQuery.trim())}`);
      setMobileMenuOpen(false);
      setMobileQuery('');
    }
  };

  const handleRemoveRecent = (q: string) => {
    removeRecent(q);
    setRecent(getRecent());
  };

  const handleClearRecent = () => {
    localStorage.removeItem(RECENT_KEY);
    setRecent([]);
  };

  return (
    <header className="sticky top-0 z-50 bg-background border-b-2 border-foreground">
      {/* Top bar */}
      <div className="border-b border-border px-4 py-1 flex items-center justify-between">
        <div className="flex items-center gap-1 text-muted-foreground" style={{ fontFamily: 'var(--font-mono)', fontSize: '11px' }}>
          <MapPin size={11} />
          <span>56 Hoàng Diệu 2, Thủ Đức, TP. Hồ Chí Minh</span>
        </div>
        <div className="text-muted-foreground" style={{ fontFamily: 'var(--font-mono)', fontSize: '11px' }}>
          Giao hàng từ 8:00 – 22:00
        </div>
      </div>

      {/* Main nav */}
      <nav className="px-4 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center h-14 gap-6">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0 group">
            <img src={logoYummy} alt="YUMMY logo" className="w-8 h-8 object-contain" />
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '18px', letterSpacing: '-0.02em', lineHeight: 1 }}>
              YUM<span style={{ color: '#E53E3E' }}>MY!</span>
            </span>
          </Link>

          {/* Desktop search with dropdown */}
          <div ref={searchContainerRef} className="hidden md:flex flex-1 max-w-md flex-col relative">
            <form onSubmit={handleDesktopSubmit}>
              <div className={`flex w-full border-2 transition-colors ${dropdownOpen ? 'border-accent' : 'border-foreground'}`}>
                <div className="flex-1 flex items-center px-3 gap-2">
                  <Search size={15} className="text-muted-foreground shrink-0" />
                  <input
                    type="text"
                    placeholder="Tìm phở, cà phê, cơm tấm..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    onFocus={() => setDropdownOpen(true)}
                    className="flex-1 py-2 bg-transparent outline-none text-sm placeholder:text-muted-foreground"
                    style={{ fontFamily: 'var(--font-body)' }}
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onMouseDown={e => e.preventDefault()}
                      onClick={() => { setSearchQuery(''); }}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <X size={13} />
                    </button>
                  )}
                </div>
                <button
                  type="submit"
                  className="px-3 bg-foreground text-background hover:bg-accent transition-colors flex items-center shrink-0"
                >
                  <Search size={15} />
                </button>
              </div>
            </form>

            {/* Dropdown */}
            {dropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-background border-2 border-foreground z-50 max-h-[70vh] overflow-y-auto"
                style={{ boxShadow: '4px 4px 0px var(--foreground)' }}>

                {/* ── With query: live suggestions ── */}
                {searchQuery.trim() && hasSuggestions && (
                  <>
                    {dishSuggestions.length > 0 && (
                      <div>
                        <p className="px-4 py-2 border-b border-border bg-secondary" style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', letterSpacing: '0.1em', color: 'var(--muted-foreground)' }}>
                          MÓN ĂN
                        </p>
                        {dishSuggestions.map(dish => (
                          <button
                            key={dish.id}
                            onMouseDown={e => e.preventDefault()}
                            onClick={() => commitSearch(dish.name)}
                            className="w-full flex items-center gap-3 px-4 py-2.5 border-b border-border hover:bg-secondary transition-colors text-left"
                          >
                            <img src={dish.image} alt={dish.name} className="w-9 h-9 object-cover border border-border shrink-0" style={{ filter: 'grayscale(20%)' }} />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate" style={{ fontFamily: 'var(--font-body)' }}>{dish.name}</p>
                              <p className="text-xs text-muted-foreground" style={{ fontFamily: 'var(--font-mono)' }}>{dish.restaurantName}</p>
                            </div>
                            <div className="text-right shrink-0">
                              <p style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', fontWeight: 700, color: 'var(--accent)' }}>{dish.price.toLocaleString('vi-VN')}₫</p>
                              <p className="flex items-center gap-0.5 justify-end" style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: '#d97706' }}>
                                <Star size={9} fill="currentColor" />{dish.rating}
                              </p>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}

                    {restaurantSuggestions.length > 0 && (
                      <div>
                        <p className="px-4 py-2 border-b border-border bg-secondary" style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', letterSpacing: '0.1em', color: 'var(--muted-foreground)' }}>
                          NHÀ HÀNG
                        </p>
                        {restaurantSuggestions.map(r => (
                          <button
                            key={r.id}
                            onMouseDown={e => e.preventDefault()}
                            onClick={() => { navigate(`/restaurant/${r.id}`); setDropdownOpen(false); setSearchQuery(''); }}
                            className="w-full flex items-center gap-3 px-4 py-2.5 border-b border-border hover:bg-secondary transition-colors text-left"
                          >
                            <img src={r.image} alt={r.name} className="w-9 h-9 object-cover border border-border shrink-0" style={{ filter: 'grayscale(20%)' }} />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate" style={{ fontFamily: 'var(--font-body)' }}>{r.name}</p>
                              <p className="text-xs text-muted-foreground" style={{ fontFamily: 'var(--font-mono)' }}>{r.cuisine} · {r.distance}</p>
                            </div>
                            <span className={`shrink-0 text-xs ${r.isOpen ? 'text-green-700' : 'text-muted-foreground'}`} style={{ fontFamily: 'var(--font-mono)' }}>
                              {r.isOpen ? 'Đang mở' : 'Đã đóng'}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}

                    <button
                      onMouseDown={e => e.preventDefault()}
                      onClick={() => commitSearch(searchQuery)}
                      className="w-full flex items-center justify-center gap-2 py-2.5 bg-secondary hover:bg-foreground hover:text-background transition-colors border-t border-border"
                      style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', fontWeight: 700 }}
                    >
                      <Search size={12} />
                      XEM TẤT CẢ KẾT QUẢ CHO "{searchQuery}"
                    </button>
                  </>
                )}

                {/* No suggestions but has query */}
                {searchQuery.trim() && !hasSuggestions && (
                  <div className="px-4 py-5 text-center">
                    <p className="text-sm text-muted-foreground" style={{ fontFamily: 'var(--font-mono)' }}>
                      Không có gợi ý. Nhấn Enter để tìm kiếm.
                    </p>
                  </div>
                )}

                {/* ── Empty query: recent + categories + trending ── */}
                {!searchQuery.trim() && (
                  <div className="py-3">
                    {/* Recent */}
                    {recent.length > 0 && (
                      <div className="px-4 pb-3 border-b border-border mb-3">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-1.5">
                            <Clock size={11} className="text-muted-foreground" />
                            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', letterSpacing: '0.1em', color: 'var(--muted-foreground)' }}>GẦN ĐÂY</span>
                          </div>
                          <button
                            onMouseDown={e => e.preventDefault()}
                            onClick={handleClearRecent}
                            className="text-accent hover:underline"
                            style={{ fontFamily: 'var(--font-mono)', fontSize: '10px' }}
                          >
                            XÓA TẤT CẢ
                          </button>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {recent.map(r => (
                            <div key={r} className="flex items-center border border-border hover:border-foreground transition-colors">
                              <button
                                onMouseDown={e => e.preventDefault()}
                                onClick={() => commitSearch(r)}
                                className="pl-2.5 pr-1.5 py-1 text-xs hover:bg-secondary transition-colors"
                                style={{ fontFamily: 'var(--font-body)' }}
                              >
                                {r}
                              </button>
                              <button
                                onMouseDown={e => e.preventDefault()}
                                onClick={() => handleRemoveRecent(r)}
                                className="px-1.5 py-1 border-l border-border text-muted-foreground hover:text-foreground transition-colors"
                              >
                                <X size={10} />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Categories */}
                    <div className="px-4 pb-3 border-b border-border mb-3">
                      <p className="mb-2" style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', letterSpacing: '0.1em', color: 'var(--muted-foreground)' }}>DANH MỤC</p>
                      <div className="grid grid-cols-5 gap-1.5">
                        {categories.map(cat => (
                          <button
                            key={cat.id}
                            onMouseDown={e => e.preventDefault()}
                            onClick={() => { navigate(`/discover?category=${cat.id}`); setDropdownOpen(false); }}
                            className="flex items-center justify-center border border-border p-2 hover:border-foreground hover:bg-secondary transition-all"
                          >
                            <span className="text-center leading-tight" style={{ fontFamily: 'var(--font-mono)', fontSize: '9px' }}>{cat.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Trending */}
                    <div className="px-4">
                      <div className="flex items-center gap-1.5 mb-2">
                        <TrendingUp size={11} className="text-muted-foreground" />
                        <p style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', letterSpacing: '0.1em', color: 'var(--muted-foreground)' }}>GỢI Ý</p>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {TRENDING.map(term => (
                          <button
                            key={term}
                            onMouseDown={e => e.preventDefault()}
                            onClick={() => { setSearchQuery(term); commitSearch(term); }}
                            className="flex items-center gap-1 border border-border px-2.5 py-1 hover:border-foreground hover:bg-secondary transition-all"
                            style={{ fontFamily: 'var(--font-body)', fontSize: '12px' }}
                          >
                            <Search size={10} className="text-muted-foreground" />
                            {term}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Desktop nav links */}
          <div className="hidden lg:flex items-center gap-6 text-sm" style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', letterSpacing: '0.05em' }}>
            <Link to="/discover?tab=dishes" className="text-foreground hover:text-accent transition-colors uppercase">Khám Phá</Link>
            <Link to="/discover?tab=restaurants" className="text-foreground hover:text-accent transition-colors uppercase">Nhà Hàng</Link>
            <Link to="/discover?tab=deals" className="text-foreground hover:text-accent transition-colors uppercase">Ưu Đãi</Link>
            <Link to="/tracking" className="text-foreground hover:text-accent transition-colors uppercase">Theo Dõi Đơn</Link>
          </div>

          {/* Auth + Cart */}
          <div className="ml-auto flex items-center gap-2">
            {isAuthenticated ? (
              <>
                <Link to="/settings" title="Tài khoản" className="flex items-center justify-center border-2 border-foreground w-9 h-9 hover:bg-foreground hover:text-background transition-all">
                  <User size={16} />
                </Link>
                <Link to="/settings" title="Cài đặt" className="flex items-center justify-center border-2 border-foreground w-9 h-9 hover:bg-foreground hover:text-background transition-all">
                  <Settings size={16} />
                </Link>
              </>
            ) : (
              <Link
                to="/auth"
                className="hidden sm:flex items-center border-2 border-foreground px-3 py-1.5 hover:bg-foreground hover:text-background transition-all"
                style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', letterSpacing: '0.03em', fontWeight: 700 }}
              >
                ĐĂNG KÝ / ĐĂNG NHẬP
              </Link>
            )}

            <button
              onClick={() => setIsOpen(true)}
              className="relative flex items-center gap-2 border-2 border-foreground px-3 py-1.5 hover:bg-foreground hover:text-background transition-all"
            >
              <ShoppingBasket size={16} />
              <span className="hidden sm:inline text-sm" style={{ fontFamily: 'var(--font-mono)', fontSize: '12px' }}>GIỎ HÀNG</span>
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-accent text-accent-foreground w-5 h-5 flex items-center justify-center text-xs" style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                  {totalItems}
                </span>
              )}
            </button>
          </div>

          {/* Mobile menu toggle */}
          <button className="lg:hidden border-2 border-foreground p-1.5" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t-2 border-foreground py-4 space-y-3">
            <form onSubmit={handleMobileSearch} className="flex border-2 border-foreground">
              <div className="flex-1 flex items-center px-3 gap-2">
                <Search size={14} className="text-muted-foreground shrink-0" />
                <input
                  type="text"
                  placeholder="Tìm phở, cà phê, cơm tấm..."
                  value={mobileQuery}
                  onChange={e => setMobileQuery(e.target.value)}
                  className="flex-1 py-2 bg-transparent outline-none text-sm placeholder:text-muted-foreground"
                  style={{ fontFamily: 'var(--font-body)' }}
                />
              </div>
              <button type="submit" className="px-3 bg-foreground text-background">
                <Search size={16} />
              </button>
            </form>
            <div className="grid grid-cols-2 gap-2" style={{ fontFamily: 'var(--font-mono)', fontSize: '12px' }}>
              {[['Khám Phá', '/discover?tab=dishes'], ['Nhà Hàng', '/discover?tab=restaurants'], ['Ưu Đãi', '/discover?tab=deals'], ['Theo Dõi', '/tracking']].map(([label, href]) => (
                <Link key={href} to={href} onClick={() => setMobileMenuOpen(false)}
                  className="border border-foreground px-3 py-2 text-center hover:bg-foreground hover:text-background transition-all uppercase tracking-wider">
                  {label}
                </Link>
              ))}
            </div>
            {!isAuthenticated ? (
              <Link to="/auth" onClick={() => setMobileMenuOpen(false)}
                className="block border-2 border-foreground px-3 py-2.5 text-center hover:bg-foreground hover:text-background transition-all uppercase tracking-wider"
                style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', fontWeight: 700 }}>
                Đăng Ký / Đăng Nhập
              </Link>
            ) : (
              <Link to="/settings" onClick={() => setMobileMenuOpen(false)}
                className="block border-2 border-foreground px-3 py-2.5 text-center hover:bg-foreground hover:text-background transition-all uppercase tracking-wider"
                style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', fontWeight: 700 }}>
                Tài Khoản & Cài Đặt
              </Link>
            )}
          </div>
        )}
      </nav>
    </header>
  );
}
