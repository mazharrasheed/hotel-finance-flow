const API_BASE = `https://projectsfinanceflow.pythonanywhere.com`;

const handleResponse = async (res: Response) => {
  const contentType = res.headers.get("content-type");

  if (contentType?.includes("application/json")) {
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.detail || data.non_field_errors?.[0] || "Request failed");
    }
    return data;
  }

  if (res.ok) {
    console.warn(`Expected JSON but got ${contentType} from ${res.url}`);
    return null;
  }

  const text = await res.text().catch(() => "");
  throw new Error(`Error ${res.status} from ${res.url}: ${text.slice(0, 200)}`);
};

export const authService = {
  login: async (username: string, password: string) => {
    const res = await fetch(`${API_BASE}/api-token-auth/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    return handleResponse(res);
  },

  getCurrentUser: async (token: string) => {
    if (!token) return null;
    try {
      const res = await fetch(`${API_BASE}/api/current_user/`, {
        headers: { 'Authorization': `Token ${token}` },
      });
      return await handleResponse(res);
    } catch (e) {
      console.warn("getCurrentUser failed:", e);
      return null;
    }
  },

  getPermissions: async (token: string) => {
    if (!token) return {};
    try {
      const res = await fetch(`${API_BASE}/api/users/me/permissions/`, {
        headers: { 'Authorization': `Token ${token}` },
      });
      return await handleResponse(res) || {};
    } catch (e) {
      console.warn("getPermissions failed:", e);
      return {};
    }
  },

  changePassword: async (token: string, data: any) => {
    if (!token) throw new Error("Token required");
    const res = await fetch(`${API_BASE}/change-password/`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Token ${token}`
      },
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  forgotPassword: async (email: string) => {
    const res = await fetch(`${API_BASE}/api/forgot-password/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    return handleResponse(res);
  },

  resetPassword: async (token: string, data: any) => {
    const res = await fetch(`${API_BASE}/api/reset-password/${token}/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  }
};
