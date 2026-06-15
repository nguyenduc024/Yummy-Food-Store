import { useState } from 'react';
import { useNavigate } from 'react-router';
import { ChevronLeft, MapPin, CreditCard, Banknote, CheckCircle } from 'lucide-react';
import { useCart } from './CartContext';

function formatPrice(price: number) {
  return price.toLocaleString('vi-VN') + '₫';
}

export function CheckoutPage() {
  const { items, totalPrice, clearCart } = useCart();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'momo'>('cash');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const deliveryFee = 15000;
  const serviceFee = Math.round(totalPrice * 0.03);
  const grandTotal = totalPrice + deliveryFee + serviceFee;

  const handlePlaceOrder = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      clearCart();
      navigate('/tracking');
    }, 1200);
  };

  if (items.length === 0 && step !== 3) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '32px' }}>Giỏ hàng trống.</h1>
        <p className="text-muted-foreground mt-2 mb-6" style={{ fontFamily: 'var(--font-mono)', fontSize: '13px' }}>Thêm món trước khi thanh toán.</p>
        <button onClick={() => navigate('/')} className="bg-foreground text-background px-6 py-2.5 hover:bg-accent transition-colors" style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
          TÌM MÓN ĂN
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 lg:px-8 py-6 pb-16">
      {/* Back */}
      <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6" style={{ fontFamily: 'var(--font-mono)', fontSize: '12px' }}>
        <ChevronLeft size={14} /> QUAY LẠI
      </button>

      {/* Header */}
      <div className="mb-8">
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', letterSpacing: '0.1em', color: 'var(--muted-foreground)', marginBottom: '4px' }}>
          ─── THANH TOÁN
        </p>
        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '36px', lineHeight: 1 }}>
          Xác Nhận Đơn Hàng
        </h1>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-0 mb-8 border-2 border-foreground overflow-hidden">
        {[
          { n: 1, label: 'Địa Chỉ' },
          { n: 2, label: 'Thanh Toán' },
          { n: 3, label: 'Xác Nhận' },
        ].map((s, i) => (
          <div
            key={s.n}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm border-r last:border-r-0 border-foreground transition-all ${step === s.n ? 'bg-foreground text-background' : step > s.n ? 'bg-secondary text-muted-foreground' : 'text-muted-foreground'}`}
            style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', fontWeight: 700 }}
          >
            <span className={`w-5 h-5 flex items-center justify-center border text-xs ${step === s.n ? 'border-background' : 'border-muted-foreground'}`}>
              {step > s.n ? '✓' : s.n}
            </span>
            <span className="hidden sm:inline">{s.label}</span>
          </div>
        ))}
      </div>

      <div className="lg:grid lg:grid-cols-[1fr,360px] lg:gap-10">
        {/* Left: Form */}
        <div>
          {/* Step 1: Address */}
          {step === 1 && (
            <div className="space-y-5">
              <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '22px' }}>Địa Chỉ Giao Hàng</h2>

              <div className="space-y-1">
                <label className="text-xs uppercase tracking-wider text-muted-foreground" style={{ fontFamily: 'var(--font-mono)' }}>Họ và tên *</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Nguyễn Văn A"
                  className="w-full border-2 border-foreground px-4 py-3 bg-secondary outline-none focus:border-accent transition-colors"
                  style={{ fontFamily: 'var(--font-body)' }}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs uppercase tracking-wider text-muted-foreground" style={{ fontFamily: 'var(--font-mono)' }}>Số điện thoại *</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="0901 234 567"
                  className="w-full border-2 border-foreground px-4 py-3 bg-secondary outline-none focus:border-accent transition-colors"
                  style={{ fontFamily: 'var(--font-mono)' }}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs uppercase tracking-wider text-muted-foreground" style={{ fontFamily: 'var(--font-mono)' }}>Địa chỉ giao hàng *</label>
                <div className="relative">
                  <MapPin size={16} className="absolute left-3 top-3.5 text-muted-foreground" />
                  <input
                    type="text"
                    value={address}
                    onChange={e => setAddress(e.target.value)}
                    placeholder="Số nhà, tên đường, quận..."
                    className="w-full border-2 border-foreground pl-10 pr-4 py-3 bg-secondary outline-none focus:border-accent transition-colors"
                    style={{ fontFamily: 'var(--font-body)' }}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs uppercase tracking-wider text-muted-foreground" style={{ fontFamily: 'var(--font-mono)' }}>Ghi chú cho tài xế</label>
                <textarea
                  value={note}
                  onChange={e => setNote(e.target.value)}
                  placeholder="Gọi khi tới, tầng 3, không có thang máy..."
                  rows={3}
                  className="w-full border-2 border-foreground px-4 py-3 bg-secondary outline-none focus:border-accent transition-colors resize-none"
                  style={{ fontFamily: 'var(--font-body)' }}
                />
              </div>

              <button
                onClick={() => setStep(2)}
                disabled={!name || !phone || !address}
                className="w-full bg-foreground text-background py-3.5 hover:bg-accent transition-colors disabled:opacity-40 disabled:cursor-not-allowed uppercase tracking-wider"
                style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '14px' }}
              >
                Tiếp Tục →
              </button>
            </div>
          )}

          {/* Step 2: Payment */}
          {step === 2 && (
            <div className="space-y-5">
              <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '22px' }}>Phương Thức Thanh Toán</h2>

              <div className="space-y-3">
                {[
                  { id: 'cash', label: 'Tiền mặt khi nhận hàng', desc: 'Trả tiền trực tiếp cho tài xế', Icon: Banknote },
                  { id: 'card', label: 'Thẻ ngân hàng / VISA', desc: 'Thanh toán online an toàn', Icon: CreditCard },
                  { id: 'momo', label: 'Ví MoMo', desc: 'Thanh toán qua ứng dụng MoMo', Icon: CreditCard },
                ].map(({ id, label, desc, Icon }) => (
                  <button
                    key={id}
                    onClick={() => setPaymentMethod(id as typeof paymentMethod)}
                    className={`w-full flex items-center gap-4 p-4 border-2 transition-all text-left ${paymentMethod === id ? 'border-foreground bg-foreground text-background' : 'border-border hover:border-foreground'}`}
                  >
                    <div className={`w-10 h-10 flex items-center justify-center border-2 ${paymentMethod === id ? 'border-background' : 'border-foreground'}`}>
                      <Icon size={18} />
                    </div>
                    <div>
                      <p style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: '14px' }}>{label}</p>
                      <p className={`text-xs mt-0.5 ${paymentMethod === id ? 'text-background/70' : 'text-muted-foreground'}`} style={{ fontFamily: 'var(--font-mono)' }}>{desc}</p>
                    </div>
                    <div className={`ml-auto w-4 h-4 border-2 ${paymentMethod === id ? 'border-background' : 'border-muted-foreground'} flex items-center justify-center`}>
                      {paymentMethod === id && <div className="w-2 h-2 bg-background" />}
                    </div>
                  </button>
                ))}
              </div>

              <div className="flex gap-3 pt-2">
                <button onClick={() => setStep(1)} className="flex-1 border-2 border-foreground py-3 hover:bg-secondary transition-colors" style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '13px' }}>
                  ← QUAY LẠI
                </button>
                <button onClick={() => setStep(3)} className="flex-1 bg-foreground text-background py-3 hover:bg-accent transition-colors" style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '13px' }}>
                  XEM LẠI ĐƠN →
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Confirm */}
          {step === 3 && (
            <div className="space-y-5">
              <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '22px' }}>Xác Nhận & Đặt Hàng</h2>

              {/* Address summary */}
              <div className="border-2 border-foreground p-4 space-y-2">
                <h3 className="text-xs uppercase tracking-wider text-muted-foreground" style={{ fontFamily: 'var(--font-mono)' }}>Địa chỉ giao</h3>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: '14px' }}>{name}</p>
                <p className="text-muted-foreground text-sm" style={{ fontFamily: 'var(--font-mono)' }}>{phone}</p>
                <p className="text-muted-foreground text-sm flex items-start gap-1" style={{ fontFamily: 'var(--font-body)' }}>
                  <MapPin size={14} className="mt-0.5 shrink-0" />
                  {address}
                </p>
              </div>

              {/* Payment summary */}
              <div className="border-2 border-foreground p-4">
                <h3 className="text-xs uppercase tracking-wider text-muted-foreground mb-2" style={{ fontFamily: 'var(--font-mono)' }}>Phương thức</h3>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: '14px', fontWeight: 600 }}>
                  {paymentMethod === 'cash' ? 'Tiền mặt khi nhận' : paymentMethod === 'card' ? 'Thẻ ngân hàng' : 'Ví MoMo'}
                </p>
              </div>

              {/* Items */}
              <div className="border-2 border-foreground p-4 space-y-3">
                <h3 className="text-xs uppercase tracking-wider text-muted-foreground" style={{ fontFamily: 'var(--font-mono)' }}>Món đã chọn</h3>
                {items.map(item => (
                  <div key={item.dishId} className="flex justify-between text-sm border-b border-dashed border-border pb-2 last:border-0 last:pb-0">
                    <span style={{ fontFamily: 'var(--font-body)' }}>{item.quantity}× {item.dishName}</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>{formatPrice(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>

              <div className="flex gap-3 pt-2">
                <button onClick={() => setStep(2)} className="flex-1 border-2 border-foreground py-3 hover:bg-secondary transition-colors" style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '13px' }}>
                  ← QUAY LẠI
                </button>
                <button
                  onClick={handlePlaceOrder}
                  disabled={isSubmitting}
                  className="flex-1 bg-accent text-accent-foreground py-3 hover:bg-foreground transition-colors disabled:opacity-70"
                  style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '13px' }}
                >
                  {isSubmitting ? 'ĐANG XỬ LÝ...' : `ĐẶT HÀNG — ${formatPrice(grandTotal)}`}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right: Order summary */}
        <div className="mt-8 lg:mt-0">
          <div className="sticky top-20 border-2 border-foreground">
            {/* Receipt-style header */}
            <div className="bg-foreground text-background p-4 text-center">
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', letterSpacing: '0.1em', opacity: 0.6 }}>
                ══════════ HOÁ ĐƠN ══════════
              </p>
              <p style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '20px', marginTop: '4px' }}>
                THỰC ĐƠN
              </p>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', opacity: 0.6, marginTop: '2px' }}>
                {new Date().toLocaleDateString('vi-VN', { day: '2-digit', month: 'long', year: 'numeric' })}
              </p>
            </div>

            <div className="p-4 space-y-3">
              {/* Items */}
              {items.map(item => (
                <div key={item.dishId} className="flex justify-between text-sm border-b border-dashed border-border pb-2">
                  <div>
                    <p style={{ fontFamily: 'var(--font-body)', fontSize: '13px' }}>{item.dishName}</p>
                    <p className="text-muted-foreground text-xs" style={{ fontFamily: 'var(--font-mono)' }}>×{item.quantity}</p>
                  </div>
                  <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '13px' }}>
                    {formatPrice(item.price * item.quantity)}
                  </span>
                </div>
              ))}

              {/* Breakdown */}
              <div className="space-y-1.5 text-sm" style={{ fontFamily: 'var(--font-mono)', fontSize: '12px' }}>
                <div className="flex justify-between text-muted-foreground">
                  <span>Tạm tính</span>
                  <span>{formatPrice(totalPrice)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Phí giao hàng</span>
                  <span>{formatPrice(deliveryFee)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Phí dịch vụ (3%)</span>
                  <span>{formatPrice(serviceFee)}</span>
                </div>
                <div className="flex justify-between border-t-2 border-foreground pt-2 mt-2">
                  <span style={{ fontWeight: 700, fontSize: '14px' }}>TỔNG CỘNG</span>
                  <span style={{ fontWeight: 700, fontSize: '16px', color: 'var(--accent)' }}>{formatPrice(grandTotal)}</span>
                </div>
              </div>

              <p className="text-xs text-muted-foreground border-t border-dashed border-border pt-3 flex items-center gap-1" style={{ fontFamily: 'var(--font-mono)' }}>
                <CheckCircle size={12} />
                Thời gian giao ước tính: 20–35 phút
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
