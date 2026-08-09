const API_BASE = 'http://localhost:8000';

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

export async function checkBackendHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/health`, { method: 'GET' });
    return res.ok;
  } catch {
    return false;
  }
}

export async function loginApi(email: string, password: string) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.detail || 'Login failed');
  }
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
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.detail || 'Registration failed');
  }
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
  if (!res.ok) throw new Error('Failed to fetch assessments from backend');
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
}) {
  const res = await fetch(`${API_BASE}/assessments`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to create assessment on backend');
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
  }
) {
  const res = await fetch(`${API_BASE}/assessments/${id}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to update assessment on backend');
  return res.json();
}

export async function deleteAssessmentApi(id: string) {
  const res = await fetch(`${API_BASE}/assessments/${id}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });
  if (!res.ok) throw new Error('Failed to delete assessment from backend');
  return res.json();
}

export async function fetchTeamApi() {
  const res = await fetch(`${API_BASE}/team`, {
    headers: getHeaders(),
  });
  if (!res.ok) throw new Error('Failed to fetch team members');
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
  if (!res.ok) throw new Error('Failed to create team member');
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
  if (!res.ok) throw new Error('Failed to update team member');
  return res.json();
}

export async function deleteTeamMemberApi(id: string) {
  const res = await fetch(`${API_BASE}/team/${id}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });
  if (!res.ok) throw new Error('Failed to delete team member');
  return res.json();
}
