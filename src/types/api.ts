// Auth types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}

// MockECommerce types
export interface MockECommerceProduct {
  id: string;
  name?: string;
  title?: string;
  description: string;
  price: number;
  categoryId: string;
  sellerId?: string;
  sellerName?: string;
  categoryName?: string;
  stock?: number;
  status?: number;
  createdAt?: string;
  updatedAt?: string;
  isActive?: boolean;
}

export interface MockECommerceProductsResponse {
  success: boolean;
  data: MockECommerceProduct[];
}

export interface MockECommerceSingleProductResponse {
  success: boolean;
  data: MockECommerceProduct;
}

export interface MockECommerceCreateProductRequest {
  title: string;
  description: string;
  price: number;
  categoryId: string;
}

export interface MockECommerceUpdateProductRequest {
  title: string;
  description: string;
  price: number;
  categoryId: string;
  stock?: number;
}

export interface MockECommerceCreateProductResponse {
  success: boolean;
  data: {
    id: string;
    sellerId: string;
    sellerName: string;
    categoryId: string;
    title: string;
    description: string;
    price: number;
    stock: number;
    status: number;
    createdAt: string;
    updatedAt: string;
    isActive: boolean;
  };
}

export interface MockECommerceUpdateProductResponse {
  id: string;
  sellerId: string;
  sellerName: string;
  categoryId: string;
  categoryName: string;
  title: string;
  description: string;
  price: number;
  stock: number;
  status: number;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
}

export interface MockECommerceDeleteResponse {
  success: boolean;
  message: string;
}

// Marketplace Credentials types
export interface MarketplaceCredential {
  id: string;
  marketplace: string;
  apiKey: string;
  secretKey?: string;
  additionalFields?: Record<string, string>;
  status: "active" | "inactive" | "error";
  lastSync?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface SaveCredentialRequest {
  marketplace: string;
  apiKey: string;
  secretKey?: string;
  additionalFields?: Record<string, string>;
}

// MockECommerce Auth types
export interface MockECommerceLoginRequest {
  email: string;
  password: string;
}

export interface MockECommerceLoginResponse {
  isAuthenticated: boolean;
  token: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  message: string;
}

export interface MockECommerceApiKey {
  id: string;
  name: string;
  apiKey: string;
  isActive: boolean;
  createdAt: string;
  lastUsedAt: string | null;
  expiresAt: string;
  description: string;
  requestsPerMinute: number;
  requestsPerDay: number;
}
