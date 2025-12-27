const API_URL = 'http://localhost:3000/api';

function getToken(): string {
  return localStorage.getItem('token') || '';
}

async function handleResponse<T>(res: Response): Promise<T> {
  let body: any;
  try {
    body = await res.json();
  } catch {
    body = null;
  }

  if (!res.ok) {
    const message = body?.message || body?.error || `HTTP ${res.status}`;
    throw new Error(message);
  }

  return body;
}

export const api = {
  login: async (login: string, password: string) => {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ login, password }),
    });
    return handleResponse(res);
  },

  register: async (login: string, password: string, fio: string, phone: string, role: string) => {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ login, password, fio, phone, role }),
    });
    return handleResponse(res);
  },

  getRequests: async () => {
    const token = getToken();
    const res = await fetch(`${API_URL}/repair-requests`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return handleResponse(res);
  },

  getRequestById: async (id: number) => {
    const token = getToken();
    const res = await fetch(`${API_URL}/repair-requests/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return handleResponse(res);
  },

  createRequest: async (data: { climateTechType: string; description: string }) => {
    const token = getToken();
    const res = await fetch(`${API_URL}/repair-requests`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  updateRequestStatus: async (id: number, status: string) => {
    const token = getToken();
    const res = await fetch(`${API_URL}/repair-requests/${id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status }),
    });
    return handleResponse(res);
  },

  assignRequest: async (id: number, specialistId: number) => {
    const token = getToken();
    const res = await fetch(`${API_URL}/repair-requests/${id}/assign/${specialistId}`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}` },
    });
    return handleResponse(res);
  },

  getSpecialists: async () => {
    const token = getToken();
    const res = await fetch(`${API_URL}/users/specialists`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return handleResponse(res);
  },
};