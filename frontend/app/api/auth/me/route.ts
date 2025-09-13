import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

// Mock user database - in real app, this would be a database
const users = [
  {
    id: '1',
    email: 'admin@oasys.com',
    name: 'Admin User',
    role: 'admin',
    organization: 'OASYS Corp',
    permissions: ['read', 'write', 'admin'],
    isActive: true,
    lastLogin: new Date(),
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: '2',
    email: 'user@oasys.com',
    name: 'Regular User',
    role: 'user',
    organization: 'OASYS Corp',
    permissions: ['read', 'write'],
    isActive: true,
    lastLogin: new Date(),
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  }
]

export async function GET(request: NextRequest) {
  try {
    // Get token from cookies
    const token = request.cookies.get('token')?.value

    if (!token) {
      return NextResponse.json(
        { error: 'No token provided' },
        { status: 401 }
      )
    }

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET) as any
    
    // Find user
    const user = users.find(u => u.id === decoded.userId)
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Check if user is active
    if (!user.isActive) {
      return NextResponse.json(
        { error: 'Account is deactivated' },
        { status: 401 }
      )
    }

    // Return user data
    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        organization: user.organization,
        permissions: user.permissions
      },
      tenant: {
        id: 'default',
        name: user.organization,
        type: 'business',
        status: 'active'
      },
      subscriptionPlan: {
        id: 'complete_platform',
        name: 'Complete Platform',
        type: 'complete_platform',
        price: 899,
        billingCycle: 'monthly'
      }
    })

  } catch (error) {
    console.error('Auth check error:', error)
    return NextResponse.json(
      { error: 'Invalid token' },
      { status: 401 }
    )
  }
}
