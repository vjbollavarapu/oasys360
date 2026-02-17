/**
 * Mock Login Form Component for E2E Testing
 * This is a simplified version of the actual login form for testing purposes
 */

import React, { useState } from 'react'

interface LoginFormProps {
  onSubmit?: (data: { email: string; password: string }) => void
  error?: string
  loading?: boolean
}

export const LoginForm: React.FC<LoginFormProps> = ({ 
  onSubmit, 
  error, 
  loading = false 
}) => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({})

  const validate = () => {
    const newErrors: { email?: string; password?: string } = {}
    if (!email) newErrors.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Please enter a valid email address'
    if (!password) newErrors.password = 'Password is required'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Form submitted, validating...')
    const isValid = validate()
    console.log('Validation result:', isValid, 'Errors:', errors)
    if (isValid && onSubmit) {
      onSubmit({ email, password })
    }
  }

  return (
    <form onSubmit={handleSubmit} data-testid="login-form">
      <div>
        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          data-testid="email-input"
        />
        {errors.email && (
          <div data-testid="email-error" style={{ color: 'red' }}>
            {errors.email}
          </div>
        )}
      </div>
      
      <div>
        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          data-testid="password-input"
        />
        {errors.password && (
          <div data-testid="password-error" style={{ color: 'red' }}>
            {errors.password}
          </div>
        )}
      </div>
      
      {error && (
        <div data-testid="error-message" style={{ color: 'red' }}>
          {error}
        </div>
      )}
      
              <button 
                type="submit" 
                disabled={loading}
                data-testid="login-button"
                onClick={(e) => {
                  console.log('Button clicked')
                  e.preventDefault()
                  handleSubmit(e)
                }}
              >
                {loading ? 'Logging in...' : 'Login'}
              </button>
      
      <div>
        <a href="/forgot-password" data-testid="forgot-password-link">
          Forgot Password?
        </a>
      </div>
      
      <div>
        <a href="/signup" data-testid="signup-link">
          Don't have an account? Sign up
        </a>
      </div>
    </form>
  )
}

export default LoginForm
