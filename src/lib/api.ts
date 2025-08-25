// API Configuration and HTTP Client Utilities
import type {
  MockECommerceProductsResponse,
  MockECommerceSingleProductResponse,
  CreateProductRequest,
  CreateProductResponse,
  UpdateProductRequest,
  UpdatedProductResponse,
  DeleteProductResponse,
  MarketplaceCredential,
  SaveCredentialRequest,
} from "@/types/products";

const API_BASE_URL =
  process.env.NODE_ENV === "production"
    ? "http://34.88.39.152/api/v1"
    : "/api/v1"; // Use proxy in development

interface ApiError {
  errors?: Array<{
    field: string;
    message: string;
  }>;
  message?: string;
}

interface ApiResponse<T = unknown> {
  success?: boolean;
  message?: string;
  userData?: T;
  tokenData?: {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
    tokenType: string;
  };
  valid?: boolean;
  userId?: string;
  email?: string;
  role?: string;
  exp?: number;
}

interface ApiErrorExtended extends Error {
  status?: number;
  errors?: Array<{
    field: string;
    message: string;
  }>;
}

class ApiClient {
  private baseURL: string;
  private isRefreshing = false;
  private refreshPromise: Promise<boolean> | null = null;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      let errorData: ApiError;
      try {
        errorData = await response.json();
      } catch {
        errorData = { message: "Network error occurred" };
      }

      const error = new Error(
        errorData.message || "API request failed"
      ) as ApiErrorExtended;
      error.status = response.status;
      error.errors = errorData.errors;
      throw error;
    }

    // Handle different content types
    const contentType = response.headers.get("content-type");
    if (contentType?.includes("application/json")) {
      return response.json();
    } else if (contentType?.startsWith("image/")) {
      return response.blob() as T;
    } else {
      return response.text() as T;
    }
  }

  private async refreshTokens(): Promise<boolean> {
    if (this.isRefreshing && this.refreshPromise) {
      return this.refreshPromise;
    }

    this.isRefreshing = true;
    this.refreshPromise = this.performTokenRefresh();

    try {
      const result = await this.refreshPromise;
      return result;
    } finally {
      this.isRefreshing = false;
      this.refreshPromise = null;
    }
  }

  private async performTokenRefresh(): Promise<boolean> {
    try {
      const refreshToken = localStorage.getItem("refreshToken");
      if (!refreshToken) {
        return false;
      }

      const response = await fetch(`${this.baseURL}/auth/refresh`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) {
        return false;
      }

      const data = await response.json();
      if (data.success && data.tokenData) {
        localStorage.setItem("accessToken", data.tokenData.accessToken);
        localStorage.setItem("refreshToken", data.tokenData.refreshToken);
        localStorage.setItem(
          "tokenExpiry",
          (Date.now() + data.tokenData.expiresIn * 1000).toString()
        );
        return true;
      }

      return false;
    } catch {
      return false;
    }
  }

  private async makeRequestWithRetry<T>(
    url: string,
    options: RequestInit,
    retryOnAuth = true
  ): Promise<T> {
    try {
      const response = await fetch(url, options);

      // If we get a 401 and this isn't a refresh request, try to refresh the token
      if (
        response.status === 401 &&
        retryOnAuth &&
        !url.includes("/auth/refresh")
      ) {
        const refreshSuccess = await this.refreshTokens();

        if (refreshSuccess) {
          // Update the authorization header with the new token
          const newToken = localStorage.getItem("accessToken");
          if (newToken && options.headers) {
            (
              options.headers as Record<string, string>
            ).Authorization = `Bearer ${newToken}`;
          }

          // Retry the original request
          const retryResponse = await fetch(url, options);
          return this.handleResponse<T>(retryResponse);
        } else {
          // Only clear tokens if we're sure the refresh failed due to auth issues
          // Network errors shouldn't clear tokens
          console.warn(
            "Token refresh failed in API client, but keeping tokens for potential recovery"
          );
        }
      }

      return this.handleResponse<T>(response);
    } catch (error) {
      throw error;
    }
  }

  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem("accessToken");
    return {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  private getMultipartHeaders(): HeadersInit {
    const token = localStorage.getItem("accessToken");
    return {
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  async get<T = unknown>(
    endpoint: string,
    params?: Record<string, string>
  ): Promise<T> {
    const url = new URL(`${this.baseURL}${endpoint}`);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, value);
      });
    }

    return this.makeRequestWithRetry<T>(url.toString(), {
      method: "GET",
      headers: this.getAuthHeaders(),
    });
  }

  async post<T = unknown>(endpoint: string, data?: unknown): Promise<T> {
    return this.makeRequestWithRetry<T>(`${this.baseURL}${endpoint}`, {
      method: "POST",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });
  }

  async postMultipart<T = unknown>(
    endpoint: string,
    formData: FormData
  ): Promise<T> {
    return this.makeRequestWithRetry<T>(`${this.baseURL}${endpoint}`, {
      method: "POST",
      headers: this.getMultipartHeaders(),
      body: formData,
    });
  }

  async put<T = unknown>(endpoint: string, data?: unknown): Promise<T> {
    return this.makeRequestWithRetry<T>(`${this.baseURL}${endpoint}`, {
      method: "PUT",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });
  }

  async delete<T = unknown>(endpoint: string): Promise<T> {
    return this.makeRequestWithRetry<T>(`${this.baseURL}${endpoint}`, {
      method: "DELETE",
      headers: this.getAuthHeaders(),
    });
  }

  // Health check
  async healthCheck(): Promise<string> {
    const response = await fetch(
      `${this.baseURL.replace("/api/v1", "")}/health`,
      {
        method: "GET",
      }
    );

    if (!response.ok) {
      throw new Error("Health check failed");
    }

    return response.text();
  }

  // MockECommerce Direct API Methods
  async getExternalProducts(): Promise<MockECommerceProductsResponse> {
    // Get saved API key from marketplace credentials
    const credentials = await this.getMarketplaceCredentials();
    const mockECommerceCredential = credentials.find(
      (c) => c.marketplace === "mockecommerce"
    );

    if (!mockECommerceCredential?.apiKey) {
      throw new Error(
        "MockECommerce API key not found. Please configure it in Settings."
      );
    }

    const response = await fetch(
      "https://mock-api.gdgikcu.dev/api/v1/Product/my-products",
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${mockECommerceCredential.apiKey}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error("MockECommerce API request failed");
    }

    return response.json();
  }

  async getExternalProduct(
    id: string
  ): Promise<MockECommerceSingleProductResponse> {
    const credentials = await this.getMarketplaceCredentials();
    const mockECommerceCredential = credentials.find(
      (c) => c.marketplace === "mockecommerce"
    );

    if (!mockECommerceCredential?.apiKey) {
      throw new Error(
        "MockECommerce API key not found. Please configure it in Settings."
      );
    }

    const response = await fetch(
      `https://mock-api.gdgikcu.dev/api/v1/Product/${id}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${mockECommerceCredential.apiKey}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error("MockECommerce API request failed");
    }

    return response.json();
  }

  async createExternalProduct(
    product: CreateProductRequest
  ): Promise<CreateProductResponse> {
    const credentials = await this.getMarketplaceCredentials();
    const mockECommerceCredential = credentials.find(
      (c) => c.marketplace === "mockecommerce"
    );

    if (!mockECommerceCredential?.apiKey) {
      throw new Error(
        "MockECommerce API key not found. Please configure it in Settings."
      );
    }

    const response = await fetch(
      "https://mock-api.gdgikcu.dev/api/v1/Product",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${mockECommerceCredential.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(product),
      }
    );

    if (!response.ok) {
      throw new Error("MockECommerce API request failed");
    }

    return response.json();
  }

  async updateExternalProduct(
    id: string,
    product: UpdateProductRequest
  ): Promise<UpdatedProductResponse> {
    const credentials = await this.getMarketplaceCredentials();
    const mockECommerceCredential = credentials.find(
      (c) => c.marketplace === "mockecommerce"
    );

    if (!mockECommerceCredential?.apiKey) {
      throw new Error(
        "MockECommerce API key not found. Please configure it in Settings."
      );
    }

    const response = await fetch(
      `https://mock-api.gdgikcu.dev/api/v1/Product/${id}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${mockECommerceCredential.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(product),
      }
    );

    if (!response.ok) {
      throw new Error("MockECommerce API request failed");
    }

    return response.json();
  }

  async deleteExternalProduct(id: string): Promise<DeleteProductResponse> {
    const credentials = await this.getMarketplaceCredentials();
    const mockECommerceCredential = credentials.find(
      (c) => c.marketplace === "mockecommerce"
    );

    if (!mockECommerceCredential?.apiKey) {
      throw new Error(
        "MockECommerce API key not found. Please configure it in Settings."
      );
    }

    const response = await fetch(
      `https://mock-api.gdgikcu.dev/api/v1/Product/${id}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${mockECommerceCredential.apiKey}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error("MockECommerce API request failed");
    }

    return response.json();
  }

  // Marketplace Credentials Management
  async getMarketplaceCredentials(): Promise<MarketplaceCredential[]> {
    try {
      return await this.get("/user/marketplace-credentials");
    } catch (error) {
      // If no credentials found, return empty array
      console.warn("No marketplace credentials found");
      return [];
    }
  }

  async saveMarketplaceCredential(
    credential: SaveCredentialRequest
  ): Promise<MarketplaceCredential> {
    return this.post("/user/marketplace-credentials", credential);
  }

  async updateMarketplaceCredential(
    id: string,
    credential: Partial<SaveCredentialRequest>
  ): Promise<MarketplaceCredential> {
    return this.put(`/user/marketplace-credentials/${id}`, credential);
  }

  async deleteMarketplaceCredential(id: string): Promise<void> {
    return this.delete(`/user/marketplace-credentials/${id}`);
  }
}

export const apiClient = new ApiClient();
export type { ApiResponse, ApiError };
