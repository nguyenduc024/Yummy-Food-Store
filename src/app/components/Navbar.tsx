import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { Search, ShoppingBasket, MapPin, Menu, X } from 'lucide-react';
import { useCart } from './CartContext';
import logoYummy from '../../logo/logo_yummy.png';

export function Navbar() {
  const { totalItems, setIsOpen } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/discover?q=${encodeURIComponent(searchQuery.trim())}`);
      setMobileMenuOpen(false);
    }
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
            <span className="font-display" style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '18px', letterSpacing: '-0.02em', lineHeight: 1 }}>
              YUM<span style={{ color: '#E53E3E' }}>MY!</span>
            </span>
          </Link>

          {/* Desktop search */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md">
            <div className="flex w-full border-2 border-foreground focus-within:border-accent transition-colors">
              <input
                type="text"
                placeholder="Tìm phở, cà phê, cơm tấm..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="flex-1 px-3 py-2 bg-transparent outline-none text-sm placeholder:text-muted-foreground"
                style={{ fontFamily: 'var(--font-body)' }}
              />
              <button type="submit" className="px-3 bg-foreground text-background hover:bg-accent transition-colors flex items-center">
                <Search size={16} />
              </button>
            </div>
          </form>

          {/* Desktop nav links */}
          <div className="hidden lg:flex items-center gap-6 text-sm" style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', letterSpacing: '0.05em' }}>
            <Link to="/discover?tab=dishes" className="text-foreground hover:text-accent transition-colors uppercase">Khám Phá</Link>
            <Link to="/discover?tab=restaurants" className="text-foreground hover:text-accent transition-colors uppercase">Nhà Hàng</Link>
            <Link to="/discover?tab=deals" className="text-foreground hover:text-accent transition-colors uppercase">Ưu Đãi</Link>
            <Link to="/tracking" className="text-foreground hover:text-accent transition-colors uppercase">Theo Dõi Đơn</Link>
          </div>

          {/* Cart button */}
          <button
            onClick={() => setIsOpen(true)}
            className="ml-auto relative flex items-center gap-2 border-2 border-foreground px-3 py-1.5 hover:bg-foreground hover:text-background transition-all group"
          >
            <ShoppingBasket size={16} />
            <span className="hidden sm:inline text-sm" style={{ fontFamily: 'var(--font-mono)', fontSize: '12px' }}>GIỎ HÀNG</span>
            {totalItems > 0 && (
              <span className="absolute -top-2 -right-2 bg-accent text-accent-foreground w-5 h-5 flex items-center justify-center text-xs" style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                {totalItems}
              </span>
            )}
          </button>

          {/* Mobile menu toggle */}
          <button
            className="lg:hidden border-2 border-foreground p-1.5"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t-2 border-foreground py-4 space-y-3">
            <form onSubmit={handleSearch} className="flex border-2 border-foreground">
              <input
                type="text"
                placeholder="Tìm phở, cà phê, cơm tấm..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="flex-1 px-3 py-2 bg-transparent outline-none text-sm placeholder:text-muted-foreground"
              />
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
          </div>
        )}
      </nav>
    </header>
  );
}
