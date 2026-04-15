const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000'

function getAccessToken(): string | null {
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith('sb-') && key.endsWith('-auth-token')) {
        const raw = localStorage.getItem(key)
        if (!raw) return null
        const data = JSON.parse(raw)
        return data.access_token || null
      }
    }
    return null
  } catch {
    return null
  }
}

function getAuthHeaders() {
  const token = getAccessToken()
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

async function request(path: string, options: RequestInit = {}) {
  const headers = getAuthHeaders()
  console.log('[API]', path, 'Auth:', headers.Authorization ? 'Bearer ' + headers.Authorization.substring(7, 30) + '...' : 'YOK')
  const res = await fetch(`${API_BASE}${path}`, { ...options, headers: { ...headers, ...(options.headers || {}) } })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }))
    throw new Error(err.error || 'API hatası')
  }
  const contentType = res.headers.get('content-type')
  if (contentType?.includes('image')) return res.blob()
  return res.json()
}

export const api = {
  get: (path: string) => request(path),
  post: (path: string, body?: any) => request(path, { method: 'POST', body: JSON.stringify(body) }),
  put: (path: string, body?: any) => request(path, { method: 'PUT', body: JSON.stringify(body) }),
  delete: (path: string) => request(path, { method: 'DELETE' }),
}
