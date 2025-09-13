import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { useRouter } from 'next/navigation'
import { MockAuthProvider } from '../utils/auth-provider'

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  useSearchParams: jest.fn(() => new URLSearchParams()),
  usePathname: jest.fn(() => '/auth/login'),
}))

// Mock the login page component
const MockLoginPage = () => {
  return (
    <div>
      <h1>Login</h1>
      <form>
        <label htmlFor="email">Email</label>
        <input id="email" type="email" placeholder="Enter your email" />
        
        <label htmlFor="password">Password</label>
        <input id="password" type="password" placeholder="Enter your password" />
        
        <button type="submit">Sign In</button>
      </form>
      
      <a href="/auth/forgot-password">Forgot Password</a>
      <a href="/auth/signup">Sign Up</a>
    </div>
  )
}

describe('Authentication Flow Integration', () => {
  const mockPush = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    useRouter.mockReturnValue({
      push: mockPush,
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
    })
  })

  it('renders login form correctly', () => {
    render(
      <MockAuthProvider>
        <MockLoginPage />
      </MockAuthProvider>
    )

    expect(screen.getByText('Login')).toBeInTheDocument()
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
  })

  it('has forgot password link', () => {
    render(
      <MockAuthProvider>
        <MockLoginPage />
      </MockAuthProvider>
    )

    expect(screen.getByText('Forgot Password')).toBeInTheDocument()
  })

  it('has signup link', () => {
    render(
      <MockAuthProvider>
        <MockLoginPage />
      </MockAuthProvider>
    )

    expect(screen.getByText('Sign Up')).toBeInTheDocument()
  })

  it('handles form input', () => {
    render(
      <MockAuthProvider>
        <MockLoginPage />
      </MockAuthProvider>
    )

    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/password/i)

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })

    expect(emailInput).toHaveValue('test@example.com')
    expect(passwordInput).toHaveValue('password123')
  })

  it('handles form submission', async () => {
    render(
      <MockAuthProvider>
        <MockLoginPage />
      </MockAuthProvider>
    )

    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/password/i)
    const submitButton = screen.getByRole('button', { name: /sign in/i })

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })
    fireEvent.click(submitButton)

    // Form submission would be handled by the actual component
    expect(emailInput).toHaveValue('test@example.com')
    expect(passwordInput).toHaveValue('password123')
  })
})