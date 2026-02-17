// Simple custom authentication without NextAuth
export interface User {
  id: string
  name: string
  email: string
  role: string
  entity: string
}

export interface AuthSession {
  user: User
  expires: string
}

// Demo users
const users: User[] = [
  {
    id: "1",
    name: "Demo User",
    email: "demo@company.com",
    role: "user",
    entity: "HQ"
  },
  {
    id: "2",
    name: "Admin User",
    email: "admin@oasys.com",
    role: "admin",
    entity: "HQ"
  },
  {
    id: "3",
    name: "Manager",
    email: "manager@testcorp.com",
    role: "manager",
    entity: "HQ"
  },
]

// Demo passwords (in production, these would be hashed)
const passwords: Record<string, string> = {
  "demo@company.com": "Demo123!",
  "admin@oasys.com": "Admin123!",
  "manager@testcorp.com": "Manager123!",
}

export function authenticateUser(email: string, password: string): User | null {
  const user = users.find((u) => u.email === email)
  if (!user) return null

  if (passwords[email] !== password) return null

  return user
}

export function createSession(user: User): AuthSession {
  const expires = new Date()
  expires.setDate(expires.getDate() + 30) // 30 days

  return {
    user,
    expires: expires.toISOString(),
  }
}

export function getStoredSession(): AuthSession | null {
  if (typeof window === "undefined") return null

  try {
    const stored = localStorage.getItem("oasys-session")
    if (!stored) return null

    const session: AuthSession = JSON.parse(stored)

    // Check if session is expired
    if (new Date(session.expires) < new Date()) {
      localStorage.removeItem("oasys-session")
      return null
    }

    return session
  } catch {
    return null
  }
}

export function storeSession(session: AuthSession): void {
  if (typeof window === "undefined") return
  localStorage.setItem("oasys-session", JSON.stringify(session))
}

export function clearSession(): void {
  if (typeof window === "undefined") return
  localStorage.removeItem("oasys-session")
}
