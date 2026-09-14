const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

async function api<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || `API error: ${res.status}`)
  }
  return res.json()
}

export interface DesignRecord {
  id: number
  name: string
  description?: string
  parameters: Record<string, number>
  results?: Record<string, number> | null
  created_at: string
  updated_at: string
}

export const designApi = {
  list: () => api<DesignRecord[]>('/designs'),
  get: (id: number) => api<DesignRecord>(`/designs/${id}`),
  create: (data: { name: string; description?: string; parameters: object; results?: object }) =>
    api<DesignRecord>('/designs', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: number, data: Partial<DesignRecord>) =>
    api<DesignRecord>(`/designs/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: number) => api<{ success: boolean }>(`/designs/${id}`, { method: 'DELETE' }),
}
