/**
 * Get the backend API URL
 * For row-based multi-tenancy, we use a single backend URL.
 * Tenant identification is handled via JWT token/session, not subdomain.
 * @returns The backend API base URL
 */
export function getApiBaseUrl(): string {
  // Use environment variable if set, otherwise default to localhost:8000
  // In production, set NEXT_PUBLIC_API_BASE_URL to your backend URL
  if (typeof window !== 'undefined') {
    // Client-side: use environment variable or default
    return process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'
  }
  
  // Server-side: use environment variable or default
  return process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'
}

/**
 * Get the full API URL for an endpoint
 * @param endpoint - API endpoint path (e.g., '/api/v1/auth/login/')
 * @returns Full API URL
 */
export function getApiUrl(endpoint: string): string {
  const baseUrl = getApiBaseUrl()
  // Remove leading slash from endpoint if present (baseUrl already ends with / or doesn't need it)
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`
  return `${baseUrl}${cleanEndpoint}`
}

