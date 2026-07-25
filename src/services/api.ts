import type { ApiError } from '@/types/api';
import { createClient } from '@/lib/supabase/client';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

interface RequestOptions extends RequestInit {
  params?: Record<string, string>;
}

/**
 * API client with Supabase JWT auth, tenant context, and standardized error handling.
 *
 * Token is sourced from the active Supabase session (not localStorage).
 * Tenant ID is read from the session's profile metadata.
 */
class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private buildUrl(endpoint: string, params?: Record<string, string>): string {
    const url = new URL(`${this.baseUrl}${endpoint}`);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, value);
      });
    }
    return url.toString();
  }

  private async getHeaders(): Promise<HeadersInit> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (typeof window !== 'undefined') {
      try {
        const supabase = await createClient();
        const { data: { session } } = await supabase.auth.getSession();

        if (session?.access_token) {
          headers['Authorization'] = `Bearer ${session.access_token}`;
        }

        // Tenant ID from user metadata or profile (set by AuthProvider)
        const orgId = session?.user?.app_metadata?.organization_id
          ?? session?.user?.user_metadata?.organization_id;
        if (orgId) {
          headers['X-Tenant-ID'] = orgId;
        }
      } catch {
        // Silently fail — unauthenticated requests will get 401 from backend
      }
    }

    return headers;
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const error: ApiError = await response.json().catch(() => ({
        code: 'UNKNOWN_ERROR',
        message: `Request failed with status ${response.status}`,
        statusCode: response.status,
      }));
      throw error;
    }
    return response.json();
  }

  async get<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    const { params, ...rest } = options || {};
    const url = this.buildUrl(endpoint, params);
    const headers = await this.getHeaders();
    const response = await fetch(url, { method: 'GET', headers, ...rest });
    return this.handleResponse<T>(response);
  }

  async post<T>(endpoint: string, body?: unknown, options?: RequestOptions): Promise<T> {
    const { params, ...rest } = options || {};
    const url = this.buildUrl(endpoint, params);
    const headers = await this.getHeaders();
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: body ? JSON.stringify(body) : undefined,
      ...rest,
    });
    return this.handleResponse<T>(response);
  }

  async put<T>(endpoint: string, body?: unknown, options?: RequestOptions): Promise<T> {
    const { params, ...rest } = options || {};
    const url = this.buildUrl(endpoint, params);
    const headers = await this.getHeaders();
    const response = await fetch(url, {
      method: 'PUT',
      headers,
      body: body ? JSON.stringify(body) : undefined,
      ...rest,
    });
    return this.handleResponse<T>(response);
  }

  async patch<T>(endpoint: string, body?: unknown, options?: RequestOptions): Promise<T> {
    const { params, ...rest } = options || {};
    const url = this.buildUrl(endpoint, params);
    const headers = await this.getHeaders();
    const response = await fetch(url, {
      method: 'PATCH',
      headers,
      body: body ? JSON.stringify(body) : undefined,
      ...rest,
    });
    return this.handleResponse<T>(response);
  }

  async delete<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    const { params, ...rest } = options || {};
    const url = this.buildUrl(endpoint, params);
    const headers = await this.getHeaders();
    const response = await fetch(url, { method: 'DELETE', headers, ...rest });
    return this.handleResponse<T>(response);
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
