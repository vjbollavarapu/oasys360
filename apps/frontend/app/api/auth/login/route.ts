import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

// Mock user database - in real app, this would be a database
const users = [
  {
    id: '1',
    email: 'admin@oasys360.com',
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
    name: 'Admin User',
    role: 'admin',
    organization: 'OASYS Corp',
    permissions: ['read', 'write', 'admin'],
    isActive: true,
    lastLogin: null,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: '2',
    email: 'user@oasys360.com',
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
    name: 'Regular User',
    role: 'user',
    organization: 'OASYS Corp',
    permissions: ['read', 'write'],
    isActive: true,
    lastLogin: null,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  }
]

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    // Validation
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Find user
    const user = users.find(u => u.email === email)
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Check if user is active
    if (!user.isActive) {
      return NextResponse.json(
        { error: 'Account is deactivated' },
        { status: 401 }
      )
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password)
    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Update last login
    user.lastLogin = new Date()
    user.updatedAt = new Date()

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
        organization: user.organization,
        permissions: user.permissions
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    )

    // Generate refresh token
    const refreshToken = jwt.sign(
      {
        userId: user.id,
        type: 'refresh'
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    )

    // Set HTTP-only cookies
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        organization: user.organization,
        permissions: user.permissions
      },
      token
    })

    // Set secure cookies
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 // 24 hours
    })

    response.cookies.set('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 // 7 days
    })

    return response

  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
