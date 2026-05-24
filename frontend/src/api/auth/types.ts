export interface LoginCredentials {
  username: string;
  password: string;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

export interface OwnerProfile {
  firstName: string;
  lastName: string;
}

export interface UpdateOwnerProfilePayload {
  firstName: string;
  lastName: string;
}

export interface LoginResponse {
  token: string;
  expiresAt: string;
  user: { id: number; username: string };
  hasShop: boolean;
}

export interface ShopSignupRequestPayload {
  name: string;
  phone: string;
  email: string;
  shopName: string;
  city: string;
}
