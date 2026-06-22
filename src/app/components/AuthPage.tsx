import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { ChevronLeft, User, Store, Truck, Eye, EyeOff } from 'lucide-react';
import { useAuth } from './AuthContext';
import { UserRole } from '../data/authTypes';
import { validatePhone, formatPhoneInput } from '../utils/phoneValidation';

type AuthStep = 'welcome' | 'login' | 'register-role' | 'register-form';

const ROLES: { role: UserRole; label: string; desc: string; icon: typeof User }[] = [
  { role: 'customer', label: 'Khách hàng', desc: 'Đặt món, theo dõi đơn hàng', icon: User },
  { role: 'restaurant', label: 'Nhà hàng', desc: 'Quản lý menu và đơn hàng', icon: Store },
  { role: 'shipper', label: 'Shipper', desc: 'Nhận và giao đơn hàng', icon: Truck },
];

export function AuthPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login, register } = useAuth();

  const initialStep = searchParams.get('mode') === 'login' ? 'login' : 'welcome';
  const prefillPhone = searchParams.get('phone') ?? '';

  const [step, setStep] = useState<AuthStep>(initialStep);
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [phone, setPhone] = useState(prefillPhone);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePhoneChange = (value: string) => {
    setPhone(formatPhoneInput(value));
    setError('');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const phoneCheck = validatePhone(phone);
    if (!phoneCheck.valid) {
      setError(phoneCheck.error!);
      return;
    }

    if (!password) {
      setError('Vui lòng nhập mật khẩu');
      return;
    }

    setIsSubmitting(true);
    const result = login(phone, password);
    setIsSubmitting(false);

    if (!result.success) {
      setError(result.error!);
      return;
    }

    navigate('/');
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!selectedRole) {
      setError('Vui lòng chọn vai trò');
      return;
    }

    const phoneCheck = validatePhone(phone);
    if (!phoneCheck.valid) {
      setError(phoneCheck.error!);
      return;
    }

    if (!name.trim()) {
      setError('Vui lòng nhập họ tên');
      return;
    }

    if (password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }

    if (password !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      return;
    }

    setIsSubmitting(true);
    const result = register({
      phone,
      password,
      name: name.trim(),
      role: selectedRole,
    });
    setIsSubmitting(false);

    if (result.phoneExists) {
      setStep('login');
      setError('Số điện thoại đã được đăng ký. Vui lòng đăng nhập.');
      return;
    }

    if (!result.success) {
      setError(result.error!);
      return;
    }

    if (selectedRole === 'customer') {
      navigate('/');
    } else {
      navigate('/auth/profile-setup');
    }
  };

  const goBack = () => {
    setError('');
    if (step === 'register-form') setStep('register-role');
    else if (step === 'register-role' || step === 'login') setStep('welcome');
    else navigate(-1);
  };

  return (
    <div className="max-w-lg mx-auto px-4 py-8 pb-16">
      <button
        onClick={goBack}
        className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
        style={{ fontFamily: 'var(--font-mono)', fontSize: '12px' }}
      >
        <ChevronLeft size={14} /> QUAY LẠI
      </button>

      <div className="mb-8">
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', letterSpacing: '0.1em', color: 'var(--muted-foreground)', marginBottom: '4px' }}>
          ─── TÀI KHOẢN
        </p>
        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '36px', lineHeight: 1 }}>
          {step === 'welcome' && 'Xin Chào!'}
          {step === 'login' && 'Đăng Nhập'}
          {step === 'register-role' && 'Chọn Vai Trò'}
          {step === 'register-form' && 'Đăng Ký'}
        </h1>
      </div>

      {error && (
        <div className="mb-6 border-2 border-accent bg-accent/10 px-4 py-3 text-sm" style={{ fontFamily: 'var(--font-mono)', fontSize: '12px' }}>
          {error}
        </div>
      )}

      {step === 'welcome' && (
        <div className="space-y-4">
          <p className="text-muted-foreground mb-6" style={{ fontFamily: 'var(--font-body)', fontSize: '15px' }}>
            Đăng ký hoặc đăng nhập để đặt món, quản lý nhà hàng hoặc giao hàng.
          </p>
          <button
            onClick={() => { setStep('register-role'); setError(''); }}
            className="w-full bg-foreground text-background py-3 hover:bg-accent transition-colors"
            style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '13px', letterSpacing: '0.05em' }}
          >
            ĐĂNG KÝ TÀI KHOẢN
          </button>
          <button
            onClick={() => { setStep('login'); setError(''); }}
            className="w-full border-2 border-foreground py-3 hover:bg-foreground hover:text-background transition-colors"
            style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '13px', letterSpacing: '0.05em' }}
          >
            ĐĂNG NHẬP
          </button>
        </div>
      )}

      {step === 'login' && (
        <form onSubmit={handleLogin} className="space-y-4">
          {prefillPhone && (
            <div className="border-2 border-foreground bg-secondary px-4 py-3 text-sm" style={{ fontFamily: 'var(--font-mono)', fontSize: '12px' }}>
              Số điện thoại này đã được đăng ký. Vui lòng đăng nhập.
            </div>
          )}

          <div>
            <label className="block mb-1.5" style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', letterSpacing: '0.05em' }}>
              SỐ ĐIỆN THOẠI
            </label>
            <input
              type="tel"
              inputMode="numeric"
              value={phone}
              onChange={e => handlePhoneChange(e.target.value)}
              placeholder="0912345678"
              className="w-full border-2 border-foreground px-3 py-2.5 bg-transparent outline-none focus:border-accent transition-colors"
              style={{ fontFamily: 'var(--font-body)', fontSize: '15px' }}
            />
            <p className="mt-1 text-muted-foreground" style={{ fontFamily: 'var(--font-mono)', fontSize: '10px' }}>
              10 chữ số, không chứa ký tự khác
            </p>
          </div>

          <div>
            <label className="block mb-1.5" style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', letterSpacing: '0.05em' }}>
              MẬT KHẨU
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••"
                className="w-full border-2 border-foreground px-3 py-2.5 bg-transparent outline-none focus:border-accent transition-colors pr-10"
                style={{ fontFamily: 'var(--font-body)', fontSize: '15px' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-foreground text-background py-3 hover:bg-accent transition-colors disabled:opacity-50"
            style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '13px', letterSpacing: '0.05em' }}
          >
            {isSubmitting ? 'ĐANG XỬ LÝ...' : 'ĐĂNG NHẬP'}
          </button>

          <p className="text-center text-muted-foreground" style={{ fontFamily: 'var(--font-mono)', fontSize: '12px' }}>
            Chưa có tài khoản?{' '}
            <button type="button" onClick={() => { setStep('register-role'); setError(''); }} className="text-accent hover:underline">
              Đăng ký ngay
            </button>
          </p>
        </form>
      )}

      {step === 'register-role' && (
        <div className="space-y-3">
          <p className="text-muted-foreground mb-4" style={{ fontFamily: 'var(--font-body)', fontSize: '14px' }}>
            Bạn muốn sử dụng YUMMY với vai trò nào?
          </p>
          {ROLES.map(({ role, label, desc, icon: Icon }) => (
            <button
              key={role}
              onClick={() => { setSelectedRole(role); setStep('register-form'); setError(''); }}
              className={`w-full flex items-center gap-4 border-2 p-4 text-left transition-all hover:bg-foreground hover:text-background group ${
                selectedRole === role ? 'border-accent bg-accent/5' : 'border-foreground'
              }`}
            >
              <div className="w-12 h-12 border-2 border-current flex items-center justify-center shrink-0">
                <Icon size={22} />
              </div>
              <div>
                <p style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '13px', letterSpacing: '0.05em' }}>{label}</p>
                <p className="text-muted-foreground group-hover:text-background/70" style={{ fontFamily: 'var(--font-body)', fontSize: '13px' }}>{desc}</p>
              </div>
            </button>
          ))}
        </div>
      )}

      {step === 'register-form' && (
        <form onSubmit={handleRegister} className="space-y-4">
          <div className="flex gap-2">
            <div className="flex-1 border-2 border-foreground px-3 py-2 bg-secondary" style={{ fontFamily: 'var(--font-mono)', fontSize: '12px' }}>
              Vai trò: <strong>{ROLES.find(r => r.role === selectedRole)?.label}</strong>
            </div>
            <button
              type="button"
              onClick={() => setStep('register-role')}
              className="shrink-0 border-2 border-foreground px-3 py-2 bg-secondary hover:bg-foreground hover:text-background transition-colors"
              style={{ fontFamily: 'var(--font-mono)', fontSize: '12px' }}
            >
              Đổi
            </button>
          </div>

          <div>
            <label className="block mb-1.5" style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', letterSpacing: '0.05em' }}>
              HỌ TÊN
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Nguyễn Văn A"
              className="w-full border-2 border-foreground px-3 py-2.5 bg-transparent outline-none focus:border-accent transition-colors"
              style={{ fontFamily: 'var(--font-body)', fontSize: '15px' }}
            />
          </div>

          <div>
            <label className="block mb-1.5" style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', letterSpacing: '0.05em' }}>
              SỐ ĐIỆN THOẠI
            </label>
            <input
              type="tel"
              inputMode="numeric"
              value={phone}
              onChange={e => handlePhoneChange(e.target.value)}
              placeholder="0912345678"
              className="w-full border-2 border-foreground px-3 py-2.5 bg-transparent outline-none focus:border-accent transition-colors"
              style={{ fontFamily: 'var(--font-body)', fontSize: '15px' }}
            />
            <p className="mt-1 text-muted-foreground" style={{ fontFamily: 'var(--font-mono)', fontSize: '10px' }}>
              10 chữ số, không chứa ký tự khác
            </p>
          </div>

          <div>
            <label className="block mb-1.5" style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', letterSpacing: '0.05em' }}>
              MẬT KHẨU
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Tối thiểu 6 ký tự"
              className="w-full border-2 border-foreground px-3 py-2.5 bg-transparent outline-none focus:border-accent transition-colors"
              style={{ fontFamily: 'var(--font-body)', fontSize: '15px' }}
            />
          </div>

          <div>
            <label className="block mb-1.5" style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', letterSpacing: '0.05em' }}>
              XÁC NHẬN MẬT KHẨU
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              placeholder="Nhập lại mật khẩu"
              className="w-full border-2 border-foreground px-3 py-2.5 bg-transparent outline-none focus:border-accent transition-colors"
              style={{ fontFamily: 'var(--font-body)', fontSize: '15px' }}
            />
          </div>

          {selectedRole !== 'customer' && (
            <div className="border-2 border-dashed border-foreground px-4 py-3 text-sm" style={{ fontFamily: 'var(--font-mono)', fontSize: '11px' }}>
              Sau khi đăng ký, bạn sẽ cần tạo hồ sơ và chờ quản trị viên phê duyệt.
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-foreground text-background py-3 hover:bg-accent transition-colors disabled:opacity-50"
            style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '13px', letterSpacing: '0.05em' }}
          >
            {isSubmitting ? 'ĐANG XỬ LÝ...' : 'TIẾP TỤC'}
          </button>
        </form>
      )}
    </div>
  );
}
