# OASYS Platform - API Architecture

## 🎯 Overview

This document outlines the comprehensive API architecture for the OASYS platform. The frontend implementation is **100% complete** with 117 pages and 99 components. This document provides the complete backend API design needed to support all frontend functionality.

## 🏗️ API Architecture Overview

### **Current Status**
- ✅ **Frontend**: 117 pages implemented across 16 modules
- ✅ **API Routes**: Basic authentication routes implemented
- 🔄 **Backend APIs**: Complete RESTful API design needed
- 🔄 **Database**: Prisma schema implementation required

### **API Design Principles**
- **RESTful Design**: Standard HTTP methods and status codes
- **Multi-Tenant**: Tenant isolation for all endpoints
- **Authentication**: JWT + NextAuth integration
- **Rate Limiting**: API usage monitoring and limits
- **Versioning**: API version management
- **Documentation**: OpenAPI/Swagger documentation

---

## 🔐 Authentication & Authorization

### **Current Implementation**
```typescript
// ✅ Implemented - app/api/auth/login/route.ts
export async function POST(request: NextRequest) {
  // JWT-based authentication with bcrypt password hashing
}

// ✅ Implemented - app/api/auth/signup/route.ts
export async function POST(request: NextRequest) {
  // User registration with password hashing
}

// ✅ Implemented - app/api/auth/me/route.ts
export async function GET(request: NextRequest) {
  // Get current user information
}
```

### **Required Backend Implementation**
```typescript
// 🔄 TO BE IMPLEMENTED - Enhanced authentication
// app/api/auth/refresh/route.ts
export async function POST(request: NextRequest) {
  // Refresh JWT token
}

// app/api/auth/logout/route.ts
export async function POST(request: NextRequest) {
  // Secure logout with token invalidation
}

// app/api/auth/2fa/route.ts
export async function POST(request: NextRequest) {
  // Two-factor authentication
}
```

---

## 💰 Accounting Module APIs

### **Chart of Accounts**
```typescript
// app/api/accounting/gl-accounts/route.ts
export async function GET(request: NextRequest) {
  // Get chart of accounts with tenant filtering
  const { searchParams } = new URL(request.url)
  const tenantId = getTenantId(request)
  
  const accounts = await prisma.chartOfAccounts.findMany({
    where: {
      tenantId,
      isActive: true,
      ...(searchParams.get('search') && {
        OR: [
          { code: { contains: searchParams.get('search') } },
          { name: { contains: searchParams.get('search') } }
        ]
      })
    },
    orderBy: { code: 'asc' }
  })
  
  return NextResponse.json({ accounts })
}

export async function POST(request: NextRequest) {
  // Create new account
  const body = await request.json()
  const tenantId = getTenantId(request)
  
  const account = await prisma.chartOfAccounts.create({
    data: {
      ...body,
      tenantId
    }
  })
  
  return NextResponse.json({ account })
}

// app/api/accounting/gl-accounts/[id]/route.ts
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  // Get specific account
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  // Update account
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  // Delete account (soft delete)
}
```

### **Journal Entries**
```typescript
// app/api/accounting/journal-entries/route.ts
export async function GET(request: NextRequest) {
  // Get journal entries with filtering
  const { searchParams } = new URL(request.url)
  const tenantId = getTenantId(request)
  
  const entries = await prisma.journalEntry.findMany({
    where: {
      tenantId,
      ...(searchParams.get('dateFrom') && {
        date: { gte: new Date(searchParams.get('dateFrom')!) }
      }),
      ...(searchParams.get('dateTo') && {
        date: { lte: new Date(searchParams.get('dateTo')!) }
      }),
      ...(searchParams.get('status') && {
        status: searchParams.get('status')
      })
    },
    include: {
      lines: {
        include: {
          account: true
        }
      }
    },
    orderBy: { date: 'desc' }
  })
  
  return NextResponse.json({ entries })
}

export async function POST(request: NextRequest) {
  // Create journal entry with validation
  const body = await request.json()
  const tenantId = getTenantId(request)
  
  // Validate debits = credits
  const totalDebits = body.lines
    .filter((line: any) => line.type === 'debit')
    .reduce((sum: number, line: any) => sum + parseFloat(line.amount), 0)
  
  const totalCredits = body.lines
    .filter((line: any) => line.type === 'credit')
    .reduce((sum: number, line: any) => sum + parseFloat(line.amount), 0)
  
  if (Math.abs(totalDebits - totalCredits) > 0.01) {
    return NextResponse.json(
      { error: 'Debits must equal credits' },
      { status: 400 }
    )
  }
  
  const entry = await prisma.journalEntry.create({
    data: {
      ...body,
      tenantId,
      createdBy: getUserId(request)
    },
    include: {
      lines: {
        include: {
          account: true
        }
      }
    }
  })
  
  return NextResponse.json({ entry })
}
```

### **Bank Reconciliation**
```typescript
// app/api/accounting/bank-reconciliation/route.ts
export async function GET(request: NextRequest) {
  // Get bank reconciliation data
  const { searchParams } = new URL(request.url)
  const tenantId = getTenantId(request)
  const accountId = searchParams.get('accountId')
  
  const reconciliation = await prisma.bankReconciliation.findFirst({
    where: {
      tenantId,
      accountId
    },
    include: {
      account: true,
      transactions: true,
      bankStatements: true
    }
  })
  
  return NextResponse.json({ reconciliation })
}

export async function POST(request: NextRequest) {
  // Create or update bank reconciliation
  const body = await request.json()
  const tenantId = getTenantId(request)
  
  const reconciliation = await prisma.bankReconciliation.upsert({
    where: {
      id: body.id || 'new'
    },
    update: body,
    create: {
      ...body,
      tenantId
    }
  })
  
  return NextResponse.json({ reconciliation })
}
```

---

## 🧾 Invoicing Module APIs

### **Invoice Management**
```typescript
// app/api/invoicing/invoices/route.ts
export async function GET(request: NextRequest) {
  // Get invoices with filtering
  const { searchParams } = new URL(request.url)
  const tenantId = getTenantId(request)
  
  const invoices = await prisma.invoice.findMany({
    where: {
      tenantId,
      ...(searchParams.get('status') && {
        status: searchParams.get('status')
      }),
      ...(searchParams.get('customerId') && {
        customerId: searchParams.get('customerId')
      })
    },
    include: {
      customer: true,
      items: true
    },
    orderBy: { issueDate: 'desc' }
  })
  
  return NextResponse.json({ invoices })
}

export async function POST(request: NextRequest) {
  // Create invoice with validation
  const body = await request.json()
  const tenantId = getTenantId(request)
  
  // Generate invoice number
  const lastInvoice = await prisma.invoice.findFirst({
    where: { tenantId },
    orderBy: { invoiceNumber: 'desc' }
  })
  
  const nextNumber = lastInvoice 
    ? parseInt(lastInvoice.invoiceNumber) + 1 
    : 1
  
  const invoice = await prisma.invoice.create({
    data: {
      ...body,
      tenantId,
      invoiceNumber: nextNumber.toString().padStart(6, '0'),
      createdBy: getUserId(request)
    },
    include: {
      customer: true,
      items: true
    }
  })
  
  return NextResponse.json({ invoice })
}
```

### **Invoice Templates**
```typescript
// app/api/invoicing/templates/route.ts
export async function GET(request: NextRequest) {
  // Get invoice templates
  const tenantId = getTenantId(request)
  
  const templates = await prisma.invoiceTemplate.findMany({
    where: { tenantId },
    orderBy: { name: 'asc' }
  })
  
  return NextResponse.json({ templates })
}

export async function POST(request: NextRequest) {
  // Create invoice template
  const body = await request.json()
  const tenantId = getTenantId(request)
  
  const template = await prisma.invoiceTemplate.create({
    data: {
      ...body,
      tenantId
    }
  })
  
  return NextResponse.json({ template })
}
```

---

## 🏦 Banking Module APIs

### **Bank Accounts**
```typescript
// app/api/banking/accounts/route.ts
export async function GET(request: NextRequest) {
  // Get bank accounts
  const tenantId = getTenantId(request)
  
  const accounts = await prisma.bankAccount.findMany({
    where: { tenantId },
    include: {
      transactions: {
        orderBy: { date: 'desc' },
        take: 10
      }
    }
  })
  
  return NextResponse.json({ accounts })
}

export async function POST(request: NextRequest) {
  // Create bank account
  const body = await request.json()
  const tenantId = getTenantId(request)
  
  const account = await prisma.bankAccount.create({
    data: {
      ...body,
      tenantId
    }
  })
  
  return NextResponse.json({ account })
}
```

### **Bank Transactions**
```typescript
// app/api/banking/transactions/route.ts
export async function GET(request: NextRequest) {
  // Get bank transactions with filtering
  const { searchParams } = new URL(request.url)
  const tenantId = getTenantId(request)
  
  const transactions = await prisma.bankTransaction.findMany({
    where: {
      tenantId,
      ...(searchParams.get('accountId') && {
        accountId: searchParams.get('accountId')
      }),
      ...(searchParams.get('dateFrom') && {
        date: { gte: new Date(searchParams.get('dateFrom')!) }
      }),
      ...(searchParams.get('dateTo') && {
        date: { lte: new Date(searchParams.get('dateTo')!) }
      })
    },
    include: {
      account: true,
      category: true
    },
    orderBy: { date: 'desc' }
  })
  
  return NextResponse.json({ transactions })
}
```

---

## 📊 Reports Module APIs

### **Financial Reports**
```typescript
// app/api/reports/financial/route.ts
export async function GET(request: NextRequest) {
  // Generate financial reports
  const { searchParams } = new URL(request.url)
  const tenantId = getTenantId(request)
  const reportType = searchParams.get('type')
  const dateFrom = searchParams.get('dateFrom')
  const dateTo = searchParams.get('dateTo')
  
  switch (reportType) {
    case 'balance-sheet':
      return await generateBalanceSheet(tenantId, dateFrom, dateTo)
    case 'income-statement':
      return await generateIncomeStatement(tenantId, dateFrom, dateTo)
    case 'cash-flow':
      return await generateCashFlowStatement(tenantId, dateFrom, dateTo)
    default:
      return NextResponse.json(
        { error: 'Invalid report type' },
        { status: 400 }
      )
  }
}

async function generateBalanceSheet(tenantId: string, dateFrom: string, dateTo: string) {
  // Generate balance sheet logic
  const assets = await prisma.chartOfAccounts.findMany({
    where: {
      tenantId,
      type: 'asset',
      isActive: true
    }
  })
  
  const liabilities = await prisma.chartOfAccounts.findMany({
    where: {
      tenantId,
      type: 'liability',
      isActive: true
    }
  })
  
  const equity = await prisma.chartOfAccounts.findMany({
    where: {
      tenantId,
      type: 'equity',
      isActive: true
    }
  })
  
  return NextResponse.json({
    report: {
      type: 'balance-sheet',
      date: new Date(),
      assets,
      liabilities,
      equity
    }
  })
}
```

---

## 🤖 AI Processing Module APIs

### **Document Processing**
```typescript
// app/api/ai-processing/documents/route.ts
export async function POST(request: NextRequest) {
  // Process document with AI
  const formData = await request.formData()
  const file = formData.get('file') as File
  const tenantId = getTenantId(request)
  
  // Upload file
  const uploadResult = await uploadToS3(file)
  
  // Create document record
  const document = await prisma.document.create({
    data: {
      filename: file.name,
      url: uploadResult.url,
      type: 'unknown',
      status: 'processing',
      tenantId,
      uploadedBy: getUserId(request)
    }
  })
  
  // Process with AI (async)
  processDocumentWithAI(document.id, uploadResult.url)
  
  return NextResponse.json({ document })
}

// app/api/ai-processing/documents/[id]/status/route.ts
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  // Get document processing status
  const document = await prisma.document.findUnique({
    where: { id: params.id }
  })
  
  return NextResponse.json({ document })
}
```

### **Transaction Categorization**
```typescript
// app/api/ai-processing/categorization/route.ts
export async function POST(request: NextRequest) {
  // Categorize transactions with AI
  const body = await request.json()
  const { transactions } = body
  
  const categorizedTransactions = await Promise.all(
    transactions.map(async (transaction: any) => {
      const category = await categorizeTransaction(transaction.description)
      return {
        ...transaction,
        suggestedCategory: category
      }
    })
  )
  
  return NextResponse.json({ categorizedTransactions })
}
```

---

## 🌐 Web3 Module APIs

### **Crypto Wallets**
```typescript
// app/api/web3/wallets/route.ts
export async function GET(request: NextRequest) {
  // Get crypto wallets
  const tenantId = getTenantId(request)
  
  const wallets = await prisma.cryptoWallet.findMany({
    where: { tenantId },
    include: {
      transactions: {
        orderBy: { date: 'desc' },
        take: 10
      }
    }
  })
  
  return NextResponse.json({ wallets })
}

export async function POST(request: NextRequest) {
  // Create crypto wallet
  const body = await request.json()
  const tenantId = getTenantId(request)
  
  const wallet = await prisma.cryptoWallet.create({
    data: {
      ...body,
      tenantId
    }
  })
  
  return NextResponse.json({ wallet })
}
```

### **DeFi Positions**
```typescript
// app/api/web3/defi/positions/route.ts
export async function GET(request: NextRequest) {
  // Get DeFi positions
  const tenantId = getTenantId(request)
  
  const positions = await prisma.defiPosition.findMany({
    where: { tenantId },
    include: {
      wallet: true,
      protocol: true
    }
  })
  
  // Calculate current values
  const positionsWithValues = await Promise.all(
    positions.map(async (position) => {
      const currentValue = await getDefiPositionValue(position)
      return {
        ...position,
        currentValue
      }
    })
  )
  
  return NextResponse.json({ positions: positionsWithValues })
}
```

---

## 📱 Mobile Module APIs

### **Mobile Dashboard**
```typescript
// app/api/mobile/dashboard/route.ts
export async function GET(request: NextRequest) {
  // Get mobile dashboard data
  const tenantId = getTenantId(request)
  const userId = getUserId(request)
  
  // Get recent transactions
  const recentTransactions = await prisma.transaction.findMany({
    where: { tenantId },
    orderBy: { date: 'desc' },
    take: 10
  })
  
  // Get pending approvals
  const pendingApprovals = await prisma.approval.findMany({
    where: {
      tenantId,
      approverId: userId,
      status: 'pending'
    },
    include: {
      request: true
    }
  })
  
  // Get quick stats
  const stats = await getQuickStats(tenantId)
  
  return NextResponse.json({
    recentTransactions,
    pendingApprovals,
    stats
  })
}
```

---

## 📄 Documents Module APIs

### **Document Management**
```typescript
// app/api/documents/route.ts
export async function GET(request: NextRequest) {
  // Get documents with filtering
  const { searchParams } = new URL(request.url)
  const tenantId = getTenantId(request)
  
  const documents = await prisma.document.findMany({
    where: {
      tenantId,
      ...(searchParams.get('type') && {
        type: searchParams.get('type')
      }),
      ...(searchParams.get('status') && {
        status: searchParams.get('status')
      })
    },
    orderBy: { createdAt: 'desc' }
  })
  
  return NextResponse.json({ documents })
}

export async function POST(request: NextRequest) {
  // Upload document
  const formData = await request.formData()
  const file = formData.get('file') as File
  const tenantId = getTenantId(request)
  
  const uploadResult = await uploadToS3(file)
  
  const document = await prisma.document.create({
    data: {
      filename: file.name,
      url: uploadResult.url,
      size: file.size,
      type: file.type,
      tenantId,
      uploadedBy: getUserId(request)
    }
  })
  
  return NextResponse.json({ document })
}
```

---

## 🔧 Utility APIs

### **Search API**
```typescript
// app/api/search/route.ts
export async function GET(request: NextRequest) {
  // Global search across all modules
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('q')
  const tenantId = getTenantId(request)
  
  if (!query) {
    return NextResponse.json({ results: [] })
  }
  
  const results = await Promise.all([
    // Search invoices
    prisma.invoice.findMany({
      where: {
        tenantId,
        OR: [
          { invoiceNumber: { contains: query } },
          { customer: { name: { contains: query } } }
        ]
      },
      take: 5
    }),
    
    // Search transactions
    prisma.transaction.findMany({
      where: {
        tenantId,
        OR: [
          { description: { contains: query } },
          { reference: { contains: query } }
        ]
      },
      take: 5
    }),
    
    // Search customers
    prisma.customer.findMany({
      where: {
        tenantId,
        OR: [
          { name: { contains: query } },
          { email: { contains: query } }
        ]
      },
      take: 5
    })
  ])
  
  return NextResponse.json({
    results: {
      invoices: results[0],
      transactions: results[1],
      customers: results[2]
    }
  })
}
```

### **Notifications API**
```typescript
// app/api/notifications/route.ts
export async function GET(request: NextRequest) {
  // Get user notifications
  const userId = getUserId(request)
  
  const notifications = await prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: 50
  })
  
  return NextResponse.json({ notifications })
}

export async function POST(request: NextRequest) {
  // Mark notification as read
  const body = await request.json()
  const { notificationId } = body
  
  const notification = await prisma.notification.update({
    where: { id: notificationId },
    data: { read: true }
  })
  
  return NextResponse.json({ notification })
}
```

---

## 🔐 Security & Middleware

### **Authentication Middleware**
```typescript
// lib/auth-middleware.ts
import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/jwt'

export async function authMiddleware(request: NextRequest) {
  const token = request.headers.get('authorization')?.replace('Bearer ', '')
  
  if (!token) {
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    )
  }
  
  try {
    const decoded = await verifyToken(token)
    request.headers.set('user-id', decoded.userId)
    request.headers.set('tenant-id', decoded.tenantId)
    return NextResponse.next()
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid token' },
      { status: 401 }
    )
  }
}
```

### **Rate Limiting**
```typescript
// lib/rate-limit.ts
import { NextRequest, NextResponse } from 'next/server'
import { Redis } from 'ioredis'

const redis = new Redis(process.env.REDIS_URL)

export async function rateLimitMiddleware(request: NextRequest) {
  const ip = request.ip || 'unknown'
  const key = `rate-limit:${ip}`
  
  const current = await redis.incr(key)
  await redis.expire(key, 60) // 1 minute window
  
  if (current > 100) { // 100 requests per minute
    return NextResponse.json(
      { error: 'Rate limit exceeded' },
      { status: 429 }
    )
  }
  
  return NextResponse.next()
}
```

---

## 📊 API Response Standards

### **Standard Response Format**
```typescript
// Success Response
{
  "success": true,
  "data": { ... },
  "message": "Operation completed successfully",
  "timestamp": "2024-01-01T00:00:00Z"
}

// Error Response
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE",
  "timestamp": "2024-01-01T00:00:00Z"
}

// Paginated Response
{
  "success": true,
  "data": { ... },
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "pages": 10
  }
}
```

### **HTTP Status Codes**
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `422` - Validation Error
- `429` - Rate Limit Exceeded
- `500` - Internal Server Error

---

## 🧪 API Testing

### **Test Structure**
```typescript
// __tests__/api/accounting.test.ts
import { describe, it, expect, beforeAll, afterAll } from '@jest/globals'
import { testApi } from '@/lib/test-utils'

describe('Accounting API', () => {
  let authToken: string
  
  beforeAll(async () => {
    // Setup test user and get auth token
    authToken = await getTestAuthToken()
  })
  
  it('should create journal entry', async () => {
    const response = await testApi.post('/api/accounting/journal-entries', {
      date: new Date(),
      description: 'Test entry',
      amount: 100,
      type: 'debit'
    }, {
      headers: { Authorization: `Bearer ${authToken}` }
    })
    
    expect(response.status).toBe(201)
    expect(response.data.entry).toBeDefined()
  })
})
```

---

## 📚 API Documentation

### **OpenAPI Specification**
```yaml
# openapi.yaml
openapi: 3.0.0
info:
  title: OASYS Platform API
  version: 1.0.0
  description: Comprehensive API for OASYS financial management platform

servers:
  - url: https://api.oasys.com/v1
    description: Production server
  - url: https://staging-api.oasys.com/v1
    description: Staging server

paths:
  /accounting/gl-accounts:
    get:
      summary: Get chart of accounts
      parameters:
        - name: search
          in: query
          schema:
            type: string
      responses:
        '200':
          description: Success
          content:
            application/json:
              schema:
                type: object
                properties:
                  accounts:
                    type: array
                    items:
                      $ref: '#/components/schemas/ChartOfAccounts'
```

---

## 🚀 Implementation Priority

### **Phase 1: Core APIs (Week 1-2)**
1. **Authentication APIs** - Complete JWT + NextAuth
2. **Accounting APIs** - GL Accounts, Journal Entries
3. **Basic CRUD APIs** - Common operations
4. **File Upload APIs** - Document management

### **Phase 2: Business Logic APIs (Week 3-4)**
1. **Invoicing APIs** - Invoice creation and management
2. **Banking APIs** - Account and transaction management
3. **Reports APIs** - Financial reporting
4. **Search APIs** - Global search functionality

### **Phase 3: Advanced APIs (Week 5-6)**
1. **AI Processing APIs** - Document processing and categorization
2. **Web3 APIs** - Cryptocurrency and DeFi integration
3. **Mobile APIs** - Mobile-specific endpoints
4. **Real-time APIs** - WebSocket integration

---

## 📈 Performance Considerations

### **Database Optimization**
- **Indexing**: Proper database indexes for all queries
- **Pagination**: Implement pagination for large datasets
- **Caching**: Redis caching for frequently accessed data
- **Query Optimization**: Efficient database queries

### **API Optimization**
- **Response Compression**: Gzip compression for responses
- **Rate Limiting**: Prevent API abuse
- **Caching Headers**: Proper cache control headers
- **Batch Operations**: Support for batch API operations

---

**OASYS Platform** - Complete API Architecture for Backend Development 