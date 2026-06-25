import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router';
import {
  ChevronLeft, Bike, Package, MapPin, CheckCircle,
  Clock, TrendingUp, Star, Flag, AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from './AuthContext';
import type { Order, OrderStatus, Review } from '../data/authTypes';
import {
  getOrdersByShipper, getAvailableOrders, updateOrderStatus,
  getReviewsByShipper, reportReview,
  seedShipperData, getUserOnlineStatus, setUserOnlineStatus,
  getOrderStatusLabel, formatPrice, formatDate, formatTimeAgo,
} from '../services/orderStorage';

type Tab = 'orders' | 'history' | 'income' | 'reviews';
type IncomePeriod = 'today' | 'week' | 'month';

const REJECT_REASONS = ['Quá xa', 'Đang bận', 'Hết pin xe', 'Khu vực không quen'];
const REPORT_REASONS = ['Ngôn từ thô tục', 'Thông tin sai lệch', 'Nội dung xúc phạm', 'Spam'];

function StarRow({ stars }: { stars: number }) {
  return (
    <span className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(s => (
        <Star key={s} size={12} fill={s <= stars ? 'currentColor' : 'none'} className={s <= stars ? 'text-accent' : 'text-muted-foreground'} />
      ))}
    </span>
  );
}

function getIncomeByPeriod(orders: Order[], shipperId: string, period: IncomePeriod): number {
  const now = new Date();
  const start = new Date(now);
  if (period === 'today') start.setHours(0, 0, 0, 0);
  else if (period === 'week') { start.setDate(start.getDate() - 6); start.setHours(0, 0, 0, 0); }
  else { start.setDate(start.getDate() - 29); start.setHours(0, 0, 0, 0); }
  return orders
    .filter(o => o.shipperId === shipperId && o.status === 'completed')
    .filter(o => new Date(o.createdAt).getTime() >= start.getTime())
    .reduce((s, o) => s + o.deliveryFee, 0);
}

export function ShipperDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [tab, setTab] = useState<Tab>('orders');
  const [incomePeriod, setIncomePeriod] = useState<IncomePeriod>('week');
  const [isOnline, setIsOnline] = useState(true);

  const [myOrders, setMyOrders] = useState<Order[]>([]);
  const [availableOrders, setAvailableOrders] = useState<Order[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);

  // Reject flow
  const [rejectOrderId, setRejectOrderId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  // Report review
  const [reportReviewId, setReportReviewId] = useState<string | null>(null);
  const [reportReason, setReportReason] = useState('');

  // Incident report
  const [incidentOrderId, setIncidentOrderId] = useState<string | null>(null);

  const load = useCallback(() => {
    if (!user) return;
    setMyOrders(getOrdersByShipper(user.id));
    setAvailableOrders(getAvailableOrders());
    setReviews(getReviewsByShipper(user.id));
    setIsOnline(getUserOnlineStatus(user.id));
  }, [user]);

  useEffect(() => {
    if (!user) return;
    if (user.role !== 'shipper') { navigate('/'); return; }
    seedShipperData(user.id);
    load();
  }, [user, navigate, load]);

  if (!user || user.role !== 'shipper') return null;

  const shipperName = user.shipperProfile?.fullName || user.name;
  const activeDelivery = myOrders.find(o => ['confirmed', 'waiting_pickup', 'delivering'].includes(o.status) && o.shipperId === user.id);
  const completedOrders = myOrders.filter(o => o.status === 'completed');
  const todayIncome = getIncomeByPeriod(myOrders, user.id, 'today');

  const handleToggleOnline = () => {
    if (!isOnline && !user.shipperProfile) {
      toast.error('Cần hoàn thiện hồ sơ shipper trước khi nhận đơn');
      return;
    }
    if (activeDelivery && isOnline) {
      toast.error('Bạn đang giao đơn. Hãy hoàn tất trước khi tắt.');
      return;
    }
    const next = !isOnline;
    setUserOnlineStatus(user.id, next);
    setIsOnline(next);
    toast.success(next ? 'Đã bật nhận đơn' : 'Đã tắt nhận đơn');
  };

  const handleAcceptOrder = (orderId: string) => {
    if (activeDelivery) {
      toast.error('Bạn đang có đơn giao. Hãy hoàn tất trước.');
      return;
    }
    updateOrderStatus(orderId, 'confirmed', { shipperId: user.id, shipperName: shipperName });
    toast.success('Đã nhận đơn hàng!');
    load();
  };

  const handlePickedUp = (orderId: string) => {
    updateOrderStatus(orderId, 'delivering');
    toast.success('Đã xác nhận lấy hàng — bắt đầu giao!');
    load();
  };

  const handleCompleted = (orderId: string) => {
    updateOrderStatus(orderId, 'completed');
    toast.success('Giao hàng thành công! Thu nhập đã được ghi nhận.');
    load();
  };

  const handleIncident = () => {
    if (!incidentOrderId) return;
    updateOrderStatus(incidentOrderId, 'cancelled_failed');
    toast.error('Đã báo cáo sự cố giao hàng');
    setIncidentOrderId(null);
    load();
  };

  const handleReportSubmit = () => {
    if (!reportReviewId || !reportReason) return;
    reportReview(reportReviewId, user.id, reportReason);
    toast.success('Đã gửi báo cáo');
    setReportReviewId(null);
    setReportReason('');
  };

  const avgStars = reviews.length > 0 ? (reviews.reduce((s, r) => s + r.stars, 0) / reviews.length).toFixed(1) : '—';

  const historyOrders = myOrders.filter(o => ['completed', 'cancelled_failed'].includes(o.status));

  const incomeOrders = myOrders.filter(o => {
    if (o.status !== 'completed' || o.shipperId !== user.id) return false;
    const now = new Date();
    const start = new Date(now);
    if (incomePeriod === 'today') start.setHours(0, 0, 0, 0);
    else if (incomePeriod === 'week') { start.setDate(start.getDate() - 6); start.setHours(0, 0, 0, 0); }
    else { start.setDate(start.getDate() - 29); start.setHours(0, 0, 0, 0); }
    return new Date(o.createdAt).getTime() >= start.getTime();
  });

  const TABS: { key: Tab; label: string }[] = [
    { key: 'orders', label: `NHẬN ĐƠN${availableOrders.length > 0 && isOnline ? ` (${availableOrders.length})` : ''}` },
    { key: 'history', label: 'LỊCH SỬ' },
    { key: 'income', label: 'THU NHẬP' },
    { key: 'reviews', label: 'ĐÁNH GIÁ' },
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 pb-16">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button onClick={() => navigate('/')} className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors" style={{ fontFamily: 'var(--font-mono)', fontSize: '12px' }}>
          <ChevronLeft size={14} /> VỀ TRANG CHỦ
        </button>
        <button
          onClick={handleToggleOnline}
          className={`flex items-center gap-2 border-2 px-4 py-2 transition-all ${isOnline ? 'bg-foreground text-background border-foreground' : 'border-foreground hover:bg-secondary'}`}
          style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', fontWeight: 700 }}
        >
          <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-400' : 'bg-muted-foreground'}`} />
          {isOnline ? 'ĐANG NHẬN ĐƠN' : 'ĐÃ TẮT'}
        </button>
      </div>

      {/* Hero */}
      <div className="border-2 border-foreground p-5 mb-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 border-2 border-foreground flex items-center justify-center shrink-0">
            <Bike size={22} />
          </div>
          <div className="flex-1">
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', letterSpacing: '0.1em', color: 'var(--muted-foreground)', marginBottom: '2px' }}>
              ─── DASHBOARD SHIPPER
            </p>
            <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '28px', lineHeight: 1 }}>
              {shipperName}
            </h1>
            {user.shipperProfile && (
              <p className="text-muted-foreground mt-1" style={{ fontFamily: 'var(--font-mono)', fontSize: '11px' }}>
                {user.shipperProfile.vehicleType} · {user.shipperProfile.licensePlate}
              </p>
            )}
          </div>
        </div>
        <div className="flex gap-6 mt-4 pt-4 border-t border-dashed border-border">
          <div>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--muted-foreground)' }}>ĐƠN HOÀN THÀNH</p>
            <p style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '24px' }}>{completedOrders.length}</p>
          </div>
          <div>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--muted-foreground)' }}>ĐIỂM ĐÁNH GIÁ</p>
            <p style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '24px' }}>{avgStars}</p>
          </div>
          <div>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--muted-foreground)' }}>THU NHẬP HÔM NAY</p>
            <p className="text-green-700" style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '18px' }}>{formatPrice(todayIncome)}</p>
          </div>
        </div>
      </div>

      {/* Active delivery banner */}
      {activeDelivery && (
        <div className="border-2 border-accent bg-accent/5 p-4 mb-4">
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--accent)', letterSpacing: '0.1em', marginBottom: '8px' }}>
            ── ĐANG GIAO ĐƠN HÀNG
          </p>
          <div className="flex items-start justify-between gap-3">
            <div>
              <p style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: '14px' }}>{activeDelivery.restaurantName}</p>
              <p className="flex items-center gap-1 mt-1" style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--muted-foreground)' }}>
                <MapPin size={11} /> {activeDelivery.address}
              </p>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--muted-foreground)', marginTop: '2px' }}>
                Khách: {activeDelivery.customerName} · {activeDelivery.customerPhone}
              </p>
            </div>
            <span className="text-accent border border-accent px-2 py-0.5 shrink-0" style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', fontWeight: 700 }}>
              {getOrderStatusLabel(activeDelivery.status)}
            </span>
          </div>
          <div className="flex gap-2 mt-3">
            {activeDelivery.status === 'confirmed' || activeDelivery.status === 'waiting_pickup' ? (
              <button
                onClick={() => handlePickedUp(activeDelivery.id)}
                className="flex items-center gap-1.5 bg-foreground text-background px-4 py-2 hover:bg-green-800 transition-colors"
                style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: 700 }}
              >
                <Package size={13} /> ĐÃ LẤY HÀNG
              </button>
            ) : (
              <button
                onClick={() => handleCompleted(activeDelivery.id)}
                className="flex items-center gap-1.5 bg-foreground text-background px-4 py-2 hover:bg-green-800 transition-colors"
                style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: 700 }}
              >
                <CheckCircle size={13} /> GIAO THÀNH CÔNG
              </button>
            )}
            <button
              onClick={() => setIncidentOrderId(activeDelivery.id)}
              className="flex items-center gap-1.5 border-2 border-accent text-accent px-4 py-2 hover:bg-accent hover:text-background transition-colors"
              style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: 700 }}
            >
              <AlertCircle size={13} /> BÁO SỰ CỐ
            </button>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="border-2 border-foreground">
        <div className="flex border-b-2 border-foreground">
          {TABS.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex-1 px-3 py-3 border-r border-foreground last:border-0 transition-colors ${tab === t.key ? 'bg-foreground text-background' : 'hover:bg-secondary'}`}
              style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: 700, letterSpacing: '0.04em' }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* ── NHẬN ĐƠN ── */}
        {tab === 'orders' && (
          <div>
            {!isOnline ? (
              <div className="p-8 text-center">
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--muted-foreground)' }}>Bật trạng thái nhận đơn để xem đơn hàng</p>
              </div>
            ) : activeDelivery ? (
              <div className="p-5 text-center">
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--muted-foreground)' }}>
                  Hoàn tất đơn đang giao trước khi nhận đơn mới
                </p>
              </div>
            ) : availableOrders.length === 0 ? (
              <div className="p-8 text-center">
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--muted-foreground)' }}>Không có đơn hàng khả dụng</p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {availableOrders.map(order => (
                  <div key={order.id} className="p-4">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div>
                        <p style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: '14px' }}>{order.restaurantName}</p>
                        <p className="flex items-center gap-1 mt-0.5" style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--muted-foreground)' }}>
                          <MapPin size={11} /> {order.address}
                        </p>
                        <p style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--muted-foreground)', marginTop: '2px' }}>
                          {formatTimeAgo(order.createdAt)}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-green-700" style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '16px' }}>+{formatPrice(order.deliveryFee)}</p>
                        <p className="text-muted-foreground" style={{ fontFamily: 'var(--font-mono)', fontSize: '10px' }}>phí giao</p>
                      </div>
                    </div>

                    <div className="space-y-0.5 mb-3">
                      {order.items.map((item, i) => (
                        <p key={i} style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--muted-foreground)' }}>
                          {item.dishName} × {item.quantity}
                        </p>
                      ))}
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAcceptOrder(order.id)}
                        className="flex-1 flex items-center justify-center gap-1.5 bg-foreground text-background py-2 hover:bg-green-800 transition-colors"
                        style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: 700 }}
                      >
                        <CheckCircle size={13} /> NHẬN ĐƠN
                      </button>
                      <button
                        onClick={() => setRejectOrderId(order.id)}
                        className="border-2 border-foreground px-4 py-2 hover:bg-secondary transition-colors"
                        style={{ fontFamily: 'var(--font-mono)', fontSize: '11px' }}
                      >
                        BỎ QUA
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── LỊCH SỬ ── */}
        {tab === 'history' && (
          <div className="divide-y divide-border">
            {historyOrders.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground" style={{ fontFamily: 'var(--font-mono)', fontSize: '12px' }}>
                Chưa có lịch sử giao hàng
              </div>
            ) : historyOrders.map(order => (
              <div key={order.id} className="p-4">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <p style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: '14px' }}>{order.restaurantName}</p>
                    <p className="flex items-center gap-1 mt-0.5" style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--muted-foreground)' }}>
                      <MapPin size={11} /> {order.address}
                    </p>
                    <p style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--muted-foreground)', marginTop: '2px' }}>
                      {formatDate(order.updatedAt)}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    {order.status === 'completed' && (
                      <p className="text-green-700" style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '15px' }}>+{formatPrice(order.deliveryFee)}</p>
                    )}
                    <span className={`border px-2 py-0.5 text-xs mt-1 block ${order.status === 'completed' ? 'text-green-700 border-green-700' : 'text-destructive border-destructive'}`} style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', fontWeight: 700 }}>
                      {getOrderStatusLabel(order.status)}
                    </span>
                  </div>
                </div>
                <div className="space-y-0.5">
                  {order.items.map((item, i) => (
                    <p key={i} style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--muted-foreground)' }}>
                      {item.dishName} × {item.quantity}
                    </p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── THU NHẬP ── */}
        {tab === 'income' && (
          <div className="p-5">
            <div className="flex gap-2 mb-5">
              {([['today', 'HÔM NAY'], ['week', '7 NGÀY'], ['month', '30 NGÀY']] as [IncomePeriod, string][]).map(([p, label]) => (
                <button
                  key={p}
                  onClick={() => setIncomePeriod(p)}
                  className={`px-3 py-1.5 border-2 transition-colors ${incomePeriod === p ? 'bg-foreground text-background border-foreground' : 'border-foreground hover:bg-secondary'}`}
                  style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', fontWeight: 700 }}
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-3 mb-5">
              <div className="border-2 border-foreground p-4 text-center">
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--muted-foreground)', letterSpacing: '0.08em', marginBottom: '4px' }}>TỔNG THU NHẬP</p>
                <p className="text-green-700" style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '22px' }}>
                  {formatPrice(getIncomeByPeriod(myOrders, user.id, incomePeriod))}
                </p>
              </div>
              <div className="border-2 border-foreground p-4 text-center">
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--muted-foreground)', letterSpacing: '0.08em', marginBottom: '4px' }}>SỐ CHUYẾN</p>
                <p style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '22px' }}>{incomeOrders.length}</p>
              </div>
            </div>

            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--muted-foreground)', letterSpacing: '0.08em', marginBottom: '10px' }}>
              CHI TIẾT TỪNG CHUYẾN
            </p>
            {incomeOrders.length === 0 ? (
              <p className="text-muted-foreground" style={{ fontFamily: 'var(--font-mono)', fontSize: '12px' }}>Không có dữ liệu trong khoảng này</p>
            ) : (
              <div className="space-y-2">
                {incomeOrders.map(order => (
                  <div key={order.id} className="flex items-center justify-between border-b border-dashed border-border pb-2 last:border-0">
                    <div>
                      <p style={{ fontFamily: 'var(--font-body)', fontSize: '13px' }}>{order.restaurantName}</p>
                      <p style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--muted-foreground)' }}>
                        {formatDate(order.updatedAt)}
                      </p>
                    </div>
                    <p className="text-green-700" style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '14px' }}>
                      +{formatPrice(order.deliveryFee)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── ĐÁNH GIÁ ── */}
        {tab === 'reviews' && (
          <div className="p-5">
            <div className="flex items-center gap-3 mb-5">
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '32px' }}>{avgStars}</span>
              <div>
                <StarRow stars={Math.round(parseFloat(avgStars) || 0)} />
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--muted-foreground)', marginTop: '2px' }}>
                  {reviews.length} đánh giá từ khách hàng
                </p>
              </div>
            </div>

            <div className="divide-y divide-border">
              {reviews.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground" style={{ fontFamily: 'var(--font-mono)', fontSize: '12px' }}>
                  Chưa có đánh giá
                </div>
              ) : reviews.map(review => (
                <div key={review.id} className="py-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: '13px' }}>{review.customerName}</span>
                        <StarRow stars={review.stars} />
                      </div>
                      <p style={{ fontFamily: 'var(--font-body)', fontSize: '13px' }}>{review.content}</p>
                      <p className="text-muted-foreground mt-1" style={{ fontFamily: 'var(--font-mono)', fontSize: '10px' }}>
                        {formatTimeAgo(review.createdAt)}
                        {(review.reportedBy?.length ?? 0) > 0 && (
                          <span className="text-accent ml-2">• {review.reportedBy!.length} báo cáo</span>
                        )}
                      </p>
                    </div>
                    <button
                      onClick={() => { setReportReviewId(review.id); setReportReason(''); }}
                      className="flex items-center gap-1 text-muted-foreground hover:text-accent transition-colors shrink-0"
                      style={{ fontFamily: 'var(--font-mono)', fontSize: '10px' }}
                    >
                      <Flag size={12} /> BÁO CÁO
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Reject modal ── */}
      {rejectOrderId && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-background border-2 border-foreground w-full max-w-sm">
            <div className="px-5 py-4 border-b-2 border-foreground">
              <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '22px' }}>Lý do từ chối</h3>
            </div>
            <div className="p-5 space-y-2">
              {REJECT_REASONS.map(r => (
                <button
                  key={r}
                  onClick={() => setRejectReason(r)}
                  className={`w-full text-left px-3 py-2.5 border-2 transition-colors ${rejectReason === r ? 'bg-foreground text-background border-foreground' : 'border-border hover:bg-secondary'}`}
                  style={{ fontFamily: 'var(--font-body)', fontSize: '13px' }}
                >
                  {r}
                </button>
              ))}
            </div>
            <div className="flex border-t-2 border-foreground">
              <button onClick={() => { setRejectOrderId(null); setRejectReason(''); }} className="flex-1 py-3 hover:bg-secondary transition-colors border-r-2 border-foreground" style={{ fontFamily: 'var(--font-mono)', fontSize: '12px' }}>THOÁT</button>
              <button
                onClick={() => { toast.success('Đã bỏ qua đơn hàng'); setRejectOrderId(null); setRejectReason(''); load(); }}
                disabled={!rejectReason}
                className="flex-1 py-3 bg-foreground text-background hover:bg-accent transition-colors disabled:opacity-40"
                style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', fontWeight: 700 }}
              >
                XÁC NHẬN
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Incident modal ── */}
      {incidentOrderId && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-background border-2 border-foreground w-full max-w-sm p-6">
            <div className="flex items-center gap-2 mb-3">
              <AlertCircle size={20} className="text-accent" />
              <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '22px' }}>Báo sự cố</h3>
            </div>
            <p className="text-muted-foreground mb-5" style={{ fontFamily: 'var(--font-body)', fontSize: '13px' }}>
              Xác nhận giao hàng thất bại? Đơn sẽ được chuyển sang "Giao thất bại" và hệ thống xử lý hoàn tiền.
            </p>
            <div className="flex gap-2">
              <button onClick={() => setIncidentOrderId(null)} className="flex-1 border-2 border-foreground py-2.5 hover:bg-secondary transition-colors" style={{ fontFamily: 'var(--font-mono)', fontSize: '12px' }}>HỦY</button>
              <button onClick={handleIncident} className="flex-1 bg-accent text-background py-2.5 hover:opacity-90" style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', fontWeight: 700 }}>XÁC NHẬN</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Report modal ── */}
      {reportReviewId && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-background border-2 border-foreground w-full max-w-sm">
            <div className="px-5 py-4 border-b-2 border-foreground">
              <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '22px' }}>Báo cáo đánh giá</h3>
            </div>
            <div className="p-5 space-y-2">
              {REPORT_REASONS.map(r => (
                <button key={r} onClick={() => setReportReason(r)}
                  className={`w-full text-left px-3 py-2.5 border-2 transition-colors ${reportReason === r ? 'bg-foreground text-background border-foreground' : 'border-border hover:bg-secondary'}`}
                  style={{ fontFamily: 'var(--font-body)', fontSize: '13px' }}
                >{r}</button>
              ))}
            </div>
            <div className="flex border-t-2 border-foreground">
              <button onClick={() => { setReportReviewId(null); setReportReason(''); }} className="flex-1 py-3 hover:bg-secondary border-r-2 border-foreground" style={{ fontFamily: 'var(--font-mono)', fontSize: '12px' }}>THOÁT</button>
              <button onClick={handleReportSubmit} disabled={!reportReason} className="flex-1 py-3 bg-foreground text-background hover:bg-accent transition-colors disabled:opacity-40" style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', fontWeight: 700 }}>GỬI BÁO CÁO</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
