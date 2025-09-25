"use client"

import { useState, useEffect, useCallback } from "react"
import { useAuth } from "./use-auth"

interface TenantDataOptions {
  autoRefresh?: boolean
  refreshInterval?: number
}

interface TenantDataHook<T> {
  data: T[]
  isLoading: boolean
  error: string | null
  refresh: () => Promise<void>
  create: (item: Omit<T, 'id' | 'tenantId' | 'createdAt' | 'updatedAt'>) => Promise<T>
  update: (id: string, updates: Partial<T>) => Promise<T>
  delete: (id: string) => Promise<void>
  findById: (id: string) => T | undefined
  filter: (predicate: (item: T) => boolean) => T[]
}

// Generic tenant-aware data hook
export function useTenantData<T extends { id: string; tenantId?: string }>(
  dataType: string,
  options: TenantDataOptions = {}
): TenantDataHook<T> {
  const { user, tenant } = useAuth()
  const [data, setData] = useState<T[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const { autoRefresh = false, refreshInterval = 30000 } = options

  // Fetch tenant-specific data
  const fetchData = useCallback(async () => {
    if (!tenant?.id && !user?.role?.includes('platform_admin')) {
      setError('No tenant context available')
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // In a real implementation, this would call your API
      // For now, we'll use mock data with tenant filtering
      const mockData = await getMockData<T>(dataType, tenant?.id)
      setData(mockData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data')
    } finally {
      setIsLoading(false)
    }
  }, [dataType, tenant?.id, user?.role])

  // Initial load
  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Auto-refresh setup
  useEffect(() => {
    if (!autoRefresh) return

    const interval = setInterval(fetchData, refreshInterval)
    return () => clearInterval(interval)
  }, [autoRefresh, refreshInterval, fetchData])

  const create = async (item: Omit<T, 'id' | 'tenantId' | 'createdAt' | 'updatedAt'>): Promise<T> => {
    if (!tenant?.id) throw new Error('No tenant context')

    const newItem = {
      ...item,
      id: generateId(),
      tenantId: tenant.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as unknown as T

    // In real implementation, call API
    setData(prev => [...prev, newItem])
    return newItem
  }

  const update = async (id: string, updates: Partial<T>): Promise<T> => {
    const existingItem = data.find(item => item.id === id)
    if (!existingItem) throw new Error('Item not found')
    if (existingItem.tenantId !== tenant?.id && !user?.role?.includes('platform_admin')) {
      throw new Error('Access denied: Item belongs to different tenant')
    }

    const updatedItem = {
      ...existingItem,
      ...updates,
      updatedAt: new Date().toISOString(),
    } as T

    setData(prev => prev.map(item => item.id === id ? updatedItem : item))
    return updatedItem
  }

  const deleteItem = async (id: string): Promise<void> => {
    const existingItem = data.find(item => item.id === id)
    if (!existingItem) throw new Error('Item not found')
    if (existingItem.tenantId !== tenant?.id && !user?.role?.includes('platform_admin')) {
      throw new Error('Access denied: Item belongs to different tenant')
    }

    setData(prev => prev.filter(item => item.id !== id))
  }

  const findById = (id: string): T | undefined => {
    return data.find(item => item.id === id)
  }

  const filter = (predicate: (item: T) => boolean): T[] => {
    return data.filter(predicate)
  }

  return {
    data,
    isLoading,
    error,
    refresh: fetchData,
    create,
    update,
    delete: deleteItem,
    findById,
    filter,
  }
}

// Specific hooks for different data types
export function useJournalEntries() {
  return useTenantData<JournalEntry>('journal_entries', { autoRefresh: true })
}

export function useInvoices() {
  return useTenantData<Invoice>('invoices', { autoRefresh: true })
}

export function useBankTransactions() {
  return useTenantData<BankTransaction>('bank_transactions')
}

export function useInventoryItems() {
  return useTenantData<InventoryItem>('inventory_items')
}

// Firm-specific hooks
export function useFirmClients() {
  const { user, tenant } = useAuth()
  const [clients, setClients] = useState<FirmClient[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (tenant?.type === 'firm') {
      // Load firm clients
      const mockClients = getMockFirmClients(tenant.id)
      setClients(mockClients)
    }
    setIsLoading(false)
  }, [tenant])

  return { clients, isLoading }
}

export function useClientData(clientId: string) {
  const { user, tenant } = useAuth()
  const [clientData, setClientData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (tenant?.type === 'firm' && clientId) {
      // Load specific client data
      const mockData = getMockClientData(tenant.id, clientId)
      setClientData(mockData)
    }
    setIsLoading(false)
  }, [tenant, clientId])

  return { clientData, isLoading }
}

// Utility functions
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

// Mock data functions (replace with real API calls)
async function getMockData<T>(dataType: string, tenantId?: string): Promise<T[]> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500))

  // Mock data based on tenant
  const mockDataMap: { [key: string]: any[] } = {
    journal_entries: [
      {
        id: '1',
        tenantId: tenantId,
        date: '2024-01-22',
        reference: 'JE-001',
        description: 'Office Rent Payment',
        debitAccount: '5000 - Rent Expense',
        creditAccount: '1000 - Cash',
        amount: 2500,
        status: 'approved',
        createdAt: '2024-01-22T10:00:00Z',
        updatedAt: '2024-01-22T10:00:00Z'
      }
    ],
    invoices: [
      {
        id: '1',
        tenantId: tenantId,
        invoiceNumber: 'INV-001',
        clientName: 'Sample Client',
        amount: 1500,
        status: 'paid',
        dueDate: '2024-02-01',
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-20T15:30:00Z'
      }
    ],
    bank_transactions: [
      {
        id: '1',
        tenantId: tenantId,
        date: '2024-01-22',
        description: 'Client Payment',
        amount: 1500,
        type: 'credit',
        account: 'Business Checking',
        status: 'cleared',
        createdAt: '2024-01-22T14:00:00Z',
        updatedAt: '2024-01-22T14:00:00Z'
      }
    ],
    inventory_items: [
      {
        id: '1',
        tenantId: tenantId,
        sku: 'PROD-001',
        name: 'Sample Product',
        quantity: 100,
        unitPrice: 25.99,
        category: 'Electronics',
        status: 'active',
        createdAt: '2024-01-10T10:00:00Z',
        updatedAt: '2024-01-20T12:00:00Z'
      }
    ]
  }

  return mockDataMap[dataType] || []
}

function getMockFirmClients(firmId: string) {
  return [
    {
      id: 'client-1',
      firmId: firmId,
      name: 'TechFlow Solutions',
      company: 'TechFlow Solutions Inc.',
      email: 'contact@techflow.com',
      subscriptionPlan: {
        id: 'ai_full_web3',
        name: 'AI + Full Web3',
        type: 'ai_full_web3' as const,
        price: 449,
        billingCycle: 'monthly' as const,
        features: [],
        moduleAccess: [],
        userLimits: { maxUsers: 25 },
        supportLevel: 'priority' as const
      },
      status: 'active' as const,
      assignedUsers: ['firm-1', 'firm-2'],
      enabledModules: [],
      createdAt: '2024-01-15',
      lastActivity: '2024-01-22'
    }
  ]
}

function getMockClientData(firmId: string, clientId: string) {
  return {
    client: {
      id: clientId,
      name: 'TechFlow Solutions',
      company: 'TechFlow Solutions Inc.'
    },
    financials: {
      revenue: '$125,000',
      expenses: '$75,000',
      profit: '$50,000',
      lastUpdated: '2024-01-22'
    },
    recentTransactions: [
      {
        id: '1',
        date: '2024-01-22',
        description: 'Software License Revenue',
        amount: 5000,
        type: 'income'
      }
    ]
  }
}

// Type definitions for data models
interface JournalEntry {
  id: string
  tenantId?: string
  date: string
  reference: string
  description: string
  debitAccount: string
  creditAccount: string
  amount: number
  status: 'draft' | 'approved' | 'posted'
  createdAt: string
  updatedAt: string
}

interface Invoice {
  id: string
  tenantId?: string
  invoiceNumber: string
  clientName: string
  amount: number
  status: 'draft' | 'sent' | 'paid' | 'overdue'
  dueDate: string
  createdAt: string
  updatedAt: string
}

interface BankTransaction {
  id: string
  tenantId?: string
  date: string
  description: string
  amount: number
  type: 'credit' | 'debit'
  account: string
  status: 'pending' | 'cleared' | 'reconciled'
  createdAt: string
  updatedAt: string
}

interface InventoryItem {
  id: string
  tenantId?: string
  sku: string
  name: string
  quantity: number
  unitPrice: number
  category: string
  status: 'active' | 'inactive' | 'discontinued'
  createdAt: string
  updatedAt: string
}

interface FirmClient {
  id: string
  firmId: string
  name: string
  company: string
  email: string
  subscriptionPlan: any
  status: 'active' | 'inactive' | 'pending'
  assignedUsers: string[]
  enabledModules: any[]
  createdAt: string
  lastActivity: string
} 