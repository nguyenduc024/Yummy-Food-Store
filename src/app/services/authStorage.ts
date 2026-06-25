import { User, RegisterData, RestaurantProfile, ShipperProfile, ProfileStatus, LockRecord } from '../data/authTypes';

export type LoginResult =
  | { status: 'ok'; user: User }
  | { status: 'locked'; reason: string; lockedAt: string }
  | { status: 'invalid' };

const USERS_KEY = 'yummy_users';
const SESSION_KEY = 'yummy_session';

function getUsers(): User[] {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveUsers(users: User[]): void {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function getAllUsers(): User[] {
  return getUsers();
}

export function findUserByPhone(phone: string): User | undefined {
  return getUsers().find(u => u.phone === phone);
}

export function getCurrentUser(): User | null {
  const userId = localStorage.getItem(SESSION_KEY);
  if (!userId) return null;
  return getUsers().find(u => u.id === userId) ?? null;
}

export function setSession(userId: string | null): void {
  if (userId) {
    localStorage.setItem(SESSION_KEY, userId);
  } else {
    localStorage.removeItem(SESSION_KEY);
  }
}

export function registerUser(data: RegisterData): User {
  const users = getUsers();
  const user: User = {
    id: `u_${Date.now()}`,
    phone: data.phone,
    password: data.password,
    name: data.name,
    role: data.role,
    profileStatus: data.role === 'customer' ? 'active' : 'pending',
    address: data.address,
    createdAt: new Date().toISOString(),
  };
  users.push(user);
  saveUsers(users);
  return user;
}

export function loginUser(phone: string, password: string): LoginResult {
  const user = findUserByPhone(phone);
  if (!user || user.password !== password) return { status: 'invalid' };
  if (user.isLocked) {
    const lastLock = user.lockHistory?.filter(r => !r.unlockedAt).at(-1);
    return {
      status: 'locked',
      reason: lastLock?.reason ?? 'Vi phạm điều khoản sử dụng',
      lockedAt: lastLock?.lockedAt ?? user.createdAt,
    };
  }
  setSession(user.id);
  return { status: 'ok', user };
}

export function logoutUser(): void {
  setSession(null);
}

export function updateUserProfile(userId: string, data: { name?: string; address?: string }): User | null {
  const users = getUsers();
  const idx = users.findIndex(u => u.id === userId);
  if (idx === -1) return null;
  users[idx] = { ...users[idx], ...data };
  saveUsers(users);
  return users[idx];
}

export function changePassword(userId: string, oldPassword: string, newPassword: string): { success: boolean; error?: string } {
  const users = getUsers();
  const idx = users.findIndex(u => u.id === userId);
  if (idx === -1) return { success: false, error: 'Không tìm thấy tài khoản' };
  if (users[idx].password !== oldPassword) return { success: false, error: 'Mật khẩu hiện tại không đúng' };
  users[idx] = { ...users[idx], password: newPassword };
  saveUsers(users);
  return { success: true };
}

export function updateRestaurantProfile(userId: string, profile: RestaurantProfile): User | null {
  const users = getUsers();
  const idx = users.findIndex(u => u.id === userId);
  if (idx === -1) return null;
  users[idx] = {
    ...users[idx],
    restaurantProfile: profile,
    profileStatus: 'pending',
  };
  saveUsers(users);
  return users[idx];
}

export function updateShipperProfile(userId: string, profile: ShipperProfile): User | null {
  const users = getUsers();
  const idx = users.findIndex(u => u.id === userId);
  if (idx === -1) return null;
  users[idx] = {
    ...users[idx],
    shipperProfile: profile,
    profileStatus: 'pending',
  };
  saveUsers(users);
  return users[idx];
}

export function updateUserPassword(phone: string, newPassword: string): boolean {
  const users = getUsers();
  const idx = users.findIndex(u => u.phone === phone);
  if (idx === -1) return false;
  users[idx] = { ...users[idx], password: newPassword };
  saveUsers(users);
  return true;
}

export function approveUser(userId: string): { success: boolean } {
  const users = getUsers();
  const idx = users.findIndex(u => u.id === userId);
  if (idx === -1) return { success: false };
  users[idx] = { ...users[idx], profileStatus: 'active', isLocked: false };
  saveUsers(users);
  return { success: true };
}

export function rejectUser(userId: string): { success: boolean } {
  const users = getUsers();
  const idx = users.findIndex(u => u.id === userId);
  if (idx === -1) return { success: false };
  users[idx] = { ...users[idx], profileStatus: 'rejected' };
  saveUsers(users);
  return { success: true };
}

export function lockUser(userId: string, reason: string, adminName: string): { success: boolean } {
  const users = getUsers();
  const idx = users.findIndex(u => u.id === userId);
  if (idx === -1) return { success: false };
  const record: LockRecord = { reason, lockedAt: new Date().toISOString(), lockedByName: adminName };
  const prev = users[idx].lockHistory ?? [];
  users[idx] = { ...users[idx], isLocked: true, lockHistory: [...prev, record] };
  saveUsers(users);
  return { success: true };
}

export function unlockUser(userId: string): { success: boolean } {
  const users = getUsers();
  const idx = users.findIndex(u => u.id === userId);
  if (idx === -1) return { success: false };
  const now = new Date().toISOString();
  const history = (users[idx].lockHistory ?? []).map(r =>
    !r.unlockedAt ? { ...r, unlockedAt: now } : r
  );
  users[idx] = { ...users[idx], isLocked: false, lockHistory: history };
  saveUsers(users);
  return { success: true };
}

export function updateUserByAdmin(userId: string, data: Partial<Pick<User, 'name' | 'phone' | 'profileStatus'>>): { success: boolean; error?: string } {
  const users = getUsers();
  const idx = users.findIndex(u => u.id === userId);
  if (idx === -1) return { success: false, error: 'Không tìm thấy tài khoản' };
  if (data.phone && data.phone !== users[idx].phone) {
    const phoneExists = users.some((u, i) => i !== idx && u.phone === data.phone);
    if (phoneExists) return { success: false, error: 'Số điện thoại đã tồn tại' };
  }
  users[idx] = { ...users[idx], ...data };
  saveUsers(users);
  return { success: true };
}

export function ensureAdminExists(): void {
  const users = getUsers();
  const adminExists = users.some(u => u.role === 'admin');
  if (!adminExists) {
    users.push({
      id: 'admin_001',
      phone: '0000000000',
      password: 'admin123',
      name: 'Quản Trị Viên',
      role: 'admin',
      profileStatus: 'active',
      createdAt: '2024-01-01T00:00:00.000Z',
    });
    saveUsers(users);
  }
}

export function getRoleLabel(role: User['role']): string {
  switch (role) {
    case 'customer': return 'Khách hàng';
    case 'restaurant': return 'Nhà hàng';
    case 'shipper': return 'Shipper';
    case 'admin': return 'Quản trị viên';
  }
}

export function getStatusLabel(status: User['profileStatus']): string {
  switch (status) {
    case 'active': return 'Đã kích hoạt';
    case 'pending': return 'Chờ duyệt';
    case 'rejected': return 'Từ chối';
  }
}
