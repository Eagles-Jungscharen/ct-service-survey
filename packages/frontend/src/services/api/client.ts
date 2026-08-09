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
  
  constructor(baseUrl: string) {
    this.baseUrl = baseUrl
  }
  
  private getAuthHeader(token:string|undefined): HeadersInit {
    if (!token) {
      return {}
    }

    if (!token) {
      return {}
    }

    return {
      Authorization: `Bearer ${token}`,
    }
  }

  private async request<T>(
    token: string|undefined,
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`
    const headers = {
      'Content-Type': 'application/json',
      ...this.getAuthHeader(token),
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

  async get<T>(endpoint: string, token: string | undefined): Promise<T> {
    return this.request<T>(token, endpoint, { method: 'GET' })
  }

  async post<T>(endpoint: string, token: string | undefined, data?: unknown): Promise<T> {
    return this.request<T>(token, endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async put<T>(endpoint: string, token: string | undefined, data: unknown): Promise<T> {
    return this.request<T>(token, endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async delete<T>(endpoint: string, token: string | undefined): Promise<T> {
    return this.request<T>(token, endpoint, { method: 'DELETE' })
  }
}

export const apiClient = new ApiClient(API_BASE_URL)
