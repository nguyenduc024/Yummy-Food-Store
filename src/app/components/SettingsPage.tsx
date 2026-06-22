import { useNavigate } from 'react-router';
import { ChevronLeft, LogOut, User, Store, Truck, Clock, CheckCircle, XCircle } from 'lucide-react';
import { useAuth } from './AuthContext';
import { getRoleLabel, getStatusLabel } from '../services/authStorage';

export function SettingsPage() {
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuth();

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

  const RoleIcon = user.role === 'restaurant' ? Store : user.role === 'shipper' ? Truck : User;

  const statusColor =
    user.profileStatus === 'active' ? 'text-green-700' :
    user.profileStatus === 'pending' ? 'text-accent' : 'text-destructive';

  const StatusIcon =
    user.profileStatus === 'active' ? CheckCircle :
    user.profileStatus === 'pending' ? Clock : XCircle;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

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

      {/* Profile card */}
      <div className="border-2 border-foreground p-6 mb-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-14 h-14 border-2 border-foreground flex items-center justify-center">
            <RoleIcon size={24} />
          </div>
          <div>
            <p style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '20px' }}>{user.name}</p>
            <p className="text-muted-foreground" style={{ fontFamily: 'var(--font-mono)', fontSize: '12px' }}>
              {getRoleLabel(user.role)}
            </p>
          </div>
        </div>

        <div className="space-y-3 border-t border-border pt-4">
          <div className="flex justify-between">
            <span className="text-muted-foreground" style={{ fontFamily: 'var(--font-mono)', fontSize: '11px' }}>SỐ ĐIỆN THOẠI</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '13px' }}>{user.phone}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground" style={{ fontFamily: 'var(--font-mono)', fontSize: '11px' }}>TRẠNG THÁI</span>
            <span className={`flex items-center gap-1 ${statusColor}`} style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', fontWeight: 700 }}>
              <StatusIcon size={14} />
              {getStatusLabel(user.profileStatus).toUpperCase()}
            </span>
          </div>
        </div>
      </div>

      {/* Profile details for restaurant/shipper */}
      {user.role === 'restaurant' && user.restaurantProfile && (
        <div className="border-2 border-foreground p-6 mb-6">
          <p className="mb-4" style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', letterSpacing: '0.1em', color: 'var(--muted-foreground)' }}>
            HỒ SƠ NHÀ HÀNG
          </p>
          <div className="space-y-2" style={{ fontFamily: 'var(--font-body)', fontSize: '14px' }}>
            <p><strong>Tên:</strong> {user.restaurantProfile.restaurantName}</p>
            <p><strong>Địa chỉ:</strong> {user.restaurantProfile.address}</p>
            <p><strong>Ẩm thực:</strong> {user.restaurantProfile.cuisine}</p>
            {user.restaurantProfile.description && (
              <p><strong>Mô tả:</strong> {user.restaurantProfile.description}</p>
            )}
          </div>
        </div>
      )}

      {user.role === 'shipper' && user.shipperProfile && (
        <div className="border-2 border-foreground p-6 mb-6">
          <p className="mb-4" style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', letterSpacing: '0.1em', color: 'var(--muted-foreground)' }}>
            HỒ SƠ SHIPPER
          </p>
          <div className="space-y-2" style={{ fontFamily: 'var(--font-body)', fontSize: '14px' }}>
            <p><strong>Họ tên:</strong> {user.shipperProfile.fullName}</p>
            <p><strong>Phương tiện:</strong> {user.shipperProfile.vehicleType}</p>
            <p><strong>Biển số:</strong> {user.shipperProfile.licensePlate}</p>
            <p><strong>CMND/CCCD:</strong> {user.shipperProfile.idNumber}</p>
          </div>
        </div>
      )}

      {user.role !== 'customer' && user.profileStatus === 'pending' && !user.restaurantProfile && !user.shipperProfile && (
        <div className="border-2 border-accent bg-accent/5 p-4 mb-6">
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '12px' }}>
            Bạn chưa tạo hồ sơ.{' '}
            <button onClick={() => navigate('/auth/profile-setup')} className="text-accent hover:underline font-bold">
              Tạo hồ sơ ngay
            </button>
          </p>
        </div>
      )}

      {user.profileStatus === 'pending' && (user.restaurantProfile || user.shipperProfile) && (
        <div className="border-2 border-dashed border-foreground p-4 mb-6 flex items-start gap-3">
          <Clock size={18} className="text-accent shrink-0 mt-0.5" />
          <p className="text-muted-foreground" style={{ fontFamily: 'var(--font-mono)', fontSize: '11px' }}>
            Hồ sơ của bạn đang chờ quản trị viên phê duyệt. Bạn vẫn có thể duyệt và đặt món trên hệ thống.
          </p>
        </div>
      )}

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
