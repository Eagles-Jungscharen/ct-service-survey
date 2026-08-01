import { API_BASE_URL } from '../../config/api'
import type { ErrorRecord } from '@ct-service-survey/shared'

// Custom Error-Klasse für API-Fehler mit Fehlercode
export class ApiError extends Error {
  public readonly code: number

  constructor(message: string, code: number = 0) {
    super(message)
    this.name = 'ApiError'
    this.code = code
  }
}

// Base API client mit Auth-Header-Support
class ApiClient {
  private baseUrl: string
  private getToken: (() => string | null) | null = null

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl
  }

  // Token-Getter für Auth registrieren
  setTokenGetter(getter: () => string | null) {
    this.getToken = getter
  }

  private getAuthHeader(): HeadersInit {
    if (!this.getToken) {
      return {}
    }

    const token = this.getToken()
    if (!token) {
      return {}
    }

    return {
      Authorization: `Bearer ${token}`,
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`
    const headers = {
      'Content-Type': 'application/json',
      ...this.getAuthHeader(),
      ...options.headers,
    }

    const response = await fetch(url, {
      ...options,
      headers,
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({})) as Partial<ErrorRecord>
      const errorMessage = errorData.error || 'Ein Fehler ist aufgetreten'
      const errorCode = errorData.errorCode || 0
      throw new ApiError(errorMessage, errorCode)
    }

    return response.json()
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' })
  }

  async post<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async put<T>(endpoint: string, data: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' })
  }
}

export const apiClient = new ApiClient(API_BASE_URL)
