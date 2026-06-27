import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import {
  ChevronLeft, LogOut, User, Store, Truck, Clock, CheckCircle, XCircle,
  Pencil, X, Eye, EyeOff, MapPin, Phone, ShieldCheck,
  ClipboardList, Star, LayoutDashboard, MessageSquare, Lock,
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from './AuthContext';
import { getRoleLabel, getStatusLabel, changePassword } from '../services/authStorage';
import {
  getOrdersByCustomer, getOrderReview, createReview, updateReview, deleteReview,
  getTicketsByCustomer, createTicket,
  getOrderStatusLabel, formatPrice, formatDate, formatTimeAgo,
  seedRestaurantData,
} from '../services/orderStorage';
import type { Order, Review, SupportTicket } from '../data/authTypes';

export function SettingsPage() {
  const navigate = useNavigate();
  const { user, logout, isAuthenticated, updateProfile } = useAuth();

  // Profile edit
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editName, setEditName] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [profileSaving, setProfileSaving] = useState(false);

  // Password
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  // Customer: orders + reviews
  const [orders, setOrders] = useState<Order[]>([]);
  const [reviewMap, setReviewMap] = useState<Record<string, Review>>({});
  const [writingReviewOrderId, setWritingReviewOrderId] = useState<string | null>(null);
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);
  const [reviewStars, setReviewStars] = useState(5);
  const [reviewContent, setReviewContent] = useState('');

  // Customer: support tickets
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [showTicketForm, setShowTicketForm] = useState(false);
  const [ticketTitle, setTicketTitle] = useState('');
  const [ticketDesc, setTicketDesc] = useState('');
  const [ticketOrderId, setTicketOrderId] = useState('');

  const loadCustomerData = () => {
    if (!user || user.role !== 'customer') return;
    const userOrders = getOrdersByCustomer(user.id);
    setOrders(userOrders);
    const map: Record<string, Review> = {};
    userOrders.forEach(o => {
      const r = getOrderReview(o.id);
      if (r) map[o.id] = r;
    });
    setReviewMap(map);
    setTickets(getTicketsByCustomer(user.id));
  };

  useEffect(() => {
    loadCustomerData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  if (!isAuthenticated || !user) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '32px' }}>Chưa đăng nhập</h1>
        <p className="text-muted-foreground mt-2 mb-6" style={{ fontFamily: 'var(--font-mono)', fontSize: '13px' }}>
          Vui lòng đăng nhập để xem cài đặt tài khoản.
        </p>
        <button
          onClick={() => navigate('/auth')}
          className="bg-foreground text-background px-6 py-2.5 hover:bg-accent transition-colors"
          style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}
        >
          ĐĂNG NHẬP
        </button>
      </div>
    );
  }

  const activeLock = user.lockHistory?.filter(r => !r.unlockedAt).at(-1);

  const RoleIcon = user.role === 'restaurant' ? Store : user.role === 'shipper' ? Truck : User;

  const statusColor =
    user.profileStatus === 'active' ? 'text-green-700' :
    user.profileStatus === 'pending' ? 'text-accent' : 'text-destructive';

  const StatusIcon =
    user.profileStatus === 'active' ? CheckCircle :
    user.profileStatus === 'pending' ? Clock : XCircle;

  const handleLogout = () => { logout(); navigate('/'); };

  const startEditProfile = () => {
    setEditName(user.name);
    setEditAddress(user.address ?? '');
    setIsEditingProfile(true);
  };

  const cancelEditProfile = () => setIsEditingProfile(false);

  const handleSaveProfile = () => {
    if (!editName.trim()) { toast.error('Họ tên không được để trống'); return; }
    setProfileSaving(true);
    const result = updateProfile({ name: editName.trim(), address: editAddress.trim() || undefined });
    setProfileSaving(false);
    if (result.success) { setIsEditingProfile(false); toast.success('Đã cập nhật thông tin thành công'); }
    else toast.error(result.error ?? 'Có lỗi xảy ra');
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    if (!oldPassword) { setPasswordError('Vui lòng nhập mật khẩu hiện tại'); return; }
    if (newPassword.length < 6) { setPasswordError('Mật khẩu mới phải có ít nhất 6 ký tự'); return; }
    if (newPassword !== confirmNewPassword) { setPasswordError('Mật khẩu xác nhận không khớp'); return; }
    setPasswordSaving(true);
    const result = changePassword(user.id, oldPassword, newPassword);
    setPasswordSaving(false);
    if (!result.success) { setPasswordError(result.error ?? 'Có lỗi xảy ra'); return; }
    setOldPassword(''); setNewPassword(''); setConfirmNewPassword('');
    toast.success('Đã đổi mật khẩu thành công');
  };

  // Dashboard path by role
  const dashboardPath = user.role === 'restaurant' ? '/restaurant' : user.role === 'shipper' ? '/shipper' : user.role === 'admin' ? '/admin' : null;

  // Review helpers
  const handleSubmitReview = (orderId: string) => {
    if (!reviewContent.trim()) { toast.error('Vui lòng nhập nội dung đánh giá'); return; }
    createReview({
      orderId,
      customerId: user.id,
      customerName: user.name,
      restaurantId: orders.find(o => o.id === orderId)?.restaurantId,
      stars: reviewStars,
      content: reviewContent.trim(),
    });
    toast.success('Đã gửi đánh giá');
    setWritingReviewOrderId(null);
    setReviewContent('');
    setReviewStars(5);
    loadCustomerData();
  };

  const handleUpdateReview = (reviewId: string) => {
    if (!reviewContent.trim()) { toast.error('Vui lòng nhập nội dung'); return; }
    const result = updateReview(reviewId, reviewStars, reviewContent.trim());
    if (!result.success) { toast.error(result.error); return; }
    toast.success('Đã cập nhật đánh giá');
    setEditingReviewId(null);
    setReviewContent('');
    setReviewStars(5);
    loadCustomerData();
  };

  const handleDeleteReview = (reviewId: string) => {
    deleteReview(reviewId);
    toast.success('Đã xóa đánh giá');
    loadCustomerData();
  };

  const startWriteReview = (orderId: string) => {
    setWritingReviewOrderId(orderId);
    setEditingReviewId(null);
    setReviewStars(5);
    setReviewContent('');
  };

  const startEditReview = (review: Review) => {
    setEditingReviewId(review.id);
    setWritingReviewOrderId(null);
    setReviewStars(review.stars);
    setReviewContent(review.content);
  };

  // Ticket
  const handleSubmitTicket = () => {
    if (!ticketTitle.trim() || !ticketDesc.trim()) { toast.error('Vui lòng điền đầy đủ thông tin'); return; }
    createTicket({
      customerId: user.id,
      customerName: user.name,
      orderId: ticketOrderId.trim() || undefined,
      title: ticketTitle.trim(),
      description: ticketDesc.trim(),
    });
    toast.success('Đã gửi yêu cầu hỗ trợ');
    setShowTicketForm(false);
    setTicketTitle(''); setTicketDesc(''); setTicketOrderId('');
    loadCustomerData();
  };

  const completedOrders = orders.filter(o => o.status === 'completed');
  const activeOrders = orders.filter(o => !['completed', 'cancelled_restaurant', 'cancelled_customer', 'cancelled_failed'].includes(o.status));

  return (
    <div className="max-w-lg mx-auto px-4 py-8 pb-16">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
        style={{ fontFamily: 'var(--font-mono)', fontSize: '12px' }}
      >
        <ChevronLeft size={14} /> QUAY LẠI
      </button>

      <div className="mb-8">
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', letterSpacing: '0.1em', color: 'var(--muted-foreground)', marginBottom: '4px' }}>
          ─── CÀI ĐẶT
        </p>
        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '36px', lineHeight: 1 }}>
          Tài Khoản
        </h1>
      </div>

      {/* Lock banner */}
      {user.isLocked && activeLock && (
        <div className="border-2 border-accent bg-accent/5 p-4 mb-6">
          <div className="flex items-start gap-2">
            <Lock size={16} className="text-accent shrink-0 mt-0.5" />
            <div>
              <p className="text-accent" style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '12px', letterSpacing: '0.05em' }}>
                TÀI KHOẢN ĐÃ BỊ KHÓA
              </p>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '13px', marginTop: '4px' }}>
                Lý do: <span className="font-semibold">{activeLock.reason}</span>
              </p>
              <p className="text-muted-foreground" style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', marginTop: '4px' }}>
                Khóa lúc: {new Date(activeLock.lockedAt).toLocaleString('vi-VN')} · bởi {activeLock.lockedByName}
              </p>
              <p className="text-muted-foreground" style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', marginTop: '2px' }}>
                Liên hệ hỗ trợ để được mở khóa.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Rejection banner */}
      {user.profileStatus === 'rejected' && user.rejectionReason && (
        <div className="border-2 border-destructive bg-destructive/5 p-4 mb-6">
          <div className="flex items-start gap-2">
            <XCircle size={16} className="text-destructive shrink-0 mt-0.5" />
            <div>
              <p className="text-destructive" style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '12px', letterSpacing: '0.05em' }}>
                HỒ SƠ BỊ TỪ CHỐI
              </p>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '13px', marginTop: '4px' }}>
                Lý do: <span className="font-semibold">{user.rejectionReason}</span>
              </p>
              {user.rejectedAt && (
                <p className="text-muted-foreground" style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', marginTop: '4px' }}>
                  Từ chối lúc: {new Date(user.rejectedAt).toLocaleString('vi-VN')}
                </p>
              )}
              <p className="text-muted-foreground" style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', marginTop: '2px' }}>
                Vui lòng bổ sung thông tin và nộp lại hồ sơ.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Profile card */}
      <div className="border-2 border-foreground p-5 mb-6 flex items-center gap-4">
        <div className="w-14 h-14 border-2 border-foreground flex items-center justify-center shrink-0">
          <RoleIcon size={24} />
        </div>
        <div className="flex-1 min-w-0">
          <p style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '20px' }} className="truncate">
            {user.name}
          </p>
          <div className="flex items-center gap-3 mt-1 flex-wrap">
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--muted-foreground)' }}>
              {getRoleLabel(user.role).toUpperCase()}
            </span>
            <span className={`flex items-center gap-1 ${statusColor}`} style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: 700 }}>
              <StatusIcon size={11} />
              {getStatusLabel(user.profileStatus).toUpperCase()}
            </span>
          </div>
        </div>
      </div>

      {/* Dashboard button for non-customer roles */}
      {dashboardPath && (
        <button
          onClick={() => navigate(dashboardPath)}
          className="w-full flex items-center justify-center gap-2 bg-foreground text-background py-3 hover:bg-accent transition-colors mb-6"
          style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '13px', letterSpacing: '0.05em' }}
        >
          <LayoutDashboard size={16} />
          VÀO DASHBOARD {getRoleLabel(user.role).toUpperCase()}
        </button>
      )}

      {/* ── Thông tin cá nhân ── */}
      <div className="border-2 border-foreground mb-6">
        <div className="flex items-center justify-between px-5 py-3 border-b border-border">
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', letterSpacing: '0.1em', color: 'var(--muted-foreground)' }}>
            THÔNG TIN CÁ NHÂN
          </p>
          {!isEditingProfile ? (
            <button
              onClick={startEditProfile}
              className="flex items-center gap-1.5 border border-foreground px-2.5 py-1 hover:bg-foreground hover:text-background transition-all"
              style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: 700 }}
            >
              <Pencil size={11} /> CHỈNH SỬA
            </button>
          ) : (
            <button onClick={cancelEditProfile} className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors" style={{ fontFamily: 'var(--font-mono)', fontSize: '11px' }}>
              <X size={13} /> HỦY
            </button>
          )}
        </div>

        <div className="p-5 space-y-4">
          <div>
            <label className="block mb-1.5" style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', letterSpacing: '0.08em', color: 'var(--muted-foreground)' }}>HỌ VÀ TÊN</label>
            {isEditingProfile ? (
              <input type="text" value={editName} onChange={e => setEditName(e.target.value)}
                className="w-full border-2 border-foreground px-3 py-2.5 bg-secondary outline-none focus:border-accent transition-colors"
                style={{ fontFamily: 'var(--font-body)', fontSize: '15px' }} autoFocus />
            ) : (
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '15px' }}>{user.name}</p>
            )}
          </div>

          <div>
            <label className="block mb-1.5" style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', letterSpacing: '0.08em', color: 'var(--muted-foreground)' }}>SỐ ĐIỆN THOẠI</label>
            <div className="flex items-center gap-2">
              <Phone size={13} className="text-muted-foreground shrink-0" />
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: '14px' }}>{user.phone}</p>
              <span className="ml-auto text-muted-foreground border border-border px-1.5 py-0.5" style={{ fontFamily: 'var(--font-mono)', fontSize: '9px' }}>KHÔNG ĐỔI ĐƯỢC</span>
            </div>
          </div>

          {(user.role === 'customer' || user.address) && (
            <div>
              <label className="block mb-1.5" style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', letterSpacing: '0.08em', color: 'var(--muted-foreground)' }}>ĐỊA CHỈ GIAO HÀNG</label>
              {isEditingProfile ? (
                <div className="relative">
                  <MapPin size={14} className="absolute left-3 top-3 text-muted-foreground" />
                  <input type="text" value={editAddress} onChange={e => setEditAddress(e.target.value)}
                    placeholder="Số nhà, tên đường, phường/xã, quận/huyện..."
                    className="w-full border-2 border-foreground pl-9 pr-4 py-2.5 bg-secondary outline-none focus:border-accent transition-colors"
                    style={{ fontFamily: 'var(--font-body)', fontSize: '14px' }} />
                </div>
              ) : (
                <div className="flex items-start gap-2">
                  <MapPin size={13} className="text-muted-foreground shrink-0 mt-0.5" />
                  <p style={{ fontFamily: 'var(--font-body)', fontSize: '14px' }}>
                    {user.address || <span className="text-muted-foreground italic">Chưa có địa chỉ</span>}
                  </p>
                </div>
              )}
            </div>
          )}

          {!isEditingProfile && (
            <div>
              <label className="block mb-1" style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', letterSpacing: '0.08em', color: 'var(--muted-foreground)' }}>THAM GIA TỪ</label>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--muted-foreground)' }}>
                {new Date(user.createdAt).toLocaleDateString('vi-VN', { day: '2-digit', month: 'long', year: 'numeric' })}
              </p>
            </div>
          )}

          {isEditingProfile && (
            <button
              onClick={handleSaveProfile} disabled={profileSaving}
              className="w-full bg-foreground text-background py-2.5 hover:bg-accent transition-colors disabled:opacity-50 mt-2"
              style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '13px', letterSpacing: '0.05em' }}
            >
              {profileSaving ? 'ĐANG LƯU...' : 'LƯU THAY ĐỔI'}
            </button>
          )}
        </div>
      </div>

      {/* ── Đổi mật khẩu ── */}
      <div className="border-2 border-foreground mb-6">
        <div className="px-5 py-3 border-b border-border flex items-center gap-2">
          <ShieldCheck size={13} className="text-muted-foreground" />
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', letterSpacing: '0.1em', color: 'var(--muted-foreground)' }}>
            BẢO MẬT — ĐỔI MẬT KHẨU
          </p>
        </div>
        <form onSubmit={handleChangePassword} className="p-5 space-y-4">
          {passwordError && (
            <div className="border border-accent bg-accent/10 px-3 py-2 text-xs" style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent)' }}>{passwordError}</div>
          )}
          {[
            { label: 'MẬT KHẨU HIỆN TẠI', val: oldPassword, set: setOldPassword, show: showOld, toggle: () => setShowOld(v => !v), placeholder: '••••••' },
            { label: 'MẬT KHẨU MỚI', val: newPassword, set: setNewPassword, show: showNew, toggle: () => setShowNew(v => !v), placeholder: 'Tối thiểu 6 ký tự' },
          ].map(({ label, val, set, show, toggle, placeholder }) => (
            <div key={label}>
              <label className="block mb-1.5" style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', letterSpacing: '0.08em', color: 'var(--muted-foreground)' }}>{label}</label>
              <div className="relative">
                <input type={show ? 'text' : 'password'} value={val} onChange={e => { set(e.target.value); setPasswordError(''); }}
                  placeholder={placeholder}
                  className="w-full border-2 border-foreground px-3 py-2.5 bg-secondary outline-none focus:border-accent transition-colors pr-10"
                  style={{ fontFamily: 'var(--font-body)', fontSize: '15px' }} />
                <button type="button" onClick={toggle} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {show ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>
          ))}
          <div>
            <label className="block mb-1.5" style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', letterSpacing: '0.08em', color: 'var(--muted-foreground)' }}>XÁC NHẬN MẬT KHẨU MỚI</label>
            <input type="password" value={confirmNewPassword} onChange={e => { setConfirmNewPassword(e.target.value); setPasswordError(''); }}
              placeholder="Nhập lại mật khẩu mới"
              className="w-full border-2 border-foreground px-3 py-2.5 bg-secondary outline-none focus:border-accent transition-colors"
              style={{ fontFamily: 'var(--font-body)', fontSize: '15px' }} />
          </div>
          <button type="submit" disabled={passwordSaving || !oldPassword || !newPassword || !confirmNewPassword}
            className="w-full border-2 border-foreground py-2.5 hover:bg-foreground hover:text-background transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '13px', letterSpacing: '0.05em' }}>
            {passwordSaving ? 'ĐANG LƯU...' : 'ĐỔI MẬT KHẨU'}
          </button>
        </form>
      </div>

      {/* ── Restaurant/Shipper profile ── */}
      {user.role === 'restaurant' && user.restaurantProfile && (
        <div className="border-2 border-foreground p-5 mb-6">
          <p className="mb-4" style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', letterSpacing: '0.1em', color: 'var(--muted-foreground)' }}>HỒ SƠ NHÀ HÀNG</p>
          <div className="space-y-2.5" style={{ fontFamily: 'var(--font-body)', fontSize: '14px' }}>
            {[
              { label: 'TÊN NHÀ HÀNG', value: user.restaurantProfile.restaurantName },
              { label: 'ĐỊA CHỈ', value: user.restaurantProfile.address },
              { label: 'ẨM THỰC', value: user.restaurantProfile.cuisine },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between border-b border-dashed border-border pb-2 last:border-0">
                <span className="text-muted-foreground" style={{ fontFamily: 'var(--font-mono)', fontSize: '11px' }}>{label}</span>
                <span className="text-right max-w-[60%]">{value}</span>
              </div>
            ))}
            {user.restaurantProfile.description && (
              <div>
                <span className="text-muted-foreground block mb-1" style={{ fontFamily: 'var(--font-mono)', fontSize: '11px' }}>MÔ TẢ</span>
                <span className="text-sm">{user.restaurantProfile.description}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {user.role === 'shipper' && user.shipperProfile && (
        <div className="border-2 border-foreground p-5 mb-6">
          <p className="mb-4" style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', letterSpacing: '0.1em', color: 'var(--muted-foreground)' }}>HỒ SƠ SHIPPER</p>
          <div className="space-y-2.5">
            {[
              { label: 'HỌ TÊN', value: user.shipperProfile.fullName },
              { label: 'PHƯƠNG TIỆN', value: user.shipperProfile.vehicleType },
              { label: 'BIỂN SỐ', value: user.shipperProfile.licensePlate },
              { label: 'CMND/CCCD', value: user.shipperProfile.idNumber },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between border-b border-dashed border-border pb-2 last:border-0" style={{ fontFamily: 'var(--font-body)', fontSize: '14px' }}>
                <span className="text-muted-foreground" style={{ fontFamily: 'var(--font-mono)', fontSize: '11px' }}>{label}</span>
                <span>{value}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {user.role !== 'customer' && user.role !== 'admin' && user.profileStatus === 'pending' && !user.restaurantProfile && !user.shipperProfile && (
        <div className="border-2 border-accent bg-accent/5 p-4 mb-6">
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '12px' }}>
            Bạn chưa tạo hồ sơ.{' '}
            <button onClick={() => navigate('/auth/profile-setup')} className="text-accent hover:underline font-bold">Tạo hồ sơ ngay</button>
          </p>
        </div>
      )}

      {user.profileStatus === 'pending' && (user.restaurantProfile || user.shipperProfile) && (
        <div className="border-2 border-dashed border-foreground p-4 mb-6 flex items-start gap-3">
          <Clock size={16} className="text-accent shrink-0 mt-0.5" />
          <p className="text-muted-foreground" style={{ fontFamily: 'var(--font-mono)', fontSize: '11px' }}>
            Hồ sơ đang chờ quản trị viên phê duyệt.
          </p>
        </div>
      )}

      {/* ── Đơn hàng của tôi (chỉ customer) ── */}
      {user.role === 'customer' && (
        <div className="border-2 border-foreground mb-6">
          <div className="px-5 py-3 border-b border-border flex items-center gap-2">
            <ClipboardList size={13} className="text-muted-foreground" />
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', letterSpacing: '0.1em', color: 'var(--muted-foreground)' }}>
              ĐƠN HÀNG CỦA TÔI
            </p>
          </div>

          {orders.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground" style={{ fontFamily: 'var(--font-mono)', fontSize: '12px' }}>
              Bạn chưa có đơn hàng nào
            </div>
          ) : (
            <div>
              {/* Active orders */}
              {activeOrders.length > 0 && (
                <div>
                  <p className="px-5 pt-4 pb-1" style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--muted-foreground)', letterSpacing: '0.08em' }}>ĐANG XỬ LÝ</p>
                  <div className="divide-y divide-border">
                    {activeOrders.map(order => (
                      <div key={order.id} className="px-5 py-3">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <p style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: '13px' }}>{order.restaurantName}</p>
                          <span className="text-accent border border-accent px-1.5 shrink-0" style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', fontWeight: 700 }}>
                            {getOrderStatusLabel(order.status)}
                          </span>
                        </div>
                        <p className="text-muted-foreground" style={{ fontFamily: 'var(--font-mono)', fontSize: '10px' }}>
                          {order.items.map(i => `${i.dishName} ×${i.quantity}`).join(', ')}
                        </p>
                        <div className="flex items-center justify-between mt-1">
                          <p className="text-muted-foreground" style={{ fontFamily: 'var(--font-mono)', fontSize: '10px' }}>{formatTimeAgo(order.createdAt)}</p>
                          <p className="text-accent" style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', fontWeight: 700 }}>{formatPrice(order.total)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Completed orders + reviews */}
              {completedOrders.length > 0 && (
                <div>
                  <p className="px-5 pt-4 pb-1" style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--muted-foreground)', letterSpacing: '0.08em' }}>ĐÃ HOÀN THÀNH</p>
                  <div className="divide-y divide-border">
                    {completedOrders.map(order => {
                      const review = reviewMap[order.id];
                      const isWriting = writingReviewOrderId === order.id;
                      const isEditing = editingReviewId === review?.id;

                      return (
                        <div key={order.id} className="px-5 py-3">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <p style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: '13px' }}>{order.restaurantName}</p>
                            <span className="text-green-700 border border-green-700 px-1.5 shrink-0" style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', fontWeight: 700 }}>HOÀN THÀNH</span>
                          </div>
                          <p className="text-muted-foreground" style={{ fontFamily: 'var(--font-mono)', fontSize: '10px' }}>
                            {order.items.map(i => `${i.dishName} ×${i.quantity}`).join(', ')}
                          </p>
                          <div className="flex items-center justify-between mt-1">
                            <p className="text-muted-foreground" style={{ fontFamily: 'var(--font-mono)', fontSize: '10px' }}>{formatDate(order.updatedAt)}</p>
                            <p className="text-accent" style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', fontWeight: 700 }}>{formatPrice(order.total)}</p>
                          </div>

                          {/* Existing review */}
                          {review && !isEditing && (
                            <div className="mt-2 border border-dashed border-border p-2">
                              <div className="flex items-center justify-between gap-2 mb-1">
                                <span className="flex gap-0.5">
                                  {[1,2,3,4,5].map(s => (
                                    <Star key={s} size={11} fill={s <= review.stars ? 'currentColor' : 'none'} className={s <= review.stars ? 'text-accent' : 'text-muted-foreground'} />
                                  ))}
                                </span>
                                {!review.isHidden && (
                                  <div className="flex gap-2">
                                    <button onClick={() => startEditReview(review)} className="text-muted-foreground hover:text-foreground" style={{ fontFamily: 'var(--font-mono)', fontSize: '10px' }}>Sửa</button>
                                    <button onClick={() => handleDeleteReview(review.id)} className="text-accent hover:opacity-80" style={{ fontFamily: 'var(--font-mono)', fontSize: '10px' }}>Xóa</button>
                                  </div>
                                )}
                              </div>
                              <p style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: review.isHidden ? 'var(--muted-foreground)' : undefined }}>
                                {review.isHidden ? `[Ẩn do vi phạm: ${review.hiddenReason}]` : review.content}
                              </p>
                            </div>
                          )}

                          {/* Write/edit review form */}
                          {(isWriting || isEditing) && (
                            <div className="mt-2 border-2 border-dashed border-foreground p-3 space-y-2">
                              <div className="flex gap-1">
                                {[1,2,3,4,5].map(s => (
                                  <button key={s} onClick={() => setReviewStars(s)} className="transition-transform hover:scale-110">
                                    <Star size={20} fill={s <= reviewStars ? 'currentColor' : 'none'} className={s <= reviewStars ? 'text-accent' : 'text-muted-foreground'} />
                                  </button>
                                ))}
                              </div>
                              <textarea
                                value={reviewContent}
                                onChange={e => setReviewContent(e.target.value)}
                                placeholder="Chia sẻ trải nghiệm của bạn..."
                                rows={3}
                                className="w-full border-2 border-foreground px-3 py-2 bg-secondary outline-none focus:border-accent resize-none"
                                style={{ fontFamily: 'var(--font-body)', fontSize: '13px' }}
                              />
                              <div className="flex gap-2">
                                <button
                                  onClick={() => isEditing ? handleUpdateReview(review!.id) : handleSubmitReview(order.id)}
                                  className="flex-1 bg-foreground text-background py-2 hover:bg-accent transition-colors"
                                  style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: 700 }}
                                >
                                  {isEditing ? 'LƯU' : 'GỬI ĐÁNH GIÁ'}
                                </button>
                                <button
                                  onClick={() => { setWritingReviewOrderId(null); setEditingReviewId(null); }}
                                  className="border-2 border-foreground px-3 py-2 hover:bg-secondary"
                                  style={{ fontFamily: 'var(--font-mono)', fontSize: '11px' }}
                                >
                                  HỦY
                                </button>
                              </div>
                            </div>
                          )}

                          {/* Button to write review if none */}
                          {!review && !isWriting && (
                            <button
                              onClick={() => startWriteReview(order.id)}
                              className="mt-2 flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors"
                              style={{ fontFamily: 'var(--font-mono)', fontSize: '10px' }}
                            >
                              <Star size={11} /> ĐÁNH GIÁ ĐƠN HÀNG NÀY
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── Hỗ trợ / Sự cố (chỉ customer) ── */}
      {user.role === 'customer' && (
        <div className="border-2 border-foreground mb-6">
          <div className="flex items-center justify-between px-5 py-3 border-b border-border">
            <div className="flex items-center gap-2">
              <MessageSquare size={13} className="text-muted-foreground" />
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', letterSpacing: '0.1em', color: 'var(--muted-foreground)' }}>
                HỖ TRỢ — SỰ CỐ
              </p>
            </div>
            <button
              onClick={() => setShowTicketForm(!showTicketForm)}
              className="flex items-center gap-1.5 border border-foreground px-2.5 py-1 hover:bg-foreground hover:text-background transition-all"
              style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: 700 }}
            >
              + GỬI YÊU CẦU
            </button>
          </div>

          {showTicketForm && (
            <div className="border-b border-dashed border-border p-5 space-y-3">
              <div>
                <label style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--muted-foreground)', display: 'block', marginBottom: '6px' }}>TIÊU ĐỀ *</label>
                <input value={ticketTitle} onChange={e => setTicketTitle(e.target.value)}
                  placeholder="Mô tả ngắn vấn đề..."
                  className="w-full border-2 border-foreground px-3 py-2.5 bg-secondary outline-none focus:border-accent"
                  style={{ fontFamily: 'var(--font-body)', fontSize: '13px' }} />
              </div>
              <div>
                <label style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--muted-foreground)', display: 'block', marginBottom: '6px' }}>MÃ ĐƠN HÀNG (nếu có)</label>
                <select value={ticketOrderId} onChange={e => setTicketOrderId(e.target.value)}
                  className="w-full border-2 border-foreground px-3 py-2.5 bg-secondary outline-none focus:border-accent"
                  style={{ fontFamily: 'var(--font-mono)', fontSize: '13px' }}>
                  <option value="">Không liên quan đến đơn hàng cụ thể</option>
                  {orders.map(o => (
                    <option key={o.id} value={o.id}>
                      {o.restaurantName} — {formatPrice(o.total)} — {getOrderStatusLabel(o.status)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--muted-foreground)', display: 'block', marginBottom: '6px' }}>MÔ TẢ CHI TIẾT *</label>
                <textarea value={ticketDesc} onChange={e => setTicketDesc(e.target.value)}
                  placeholder="Mô tả chi tiết vấn đề bạn gặp phải..."
                  rows={4} className="w-full border-2 border-foreground px-3 py-2.5 bg-secondary outline-none focus:border-accent resize-none"
                  style={{ fontFamily: 'var(--font-body)', fontSize: '13px' }} />
              </div>
              <div className="flex gap-2">
                <button onClick={handleSubmitTicket} className="flex-1 bg-foreground text-background py-2.5 hover:bg-accent transition-colors" style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '12px' }}>
                  GỬI YÊU CẦU HỖ TRỢ
                </button>
                <button onClick={() => setShowTicketForm(false)} className="border-2 border-foreground px-4 py-2.5 hover:bg-secondary" style={{ fontFamily: 'var(--font-mono)', fontSize: '12px' }}>HỦY</button>
              </div>
            </div>
          )}

          <div className="divide-y divide-border">
            {tickets.length === 0 ? (
              <div className="p-6 text-center text-muted-foreground" style={{ fontFamily: 'var(--font-mono)', fontSize: '12px' }}>
                Chưa có yêu cầu hỗ trợ nào
              </div>
            ) : tickets.map(ticket => (
              <div key={ticket.id} className="px-5 py-3">
                <div className="flex items-start justify-between gap-2">
                  <p style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: '13px' }}>{ticket.title}</p>
                  <span className={`border px-1.5 shrink-0 ${ticket.status === 'open' ? 'text-accent border-accent' : ticket.status === 'in_progress' ? 'text-blue-700 border-blue-700' : 'text-green-700 border-green-700'}`} style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', fontWeight: 700 }}>
                    {ticket.status === 'open' ? 'MỚI' : ticket.status === 'in_progress' ? 'ĐANG XỬ LÝ' : 'ĐÃ GIẢI QUYẾT'}
                  </span>
                </div>
                <p className="text-muted-foreground mt-0.5" style={{ fontFamily: 'var(--font-mono)', fontSize: '10px' }}>
                  {formatTimeAgo(ticket.createdAt)}
                </p>
                {ticket.resolution && (
                  <p className="mt-1 text-green-700" style={{ fontFamily: 'var(--font-mono)', fontSize: '11px' }}>
                    Kết quả: {ticket.resolution}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="w-full flex items-center justify-center gap-2 border-2 border-foreground py-3 hover:bg-foreground hover:text-background transition-colors"
        style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '13px', letterSpacing: '0.05em' }}
      >
        <LogOut size={16} />
        ĐĂNG XUẤT
      </button>
    </div>
  );
}
