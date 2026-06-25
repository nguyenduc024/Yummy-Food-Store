import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router';
import {
  ChevronLeft, ChefHat, ClipboardList, TrendingUp, Star,
  CheckCircle, XCircle, Clock, Package, Truck,
  Plus, Pencil, Trash2, Eye, EyeOff, Flag,
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from './AuthContext';
import type { Order, OrderStatus, Review, MenuItemData } from '../data/authTypes';
import {
  getOrdersByRestaurant, updateOrderStatus, getReviewsByRestaurant,
  reportReview, getRestaurantMenu, addMenuItem, updateMenuItem, deleteMenuItem,
  seedRestaurantData, getUserOnlineStatus, setUserOnlineStatus,
  getOrderStatusLabel, formatPrice, formatDate, formatTimeAgo,
} from '../services/orderStorage';

type Tab = 'orders' | 'menu' | 'revenue' | 'reviews';
type OrderSub = 'new' | 'active' | 'history';
type RevPeriod = 'today' | 'week' | 'month';

const CANCEL_REASONS = ['Hết nguyên liệu', 'Quán đóng cửa đột xuất', 'Quá tải đơn hàng', 'Lỗi kỹ thuật'];
const REPORT_REASONS = ['Ngôn từ thô tục', 'Thông tin sai lệch', 'Nội dung xúc phạm', 'Spam'];

const STATUS_STYLE: Record<OrderStatus, string> = {
  pending: 'text-accent border-accent',
  confirmed: 'text-blue-700 border-blue-700',
  finding_driver: 'text-orange-600 border-orange-600',
  waiting_pickup: 'text-purple-700 border-purple-700',
  delivering: 'text-blue-600 border-blue-600',
  completed: 'text-green-700 border-green-700',
  cancelled_restaurant: 'text-destructive border-destructive',
  cancelled_customer: 'text-destructive border-destructive',
  cancelled_failed: 'text-destructive border-destructive',
};

function StarRow({ stars }: { stars: number }) {
  return (
    <span className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(s => (
        <Star key={s} size={12} fill={s <= stars ? 'currentColor' : 'none'} className={s <= stars ? 'text-accent' : 'text-muted-foreground'} />
      ))}
    </span>
  );
}

function getDailyRevenue(orders: Order[], days: number) {
  const result: { label: string; total: number }[] = [];
  const now = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const start = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
    const end = start + 86400000;
    const label = d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
    const total = orders.filter(o => o.status === 'completed').filter(o => {
      const t = new Date(o.createdAt).getTime();
      return t >= start && t < end;
    }).reduce((s, o) => s + o.total, 0);
    result.push({ label, total });
  }
  return result;
}

export function RestaurantDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [tab, setTab] = useState<Tab>('orders');
  const [orderSub, setOrderSub] = useState<OrderSub>('new');
  const [revPeriod, setRevPeriod] = useState<RevPeriod>('week');
  const [isOnline, setIsOnline] = useState(true);

  const [orders, setOrders] = useState<Order[]>([]);
  const [menu, setMenu] = useState<MenuItemData[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);

  // Cancel order flow
  const [cancelOrderId, setCancelOrderId] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState('');

  // Report review flow
  const [reportReviewId, setReportReviewId] = useState<string | null>(null);
  const [reportReason, setReportReason] = useState('');

  // Menu edit
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [menuForm, setMenuForm] = useState({ name: '', price: '', description: '', category: '' });

  // Review filter
  const [reviewStarFilter, setReviewStarFilter] = useState(0);

  const load = useCallback(() => {
    if (!user) return;
    setOrders(getOrdersByRestaurant(user.id));
    setMenu(getRestaurantMenu(user.id));
    setReviews(getReviewsByRestaurant(user.id));
    setIsOnline(getUserOnlineStatus(user.id));
  }, [user]);

  useEffect(() => {
    if (!user) return;
    if (user.role !== 'restaurant') { navigate('/'); return; }
    seedRestaurantData(user.id);
    load();
  }, [user, navigate, load]);

  if (!user || user.role !== 'restaurant') return null;

  const restaurantName = user.restaurantProfile?.restaurantName || user.name;

  // Stats
  const pendingCount = orders.filter(o => o.status === 'pending').length;
  const activeOrders = orders.filter(o => ['confirmed', 'finding_driver', 'waiting_pickup', 'delivering'].includes(o.status));
  const todayRevenue = orders.filter(o => o.status === 'completed').filter(o => {
    const t = new Date(o.createdAt).getTime();
    const today = new Date(); today.setHours(0, 0, 0, 0);
    return t >= today.getTime();
  }).reduce((s, o) => s + o.total, 0);

  // Toggle online
  const handleToggleOnline = () => {
    const next = !isOnline;
    if (!next && activeOrders.length > 0) {
      toast.error(`Bạn đang có ${activeOrders.length} đơn chưa xử lý. Hãy hoàn tất trước khi tạm ngừng.`);
      return;
    }
    setUserOnlineStatus(user.id, next);
    setIsOnline(next);
    toast.success(next ? 'Đã bật nhận đơn' : 'Đã tạm ngừng nhận đơn');
  };

  // Confirm order
  const handleConfirm = (orderId: string) => {
    updateOrderStatus(orderId, 'confirmed');
    toast.success('Đã xác nhận đơn hàng');
    load();
  };

  // Cancel order
  const handleCancelSubmit = () => {
    if (!cancelOrderId || !cancelReason) return;
    updateOrderStatus(cancelOrderId, 'cancelled_restaurant', { cancelReason });
    toast.success('Đã hủy đơn hàng');
    setCancelOrderId(null);
    setCancelReason('');
    load();
  };

  // Mark ready for pickup
  const handleReadyPickup = (orderId: string) => {
    updateOrderStatus(orderId, 'waiting_pickup');
    toast.success('Đã đánh dấu sẵn sàng giao');
    load();
  };

  // Report review
  const handleReportSubmit = () => {
    if (!reportReviewId || !reportReason) return;
    reportReview(reportReviewId, user.id, reportReason);
    toast.success('Đã gửi báo cáo đến quản trị viên');
    setReportReviewId(null);
    setReportReason('');
  };

  // Menu actions
  const handleAddItem = () => {
    const price = parseInt(menuForm.price.replace(/\D/g, ''));
    if (!menuForm.name.trim()) { toast.error('Vui lòng nhập tên món'); return; }
    if (!price || price <= 0) { toast.error('Vui lòng nhập giá hợp lệ'); return; }
    if (!menuForm.category.trim()) { toast.error('Vui lòng nhập danh mục'); return; }
    addMenuItem({ restaurantId: user.id, name: menuForm.name.trim(), price, description: menuForm.description.trim(), category: menuForm.category.trim(), isAvailable: true, isHidden: false });
    toast.success('Đã thêm món mới');
    setMenuForm({ name: '', price: '', description: '', category: '' });
    setShowAddForm(false);
    load();
  };

  const handleEditItem = () => {
    if (!editingItemId) return;
    const price = parseInt(menuForm.price.replace(/\D/g, ''));
    if (!menuForm.name.trim()) { toast.error('Vui lòng nhập tên món'); return; }
    if (!price || price <= 0) { toast.error('Giá không hợp lệ'); return; }
    updateMenuItem(editingItemId, { name: menuForm.name.trim(), price, description: menuForm.description.trim(), category: menuForm.category.trim() });
    toast.success('Đã cập nhật món ăn');
    setEditingItemId(null);
    setMenuForm({ name: '', price: '', description: '', category: '' });
    load();
  };

  const startEdit = (item: MenuItemData) => {
    setEditingItemId(item.id);
    setShowAddForm(false);
    setMenuForm({ name: item.name, price: item.price.toString(), description: item.description, category: item.category });
  };

  const handleDeleteItem = (id: string, name: string) => {
    deleteMenuItem(id);
    toast.success(`Đã xóa "${name}"`);
    load();
  };

  const handleToggleAvail = (item: MenuItemData) => {
    updateMenuItem(item.id, { isAvailable: !item.isAvailable });
    toast.success(item.isAvailable ? 'Đã tạm ẩn món khỏi menu' : 'Đã hiển thị lại món');
    load();
  };

  // Revenue data
  const revDays = revPeriod === 'today' ? 1 : revPeriod === 'week' ? 7 : 30;
  const revData = getDailyRevenue(orders, revDays);
  const totalRevenue = orders.filter(o => {
    if (o.status !== 'completed') return false;
    const now = new Date();
    const start = new Date(now);
    if (revPeriod === 'today') start.setHours(0, 0, 0, 0);
    else if (revPeriod === 'week') { start.setDate(start.getDate() - 6); start.setHours(0, 0, 0, 0); }
    else { start.setDate(start.getDate() - 29); start.setHours(0, 0, 0, 0); }
    return new Date(o.createdAt).getTime() >= start.getTime();
  }).reduce((s, o) => s + o.total, 0);

  const completedInPeriod = orders.filter(o => {
    if (o.status !== 'completed') return false;
    const now = new Date();
    const start = new Date(now);
    if (revPeriod === 'today') start.setHours(0, 0, 0, 0);
    else if (revPeriod === 'week') { start.setDate(start.getDate() - 6); start.setHours(0, 0, 0, 0); }
    else { start.setDate(start.getDate() - 29); start.setHours(0, 0, 0, 0); }
    return new Date(o.createdAt).getTime() >= start.getTime();
  });

  const cancelledInPeriod = orders.filter(o => {
    if (!['cancelled_restaurant', 'cancelled_customer', 'cancelled_failed'].includes(o.status)) return false;
    const now = new Date();
    const start = new Date(now);
    if (revPeriod === 'today') start.setHours(0, 0, 0, 0);
    else if (revPeriod === 'week') { start.setDate(start.getDate() - 6); start.setHours(0, 0, 0, 0); }
    else { start.setDate(start.getDate() - 29); start.setHours(0, 0, 0, 0); }
    return new Date(o.createdAt).getTime() >= start.getTime();
  });

  const maxRevBar = Math.max(...revData.map(d => d.total), 1);

  // Top dishes
  const dishCounts: Record<string, { name: string; count: number; revenue: number }> = {};
  orders.filter(o => o.status === 'completed').forEach(o => {
    o.items.forEach(item => {
      if (!dishCounts[item.dishName]) dishCounts[item.dishName] = { name: item.dishName, count: 0, revenue: 0 };
      dishCounts[item.dishName].count += item.quantity;
      dishCounts[item.dishName].revenue += item.price * item.quantity;
    });
  });
  const topDishes = Object.values(dishCounts).sort((a, b) => b.count - a.count).slice(0, 5);

  const filteredReviews = reviewStarFilter > 0 ? reviews.filter(r => r.stars === reviewStarFilter) : reviews;
  const avgStars = reviews.length > 0 ? (reviews.reduce((s, r) => s + r.stars, 0) / reviews.length).toFixed(1) : '—';

  const newOrders = orders.filter(o => o.status === 'pending');
  const historyOrders = orders.filter(o => ['completed', 'cancelled_restaurant', 'cancelled_customer', 'cancelled_failed'].includes(o.status));

  const TABS: { key: Tab; label: string }[] = [
    { key: 'orders', label: `ĐƠN HÀNG${pendingCount > 0 ? ` (${pendingCount})` : ''}` },
    { key: 'menu', label: 'THỰC ĐƠN' },
    { key: 'revenue', label: 'BÁO CÁO' },
    { key: 'reviews', label: 'ĐÁNH GIÁ' },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 pb-16">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
          style={{ fontFamily: 'var(--font-mono)', fontSize: '12px' }}
        >
          <ChevronLeft size={14} /> VỀ TRANG CHỦ
        </button>

        <button
          onClick={handleToggleOnline}
          className={`flex items-center gap-2 border-2 px-4 py-2 transition-all ${isOnline ? 'bg-foreground text-background border-foreground' : 'border-foreground hover:bg-secondary'}`}
          style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', fontWeight: 700 }}
        >
          <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-400' : 'bg-muted-foreground'}`} />
          {isOnline ? 'ĐANG NHẬN ĐƠN' : 'TẠM NGỪNG'}
        </button>
      </div>

      {/* Hero */}
      <div className="border-2 border-foreground p-5 mb-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 border-2 border-foreground flex items-center justify-center shrink-0">
            <ChefHat size={22} />
          </div>
          <div className="flex-1">
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', letterSpacing: '0.1em', color: 'var(--muted-foreground)', marginBottom: '2px' }}>
              ─── DASHBOARD NHÀ HÀNG
            </p>
            <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '28px', lineHeight: 1 }}>
              {restaurantName}
            </h1>
          </div>
        </div>
        <div className="flex gap-6 mt-4 pt-4 border-t border-dashed border-border">
          <div>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--muted-foreground)' }}>ĐƠN MỚI</p>
            <p className="text-accent" style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '24px' }}>{pendingCount}</p>
          </div>
          <div>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--muted-foreground)' }}>ĐANG XỬ LÝ</p>
            <p style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '24px' }}>{activeOrders.length}</p>
          </div>
          <div>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--muted-foreground)' }}>DOANH THU HÔM NAY</p>
            <p className="text-green-700" style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '18px' }}>{formatPrice(todayRevenue)}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-2 border-foreground mb-6">
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

        {/* ── ĐƠN HÀNG ── */}
        {tab === 'orders' && (
          <div>
            <div className="flex border-b border-border">
              {(['new', 'active', 'history'] as OrderSub[]).map((s, i) => {
                const labels = [`Đơn Mới${newOrders.length > 0 ? ` (${newOrders.length})` : ''}`, `Đang Thực Hiện${activeOrders.length > 0 ? ` (${activeOrders.length})` : ''}`, 'Lịch Sử'];
                return (
                  <button
                    key={s}
                    onClick={() => setOrderSub(s)}
                    className={`px-4 py-2.5 border-r border-border last:border-0 text-sm transition-colors ${orderSub === s ? 'bg-secondary font-bold' : 'text-muted-foreground hover:text-foreground'}`}
                    style={{ fontFamily: 'var(--font-mono)', fontSize: '11px' }}
                  >
                    {labels[i]}
                  </button>
                );
              })}
            </div>

            <div className="divide-y divide-border">
              {/* Đơn mới */}
              {orderSub === 'new' && (
                newOrders.length === 0
                  ? <div className="p-8 text-center text-muted-foreground" style={{ fontFamily: 'var(--font-mono)', fontSize: '12px' }}>Không có đơn mới</div>
                  : newOrders.map(order => (
                    <OrderCard
                      key={order.id}
                      order={order}
                      actions={
                        <div className="flex gap-2 mt-3">
                          <button
                            onClick={() => handleConfirm(order.id)}
                            className="flex items-center gap-1.5 bg-foreground text-background px-4 py-2 hover:bg-green-800 transition-colors"
                            style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: 700 }}
                          >
                            <CheckCircle size={13} /> XÁC NHẬN
                          </button>
                          <button
                            onClick={() => setCancelOrderId(order.id)}
                            className="flex items-center gap-1.5 border-2 border-foreground px-4 py-2 hover:bg-secondary transition-colors"
                            style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: 700 }}
                          >
                            <XCircle size={13} /> HỦY ĐƠN
                          </button>
                        </div>
                      }
                    />
                  ))
              )}

              {/* Đang thực hiện */}
              {orderSub === 'active' && (
                activeOrders.length === 0
                  ? <div className="p-8 text-center text-muted-foreground" style={{ fontFamily: 'var(--font-mono)', fontSize: '12px' }}>Không có đơn đang xử lý</div>
                  : activeOrders.map(order => (
                    <OrderCard
                      key={order.id}
                      order={order}
                      actions={
                        order.status === 'confirmed' ? (
                          <button
                            onClick={() => handleReadyPickup(order.id)}
                            className="mt-3 flex items-center gap-1.5 bg-foreground text-background px-4 py-2 hover:bg-accent transition-colors"
                            style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: 700 }}
                          >
                            <Package size={13} /> SẴN SÀNG GIAO
                          </button>
                        ) : order.status === 'delivering' && order.shipperName ? (
                          <p className="mt-3 flex items-center gap-1.5" style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--muted-foreground)' }}>
                            <Truck size={13} /> Tài xế: {order.shipperName}
                          </p>
                        ) : null
                      }
                    />
                  ))
              )}

              {/* Lịch sử */}
              {orderSub === 'history' && (
                historyOrders.length === 0
                  ? <div className="p-8 text-center text-muted-foreground" style={{ fontFamily: 'var(--font-mono)', fontSize: '12px' }}>Chưa có lịch sử</div>
                  : historyOrders.map(order => <OrderCard key={order.id} order={order} />)
              )}
            </div>
          </div>
        )}

        {/* ── THỰC ĐƠN ── */}
        {tab === 'menu' && (
          <div className="p-5">
            <div className="flex items-center justify-between mb-4">
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--muted-foreground)' }}>
                {menu.length} MÓN ĂN
              </p>
              <button
                onClick={() => { setShowAddForm(!showAddForm); setEditingItemId(null); setMenuForm({ name: '', price: '', description: '', category: '' }); }}
                className="flex items-center gap-1.5 border-2 border-foreground px-3 py-1.5 hover:bg-foreground hover:text-background transition-all"
                style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: 700 }}
              >
                <Plus size={13} /> THÊM MÓN
              </button>
            </div>

            {/* Add form */}
            {showAddForm && (
              <MenuForm
                form={menuForm}
                onChange={f => setMenuForm(f)}
                onSubmit={handleAddItem}
                onCancel={() => setShowAddForm(false)}
                submitLabel="THÊM MÓN"
              />
            )}

            <div className="space-y-2">
              {menu.map(item => (
                <div key={item.id}>
                  <div className="border border-border p-3 flex items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: '14px' }}>{item.name}</span>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--muted-foreground)', border: '1px solid var(--border)', padding: '0 4px' }}>
                          {item.category}
                        </span>
                        {!item.isAvailable && (
                          <span className="text-accent" style={{ fontFamily: 'var(--font-mono)', fontSize: '10px' }}>TẠM ẨN</span>
                        )}
                      </div>
                      <p className="text-accent mt-0.5" style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', fontWeight: 700 }}>
                        {formatPrice(item.price)}
                      </p>
                      {item.description && (
                        <p className="mt-1 text-muted-foreground" style={{ fontFamily: 'var(--font-body)', fontSize: '12px' }}>{item.description}</p>
                      )}
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <button
                        onClick={() => handleToggleAvail(item)}
                        title={item.isAvailable ? 'Tạm ẩn' : 'Hiện lại'}
                        className="border border-border p-1.5 hover:bg-secondary transition-colors"
                      >
                        {item.isAvailable ? <Eye size={13} /> : <EyeOff size={13} />}
                      </button>
                      <button
                        onClick={() => startEdit(item)}
                        className="border border-border p-1.5 hover:bg-secondary transition-colors"
                      >
                        <Pencil size={13} />
                      </button>
                      <button
                        onClick={() => handleDeleteItem(item.id, item.name)}
                        className="border border-accent p-1.5 hover:bg-accent hover:text-background transition-colors"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                  {/* Edit form inline */}
                  {editingItemId === item.id && (
                    <MenuForm
                      form={menuForm}
                      onChange={f => setMenuForm(f)}
                      onSubmit={handleEditItem}
                      onCancel={() => setEditingItemId(null)}
                      submitLabel="LƯU THAY ĐỔI"
                    />
                  )}
                </div>
              ))}
              {menu.length === 0 && (
                <div className="py-10 text-center text-muted-foreground" style={{ fontFamily: 'var(--font-mono)', fontSize: '12px' }}>
                  Thực đơn trống. Thêm món đầu tiên.
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── BÁO CÁO ── */}
        {tab === 'revenue' && (
          <div className="p-5">
            {/* Period filter */}
            <div className="flex gap-2 mb-5">
              {([['today', 'HÔM NAY'], ['week', '7 NGÀY'], ['month', '30 NGÀY']] as [RevPeriod, string][]).map(([p, label]) => (
                <button
                  key={p}
                  onClick={() => setRevPeriod(p)}
                  className={`px-3 py-1.5 border-2 transition-colors ${revPeriod === p ? 'bg-foreground text-background border-foreground' : 'border-foreground hover:bg-secondary'}`}
                  style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', fontWeight: 700 }}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 mb-5">
              {[
                { label: 'DOANH THU', value: formatPrice(totalRevenue), color: 'text-green-700' },
                { label: 'ĐƠN HOÀN THÀNH', value: String(completedInPeriod.length), color: '' },
                { label: 'ĐƠN HỦY', value: String(cancelledInPeriod.length), color: 'text-accent' },
              ].map(({ label, value, color }) => (
                <div key={label} className="border-2 border-foreground p-4 text-center">
                  <p style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--muted-foreground)', letterSpacing: '0.08em', marginBottom: '4px' }}>{label}</p>
                  <p className={color} style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '18px' }}>{value}</p>
                </div>
              ))}
            </div>

            {/* Bar chart */}
            {revPeriod !== 'today' && (
              <div className="mb-5">
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--muted-foreground)', letterSpacing: '0.08em', marginBottom: '12px' }}>
                  BIỂU ĐỒ DOANH THU (đ)
                </p>
                <div className="flex items-end gap-1 h-28 border-b-2 border-l-2 border-foreground pl-1 pb-0">
                  {revData.map((d, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center justify-end gap-1">
                      <div
                        className="w-full bg-foreground transition-all"
                        style={{ height: `${Math.max((d.total / maxRevBar) * 88, d.total > 0 ? 4 : 0)}px` }}
                        title={`${d.label}: ${formatPrice(d.total)}`}
                      />
                    </div>
                  ))}
                </div>
                <div className="flex gap-1 mt-1">
                  {revData.map((d, i) => (
                    <div key={i} className="flex-1 text-center" style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--muted-foreground)' }}>
                      {revData.length <= 7 ? d.label : (i % 5 === 0 ? d.label : '')}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Top dishes */}
            <div>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--muted-foreground)', letterSpacing: '0.08em', marginBottom: '10px' }}>
                TOP MÓN BÁN CHẠY
              </p>
              {topDishes.length === 0 ? (
                <p className="text-muted-foreground" style={{ fontFamily: 'var(--font-mono)', fontSize: '12px' }}>Chưa có dữ liệu</p>
              ) : (
                <div className="space-y-2">
                  {topDishes.map((dish, i) => (
                    <div key={dish.name} className="flex items-center gap-3 border-b border-dashed border-border pb-2 last:border-0">
                      <span className="text-muted-foreground w-4 text-right" style={{ fontFamily: 'var(--font-mono)', fontSize: '11px' }}>#{i + 1}</span>
                      <span className="flex-1" style={{ fontFamily: 'var(--font-body)', fontSize: '13px' }}>{dish.name}</span>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px' }}>{dish.count} phần</span>
                      <span className="text-green-700" style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: 700 }}>{formatPrice(dish.revenue)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── ĐÁNH GIÁ ── */}
        {tab === 'reviews' && (
          <div className="p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '28px' }}>{avgStars}</span>
                <div>
                  <StarRow stars={Math.round(parseFloat(avgStars) || 0)} />
                  <p style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--muted-foreground)', marginTop: '2px' }}>
                    {reviews.length} đánh giá
                  </p>
                </div>
              </div>
              <div className="flex gap-1">
                {[0, 5, 4, 3, 2, 1].map(s => (
                  <button
                    key={s}
                    onClick={() => setReviewStarFilter(s)}
                    className={`px-2 py-1 border transition-colors ${reviewStarFilter === s ? 'bg-foreground text-background border-foreground' : 'border-border hover:bg-secondary'}`}
                    style={{ fontFamily: 'var(--font-mono)', fontSize: '10px' }}
                  >
                    {s === 0 ? 'TẤT CẢ' : `${s}★`}
                  </button>
                ))}
              </div>
            </div>

            <div className="divide-y divide-border">
              {filteredReviews.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground" style={{ fontFamily: 'var(--font-mono)', fontSize: '12px' }}>
                  Chưa có đánh giá
                </div>
              ) : filteredReviews.map(review => (
                <div key={review.id} className="py-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: '13px' }}>{review.customerName}</span>
                        <StarRow stars={review.stars} />
                        {review.isHidden && (
                          <span className="text-accent border border-accent px-1" style={{ fontFamily: 'var(--font-mono)', fontSize: '9px' }}>ĐÃ ẨN</span>
                        )}
                      </div>
                      <p style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: review.isHidden ? 'var(--muted-foreground)' : undefined }}>
                        {review.isHidden ? `[Ẩn: ${review.hiddenReason}]` : review.content}
                      </p>
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

      {/* ── Cancel modal ── */}
      {cancelOrderId && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-background border-2 border-foreground w-full max-w-sm">
            <div className="px-5 py-4 border-b-2 border-foreground">
              <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '22px' }}>Lý do hủy đơn</h3>
            </div>
            <div className="p-5 space-y-2">
              {CANCEL_REASONS.map(r => (
                <button
                  key={r}
                  onClick={() => setCancelReason(r)}
                  className={`w-full text-left px-3 py-2.5 border-2 transition-colors ${cancelReason === r ? 'bg-foreground text-background border-foreground' : 'border-border hover:bg-secondary'}`}
                  style={{ fontFamily: 'var(--font-body)', fontSize: '13px' }}
                >
                  {r}
                </button>
              ))}
            </div>
            <div className="flex border-t-2 border-foreground">
              <button
                onClick={() => { setCancelOrderId(null); setCancelReason(''); }}
                className="flex-1 py-3 hover:bg-secondary transition-colors border-r-2 border-foreground"
                style={{ fontFamily: 'var(--font-mono)', fontSize: '12px' }}
              >
                THOÁT
              </button>
              <button
                onClick={handleCancelSubmit}
                disabled={!cancelReason}
                className="flex-1 py-3 bg-accent text-background hover:opacity-90 transition-opacity disabled:opacity-40"
                style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', fontWeight: 700 }}
              >
                XÁC NHẬN HỦY
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Report review modal ── */}
      {reportReviewId && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-background border-2 border-foreground w-full max-w-sm">
            <div className="px-5 py-4 border-b-2 border-foreground">
              <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '22px' }}>Báo cáo đánh giá</h3>
            </div>
            <div className="p-5 space-y-2">
              {REPORT_REASONS.map(r => (
                <button
                  key={r}
                  onClick={() => setReportReason(r)}
                  className={`w-full text-left px-3 py-2.5 border-2 transition-colors ${reportReason === r ? 'bg-foreground text-background border-foreground' : 'border-border hover:bg-secondary'}`}
                  style={{ fontFamily: 'var(--font-body)', fontSize: '13px' }}
                >
                  {r}
                </button>
              ))}
            </div>
            <div className="flex border-t-2 border-foreground">
              <button
                onClick={() => { setReportReviewId(null); setReportReason(''); }}
                className="flex-1 py-3 hover:bg-secondary transition-colors border-r-2 border-foreground"
                style={{ fontFamily: 'var(--font-mono)', fontSize: '12px' }}
              >
                THOÁT
              </button>
              <button
                onClick={handleReportSubmit}
                disabled={!reportReason}
                className="flex-1 py-3 bg-foreground text-background hover:bg-accent transition-colors disabled:opacity-40"
                style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', fontWeight: 700 }}
              >
                GỬI BÁO CÁO
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Shared sub-components ─────────────────────────────────────────────────────

function OrderCard({ order, actions }: { order: Order; actions?: React.ReactNode }) {
  const statusStyle = STATUS_STYLE[order.status] || 'text-muted-foreground border-muted-foreground';
  return (
    <div className="p-4">
      <div className="flex items-start justify-between gap-3 mb-2">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: 700 }}>{order.customerName}</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--muted-foreground)' }}>{order.customerPhone}</span>
          </div>
          <p className="text-muted-foreground mt-0.5" style={{ fontFamily: 'var(--font-mono)', fontSize: '10px' }}>
            {formatTimeAgo(order.createdAt)} · {order.address}
          </p>
        </div>
        <span className={`border px-2 py-0.5 shrink-0 ${statusStyle}`} style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', fontWeight: 700 }}>
          {getOrderStatusLabel(order.status)}
        </span>
      </div>

      <div className="space-y-0.5 mb-2">
        {order.items.map((item, i) => (
          <div key={i} className="flex justify-between" style={{ fontFamily: 'var(--font-body)', fontSize: '13px' }}>
            <span>{item.dishName} × {item.quantity}{item.note ? <span className="text-muted-foreground text-xs"> ({item.note})</span> : ''}</span>
            <span style={{ fontFamily: 'var(--font-mono)' }}>{formatPrice(item.price * item.quantity)}</span>
          </div>
        ))}
      </div>

      <div className="flex justify-between border-t border-dashed border-border pt-2">
        <span className="text-muted-foreground" style={{ fontFamily: 'var(--font-mono)', fontSize: '10px' }}>Ship: {formatPrice(order.deliveryFee)}</span>
        <span className="text-accent" style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', fontWeight: 700 }}>Tổng: {formatPrice(order.total)}</span>
      </div>

      {order.cancelReason && (
        <p className="mt-2 text-accent" style={{ fontFamily: 'var(--font-mono)', fontSize: '10px' }}>Lý do hủy: {order.cancelReason}</p>
      )}

      {actions}
    </div>
  );
}

function MenuForm({
  form, onChange, onSubmit, onCancel, submitLabel,
}: {
  form: { name: string; price: string; description: string; category: string };
  onChange: (f: typeof form) => void;
  onSubmit: () => void;
  onCancel: () => void;
  submitLabel: string;
}) {
  return (
    <div className="border-2 border-dashed border-foreground p-4 my-2 space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', letterSpacing: '0.08em', color: 'var(--muted-foreground)', display: 'block', marginBottom: '4px' }}>TÊN MÓN *</label>
          <input
            value={form.name}
            onChange={e => onChange({ ...form, name: e.target.value })}
            className="w-full border-2 border-foreground px-2.5 py-2 bg-secondary outline-none focus:border-accent transition-colors"
            style={{ fontFamily: 'var(--font-body)', fontSize: '13px' }}
            placeholder="Phở Bò Tái..."
          />
        </div>
        <div>
          <label style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', letterSpacing: '0.08em', color: 'var(--muted-foreground)', display: 'block', marginBottom: '4px' }}>GIÁ (VNĐ) *</label>
          <input
            value={form.price}
            onChange={e => onChange({ ...form, price: e.target.value })}
            className="w-full border-2 border-foreground px-2.5 py-2 bg-secondary outline-none focus:border-accent transition-colors"
            style={{ fontFamily: 'var(--font-mono)', fontSize: '13px' }}
            placeholder="65000"
          />
        </div>
      </div>
      <div>
        <label style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', letterSpacing: '0.08em', color: 'var(--muted-foreground)', display: 'block', marginBottom: '4px' }}>DANH MỤC *</label>
        <input
          value={form.category}
          onChange={e => onChange({ ...form, category: e.target.value })}
          className="w-full border-2 border-foreground px-2.5 py-2 bg-secondary outline-none focus:border-accent transition-colors"
          style={{ fontFamily: 'var(--font-body)', fontSize: '13px' }}
          placeholder="Phở Bò, Bún, Nước..."
        />
      </div>
      <div>
        <label style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', letterSpacing: '0.08em', color: 'var(--muted-foreground)', display: 'block', marginBottom: '4px' }}>MÔ TẢ</label>
        <input
          value={form.description}
          onChange={e => onChange({ ...form, description: e.target.value })}
          className="w-full border-2 border-foreground px-2.5 py-2 bg-secondary outline-none focus:border-accent transition-colors"
          style={{ fontFamily: 'var(--font-body)', fontSize: '13px' }}
          placeholder="Mô tả ngắn..."
        />
      </div>
      <div className="flex gap-2 pt-1">
        <button onClick={onSubmit} className="flex-1 bg-foreground text-background py-2 hover:bg-accent transition-colors" style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: 700 }}>
          {submitLabel}
        </button>
        <button onClick={onCancel} className="border-2 border-foreground px-4 py-2 hover:bg-secondary transition-colors" style={{ fontFamily: 'var(--font-mono)', fontSize: '11px' }}>
          HỦY
        </button>
      </div>
    </div>
  );
}
