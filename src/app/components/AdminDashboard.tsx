import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router';
import {
  ChevronLeft, Shield, Users, BarChart2, Ticket, Settings,
  CheckCircle, XCircle, Lock, Unlock, Star, Eye, EyeOff, Trash2,
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from './AuthContext';
import type { User, Review, SupportTicket, SystemConfig } from '../data/authTypes';
import {
  getAllUsers, approveUser, rejectUser, lockUser, unlockUser, getRoleLabel, getStatusLabel,
} from '../services/authStorage';
import { formatDate } from '../services/orderStorage';
import {
  getAllOrders, getAllReviews, getAllTickets, hideReview, unhideReview, deleteReview,
  updateTicket, getSystemConfig, saveSystemConfig,
  formatPrice, formatTimeAgo,
} from '../services/orderStorage';

type Tab = 'accounts' | 'reviews' | 'stats' | 'tickets' | 'config';

function StarRow({ stars }: { stars: number }) {
  return (
    <span className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(s => (
        <Star key={s} size={11} fill={s <= stars ? 'currentColor' : 'none'} className={s <= stars ? 'text-accent' : 'text-muted-foreground'} />
      ))}
    </span>
  );
}

export function AdminDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [tab, setTab] = useState<Tab>('accounts');
  const [users, setUsers] = useState<User[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [config, setConfig] = useState<SystemConfig>(getSystemConfig());
  const [configForm, setConfigForm] = useState({ serviceFeePercent: '', deliveryFeePerKm: '', discountPercent: '' });
  const [configEditing, setConfigEditing] = useState(false);

  // Account tab state
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState<User['role'] | 'all'>('all');
  const [expandedUserId, setExpandedUserId] = useState<string | null>(null);
  const [lockModalUserId, setLockModalUserId] = useState<string | null>(null);
  const [lockReason, setLockReason] = useState('');
  const [rejectModalUserId, setRejectModalUserId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  // Review tab state
  const [reviewFilter, setReviewFilter] = useState<'all' | 'reported' | 'hidden'>('all');
  const [hideReviewId, setHideReviewId] = useState<string | null>(null);
  const [hideReason, setHideReason] = useState('');
  const [deleteReviewConfirmId, setDeleteReviewConfirmId] = useState<string | null>(null);

  // Ticket tab state
  const [ticketDetail, setTicketDetail] = useState<string | null>(null);
  const [ticketResolution, setTicketResolution] = useState('');

  const load = useCallback(() => {
    setUsers(getAllUsers());
    setReviews(getAllReviews());
    setTickets(getAllTickets());
    const c = getSystemConfig();
    setConfig(c);
    setConfigForm({
      serviceFeePercent: c.serviceFeePercent.toString(),
      deliveryFeePerKm: c.deliveryFeePerKm.toString(),
      discountPercent: c.discountPercent.toString(),
    });
  }, []);

  useEffect(() => {
    if (!user) return;
    if (user.role !== 'admin') { navigate('/'); return; }
    load();
  }, [user, navigate, load]);

  if (!user || user.role !== 'admin') return null;

  // Stats
  const allOrders = getAllOrders();
  const completedOrders = allOrders.filter(o => o.status === 'completed');
  const cancelledOrders = allOrders.filter(o => ['cancelled_restaurant', 'cancelled_customer', 'cancelled_failed'].includes(o.status));
  const totalRevenue = completedOrders.reduce((s, o) => s + o.total, 0);
  const pendingUsers = users.filter(u => u.role !== 'customer' && u.role !== 'admin' && u.profileStatus === 'pending');

  // Account filter
  const filteredUsers = users.filter(u => u.role !== 'admin').filter(u => {
    if (userRoleFilter !== 'all' && u.role !== userRoleFilter) return false;
    if (!userSearch.trim()) return true;
    const q = userSearch.toLowerCase();
    return u.name.toLowerCase().includes(q) || u.phone.includes(q);
  });

  // Review filter
  const filteredReviews = reviews.filter(r => {
    if (reviewFilter === 'reported') return (r.reportedBy?.length ?? 0) > 0;
    if (reviewFilter === 'hidden') return r.isHidden;
    return true;
  });

  const handleApprove = (userId: string) => {
    approveUser(userId);
    toast.success('Đã duyệt tài khoản');
    load();
  };
  const handleReject = (userId: string) => {
    setRejectModalUserId(userId);
    setRejectReason('');
  };

  const handleConfirmReject = () => {
    if (!rejectModalUserId || !rejectReason.trim()) return;
    rejectUser(rejectModalUserId, rejectReason.trim());
    toast.success('Đã từ chối tài khoản');
    setRejectModalUserId(null);
    setRejectReason('');
    load();
  };
  const handleUnlock = (userId: string) => {
    unlockUser(userId);
    toast.success('Đã mở khóa tài khoản');
    load();
  };

  const handleConfirmLock = () => {
    if (!lockModalUserId || !lockReason.trim()) return;
    lockUser(lockModalUserId, lockReason.trim(), user.name);
    toast.success('Đã khóa tài khoản');
    setLockModalUserId(null);
    setLockReason('');
    load();
  };

  const handleHideReview = () => {
    if (!hideReviewId || !hideReason.trim()) return;
    hideReview(hideReviewId, hideReason.trim());
    toast.success('Đã ẩn đánh giá');
    setHideReviewId(null);
    setHideReason('');
    load();
  };
  const handleUnhide = (id: string) => {
    unhideReview(id);
    toast.success('Đã hiện lại đánh giá');
    load();
  };
  const handleDeleteReview = (id: string) => {
    deleteReview(id);
    toast.success('Đã xóa vĩnh viễn');
    setDeleteReviewConfirmId(null);
    load();
  };

  const handleResolveTicket = (ticketId: string) => {
    updateTicket(ticketId, { status: 'resolved', resolution: ticketResolution.trim() || 'Đã xử lý bởi quản trị viên' });
    toast.success('Đã đóng ticket hỗ trợ');
    setTicketDetail(null);
    setTicketResolution('');
    load();
  };
  const handleProcessTicket = (ticketId: string) => {
    updateTicket(ticketId, { status: 'in_progress' });
    toast.success('Ticket chuyển sang Đang xử lý');
    load();
  };

  const handleSaveConfig = () => {
    const s = parseFloat(configForm.serviceFeePercent);
    const d = parseFloat(configForm.deliveryFeePerKm);
    const dc = parseFloat(configForm.discountPercent);
    if (isNaN(s) || s < 0 || s > 50) { toast.error('Phí dịch vụ phải từ 0–50%'); return; }
    if (isNaN(d) || d < 0) { toast.error('Phí giao hàng phải ≥ 0'); return; }
    if (isNaN(dc) || dc < 0 || dc > 100) { toast.error('Chiết khấu phải từ 0–100%'); return; }
    const newConfig: SystemConfig = { serviceFeePercent: s, deliveryFeePerKm: d, discountPercent: dc, updatedAt: new Date().toISOString(), updatedBy: user.name };
    saveSystemConfig(newConfig);
    setConfig(newConfig);
    setConfigEditing(false);
    toast.success('Đã lưu cấu hình hệ thống');
    load();
  };

  const TABS: { key: Tab; label: string; icon: React.ElementType }[] = [
    { key: 'accounts', label: `TÀI KHOẢN${pendingUsers.length > 0 ? ` (${pendingUsers.length})` : ''}`, icon: Users },
    { key: 'reviews', label: 'ĐÁNH GIÁ', icon: Star },
    { key: 'stats', label: 'THỐNG KÊ', icon: BarChart2 },
    { key: 'tickets', label: `SỰ CỐ${tickets.filter(t => t.status === 'open').length > 0 ? ` (${tickets.filter(t => t.status === 'open').length})` : ''}`, icon: Ticket },
    { key: 'config', label: 'CẤU HÌNH', icon: Settings },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 pb-16">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate('/')} className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors" style={{ fontFamily: 'var(--font-mono)', fontSize: '12px' }}>
          <ChevronLeft size={14} /> VỀ TRANG CHỦ
        </button>
      </div>

      {/* Hero */}
      <div className="border-2 border-foreground p-5 mb-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 border-2 border-foreground flex items-center justify-center shrink-0">
            <Shield size={22} />
          </div>
          <div className="flex-1">
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', letterSpacing: '0.1em', color: 'var(--muted-foreground)', marginBottom: '2px' }}>
              ─── ADMIN PANEL
            </p>
            <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '28px', lineHeight: 1 }}>
              Quản Trị Hệ Thống
            </h1>
          </div>
        </div>
        <div className="flex gap-6 mt-4 pt-4 border-t border-dashed border-border flex-wrap">
          {[
            { label: 'TỔNG TÀI KHOẢN', value: users.filter(u => u.role !== 'admin').length.toString() },
            { label: 'CHỜ DUYỆT', value: pendingUsers.length.toString(), color: pendingUsers.length > 0 ? 'text-accent' : '' },
            { label: 'ĐƠN HOÀN THÀNH', value: completedOrders.length.toString() },
            { label: 'DOANH THU', value: formatPrice(totalRevenue), color: 'text-green-700' },
            { label: 'ĐÁNH GIÁ BỊ BÁO', value: reviews.filter(r => (r.reportedBy?.length ?? 0) > 0).length.toString(), color: 'text-accent' },
          ].map(({ label, value, color }) => (
            <div key={label}>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--muted-foreground)' }}>{label}</p>
              <p className={color} style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '18px' }}>{value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="border-2 border-foreground">
        <div className="flex border-b-2 border-foreground overflow-x-auto">
          {TABS.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-1.5 px-4 py-3 border-r border-foreground last:border-0 whitespace-nowrap transition-colors ${tab === t.key ? 'bg-foreground text-background' : 'hover:bg-secondary'}`}
              style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: 700 }}
            >
              <t.icon size={13} />
              {t.label}
            </button>
          ))}
        </div>

        {/* ── TÀI KHOẢN ── */}
        {tab === 'accounts' && (
          <div className="p-5">
            {/* Search + filter */}
            <div className="flex gap-2 mb-4 flex-wrap">
              <input
                value={userSearch}
                onChange={e => setUserSearch(e.target.value)}
                placeholder="Tìm theo tên, SĐT..."
                className="flex-1 min-w-48 border-2 border-foreground px-3 py-2 bg-secondary outline-none focus:border-accent transition-colors"
                style={{ fontFamily: 'var(--font-body)', fontSize: '13px' }}
              />
              {(['all', 'customer', 'restaurant', 'shipper'] as const).map(r => (
                <button
                  key={r}
                  onClick={() => setUserRoleFilter(r)}
                  className={`px-3 py-2 border-2 transition-colors ${userRoleFilter === r ? 'bg-foreground text-background border-foreground' : 'border-foreground hover:bg-secondary'}`}
                  style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', fontWeight: 700 }}
                >
                  {r === 'all' ? 'TẤT CẢ' : getRoleLabel(r).toUpperCase()}
                </button>
              ))}
            </div>

            <div className="divide-y divide-border">
              {filteredUsers.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground" style={{ fontFamily: 'var(--font-mono)', fontSize: '12px' }}>Không tìm thấy tài khoản</div>
              ) : filteredUsers.map(u => (
                <div key={u.id}>
                  <div className="py-3 flex items-center gap-3">
                    <button
                      onClick={() => setExpandedUserId(expandedUserId === u.id ? null : u.id)}
                      className="flex-1 text-left min-w-0"
                    >
                      <div className="flex items-center gap-2 flex-wrap">
                        <span style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: '14px' }}>{u.name}</span>
                        <span className="text-muted-foreground" style={{ fontFamily: 'var(--font-mono)', fontSize: '11px' }}>{u.phone}</span>
                        <span className="border border-border px-1.5" style={{ fontFamily: 'var(--font-mono)', fontSize: '10px' }}>{getRoleLabel(u.role)}</span>
                        <span className={`px-1.5 ${u.isLocked ? 'text-accent border border-accent' : u.profileStatus === 'active' ? 'text-green-700 border border-green-700' : u.profileStatus === 'pending' ? 'text-accent border border-accent' : 'text-destructive border border-destructive'}`} style={{ fontFamily: 'var(--font-mono)', fontSize: '10px' }}>
                          {u.isLocked ? 'BỊ KHÓA' : getStatusLabel(u.profileStatus)}
                        </span>
                      </div>
                      <p className="text-muted-foreground mt-0.5" style={{ fontFamily: 'var(--font-mono)', fontSize: '10px' }}>
                        Tham gia: {formatDate(u.createdAt)}
                      </p>
                    </button>
                    <div className="flex gap-1 shrink-0">
                      {u.profileStatus === 'pending' && !u.isLocked && (
                        <>
                          <button onClick={() => handleApprove(u.id)} className="flex items-center gap-1 border border-green-700 text-green-700 px-2 py-1 hover:bg-green-700 hover:text-background transition-colors" style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', fontWeight: 700 }}>
                            <CheckCircle size={11} /> DUYỆT
                          </button>
                          <button onClick={() => handleReject(u.id)} className="flex items-center gap-1 border border-destructive text-destructive px-2 py-1 hover:bg-destructive hover:text-background transition-colors" style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', fontWeight: 700 }}>
                            <XCircle size={11} /> TỪ CHỐI
                          </button>
                        </>
                      )}
                      {u.isLocked ? (
                        <button
                          onClick={() => handleUnlock(u.id)}
                          className="flex items-center gap-1 border border-green-700 text-green-700 px-2 py-1 hover:bg-green-700 hover:text-background transition-colors"
                          style={{ fontFamily: 'var(--font-mono)', fontSize: '10px' }}
                        >
                          <Unlock size={11} /> MỞ KHÓA
                        </button>
                      ) : (
                        <button
                          onClick={() => { setLockModalUserId(u.id); setLockReason(''); }}
                          className="flex items-center gap-1 border border-foreground px-2 py-1 hover:bg-foreground hover:text-background transition-colors"
                          style={{ fontFamily: 'var(--font-mono)', fontSize: '10px' }}
                        >
                          <Lock size={11} /> KHÓA
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Expanded details */}
                  {expandedUserId === u.id && (
                    <div className="bg-secondary border-l-4 border-foreground px-4 py-3 mb-2 space-y-1">
                      {u.address && <p style={{ fontFamily: 'var(--font-mono)', fontSize: '11px' }}>Địa chỉ: {u.address}</p>}
                      {u.restaurantProfile && (
                        <>
                          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '11px' }}>Nhà hàng: {u.restaurantProfile.restaurantName}</p>
                          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '11px' }}>Ẩm thực: {u.restaurantProfile.cuisine}</p>
                          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '11px' }}>Địa chỉ quán: {u.restaurantProfile.address}</p>
                        </>
                      )}
                      {u.shipperProfile && (
                        <>
                          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '11px' }}>Phương tiện: {u.shipperProfile.vehicleType} — {u.shipperProfile.licensePlate}</p>
                          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '11px' }}>CMND: {u.shipperProfile.idNumber}</p>
                        </>
                      )}
                      <p style={{ fontFamily: 'var(--font-mono)', fontSize: '11px' }}>ID: {u.id}</p>

                      {/* Rejection reason */}
                      {u.profileStatus === 'rejected' && u.rejectionReason && (
                        <div className="mt-3 pt-3 border-t border-dashed border-border">
                          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', letterSpacing: '0.08em', color: 'var(--muted-foreground)', marginBottom: '6px' }}>LÝ DO TỪ CHỐI</p>
                          <p style={{ fontFamily: 'var(--font-body)', fontSize: '12px' }}>{u.rejectionReason}</p>
                          {u.rejectedAt && (
                            <p className="text-muted-foreground" style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', marginTop: '3px' }}>
                              {new Date(u.rejectedAt).toLocaleString('vi-VN')}
                            </p>
                          )}
                        </div>
                      )}

                      {/* Lock history */}
                      {(u.lockHistory?.length ?? 0) > 0 && (
                        <div className="mt-3 pt-3 border-t border-dashed border-border">
                          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', letterSpacing: '0.08em', color: 'var(--muted-foreground)', marginBottom: '8px' }}>
                            LỊCH SỬ KHÓA TÀI KHOẢN
                          </p>
                          <div className="space-y-2">
                            {[...u.lockHistory!].reverse().map((rec, idx) => (
                              <div key={idx} className={`px-3 py-2 border-l-2 ${rec.unlockedAt ? 'border-border' : 'border-accent'}`}>
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className={`${rec.unlockedAt ? 'text-muted-foreground' : 'text-accent'}`} style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', fontWeight: 700 }}>
                                    {rec.unlockedAt ? 'ĐÃ MỞ' : 'ĐANG KHÓA'}
                                  </span>
                                  <span className="text-muted-foreground" style={{ fontFamily: 'var(--font-mono)', fontSize: '10px' }}>
                                    bởi {rec.lockedByName}
                                  </span>
                                </div>
                                <p style={{ fontFamily: 'var(--font-body)', fontSize: '12px', marginTop: '2px' }}>
                                  Lý do: {rec.reason}
                                </p>
                                <p style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--muted-foreground)', marginTop: '2px' }}>
                                  Khóa: {new Date(rec.lockedAt).toLocaleString('vi-VN')}
                                  {rec.unlockedAt && ` → Mở: ${new Date(rec.unlockedAt).toLocaleString('vi-VN')}`}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── ĐÁNH GIÁ ── */}
        {tab === 'reviews' && (
          <div className="p-5">
            <div className="flex gap-2 mb-4">
              {([['all', 'TẤT CẢ'], ['reported', 'BỊ BÁO CÁO'], ['hidden', 'ĐÃ ẨN']] as const).map(([f, label]) => (
                <button
                  key={f}
                  onClick={() => setReviewFilter(f)}
                  className={`px-3 py-1.5 border-2 transition-colors ${reviewFilter === f ? 'bg-foreground text-background border-foreground' : 'border-foreground hover:bg-secondary'}`}
                  style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', fontWeight: 700 }}
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="divide-y divide-border">
              {filteredReviews.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground" style={{ fontFamily: 'var(--font-mono)', fontSize: '12px' }}>Không có đánh giá</div>
              ) : filteredReviews.map(review => (
                <div key={review.id} className="py-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: '13px' }}>{review.customerName}</span>
                        <StarRow stars={review.stars} />
                        {review.restaurantId && <span className="border border-border px-1" style={{ fontFamily: 'var(--font-mono)', fontSize: '9px' }}>NHÀ HÀNG</span>}
                        {review.shipperId && <span className="border border-border px-1" style={{ fontFamily: 'var(--font-mono)', fontSize: '9px' }}>SHIPPER</span>}
                        {review.isHidden && <span className="text-accent border border-accent px-1" style={{ fontFamily: 'var(--font-mono)', fontSize: '9px' }}>ĐÃ ẨN</span>}
                      </div>
                      <p style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: review.isHidden ? 'var(--muted-foreground)' : undefined }}>
                        {review.content}
                      </p>
                      {review.isHidden && review.hiddenReason && (
                        <p className="text-accent" style={{ fontFamily: 'var(--font-mono)', fontSize: '10px' }}>Lý do ẩn: {review.hiddenReason}</p>
                      )}
                      <p className="text-muted-foreground mt-1" style={{ fontFamily: 'var(--font-mono)', fontSize: '10px' }}>
                        {formatTimeAgo(review.createdAt)}
                        {(review.reportedBy?.length ?? 0) > 0 && (
                          <span className="text-accent ml-2">• {review.reportedBy!.length} báo cáo: {review.reportReasons?.join(', ')}</span>
                        )}
                      </p>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      {review.isHidden ? (
                        <button onClick={() => handleUnhide(review.id)} className="flex items-center gap-1 border border-foreground px-2 py-1 hover:bg-secondary transition-colors" style={{ fontFamily: 'var(--font-mono)', fontSize: '10px' }}>
                          <Eye size={11} /> HIỆN
                        </button>
                      ) : (
                        <button onClick={() => { setHideReviewId(review.id); setHideReason(''); }} className="flex items-center gap-1 border border-foreground px-2 py-1 hover:bg-secondary transition-colors" style={{ fontFamily: 'var(--font-mono)', fontSize: '10px' }}>
                          <EyeOff size={11} /> ẨN
                        </button>
                      )}
                      <button onClick={() => setDeleteReviewConfirmId(review.id)} className="flex items-center gap-1 border border-accent text-accent px-2 py-1 hover:bg-accent hover:text-background transition-colors" style={{ fontFamily: 'var(--font-mono)', fontSize: '10px' }}>
                        <Trash2 size={11} /> XÓA
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── THỐNG KÊ ── */}
        {tab === 'stats' && (
          <div className="p-5">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
              {[
                { label: 'TỔNG ĐƠN HÀNG', value: allOrders.length.toString() },
                { label: 'HOÀN THÀNH', value: completedOrders.length.toString(), color: 'text-green-700' },
                { label: 'ĐÃ HỦY', value: cancelledOrders.length.toString(), color: 'text-accent' },
                { label: 'TỶ LỆ HỦY', value: allOrders.length > 0 ? `${Math.round(cancelledOrders.length / allOrders.length * 100)}%` : '0%', color: cancelledOrders.length / Math.max(allOrders.length, 1) > 0.2 ? 'text-accent' : '' },
              ].map(({ label, value, color }) => (
                <div key={label} className="border-2 border-foreground p-4 text-center">
                  <p style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--muted-foreground)', letterSpacing: '0.08em', marginBottom: '6px' }}>{label}</p>
                  <p className={color} style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '22px' }}>{value}</p>
                </div>
              ))}
            </div>

            <div className="border-2 border-foreground p-4 mb-4">
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--muted-foreground)', letterSpacing: '0.08em', marginBottom: '12px' }}>TỔNG DOANH THU HỆ THỐNG</p>
              <p className="text-green-700" style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '36px' }}>
                {formatPrice(totalRevenue)}
              </p>
              <p className="text-muted-foreground mt-1" style={{ fontFamily: 'var(--font-mono)', fontSize: '11px' }}>
                Phí dịch vụ ({config.serviceFeePercent}%): {formatPrice(Math.round(totalRevenue * config.serviceFeePercent / 100))}
              </p>
            </div>

            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--muted-foreground)', letterSpacing: '0.08em', marginBottom: '10px' }}>
              PHÂN BỐ TÀI KHOẢN
            </p>
            <div className="space-y-2">
              {([['customer', 'Khách hàng'], ['restaurant', 'Nhà hàng'], ['shipper', 'Shipper']] as const).map(([role, label]) => {
                const count = users.filter(u => u.role === role).length;
                const pendingCount = users.filter(u => u.role === role && u.profileStatus === 'pending').length;
                return (
                  <div key={role} className="flex items-center gap-3 border-b border-dashed border-border pb-2 last:border-0">
                    <span className="w-28" style={{ fontFamily: 'var(--font-mono)', fontSize: '11px' }}>{label}</span>
                    <div className="flex-1 h-3 bg-secondary border border-border">
                      <div className="h-full bg-foreground transition-all" style={{ width: `${users.length > 0 ? (count / users.length * 100) : 0}%` }} />
                    </div>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', minWidth: '3rem', textAlign: 'right' }}>{count}</span>
                    {pendingCount > 0 && <span className="text-accent" style={{ fontFamily: 'var(--font-mono)', fontSize: '10px' }}>({pendingCount} chờ)</span>}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── SỰ CỐ ── */}
        {tab === 'tickets' && (
          <div className="p-5">
            <div className="divide-y divide-border">
              {tickets.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground" style={{ fontFamily: 'var(--font-mono)', fontSize: '12px' }}>
                  Không có ticket hỗ trợ
                </div>
              ) : tickets.map(ticket => (
                <div key={ticket.id} className="py-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: '14px' }}>{ticket.title}</span>
                        <span className={`border px-1.5 ${ticket.status === 'open' ? 'text-accent border-accent' : ticket.status === 'in_progress' ? 'text-blue-700 border-blue-700' : 'text-green-700 border-green-700'}`} style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', fontWeight: 700 }}>
                          {ticket.status === 'open' ? 'MỚI' : ticket.status === 'in_progress' ? 'ĐANG XỬ LÝ' : 'ĐÃ GIẢI QUYẾT'}
                        </span>
                      </div>
                      <p className="text-muted-foreground" style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', marginBottom: '4px' }}>
                        {ticket.customerName} · {formatTimeAgo(ticket.createdAt)}
                        {ticket.orderId && ` · Đơn: ${ticket.orderId.slice(0, 12)}...`}
                      </p>
                      <p style={{ fontFamily: 'var(--font-body)', fontSize: '13px' }}>{ticket.description}</p>
                      {ticket.resolution && (
                        <p className="mt-2 text-green-700" style={{ fontFamily: 'var(--font-mono)', fontSize: '11px' }}>
                          Kết quả: {ticket.resolution}
                        </p>
                      )}
                    </div>
                    {ticket.status !== 'resolved' && (
                      <div className="flex gap-1 shrink-0">
                        {ticket.status === 'open' && (
                          <button onClick={() => handleProcessTicket(ticket.id)} className="border border-blue-700 text-blue-700 px-2 py-1 hover:bg-blue-700 hover:text-background transition-colors" style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', fontWeight: 700 }}>
                            XỬ LÝ
                          </button>
                        )}
                        <button onClick={() => { setTicketDetail(ticket.id); setTicketResolution(''); }} className="bg-foreground text-background px-2 py-1 hover:bg-green-800 transition-colors" style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', fontWeight: 700 }}>
                          ĐÓNG
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── CẤU HÌNH ── */}
        {tab === 'config' && (
          <div className="p-5">
            <div className="flex items-center justify-between mb-4">
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--muted-foreground)' }}>
                CẤU HÌNH HỆ THỐNG
              </p>
              <button
                onClick={() => setConfigEditing(!configEditing)}
                className="flex items-center gap-1.5 border-2 border-foreground px-3 py-1.5 hover:bg-foreground hover:text-background transition-all"
                style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: 700 }}
              >
                {configEditing ? 'HỦY' : 'CHỈNH SỬA'}
              </button>
            </div>

            <div className="space-y-4">
              {[
                { key: 'serviceFeePercent' as const, label: 'PHÍ DỊCH VỤ (%)', hint: '0–50%', value: config.serviceFeePercent, unit: '%' },
                { key: 'deliveryFeePerKm' as const, label: 'PHÍ GIAO HÀNG / KM (VNĐ)', hint: '≥ 0', value: config.deliveryFeePerKm, unit: 'đ/km' },
                { key: 'discountPercent' as const, label: 'CHIẾT KHẤU MẶC ĐỊNH (%)', hint: '0–100%', value: config.discountPercent, unit: '%' },
              ].map(({ key, label, hint, value, unit }) => (
                <div key={key} className="border-b border-dashed border-border pb-4 last:border-0">
                  <label style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', letterSpacing: '0.08em', color: 'var(--muted-foreground)', display: 'block', marginBottom: '6px' }}>
                    {label} <span className="text-muted-foreground">({hint})</span>
                  </label>
                  {configEditing ? (
                    <input
                      value={configForm[key]}
                      onChange={e => setConfigForm(f => ({ ...f, [key]: e.target.value }))}
                      className="w-full border-2 border-foreground px-3 py-2 bg-secondary outline-none focus:border-accent transition-colors"
                      style={{ fontFamily: 'var(--font-mono)', fontSize: '16px' }}
                    />
                  ) : (
                    <p style={{ fontFamily: 'var(--font-mono)', fontSize: '20px', fontWeight: 700 }}>
                      {value.toLocaleString('vi-VN')} <span className="text-muted-foreground text-sm">{unit}</span>
                    </p>
                  )}
                </div>
              ))}
            </div>

            {configEditing && (
              <button
                onClick={handleSaveConfig}
                className="w-full mt-5 bg-foreground text-background py-3 hover:bg-accent transition-colors"
                style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '13px', letterSpacing: '0.05em' }}
              >
                LƯU CẤU HÌNH
              </button>
            )}

            {!configEditing && (
              <p className="mt-4 text-muted-foreground" style={{ fontFamily: 'var(--font-mono)', fontSize: '10px' }}>
                Cập nhật lần cuối: {formatDate(config.updatedAt)} bởi {config.updatedBy}
              </p>
            )}
          </div>
        )}
      </div>

      {/* ── Hide review modal ── */}
      {hideReviewId && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-background border-2 border-foreground w-full max-w-sm p-6">
            <h3 className="mb-3" style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '22px' }}>Lý do ẩn đánh giá</h3>
            <input
              value={hideReason}
              onChange={e => setHideReason(e.target.value)}
              placeholder="Nhập lý do vi phạm..."
              className="w-full border-2 border-foreground px-3 py-2.5 bg-secondary outline-none focus:border-accent mb-4"
              style={{ fontFamily: 'var(--font-body)', fontSize: '13px' }}
            />
            <div className="flex gap-2">
              <button onClick={() => { setHideReviewId(null); setHideReason(''); }} className="flex-1 border-2 border-foreground py-2.5 hover:bg-secondary" style={{ fontFamily: 'var(--font-mono)', fontSize: '12px' }}>HỦY</button>
              <button onClick={handleHideReview} disabled={!hideReason.trim()} className="flex-1 bg-foreground text-background py-2.5 hover:bg-accent transition-colors disabled:opacity-40" style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', fontWeight: 700 }}>XÁC NHẬN ẨN</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete review confirm ── */}
      {deleteReviewConfirmId && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-background border-2 border-foreground w-full max-w-sm p-6">
            <h3 className="mb-2" style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '22px' }}>Xóa vĩnh viễn?</h3>
            <p className="text-muted-foreground mb-5" style={{ fontFamily: 'var(--font-body)', fontSize: '13px' }}>
              Thao tác này không thể hoàn tác. Điểm trung bình sẽ được tính lại.
            </p>
            <div className="flex gap-2">
              <button onClick={() => setDeleteReviewConfirmId(null)} className="flex-1 border-2 border-foreground py-2.5 hover:bg-secondary" style={{ fontFamily: 'var(--font-mono)', fontSize: '12px' }}>HỦY</button>
              <button onClick={() => handleDeleteReview(deleteReviewConfirmId!)} className="flex-1 bg-accent text-background py-2.5 hover:opacity-90" style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', fontWeight: 700 }}>XÓA VĨNH VIỄN</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Lock account modal ── */}
      {lockModalUserId && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-background border-2 border-foreground w-full max-w-sm p-6">
            <div className="flex items-center gap-2 mb-1">
              <Lock size={16} />
              <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '22px' }}>Khóa tài khoản</h3>
            </div>
            <p className="text-muted-foreground mb-4" style={{ fontFamily: 'var(--font-mono)', fontSize: '11px' }}>
              {users.find(u => u.id === lockModalUserId)?.name} — {users.find(u => u.id === lockModalUserId)?.phone}
            </p>
            <label style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--muted-foreground)', display: 'block', marginBottom: '6px' }}>
              LÝ DO KHÓA *
            </label>
            <textarea
              value={lockReason}
              onChange={e => setLockReason(e.target.value)}
              placeholder="Nhập lý do khóa tài khoản này..."
              rows={3}
              autoFocus
              className="w-full border-2 border-foreground px-3 py-2.5 bg-secondary outline-none focus:border-accent mb-4 resize-none"
              style={{ fontFamily: 'var(--font-body)', fontSize: '13px' }}
            />
            <p className="text-accent mb-4" style={{ fontFamily: 'var(--font-mono)', fontSize: '10px' }}>
              Lý do này sẽ được hiển thị cho người dùng khi họ cố đăng nhập.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => { setLockModalUserId(null); setLockReason(''); }}
                className="flex-1 border-2 border-foreground py-2.5 hover:bg-secondary transition-colors"
                style={{ fontFamily: 'var(--font-mono)', fontSize: '12px' }}
              >
                HỦY
              </button>
              <button
                onClick={handleConfirmLock}
                disabled={!lockReason.trim()}
                className="flex-1 bg-foreground text-background py-2.5 hover:bg-accent transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', fontWeight: 700 }}
              >
                XÁC NHẬN KHÓA
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Reject account modal ── */}
      {rejectModalUserId && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-background border-2 border-foreground w-full max-w-sm p-6">
            <div className="flex items-center gap-2 mb-1">
              <XCircle size={16} />
              <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '22px' }}>Từ chối hồ sơ</h3>
            </div>
            <p className="text-muted-foreground mb-4" style={{ fontFamily: 'var(--font-mono)', fontSize: '11px' }}>
              {users.find(u => u.id === rejectModalUserId)?.name} — {users.find(u => u.id === rejectModalUserId)?.phone}
            </p>
            <label style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--muted-foreground)', display: 'block', marginBottom: '6px' }}>
              LÝ DO TỪ CHỐI *
            </label>
            <textarea
              value={rejectReason}
              onChange={e => setRejectReason(e.target.value)}
              placeholder="Nhập lý do từ chối (ví dụ: Thiếu giấy phép kinh doanh, ảnh không hợp lệ...)..."
              rows={3}
              autoFocus
              className="w-full border-2 border-foreground px-3 py-2.5 bg-secondary outline-none focus:border-accent mb-4 resize-none"
              style={{ fontFamily: 'var(--font-body)', fontSize: '13px' }}
            />
            <p className="text-accent mb-4" style={{ fontFamily: 'var(--font-mono)', fontSize: '10px' }}>
              Lý do này sẽ hiển thị cho người dùng để họ biết cần bổ sung gì.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => { setRejectModalUserId(null); setRejectReason(''); }}
                className="flex-1 border-2 border-foreground py-2.5 hover:bg-secondary transition-colors"
                style={{ fontFamily: 'var(--font-mono)', fontSize: '12px' }}
              >
                HỦY
              </button>
              <button
                onClick={handleConfirmReject}
                disabled={!rejectReason.trim()}
                className="flex-1 bg-destructive text-background py-2.5 hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', fontWeight: 700 }}
              >
                XÁC NHẬN TỪ CHỐI
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Resolve ticket modal ── */}
      {ticketDetail && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-background border-2 border-foreground w-full max-w-sm p-6">
            <h3 className="mb-3" style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '22px' }}>Đóng ticket hỗ trợ</h3>
            <label style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--muted-foreground)', display: 'block', marginBottom: '6px' }}>
              KẾT QUẢ XỬ LÝ
            </label>
            <textarea
              value={ticketResolution}
              onChange={e => setTicketResolution(e.target.value)}
              placeholder="Mô tả kết quả giải quyết..."
              rows={3}
              className="w-full border-2 border-foreground px-3 py-2.5 bg-secondary outline-none focus:border-accent mb-4 resize-none"
              style={{ fontFamily: 'var(--font-body)', fontSize: '13px' }}
            />
            <div className="flex gap-2">
              <button onClick={() => { setTicketDetail(null); setTicketResolution(''); }} className="flex-1 border-2 border-foreground py-2.5 hover:bg-secondary" style={{ fontFamily: 'var(--font-mono)', fontSize: '12px' }}>HỦY</button>
              <button onClick={() => handleResolveTicket(ticketDetail!)} className="flex-1 bg-foreground text-background py-2.5 hover:bg-green-800 transition-colors" style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', fontWeight: 700 }}>ĐÃ GIẢI QUYẾT</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
