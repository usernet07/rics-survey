import type { Survey, SectionCapture, Photo } from '../types/survey';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

let authToken: string | null = localStorage.getItem('token');

function headers(json = true): HeadersInit {
  const h: HeadersInit = {};
  if (authToken) h['Authorization'] = `Bearer ${authToken}`;
  if (json) h['Content-Type'] = 'application/json';
  return h;
}

async function request<T>(path: string, opts: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...opts,
    headers: { ...headers(opts.body instanceof FormData ? false : true), ...opts.headers },
  });
  if (res.status === 401) {
    authToken = null;
    localStorage.removeItem('token');
    window.location.href = '/login';
    throw new Error('Unauthorized');
  }
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message || 'Request failed');
  }
  return res.json();
}

// Auth
export async function login(username: string, password: string): Promise<{ token: string }> {
  const data = await request<{ token: string }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });
  authToken = data.token;
  localStorage.setItem('token', data.token);
  return data;
}

export async function register(username: string, password: string, name: string): Promise<{ token: string }> {
  const data = await request<{ token: string }>('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ username, password, name }),
  });
  authToken = data.token;
  localStorage.setItem('token', data.token);
  return data;
}

export function logout() {
  authToken = null;
  localStorage.removeItem('token');
}

export function isAuthenticated(): boolean {
  return !!authToken;
}

// Surveys
export async function getSurveys(): Promise<Survey[]> {
  return request('/surveys');
}

export async function getSurvey(id: string): Promise<Survey> {
  return request(`/surveys/${id}`);
}

export async function createSurvey(data: Partial<Survey>): Promise<Survey> {
  return request('/surveys', { method: 'POST', body: JSON.stringify(data) });
}

export async function updateSurvey(id: string, data: Partial<Survey>): Promise<Survey> {
  return request(`/surveys/${id}`, { method: 'PUT', body: JSON.stringify(data) });
}

export async function deleteSurvey(id: string): Promise<void> {
  return request(`/surveys/${id}`, { method: 'DELETE' });
}

// Captures
export async function getCaptures(surveyId: string): Promise<SectionCapture[]> {
  return request(`/surveys/${surveyId}/captures`);
}

export async function getCapture(surveyId: string, sectionId: string): Promise<SectionCapture | null> {
  return request<SectionCapture | null>(`/surveys/${surveyId}/captures/${sectionId}`).catch(() => null);
}

export async function saveCapture(surveyId: string, sectionId: string, data: Partial<SectionCapture>): Promise<SectionCapture> {
  return request(`/surveys/${surveyId}/captures/${sectionId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

// Photos
export async function uploadPhoto(surveyId: string, sectionId: string, file: File, description: string): Promise<Photo> {
  const formData = new FormData();
  formData.append('photo', file);
  formData.append('description', description);
  return request(`/surveys/${surveyId}/captures/${sectionId}/photos`, {
    method: 'POST',
    body: formData,
    headers: {},
  });
}

export async function deletePhoto(photoId: string): Promise<void> {
  return request(`/photos/${photoId}`, { method: 'DELETE' });
}

export async function getPhotos(surveyId: string): Promise<Photo[]> {
  return request(`/surveys/${surveyId}/photos`);
}

// PDF Export
export function getPdfUrl(surveyId: string): string {
  return `${API_BASE}/surveys/${surveyId}/pdf?token=${authToken}`;
}
