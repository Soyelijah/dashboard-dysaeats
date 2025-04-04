export enum Role {
  ADMIN = 'admin',
  RESTAURANT = 'restaurant',
  DELIVERY = 'delivery',
  CUSTOMER = 'customer'
}

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  PENDING = 'pending',
  SUSPENDED = 'suspended',
  AVAILABLE = 'available',
  BUSY = 'busy'
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
  status: UserStatus;
  phone?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DeliveryPerson extends User {
  role: Role.DELIVERY;
  status: UserStatus;
  currentLocation?: {
    latitude: number;
    longitude: number;
  };
  ratings?: {
    average: number;
    count: number;
  };
  activeOrder?: {
    id: string;
    orderNumber: string;
  };
}

export interface RestaurantOwner extends User {
  role: Role.RESTAURANT;
  restaurant?: {
    id: string;
    name: string;
  };
}