// Dynamic API Base URL supporting Vite Environment Variable (Day 48 Production Ready)
export const API_BASE =
  ((import.meta as any).env?.VITE_API_BASE_URL as string) ||
  'http://localhost:8000';

let authToken: string | null = null;

export function setAuthToken(token: string | null) {
  authToken = token;
}

export function getAuthToken(): string | null {
  return authToken;
}

function getHeaders(customHeaders?: Record<string, string>): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...customHeaders,
  };
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }
  return headers;
}

async function extractErrorMessage(res: Response, fallback: string): Promise<string> {
  try {
    const data = await res.json();
    if (data && data.detail) {
      if (typeof data.detail === 'string') return data.detail;
      if (Array.isArray(data.detail)) {
        return data.detail.map((d: any) => d.msg || JSON.stringify(d)).join(', ');
      }
    }
    if (data && data.message) return data.message;
  } catch {
    // If response is not JSON
  }
  return `${fallback} (HTTP ${res.status})`;
}

export async function checkBackendHealth(): Promise<{ online: boolean; info?: any }> {
  try {
    const res = await fetch(`${API_BASE}/health`, { method: 'GET' });
    if (res.ok) {
      const data = await res.json();
      return { online: true, info: data };
    }
    return { online: false };
  } catch {
    return { online: false };
  }
}

export async function predictApi(data: {
  subject?: string;
  name?: string;
  kind?: string;
  type?: string;
  amount: number;
  income: number;
  credit_score?: number;
  credit?: number;
  employment?: string;
  channel?: string;
  term_months?: number;
}) {
  const res = await fetch(`${API_BASE}/predict`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await extractErrorMessage(res, 'Risk prediction failed');
    throw new Error(err);
  }
  return res.json();
}

export async function loginApi(email: string, password: string) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const err = await extractErrorMessage(res, 'Login failed');
    throw new Error(err);
  }
  const data = await res.json();
  if (data.access_token) {
    setAuthToken(data.access_token);
  }
  return data;
}

export async function registerApi(
  name: string,
  email: string,
  password: string,
  role: string = 'Analyst'
) {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password, role }),
  });
  if (!res.ok) {
    const err = await extractErrorMessage(res, 'Registration failed');
    throw new Error(err);
  }
  const data = await res.json();
  if (data.access_token) {
    setAuthToken(data.access_token);
  }
  return data;
}

export async function logoutApi() {
  try {
    const res = await fetch(`${API_BASE}/auth/logout`, {
      method: 'POST',
      headers: getHeaders(),
    });
    setAuthToken(null);
    if (!res.ok) {
      return { message: 'Logged out' };
    }
    return res.json();
  } catch {
    setAuthToken(null);
    return { message: 'Logged out' };
  }
}

export async function fetchAssessmentsApi() {
  const res = await fetch(`${API_BASE}/assessments`, {
    headers: getHeaders(),
  });
  if (!res.ok) {
    const err = await extractErrorMessage(res, 'Failed to fetch assessments');
    throw new Error(err);
  }
  return res.json();
}

export async function createAssessmentApi(data: {
  subject: string;
  kind: string;
  amount: number;
  income: number;
  credit_score: number;
  employment: string;
  channel: string;
  term_months?: number;
}) {
  const res = await fetch(`${API_BASE}/assessments`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await extractErrorMessage(res, 'Failed to run ML risk assessment');
    throw new Error(err);
  }
  return res.json();
}

export async function updateAssessmentApi(
  id: string,
  data: {
    subject?: string;
    amount?: number;
    income?: number;
    credit_score?: number;
    employment?: string;
    channel?: string;
    term_months?: number;
  }
) {
  const res = await fetch(`${API_BASE}/assessments/${id}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await extractErrorMessage(res, 'Failed to update & rescore assessment');
    throw new Error(err);
  }
  return res.json();
}

export async function deleteAssessmentApi(id: string) {
  const res = await fetch(`${API_BASE}/assessments/${id}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });
  if (!res.ok) {
    const err = await extractErrorMessage(res, 'Failed to delete assessment');
    throw new Error(err);
  }
  return res.json();
}

export async function fetchTeamApi() {
  const res = await fetch(`${API_BASE}/team`, {
    headers: getHeaders(),
  });
  if (!res.ok) {
    const err = await extractErrorMessage(res, 'Failed to fetch team members');
    throw new Error(err);
  }
  return res.json();
}

export async function createTeamMemberApi(data: {
  name: string;
  email: string;
  role: string;
  status?: string;
}) {
  const res = await fetch(`${API_BASE}/team`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await extractErrorMessage(res, 'Failed to create team member');
    throw new Error(err);
  }
  return res.json();
}

export async function updateTeamMemberApi(
  id: string,
  data: {
    name?: string;
    email?: string;
    role?: string;
    status?: string;
  }
) {
  const res = await fetch(`${API_BASE}/team/${id}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await extractErrorMessage(res, 'Failed to update team member');
    throw new Error(err);
  }
  return res.json();
}

export async function deleteTeamMemberApi(id: string) {
  const res = await fetch(`${API_BASE}/team/${id}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });
  if (!res.ok) {
    const err = await extractErrorMessage(res, 'Failed to delete team member');
    throw new Error(err);
  }
  return res.json();
}

