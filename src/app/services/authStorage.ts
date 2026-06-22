import { User, RegisterData, RestaurantProfile, ShipperProfile } from '../data/authTypes';

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
    createdAt: new Date().toISOString(),
  };
  users.push(user);
  saveUsers(users);
  return user;
}

export function loginUser(phone: string, password: string): User | null {
  const user = findUserByPhone(phone);
  if (!user || user.password !== password) return null;
  setSession(user.id);
  return user;
}

export function logoutUser(): void {
  setSession(null);
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

export function getRoleLabel(role: User['role']): string {
  switch (role) {
    case 'customer': return 'Khách hàng';
    case 'restaurant': return 'Nhà hàng';
    case 'shipper': return 'Shipper';
  }
}

export function getStatusLabel(status: User['profileStatus']): string {
  switch (status) {
    case 'active': return 'Đã kích hoạt';
    case 'pending': return 'Chờ duyệt';
    case 'rejected': return 'Từ chối';
  }
}
