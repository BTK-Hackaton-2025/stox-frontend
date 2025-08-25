// MockECommerce Product Types
export interface MockECommerceProduct {
  id: string;
  sellerId?: string;
  sellerName?: string;
  categoryId: string;
  categoryName?: string;
  title?: string;
  name?: string; // For read operations
  description: string;
  price: number;
  stock?: number;
  status?: number;
  createdAt?: string;
  updatedAt?: string;
  isActive?: boolean;
  images?: string[];
}

// Marketplace Credentials Types
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

// MockECommerce Auth Types
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

export interface MockECommerceProductsResponse {
  success: boolean;
  data: MockECommerceProduct[];
}

export interface MockECommerceSingleProductResponse {
  success: boolean;
  data: MockECommerceProduct;
}

export interface CreateProductRequest {
  title: string;
  description: string;
  price: number;
  categoryId: string;
}

export interface UpdateProductRequest {
  title: string;
  description: string;
  price: number;
  categoryId: string;
  stock?: number;
}

export interface CreateProductResponse {
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

export interface DeleteProductResponse {
  success: boolean;
  message: string;
}

export interface UpdatedProductResponse {
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

// Marketplace types
export interface MarketplaceInfo {
  id: string;
  name: string;
  logo: string;
  isAvailable: boolean;
  comingSoon?: boolean;
}
