import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

// Mock user database - in real app, this would be a database
let users = [
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
  }
]

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, name, organization, role = 'user' } = body

    // Validation
    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Email, password, and name are required' },
        { status: 400 }
      )
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Password validation
    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = users.find(u => u.email === email)
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      )
    }

    // Hash password
    const saltRounds = 12
    const hashedPassword = await bcrypt.hash(password, saltRounds)

    // Create new user
    const newUser = {
      id: (users.length + 1).toString(),
      email,
      password: hashedPassword,
      name,
      role,
      organization: organization || 'Default Organization',
      permissions: role === 'admin' ? ['read', 'write', 'admin'] : ['read', 'write'],
      isActive: true,
      lastLogin: null,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    // Add user to database
    users.push(newUser)

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: newUser.id,
        email: newUser.email,
        role: newUser.role,
        organization: newUser.organization,
        permissions: newUser.permissions
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    )

    // Generate refresh token
    const refreshToken = jwt.sign(
      {
        userId: newUser.id,
        type: 'refresh'
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    )

    // Set HTTP-only cookies
    const response = NextResponse.json({
      success: true,
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
        organization: newUser.organization,
        permissions: newUser.permissions
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
    console.error('Signup error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
