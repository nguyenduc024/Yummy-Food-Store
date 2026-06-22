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
} from '../services/authStorage';

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  login: (phone: string, password: string) => { success: boolean; error?: string };
  register: (data: RegisterData) => { success: boolean; user?: User; error?: string; phoneExists?: boolean };
  logout: () => void;
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
    const loggedIn = storageLogin(phone, password);
    if (!loggedIn) {
      return { success: false, error: 'Số điện thoại hoặc mật khẩu không đúng' };
    }
    setUser(loggedIn);
    return { success: true };
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
