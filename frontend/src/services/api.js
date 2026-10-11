const API_BASE = '/api';

function getAuthHeader() {
  const token = localStorage.getItem('litterhero_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function handleResponse(response) {
  if (!response.ok) {
    let errorMsg = 'An error occurred';
    try {
      const data = await response.json();
      errorMsg = data.error || errorMsg;
    } catch (_) {
      errorMsg = response.statusText || errorMsg;
    }
    const error = new Error(errorMsg);
    error.status = response.status;
    throw error;
  }
  return response.json();
}

export const api = {
  async getStatus() {
    const res = await fetch(`${API_BASE}/status`);
    return handleResponse(res);
  },

  async login(email, password) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    return handleResponse(res);
  },

  async register(email, password, name) {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name })
    });
    return handleResponse(res);
  },

  async getMe() {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: { ...getAuthHeader() }
    });
    return handleResponse(res);
  },

  async getReports() {
    const res = await fetch(`${API_BASE}/reports`);
    return handleResponse(res);
  },

  async createReport(reportData) {
    const res = await fetch(`${API_BASE}/reports`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      },
      body: JSON.stringify(reportData)
    });
    return handleResponse(res);
  },

  async getMissions(filters = {}) {
    const params = new URLSearchParams();
    if (filters.status && filters.status !== 'ALL') params.append('status', filters.status);
    if (filters.category && filters.category !== 'ALL') params.append('category', filters.category);
    if (filters.severity && filters.severity !== 'ALL') params.append('severity', filters.severity);
    if (filters.search) params.append('search', filters.search);

    const query = params.toString() ? `?${params.toString()}` : '';
    const res = await fetch(`${API_BASE}/missions${query}`);
    return handleResponse(res);
  },

  async getMission(id) {
    const res = await fetch(`${API_BASE}/missions/${id}`);
    return handleResponse(res);
  },

  async claimMission(id) {
    const res = await fetch(`${API_BASE}/missions/${id}/claim`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      }
    });
    return handleResponse(res);
  },

  async submitEvidence(id, evidenceData) {
    const res = await fetch(`${API_BASE}/missions/${id}/evidence`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      },
      body: JSON.stringify(evidenceData)
    });
    return handleResponse(res);
  },

  // Admin Verification Portal
  async getAdminReviews() {
    const res = await fetch(`${API_BASE}/admin/reviews`, {
      headers: { ...getAuthHeader() }
    });
    return handleResponse(res);
  },

  async reviewEvidence(id, { decision, rejectionReason, notes }) {
    const res = await fetch(`${API_BASE}/admin/missions/${id}/review`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      },
      body: JSON.stringify({ decision, rejectionReason, notes })
    });
    return handleResponse(res);
  },

  async getAuditLogs() {
    const res = await fetch(`${API_BASE}/admin/audit-logs`, {
      headers: { ...getAuthHeader() }
    });
    return handleResponse(res);
  },

  async getLeaderboard() {
    const res = await fetch(`${API_BASE}/leaderboard`);
    return handleResponse(res);
  },

  async getImpact() {
    const res = await fetch(`${API_BASE}/impact`);
    return handleResponse(res);
  },

  async uploadImage(file) {
    const formData = new FormData();
    formData.append('image', file);

    const res = await fetch(`${API_BASE}/upload`, {
      method: 'POST',
      headers: { ...getAuthHeader() },
      body: formData
    });
    return handleResponse(res);
  }
};
