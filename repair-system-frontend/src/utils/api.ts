// src/utils/api.ts

const API_BASE = 'http://localhost:3000/api';

/** Универсальный формат ответа клиента */
export interface ApiResult<T = any> {
  data: T | null;
  error: string | null;
  status: number;
}

/** Типы для auth-ответов бэка */
export interface BackendAuthUser {
  id: number;
  fio: string;
  login: string;
  role: 'Manager' | 'Specialist' | 'Operator' | 'Customer' | 'QualityManager';
  phone?: string;
}

export interface BackendLoginResponse {
  token: string;
  user: BackendAuthUser;
}

class ApiClient {
  private baseUrl = API_BASE;

  private getToken(): string | null {
    const token = localStorage.getItem('authToken');
    return token || null;
  }

  private buildHeaders(extra?: HeadersInit): HeadersInit {
    const token = this.getToken();
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(extra || {}),
    };

    if (token) {
      (headers as any)['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  async request<T = any>(endpoint: string, options: RequestInit = {}): Promise<ApiResult<T>> {
    const url = `${this.baseUrl}${endpoint}`;

    try {
      const response = await fetch(url, {
        ...options,
        headers: this.buildHeaders(options.headers || {}),
      });

      const text = await response.text();
      let json: any;
      try {
        json = text ? JSON.parse(text) : {};
      } catch {
        json = { message: text };
      }

      if (response.status === 401) {
        localStorage.removeItem('authToken');
        return { data: null, error: 'Unauthorized', status: 401 };
      }

      if (!response.ok) {
        const msg = json.message || json.error || `Error ${response.status}`;
        return { data: null, error: msg, status: response.status };
      }

      return { data: json as T, error: null, status: response.status };
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Network error';
      return { data: null, error: msg, status: 0 };
    }
  }

  // ---------- AUTH ----------

  login(login: string, password: string) {
    return this.request<BackendLoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ login, password }),
    });
  }

  register(fio: string, login: string, password: string, phone: string, role: string) {
    return this.request<BackendLoginResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ fio, login, password, phone, role }),
    });
  }

  verifyAuth() {
    return this.request<BackendAuthUser>('/auth/me', {
      method: 'GET',
    });
  }

  // ---------- REQUESTS ----------

  getRequests() {
    return this.request<any[]>('/repair-requests', {
      method: 'GET',
    });
  }

  createRequest(climateTechType: string, description: string) {
    return this.request('/repair-requests', {
      method: 'POST',
      body: JSON.stringify({ climateTechType, description }),
    });
  }

  updateRequest(id: number, dto: { climateTechType?: string; description?: string; requestStatus?: string }) {
    return this.request(`/repair-requests/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(dto),
    });
  }

  deleteRequest(id: number) {
    return this.request(`/repair-requests/${id}`, {
      method: 'DELETE',
    });
  }

  assignMaster(id: number, masterId: number) {
    return this.request(`/repair-requests/${id}/assign/${masterId}`, {
      method: 'PATCH',
      body: JSON.stringify({}),
    });
  }

  // ---------- FEEDBACK ----------

  getFeedbacks() {
    // у тебя нет общего списка, оставим заглушку, чтобы не падало
    return this.request<any[]>('/repair-requests/1/feedback', {
      method: 'GET',
    });
  }

  addFeedback(requestId: number, rating: number, comment: string, client_name: string) {
    return this.request(`/repair-requests/${requestId}/feedback`, {
      method: 'POST',
      body: JSON.stringify({ rating, comment, client_name }),
    });
  }

  // ---------- USERS ----------

  getUsers() {
    return this.request<any[]>('/users', {
      method: 'GET',
    });
  }
}

export const apiClient = new ApiClient();
