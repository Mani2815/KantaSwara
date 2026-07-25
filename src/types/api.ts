/** Generic API response wrapper */
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

/** Paginated API response */
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/** API error response */
export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, string[]>;
  statusCode: number;
}

/** Query parameters for list endpoints */
export interface ListQueryParams {
  page?: number;
  pageSize?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  status?: string;
  dateFrom?: string;
  dateTo?: string;
}

/** Tenant context */
export interface Tenant {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  primaryColor: string | null;
  plan: 'starter' | 'professional' | 'enterprise';
  isActive: boolean;
}

/** User */
export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  role: string;
  tenantId: string;
  permissions: string[];
  createdAt: string;
}
