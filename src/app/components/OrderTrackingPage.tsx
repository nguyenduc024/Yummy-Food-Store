import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { CheckCircle, Clock, ChefHat, Bike, Home, MessageCircle, Phone, Star } from 'lucide-react';

const ORDER_STEPS = [
  { id: 1, label: 'Đơn hàng đã xác nhận', sublabel: 'Nhà hàng đã tiếp nhận đơn', icon: CheckCircle, time: '14:32' },
  { id: 2, label: 'Đang chuẩn bị', sublabel: 'Đầu bếp đang làm món của bạn', icon: ChefHat, time: '14:35' },
  { id: 3, label: 'Đang giao hàng', sublabel: 'Tài xế đã lấy đơn và đang đến', icon: Bike, time: '14:48' },
  { id: 4, label: 'Đã giao hàng', sublabel: 'Món đến nơi, chúc ngon miệng!', icon: Home, time: '15:05' },
];

export function OrderTrackingPage() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [showReview, setShowReview] = useState(false);
  const [rating, setRating] = useState(0);

  useEffect(() => {
    const intervals = [2000, 4000, 7000].map((delay, i) =>
      setTimeout(() => setCurrentStep(i + 2), delay)
    );
    return () => intervals.forEach(clearTimeout);
  }, []);

  const completedOrder = currentStep >= 4;

  const estimatedMinutes = currentStep === 1 ? '30–40' : currentStep === 2 ? '25–35' : currentStep === 3 ? '8–15' : '0';

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 pb-20">
      {/* Header */}
      <div className="mb-8">
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', letterSpacing: '0.1em', color: 'var(--muted-foreground)', marginBottom: '4px' }}>
          ─── ĐƠN HÀNG #TĐ-2024-00128
        </p>
        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '36px', lineHeight: 1 }}>
          Theo Dõi Đơn Hàng
        </h1>
      </div>

      {/* ETA card */}
      <div className={`border-2 p-5 mb-8 text-center transition-colors ${completedOrder ? 'border-foreground bg-foreground text-background' : 'border-foreground'}`}>
        <p className="text-xs uppercase tracking-wider opacity-60 mb-2" style={{ fontFamily: 'var(--font-mono)' }}>
          {completedOrder ? 'ĐÃ GIAO THÀNH CÔNG' : 'DỰ KIẾN ĐẾN NƠI TRONG'}
        </p>
        {completedOrder ? (
          <div className="flex items-center justify-center gap-2">
            <CheckCircle size={28} />
            <p style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '28px' }}>Chúc ngon miệng!</p>
          </div>
        ) : (
          <p style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '48px', lineHeight: 1 }}>
            {estimatedMinutes} <span style={{ fontSize: '20px', opacity: 0.6 }}>phút</span>
          </p>
        )}
        {!completedOrder && (
          <p className="text-sm mt-2 opacity-60" style={{ fontFamily: 'var(--font-mono)' }}>
            Phở Thìn Bờ Hồ → {' '}
            <span>Hoàn Kiếm, Hà Nội</span>
          </p>
        )}
      </div>

      {/* Timeline */}
      <div className="border-2 border-foreground mb-6">
        <div className="border-b border-foreground p-3 bg-secondary">
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', letterSpacing: '0.08em', fontWeight: 700 }}>
            LỊCH SỬ TRẠNG THÁI
          </span>
        </div>
        <div className="p-4">
          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-5 top-5 bottom-5 w-0.5 bg-border" />
            {/* Progress line */}
            <div
              className="absolute left-5 top-5 w-0.5 bg-foreground transition-all duration-1000"
              style={{ height: `${((currentStep - 1) / (ORDER_STEPS.length - 1)) * 100}%` }}
            />

            <div className="space-y-6 relative">
              {ORDER_STEPS.map((step, i) => {
                const isCompleted = currentStep > step.id;
                const isCurrent = currentStep === step.id;
                const Icon = step.icon;
                return (
                  <div key={step.id} className="flex gap-4 items-start">
                    <div className={`w-10 h-10 flex items-center justify-center border-2 shrink-0 relative z-10 transition-all duration-500 ${
                      isCompleted ? 'bg-foreground text-background border-foreground' :
                      isCurrent ? 'bg-foreground text-background border-foreground animate-pulse' :
                      'bg-background text-muted-foreground border-border'
                    }`}>
                      <Icon size={18} />
                    </div>
                    <div className="flex-1 pt-1">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p style={{
                            fontFamily: 'var(--font-body)',
                            fontWeight: 600,
                            fontSize: '14px',
                            color: isCurrent || isCompleted ? 'var(--foreground)' : 'var(--muted-foreground)',
                          }}>
                            {step.label}
                          </p>
                          <p className="text-xs mt-0.5" style={{ fontFamily: 'var(--font-mono)', color: 'var(--muted-foreground)' }}>
                            {step.sublabel}
                          </p>
                        </div>
                        {(isCompleted || isCurrent) && (
                          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--muted-foreground)', flexShrink: 0 }}>
                            {step.time}
                          </span>
                        )}
                      </div>
                      {isCurrent && (
                        <div className="mt-2 flex items-center gap-1">
                          <div className="w-1 h-1 bg-accent rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                          <div className="w-1 h-1 bg-accent rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                          <div className="w-1 h-1 bg-accent rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                          <span className="text-xs text-accent ml-1" style={{ fontFamily: 'var(--font-mono)' }}>đang xử lý...</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Driver info (shown during delivery) */}
      {currentStep >= 3 && !completedOrder && (
        <div className="border-2 border-foreground p-4 mb-6">
          <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '16px', marginBottom: '12px' }}>
            Thông Tin Tài Xế
          </h3>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-secondary border-2 border-foreground flex items-center justify-center">
              <Bike size={22} />
            </div>
            <div>
              <p style={{ fontFamily: 'var(--font-body)', fontWeight: 600 }}>Trần Văn Hùng</p>
              <p className="text-xs text-muted-foreground" style={{ fontFamily: 'var(--font-mono)' }}>BKS: 29A-345.67 · Honda Wave</p>
            </div>
            <div className="ml-auto flex gap-2">
              <button className="w-10 h-10 border-2 border-foreground flex items-center justify-center hover:bg-foreground hover:text-background transition-all">
                <Phone size={16} />
              </button>
              <button className="w-10 h-10 border-2 border-foreground flex items-center justify-center hover:bg-foreground hover:text-background transition-all">
                <MessageCircle size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Review (after delivery) */}
      {completedOrder && !showReview && (
        <div className="border-2 border-foreground p-5 mb-6">
          <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '18px', marginBottom: '6px' }}>
            Đánh Giá Đơn Hàng
          </h3>
          <p className="text-sm text-muted-foreground mb-4" style={{ fontFamily: 'var(--font-mono)' }}>Giúp chúng tôi cải thiện dịch vụ.</p>
          <div className="flex gap-2 mb-4">
            {[1, 2, 3, 4, 5].map(s => (
              <button key={s} onClick={() => setRating(s)}
                className={`w-10 h-10 flex items-center justify-center border-2 transition-all ${rating >= s ? 'bg-foreground text-background border-foreground' : 'border-border'}`}>
                <Star size={16} fill={rating >= s ? 'currentColor' : 'none'} />
              </button>
            ))}
          </div>
          {rating > 0 && (
            <button
              onClick={() => setShowReview(true)}
              className="w-full bg-foreground text-background py-2.5 hover:bg-accent transition-colors"
              style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '13px' }}
            >
              GỬI ĐÁNH GIÁ
            </button>
          )}
        </div>
      )}
      {showReview && (
        <div className="border-2 border-foreground p-4 mb-6 text-center">
          <CheckCircle size={24} className="mx-auto mb-2" />
          <p style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>Cảm ơn bạn đã đánh giá!</p>
        </div>
      )}

      {/* Support */}
      <div className="border border-dashed border-border p-4 text-center">
        <p className="text-sm text-muted-foreground mb-2" style={{ fontFamily: 'var(--font-mono)', fontSize: '12px' }}>
          Gặp vấn đề với đơn hàng?
        </p>
        <button className="flex items-center gap-2 mx-auto border border-foreground px-4 py-2 text-sm hover:bg-foreground hover:text-background transition-all" style={{ fontFamily: 'var(--font-mono)', fontSize: '12px' }}>
          <MessageCircle size={14} /> Liên Hệ Hỗ Trợ
        </button>
      </div>

      {/* Back to home */}
      <button
        onClick={() => navigate('/')}
        className="mt-6 w-full border-2 border-foreground py-3 hover:bg-foreground hover:text-background transition-all"
        style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '13px' }}
      >
        ĐẶT ĐƠN MỚI
      </button>
    </div>
  );
}
