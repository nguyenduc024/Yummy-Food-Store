export type UserRole = 'customer' | 'restaurant' | 'shipper';

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

export interface User {
  id: string;
  phone: string;
  password: string;
  name: string;
  role: UserRole;
  profileStatus: ProfileStatus;
  restaurantProfile?: RestaurantProfile;
  shipperProfile?: ShipperProfile;
  createdAt: string;
}

export interface RegisterData {
  phone: string;
  password: string;
  name: string;
  role: UserRole;
}
