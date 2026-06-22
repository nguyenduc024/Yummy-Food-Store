import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { ChevronLeft, Clock, CheckCircle } from 'lucide-react';
import { useAuth } from './AuthContext';

export function ProfileSetupPage() {
  const navigate = useNavigate();
  const { user, completeRestaurantProfile, completeShipperProfile } = useAuth();
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDone, setIsDone] = useState(false);

  // Restaurant fields
  const [restaurantName, setRestaurantName] = useState('');
  const [address, setAddress] = useState('');
  const [cuisine, setCuisine] = useState('');
  const [description, setDescription] = useState('');

  // Shipper fields
  const [fullName, setFullName] = useState('');
  const [vehicleType, setVehicleType] = useState('');
  const [licensePlate, setLicensePlate] = useState('');
  const [idNumber, setIdNumber] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    if (user.role === 'customer') {
      navigate('/');
      return;
    }
    if (user.restaurantProfile || user.shipperProfile) {
      setIsDone(true);
    }
  }, [user, navigate]);

  if (!user || user.role === 'customer') return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    let result;
    if (user.role === 'restaurant') {
      if (!restaurantName.trim() || !address.trim() || !cuisine.trim()) {
        setError('Vui lòng điền đầy đủ thông tin nhà hàng');
        setIsSubmitting(false);
        return;
      }
      result = completeRestaurantProfile({
        restaurantName: restaurantName.trim(),
        address: address.trim(),
        cuisine: cuisine.trim(),
        description: description.trim(),
      });
    } else {
      if (!fullName.trim() || !vehicleType.trim() || !licensePlate.trim() || !idNumber.trim()) {
        setError('Vui lòng điền đầy đủ thông tin shipper');
        setIsSubmitting(false);
        return;
      }
      result = completeShipperProfile({
        fullName: fullName.trim(),
        vehicleType: vehicleType.trim(),
        licensePlate: licensePlate.trim(),
        idNumber: idNumber.trim(),
      });
    }

    setIsSubmitting(false);

    if (!result.success) {
      setError(result.error!);
      return;
    }

    setIsDone(true);
  };

  if (isDone) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <div className="w-16 h-16 border-2 border-foreground mx-auto flex items-center justify-center mb-6">
          <Clock size={32} className="text-accent" />
        </div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '32px', marginBottom: '12px' }}>
          Hồ Sơ Đang Chờ Duyệt
        </h1>
        <p className="text-muted-foreground mb-2" style={{ fontFamily: 'var(--font-body)', fontSize: '15px' }}>
          Hồ sơ {user.role === 'restaurant' ? 'nhà hàng' : 'shipper'} của bạn đã được gửi thành công.
        </p>
        <p className="text-muted-foreground mb-8" style={{ fontFamily: 'var(--font-mono)', fontSize: '12px' }}>
          Trạng thái: <span className="text-accent font-bold">CHỜ DUYỆT</span> — Quản trị viên sẽ xem xét và phê duyệt trong thời gian sớm nhất.
        </p>
        <button
          onClick={() => navigate('/')}
          className="bg-foreground text-background px-8 py-3 hover:bg-accent transition-colors"
          style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '13px', letterSpacing: '0.05em' }}
        >
          VỀ TRANG CHỦ
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-8 pb-16">
      <button
        onClick={() => navigate('/auth')}
        className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
        style={{ fontFamily: 'var(--font-mono)', fontSize: '12px' }}
      >
        <ChevronLeft size={14} /> QUAY LẠI
      </button>

      <div className="mb-8">
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', letterSpacing: '0.1em', color: 'var(--muted-foreground)', marginBottom: '4px' }}>
          ─── HỒ SƠ {user.role === 'restaurant' ? 'NHÀ HÀNG' : 'SHIPPER'}
        </p>
        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '36px', lineHeight: 1 }}>
          Tạo Hồ Sơ
        </h1>
        <p className="text-muted-foreground mt-2" style={{ fontFamily: 'var(--font-body)', fontSize: '14px' }}>
          Điền thông tin để quản trị viên xét duyệt tài khoản của bạn.
        </p>
      </div>

      {error && (
        <div className="mb-6 border-2 border-accent bg-accent/10 px-4 py-3 text-sm" style={{ fontFamily: 'var(--font-mono)', fontSize: '12px' }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {user.role === 'restaurant' ? (
          <>
            <div>
              <label className="block mb-1.5" style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', letterSpacing: '0.05em' }}>
                TÊN NHÀ HÀNG *
              </label>
              <input
                type="text"
                value={restaurantName}
                onChange={e => setRestaurantName(e.target.value)}
                placeholder="Phở Hà Nội"
                className="w-full border-2 border-foreground px-3 py-2.5 bg-transparent outline-none focus:border-accent transition-colors"
                style={{ fontFamily: 'var(--font-body)', fontSize: '15px' }}
              />
            </div>
            <div>
              <label className="block mb-1.5" style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', letterSpacing: '0.05em' }}>
                ĐỊA CHỈ *
              </label>
              <input
                type="text"
                value={address}
                onChange={e => setAddress(e.target.value)}
                placeholder="123 Nguyễn Huệ, Q.1, TP.HCM"
                className="w-full border-2 border-foreground px-3 py-2.5 bg-transparent outline-none focus:border-accent transition-colors"
                style={{ fontFamily: 'var(--font-body)', fontSize: '15px' }}
              />
            </div>
            <div>
              <label className="block mb-1.5" style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', letterSpacing: '0.05em' }}>
                LOẠI ẨM THỰC *
              </label>
              <input
                type="text"
                value={cuisine}
                onChange={e => setCuisine(e.target.value)}
                placeholder="Việt Nam, Món Á..."
                className="w-full border-2 border-foreground px-3 py-2.5 bg-transparent outline-none focus:border-accent transition-colors"
                style={{ fontFamily: 'var(--font-body)', fontSize: '15px' }}
              />
            </div>
            <div>
              <label className="block mb-1.5" style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', letterSpacing: '0.05em' }}>
                MÔ TẢ
              </label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Giới thiệu về nhà hàng..."
                rows={3}
                className="w-full border-2 border-foreground px-3 py-2.5 bg-transparent outline-none focus:border-accent transition-colors resize-none"
                style={{ fontFamily: 'var(--font-body)', fontSize: '15px' }}
              />
            </div>
          </>
        ) : (
          <>
            <div>
              <label className="block mb-1.5" style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', letterSpacing: '0.05em' }}>
                HỌ TÊN ĐẦY ĐỦ *
              </label>
              <input
                type="text"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                placeholder="Nguyễn Văn A"
                className="w-full border-2 border-foreground px-3 py-2.5 bg-transparent outline-none focus:border-accent transition-colors"
                style={{ fontFamily: 'var(--font-body)', fontSize: '15px' }}
              />
            </div>
            <div>
              <label className="block mb-1.5" style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', letterSpacing: '0.05em' }}>
                LOẠI PHƯƠNG TIỆN *
              </label>
              <select
                value={vehicleType}
                onChange={e => setVehicleType(e.target.value)}
                className="w-full border-2 border-foreground px-3 py-2.5 bg-transparent outline-none focus:border-accent transition-colors"
                style={{ fontFamily: 'var(--font-body)', fontSize: '15px' }}
              >
                <option value="">Chọn phương tiện</option>
                <option value="Xe máy">Xe máy</option>
                <option value="Xe đạp">Xe đạp</option>
                <option value="Ô tô">Ô tô</option>
              </select>
            </div>
            <div>
              <label className="block mb-1.5" style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', letterSpacing: '0.05em' }}>
                BIỂN SỐ XE *
              </label>
              <input
                type="text"
                value={licensePlate}
                onChange={e => setLicensePlate(e.target.value)}
                placeholder="59A1-12345"
                className="w-full border-2 border-foreground px-3 py-2.5 bg-transparent outline-none focus:border-accent transition-colors"
                style={{ fontFamily: 'var(--font-body)', fontSize: '15px' }}
              />
            </div>
            <div>
              <label className="block mb-1.5" style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', letterSpacing: '0.05em' }}>
                SỐ CMND/CCCD *
              </label>
              <input
                type="text"
                value={idNumber}
                onChange={e => setIdNumber(e.target.value)}
                placeholder="012345678901"
                className="w-full border-2 border-foreground px-3 py-2.5 bg-transparent outline-none focus:border-accent transition-colors"
                style={{ fontFamily: 'var(--font-body)', fontSize: '15px' }}
              />
            </div>
          </>
        )}

        <div className="flex items-start gap-2 border-2 border-dashed border-foreground px-4 py-3">
          <CheckCircle size={16} className="text-muted-foreground shrink-0 mt-0.5" />
          <p className="text-muted-foreground" style={{ fontFamily: 'var(--font-mono)', fontSize: '11px' }}>
            Hồ sơ sẽ ở trạng thái <strong>CHỜ DUYỆT</strong> cho đến khi quản trị viên phê duyệt.
          </p>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-foreground text-background py-3 hover:bg-accent transition-colors disabled:opacity-50"
          style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '13px', letterSpacing: '0.05em' }}
        >
          {isSubmitting ? 'ĐANG GỬI...' : 'GỬI HỒ SƠ'}
        </button>
      </form>
    </div>
  );
}
