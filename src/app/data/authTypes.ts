export type UserRole = 'customer' | 'restaurant' | 'shipper' | 'admin';

export type ProfileStatus = 'active' | 'pending' | 'rejected';

export interface RestaurantProfile {
  restaurantName: string;
  address: string;
  cuisine: string;
  description: string;
}

export interface ShipperProfile {
  fullName: string;
  vehicleType: string;
  licensePlate: string;
  idNumber: string;
}

export interface LockRecord {
  reason: string;
  lockedAt: string;
  lockedByName: string;
  unlockedAt?: string;
}

export interface User {
  id: string;
  phone: string;
  password: string;
  name: string;
  role: UserRole;
  profileStatus: ProfileStatus;
  address?: string;
  restaurantProfile?: RestaurantProfile;
  shipperProfile?: ShipperProfile;
  createdAt: string;
  isLocked?: boolean;
  lockHistory?: LockRecord[];
}

export interface RegisterData {
  phone: string;
  password: string;
  name: string;
  role: UserRole;
  address?: string;
}

// ─── Order ─────────────────────────────────────────────────────────────────────

export type OrderStatus =
  | 'pending'               // Chờ xác nhận
  | 'confirmed'             // Đã xác nhận / Đang chuẩn bị
  | 'finding_driver'        // Đang tìm tài xế
  | 'waiting_pickup'        // Chờ tài xế lấy món
  | 'delivering'            // Đang giao
  | 'completed'             // Hoàn thành
  | 'cancelled_restaurant'  // Đã hủy bởi Nhà hàng
  | 'cancelled_customer'    // Đã hủy bởi Khách hàng
  | 'cancelled_failed';     // Đã hủy (giao thất bại)

export interface OrderItem {
  dishId: string;
  dishName: string;
  price: number;
  quantity: number;
  note?: string;
}

export interface Order {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  restaurantId: string;
  restaurantName: string;
  shipperId?: string;
  shipperName?: string;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  status: OrderStatus;
  address: string;
  note?: string;
  createdAt: string;
  updatedAt: string;
  cancelReason?: string;
}

// ─── Review ────────────────────────────────────────────────────────────────────

export interface Review {
  id: string;
  orderId: string;
  customerId: string;
  customerName: string;
  restaurantId?: string;
  shipperId?: string;
  stars: number;
  content: string;
  createdAt: string;
  isHidden?: boolean;
  hiddenReason?: string;
  reportedBy?: string[];
  reportReasons?: string[];
}

// ─── Support Ticket ────────────────────────────────────────────────────────────

export interface SupportTicket {
  id: string;
  customerId: string;
  customerName: string;
  orderId?: string;
  title: string;
  description: string;
  status: 'open' | 'in_progress' | 'resolved';
  createdAt: string;
  updatedAt: string;
  resolution?: string;
}

// ─── System Config ─────────────────────────────────────────────────────────────

export interface SystemConfig {
  serviceFeePercent: number;
  deliveryFeePerKm: number;
  discountPercent: number;
  updatedAt: string;
  updatedBy: string;
}

// ─── Menu ──────────────────────────────────────────────────────────────────────

export interface MenuItemData {
  id: string;
  restaurantId: string;
  name: string;
  price: number;
  description: string;
  category: string;
  isAvailable: boolean;
  isHidden: boolean;
  createdAt: string;
}
