import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { User, RegisterData, RestaurantProfile, ShipperProfile } from '../data/authTypes';
import {
  getCurrentUser,
  setSession,
  findUserByPhone,
  registerUser,
  loginUser as storageLogin,
  logoutUser as storageLogout,
  updateRestaurantProfile,
  updateShipperProfile,
  updateUserProfile,
} from '../services/authStorage';

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  login: (phone: string, password: string) => { success: boolean; error?: string; role?: User['role'] };
  register: (data: RegisterData) => { success: boolean; user?: User; error?: string; phoneExists?: boolean };
  logout: () => void;
  updateProfile: (data: { name?: string; address?: string }) => { success: boolean; error?: string };
  completeRestaurantProfile: (profile: RestaurantProfile) => { success: boolean; error?: string };
  completeShipperProfile: (profile: ShipperProfile) => { success: boolean; error?: string };
  refreshUser: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => getCurrentUser());

  const refreshUser = useCallback(() => {
    setUser(getCurrentUser());
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = (phone: string, password: string) => {
    const result = storageLogin(phone, password);
    if (result.status === 'locked') {
      const d = new Date(result.lockedAt).toLocaleString('vi-VN');
      return { success: false, error: `Tài khoản bị khóa từ ${d}. Lý do: ${result.reason}` };
    }
    if (result.status === 'invalid') {
      return { success: false, error: 'Số điện thoại hoặc mật khẩu không đúng' };
    }
    setUser(result.user);
    return { success: true, role: result.user.role };
  };

  const register = (data: RegisterData) => {
    if (findUserByPhone(data.phone)) {
      return { success: false, phoneExists: true, error: 'Số điện thoại đã được đăng ký. Vui lòng đăng nhập.' };
    }
    const newUser = registerUser(data);
    setSession(newUser.id);
    setUser(newUser);
    return { success: true, user: newUser };
  };

  const logout = () => {
    storageLogout();
    setUser(null);
  };

  const updateProfile = (data: { name?: string; address?: string }) => {
    if (!user) return { success: false, error: 'Chưa đăng nhập' };
    const updated = updateUserProfile(user.id, data);
    if (!updated) return { success: false, error: 'Không thể cập nhật' };
    setUser(updated);
    return { success: true };
  };

  const completeRestaurantProfile = (profile: RestaurantProfile) => {
    if (!user) return { success: false, error: 'Chưa đăng nhập' };
    const updated = updateRestaurantProfile(user.id, profile);
    if (!updated) return { success: false, error: 'Không thể cập nhật hồ sơ' };
    setUser(updated);
    return { success: true };
  };

  const completeShipperProfile = (profile: ShipperProfile) => {
    if (!user) return { success: false, error: 'Chưa đăng nhập' };
    const updated = updateShipperProfile(user.id, profile);
    if (!updated) return { success: false, error: 'Không thể cập nhật hồ sơ' };
    setUser(updated);
    return { success: true };
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        updateProfile,
        completeRestaurantProfile,
        completeShipperProfile,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
