import { renderHook } from '@testing-library/react'
import { MockAuthProvider, useAuth, mockUser } from '../utils/auth-provider'

describe('useAuth Hook', () => {
  it('returns loading state when session is loading', () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: ({ children }) => (
        <MockAuthProvider value={{ isLoading: true }}>
          {children}
        </MockAuthProvider>
      ),
    })

    expect(result.current.user).toBeNull()
    expect(result.current.isLoading).toBe(true)
    expect(result.current.isAuthenticated).toBe(false)
  })

  it('returns authenticated state when user is logged in', () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: ({ children }) => (
        <MockAuthProvider 
          value={{ 
            user: mockUser, 
            isLoading: false, 
            isAuthenticated: true 
          }}
        >
          {children}
        </MockAuthProvider>
      ),
    })

    expect(result.current.user).toEqual(mockUser)
    expect(result.current.isLoading).toBe(false)
    expect(result.current.isAuthenticated).toBe(true)
  })

  it('returns unauthenticated state when no session', () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: ({ children }) => (
        <MockAuthProvider 
          value={{ 
            user: null, 
            isLoading: false, 
            isAuthenticated: false 
          }}
        >
          {children}
        </MockAuthProvider>
      ),
    })

    expect(result.current.user).toBeNull()
    expect(result.current.isLoading).toBe(false)
    expect(result.current.isAuthenticated).toBe(false)
  })

  it('returns user role correctly', () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: ({ children }) => (
        <MockAuthProvider 
          value={{ 
            user: mockUser, 
            userRole: 'admin',
            isLoading: false, 
            isAuthenticated: true 
          }}
        >
          {children}
        </MockAuthProvider>
      ),
    })

    expect(result.current.userRole).toBe('admin')
  })

  it('returns null role when user is not authenticated', () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: ({ children }) => (
        <MockAuthProvider 
          value={{ 
            user: null, 
            userRole: null,
            isLoading: false, 
            isAuthenticated: false 
          }}
        >
          {children}
        </MockAuthProvider>
      ),
    })

    expect(result.current.userRole).toBeNull()
  })

  it('returns tenant information when available', () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: ({ children }) => (
        <MockAuthProvider 
          value={{ 
            user: mockUser, 
            tenant: mockUser.tenant,
            isLoading: false, 
            isAuthenticated: true 
          }}
        >
          {children}
        </MockAuthProvider>
      ),
    })

    expect(result.current.tenant).toEqual(mockUser.tenant)
  })

  it('returns null tenant when not available', () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: ({ children }) => (
        <MockAuthProvider 
          value={{ 
            user: mockUser, 
            tenant: null,
            isLoading: false, 
            isAuthenticated: true 
          }}
        >
          {children}
        </MockAuthProvider>
      ),
    })

    expect(result.current.tenant).toBeNull()
  })
})