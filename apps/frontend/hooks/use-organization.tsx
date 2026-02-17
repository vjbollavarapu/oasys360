"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

export interface FiscalPeriod {
  id: string
  name: string
  startDate: string
  endDate: string
  isActive: boolean
  isLocked: boolean
  isSoftClosed: boolean // Allows limited adjustments
  createdDate: string
  lockedBy?: string
  lockedDate?: string
  fiscalYearId: string
  periodNumber: number
  periodType: 'monthly' | 'quarterly' | 'annual'
  isYearEnd: boolean
  closingEntries?: ClosingEntry[]
  auditStatus?: 'not-started' | 'in-progress' | 'under-review' | 'completed' | 'failed' | 'exception'
  auditedBy?: string
  auditedDate?: string
  // Enhanced tracking
  transactionCount: number
  totalDebits: number
  totalCredits: number
  lastModified: string
  modifiedBy: string
  // Workflow management
  approvalStatus: 'pending' | 'approved' | 'rejected'
  approvedBy?: string
  approvalDate?: string
  exceptions: PeriodException[]
}

export interface FiscalYear {
  id: string
  name: string
  startDate: string
  endDate: string
  organizationId: string
  status: 'open' | 'closed' | 'archived'
  periods: FiscalPeriod[]
  closingStatus: 'not-started' | 'in-progress' | 'completed'
  closedBy?: string
  closedDate?: string
  openingBalances?: OpeningBalance[]
  retainedEarnings?: number
  yearEndAdjustments?: YearEndAdjustment[]
}

export interface ClosingEntry {
  id: string
  accountId: string
  accountName: string
  debitAmount: number
  creditAmount: number
  entryType: 'revenue' | 'expense' | 'dividend' | 'retained-earnings'
  createdBy: string
  createdDate: string
}

export interface OpeningBalance {
  id: string
  accountId: string
  accountName: string
  balance: number
  balanceType: 'debit' | 'credit'
}

export interface YearEndAdjustment {
  id: string
  description: string
  accountId: string
  amount: number
  adjustmentType: 'accrual' | 'prepayment' | 'depreciation' | 'provision' | 'other'
  createdBy: string
  createdDate: string
  approvedBy?: string
  approvedDate?: string
}

export interface PeriodException {
  id: string
  description: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  status: 'open' | 'investigating' | 'resolved' | 'accepted'
  createdBy: string
  createdDate: string
  resolvedBy?: string
  resolvedDate?: string
  resolution?: string
}

export interface WorkflowStep {
  id: string
  name: string
  description: string
  assignedTo: string
  status: 'pending' | 'in-progress' | 'completed' | 'skipped'
  dueDate?: string
  completedDate?: string
  comments?: string
}

export interface Organization {
  id: string
  name: string
  code: string
  address: string
  country: string
  currency: string
  timezone: string
  fiscalYearStart: string // MM-DD format
  logo?: string
  isActive: boolean
  fiscalPeriods: FiscalPeriod[]
  fiscalYears: FiscalYear[]
  fiscalYearSettings: {
    periodType: 'monthly' | 'quarterly' | 'annual'
    autoLockPeriods: boolean
    requireAuditBeforeClose: boolean
    allowPostingToPriorPeriods: boolean
    retainedEarningsAccount: string
    autoCreateNextYear: boolean
  }
}

interface OrganizationContextType {
  organizations: Organization[]
  currentOrganization: Organization | null
  currentFiscalPeriod: FiscalPeriod | null
  currentFiscalYear: FiscalYear | null
  setCurrentOrganization: (organization: Organization) => void
  setCurrentFiscalPeriod: (period: FiscalPeriod) => void
  isDateWithinFiscalPeriod: (date: string) => boolean
  canAddTransaction: (date: string) => { allowed: boolean; reason?: string }
  lockFiscalPeriod: (periodId: string, userId: string) => Promise<boolean>
  unlockFiscalPeriod: (periodId: string, userId: string) => Promise<boolean>
  // Enhanced fiscal year management functions
  createFiscalYear: (year: Omit<FiscalYear, 'id' | 'periods'>) => Promise<FiscalYear>
  closeFiscalYear: (yearId: string, userId: string) => Promise<boolean>
  generateOpeningBalances: (yearId: string) => Promise<OpeningBalance[]>
  createYearEndAdjustments: (yearId: string, adjustments: Omit<YearEndAdjustment, 'id'>[]) => Promise<boolean>
  generateClosingEntries: (yearId: string) => Promise<ClosingEntry[]>
  rolloverToNextYear: (yearId: string, userId: string) => Promise<FiscalYear>
  validateYearEndClose: (yearId: string) => Promise<{ valid: boolean; errors: string[] }>
  archiveFiscalYear: (yearId: string, userId: string) => Promise<boolean>
  isLoading: boolean
}

const OrganizationContext = createContext<OrganizationContextType | undefined>(undefined)

// Mock data for organizations
const mockOrganizations: Organization[] = [
  {
    id: 'org-1',
    name: 'OASYS Technologies Inc.',
    code: 'OASYS-US',
    address: '123 Tech Street, Silicon Valley, CA 94000',
    country: 'United States',
    currency: 'USD',
    timezone: 'America/Los_Angeles',
    fiscalYearStart: '01-01', // January 1st
    logo: '/oasys-logo.svg',
    isActive: true,
    fiscalPeriods: [
      {
        id: 'fy-2023',
        name: 'FY 2023',
        startDate: '2023-01-01',
        endDate: '2023-12-31',
        isActive: false,
        isLocked: true,
        isSoftClosed: false,
        createdDate: '2023-01-01',
        lockedBy: 'admin@oasys360.com',
        lockedDate: '2024-01-15',
        fiscalYearId: 'fy-2023',
        periodNumber: 1,
        periodType: 'annual',
        isYearEnd: true,
        closingEntries: [],
        auditStatus: 'completed',
        auditedBy: 'admin@oasys360.com',
        auditedDate: '2024-01-15',
        transactionCount: 1547,
        totalDebits: 2547893.45,
        totalCredits: 2547893.45,
        lastModified: '2024-01-15T10:30:00Z',
        modifiedBy: 'admin@oasys360.com',
        approvalStatus: 'approved',
        approvedBy: 'cfo@oasys360.com',
        approvalDate: '2024-01-20',
        exceptions: []
      },
      {
        id: 'fy-2024',
        name: 'FY 2024',
        startDate: '2024-01-01',
        endDate: '2024-12-31',
        isActive: true,
        isLocked: false,
        isSoftClosed: false,
        createdDate: '2024-01-01',
        fiscalYearId: 'fy-2024',
        periodNumber: 1,
        periodType: 'annual',
        isYearEnd: false,
        closingEntries: [],
        auditStatus: 'in-progress',
        auditedBy: 'admin@oasys360.com',
        auditedDate: '2024-01-01',
        transactionCount: 2891,
        totalDebits: 4892345.67,
        totalCredits: 4892345.67,
        lastModified: '2024-12-01T14:22:00Z',
        modifiedBy: 'admin@oasys360.com',
        approvalStatus: 'pending',
        exceptions: [
          {
            id: 'exc-001',
            description: 'Unreconciled bank transaction for $1,250',
            severity: 'medium',
            status: 'investigating',
            createdBy: 'admin@oasys360.com',
            createdDate: '2024-11-15T09:00:00Z'
          }
        ]
      },
      {
        id: 'fy-2025',
        name: 'FY 2025',
        startDate: '2025-01-01',
        endDate: '2025-12-31',
        isActive: false,
        isLocked: false,
        isSoftClosed: false,
        createdDate: '2024-11-01',
        fiscalYearId: 'fy-2025',
        periodNumber: 1,
        periodType: 'annual',
        isYearEnd: false,
        closingEntries: [],
        auditStatus: 'not-started',
        auditedBy: 'admin@oasys360.com',
        auditedDate: '2024-11-01',
        transactionCount: 0,
        totalDebits: 0,
        totalCredits: 0,
        lastModified: '2024-11-01T08:00:00Z',
        modifiedBy: 'admin@oasys360.com',
        approvalStatus: 'pending',
        exceptions: []
      }
    ],
    fiscalYears: [],
    fiscalYearSettings: {
      periodType: 'annual',
      autoLockPeriods: true,
      requireAuditBeforeClose: true,
      allowPostingToPriorPeriods: false,
      retainedEarningsAccount: '3100-Retained Earnings',
      autoCreateNextYear: true
    }
  },
  {
    id: 'org-2',
    name: 'OASYS Europe Ltd.',
    code: 'OASYS-EU',
    address: '456 Business Ave, London, UK SW1A 1AA',
    country: 'United Kingdom',
    currency: 'GBP',
    timezone: 'Europe/London',
    fiscalYearStart: '04-06', // April 6th (UK tax year)
    logo: '/oasys-logo.svg',
    isActive: true,
    fiscalPeriods: [
      {
        id: 'fy-2023-24',
        name: 'FY 2023-24',
        startDate: '2023-04-06',
        endDate: '2024-04-05',
        isActive: false,
        isLocked: true,
        isSoftClosed: false,
        createdDate: '2023-04-06',
        lockedBy: 'admin@oasys-europe.com',
        lockedDate: '2024-04-20',
        fiscalYearId: 'fy-2023-24',
        periodNumber: 1,
        periodType: 'annual',
        isYearEnd: true,
        closingEntries: [],
        auditStatus: 'completed',
        auditedBy: 'admin@oasys-europe.com',
        auditedDate: '2024-04-20',
        transactionCount: 987,
        totalDebits: 1234567.89,
        totalCredits: 1234567.89,
        lastModified: '2024-04-20T16:45:00Z',
        modifiedBy: 'admin@oasys-europe.com',
        approvalStatus: 'approved',
        approvedBy: 'cfo@oasys-europe.com',
        approvalDate: '2024-04-25',
        exceptions: []
      },
      {
        id: 'fy-2024-25',
        name: 'FY 2024-25',
        startDate: '2024-04-06',
        endDate: '2025-04-05',
        isActive: true,
        isLocked: false,
        isSoftClosed: false,
        createdDate: '2024-04-06',
        fiscalYearId: 'fy-2024-25',
        periodNumber: 1,
        periodType: 'annual',
        isYearEnd: false,
        closingEntries: [],
        auditStatus: 'under-review',
        auditedBy: 'admin@oasys-europe.com',
        auditedDate: '2024-04-06',
        transactionCount: 1456,
        totalDebits: 2345678.90,
        totalCredits: 2345678.90,
        lastModified: '2024-12-01T11:30:00Z',
        modifiedBy: 'admin@oasys-europe.com',
        approvalStatus: 'pending',
        exceptions: []
      }
    ],
    fiscalYears: [],
    fiscalYearSettings: {
      periodType: 'quarterly',
      autoLockPeriods: true,
      requireAuditBeforeClose: true,
      allowPostingToPriorPeriods: true,
      retainedEarningsAccount: '3100-Retained Earnings',
      autoCreateNextYear: true
    }
  },
  {
    id: 'org-3',
    name: 'OASYS Asia Pte Ltd.',
    code: 'OASYS-SG',
    address: '789 Fintech Street, Singapore 018956',
    country: 'Singapore',
    currency: 'SGD',
    timezone: 'Asia/Singapore',
    fiscalYearStart: '01-01', // January 1st
    logo: '/oasys-logo.svg',
    isActive: true,
    fiscalPeriods: [
      {
        id: 'fy-2024-sg',
        name: 'FY 2024',
        startDate: '2024-01-01',
        endDate: '2024-12-31',
        isActive: true,
        isLocked: false,
        isSoftClosed: true, // Soft-closed for year-end preparation
        createdDate: '2024-01-01',
        fiscalYearId: 'fy-2024-sg',
        periodNumber: 1,
        periodType: 'annual',
        isYearEnd: false,
        closingEntries: [],
        auditStatus: 'in-progress',
        auditedBy: 'admin@oasys360.com',
        auditedDate: '2024-01-01',
        transactionCount: 756,
        totalDebits: 987654.32,
        totalCredits: 987654.32,
        lastModified: '2024-11-30T17:15:00Z',
        modifiedBy: 'admin@oasys360.com',
        approvalStatus: 'pending',
        exceptions: [
          {
            id: 'exc-sg-001',
            description: 'Missing depreciation entry for Q4',
            severity: 'high',
            status: 'open',
            createdBy: 'admin@oasys360.com',
            createdDate: '2024-11-28T10:00:00Z'
          }
        ]
      }
    ],
    fiscalYears: [],
    fiscalYearSettings: {
      periodType: 'monthly',
      autoLockPeriods: false,
      requireAuditBeforeClose: true,
      allowPostingToPriorPeriods: true,
      retainedEarningsAccount: '3100-Retained Earnings',
      autoCreateNextYear: false
    }
  }
]

export function OrganizationProvider({ children }: { children: ReactNode }) {
  const [organizations] = useState<Organization[]>(mockOrganizations)
  const [currentOrganization, setCurrentOrganization] = useState<Organization | null>(null)
  const [currentFiscalPeriod, setCurrentFiscalPeriod] = useState<FiscalPeriod | null>(null)
  const [currentFiscalYear, setCurrentFiscalYear] = useState<FiscalYear | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Initialize with first organization and its active fiscal period
  useEffect(() => {
    const initializeOrganization = () => {
      const firstOrg = organizations[0]
      if (firstOrg) {
        setCurrentOrganization(firstOrg)
        const activePeriod = firstOrg.fiscalPeriods.find(period => period.isActive)
        if (activePeriod) {
          setCurrentFiscalPeriod(activePeriod)
        }
      }
      setIsLoading(false)
    }

    initializeOrganization()
  }, [organizations])

  // Update fiscal period when organization changes
  const handleSetCurrentOrganization = (organization: Organization) => {
    setCurrentOrganization(organization)
    const activePeriod = organization.fiscalPeriods.find(period => period.isActive)
    setCurrentFiscalPeriod(activePeriod || null)
  }

  const isDateWithinFiscalPeriod = (date: string): boolean => {
    if (!currentFiscalPeriod) return false
    
    const inputDate = new Date(date)
    const startDate = new Date(currentFiscalPeriod.startDate)
    const endDate = new Date(currentFiscalPeriod.endDate)
    
    return inputDate >= startDate && inputDate <= endDate
  }

  const canAddTransaction = (date: string): { allowed: boolean; reason?: string } => {
    if (!currentFiscalPeriod) {
      return { allowed: false, reason: 'No active fiscal period selected' }
    }

    if (currentFiscalPeriod.isLocked) {
      return { 
        allowed: false, 
        reason: `Fiscal period ${currentFiscalPeriod.name} is locked${currentFiscalPeriod.lockedBy ? ` by ${currentFiscalPeriod.lockedBy}` : ''}` 
      }
    }

    if (!isDateWithinFiscalPeriod(date)) {
      return { 
        allowed: false, 
        reason: `Transaction date must be within the active fiscal period (${currentFiscalPeriod.startDate} to ${currentFiscalPeriod.endDate})` 
      }
    }

    return { allowed: true }
  }

  const lockFiscalPeriod = async (periodId: string, userId: string): Promise<boolean> => {
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        if (currentOrganization) {
          const updatedOrganization = {
            ...currentOrganization,
            fiscalPeriods: currentOrganization.fiscalPeriods.map(period =>
              period.id === periodId
                ? { 
                    ...period, 
                    isLocked: true, 
                    lockedBy: userId, 
                    lockedDate: new Date().toISOString().split('T')[0] 
                  }
                : period
            )
          }
          setCurrentOrganization(updatedOrganization)
          
          if (currentFiscalPeriod?.id === periodId) {
            const updatedPeriod = updatedOrganization.fiscalPeriods.find(p => p.id === periodId)
            if (updatedPeriod) {
              setCurrentFiscalPeriod(updatedPeriod)
            }
          }
        }
        resolve(true)
      }, 1000)
    })
  }

  const unlockFiscalPeriod = async (periodId: string, userId: string): Promise<boolean> => {
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        if (currentOrganization) {
          const updatedOrganization = {
            ...currentOrganization,
            fiscalPeriods: currentOrganization.fiscalPeriods.map(period =>
              period.id === periodId
                ? { 
                    ...period, 
                    isLocked: false, 
                    lockedBy: undefined, 
                    lockedDate: undefined 
                  }
                : period
            )
          }
          setCurrentOrganization(updatedOrganization)
          
          if (currentFiscalPeriod?.id === periodId) {
            const updatedPeriod = updatedOrganization.fiscalPeriods.find(p => p.id === periodId)
            if (updatedPeriod) {
              setCurrentFiscalPeriod(updatedPeriod)
            }
          }
        }
        resolve(true)
      }, 1000)
    })
  }

  // Enhanced fiscal year management functions
  const createFiscalYear = async (year: Omit<FiscalYear, 'id' | 'periods'>): Promise<FiscalYear> => {
    const newYear: FiscalYear = {
      ...year,
      id: `fy-${Date.now()}`,
      periods: []
    }
    // In real app, would save to backend
    return newYear
  }

  const closeFiscalYear = async (yearId: string, userId: string): Promise<boolean> => {
    try {
      // Validate year can be closed
      const validation = await validateYearEndClose(yearId)
      if (!validation.valid) return false
      
      // Generate closing entries
      await generateClosingEntries(yearId)
      
      // Mark year as closed
      // In real app, would update backend
      return true
    } catch (error) {
      console.error('Error closing fiscal year:', error)
      return false
    }
  }

  const generateOpeningBalances = async (yearId: string): Promise<OpeningBalance[]> => {
    // Mock opening balances - in real app would calculate from previous year
    return [
      { id: '1', accountId: '1000', accountName: 'Cash', balance: 50000, balanceType: 'debit' },
      { id: '2', accountId: '2000', accountName: 'Accounts Payable', balance: 15000, balanceType: 'credit' },
      { id: '3', accountId: '3000', accountName: 'Retained Earnings', balance: 35000, balanceType: 'credit' }
    ]
  }

  const createYearEndAdjustments = async (yearId: string, adjustments: Omit<YearEndAdjustment, 'id'>[]): Promise<boolean> => {
    try {
      // In real app, would save adjustments to backend
      return true
    } catch (error) {
      console.error('Error creating year-end adjustments:', error)
      return false
    }
  }

  const generateClosingEntries = async (yearId: string): Promise<ClosingEntry[]> => {
    // Mock closing entries - in real app would calculate from account balances
    return [
      {
        id: '1',
        accountId: '4000',
        accountName: 'Sales Revenue',
        debitAmount: 100000,
        creditAmount: 0,
        entryType: 'revenue',
        createdBy: 'system',
        createdDate: new Date().toISOString()
      },
      {
        id: '2',
        accountId: '5000',
        accountName: 'Cost of Goods Sold',
        debitAmount: 0,
        creditAmount: 60000,
        entryType: 'expense',
        createdBy: 'system',
        createdDate: new Date().toISOString()
      }
    ]
  }

  const rolloverToNextYear = async (yearId: string, userId: string): Promise<FiscalYear> => {
    // Create next fiscal year with opening balances from current year
    const currentYear = currentOrganization?.fiscalYears.find(y => y.id === yearId)
    if (!currentYear) throw new Error('Fiscal year not found')
    
    const nextYearStart = new Date(currentYear.endDate)
    nextYearStart.setDate(nextYearStart.getDate() + 1)
    
    const nextYearEnd = new Date(nextYearStart)
    nextYearEnd.setFullYear(nextYearEnd.getFullYear() + 1)
    nextYearEnd.setDate(nextYearEnd.getDate() - 1)
    
    const openingBalances = await generateOpeningBalances(yearId)
    
    const nextYear: FiscalYear = {
      id: `fy-${nextYearStart.getFullYear()}`,
      name: `FY ${nextYearStart.getFullYear()}`,
      startDate: nextYearStart.toISOString().split('T')[0],
      endDate: nextYearEnd.toISOString().split('T')[0],
      organizationId: currentYear.organizationId,
      status: 'open',
      periods: [],
      closingStatus: 'not-started',
      openingBalances
    }
    
    return nextYear
  }

  const validateYearEndClose = async (yearId: string): Promise<{ valid: boolean; errors: string[] }> => {
    const errors: string[] = []
    
    // Check if all periods are locked
    const year = currentOrganization?.fiscalYears.find(y => y.id === yearId)
    if (!year) {
      errors.push('Fiscal year not found')
      return { valid: false, errors }
    }
    
    const unlockedPeriods = year.periods.filter(p => !p.isLocked)
    if (unlockedPeriods.length > 0) {
      errors.push(`${unlockedPeriods.length} periods are not locked`)
    }
    
    // Check if audit is required and completed
    if (currentOrganization?.fiscalYearSettings.requireAuditBeforeClose) {
      const pendingAudits = year.periods.filter(p => p.auditStatus !== 'completed')
      if (pendingAudits.length > 0) {
        errors.push(`${pendingAudits.length} periods have pending audits`)
      }
    }
    
    return { valid: errors.length === 0, errors }
  }

  const archiveFiscalYear = async (yearId: string, userId: string): Promise<boolean> => {
    try {
      // Archive old fiscal year - in real app would update backend
      return true
    } catch (error) {
      console.error('Error archiving fiscal year:', error)
      return false
    }
  }

  const value: OrganizationContextType & { organization: Organization | null } = {
    organizations,
    currentOrganization,
    currentFiscalPeriod,
    currentFiscalYear,
    setCurrentOrganization: handleSetCurrentOrganization,
    setCurrentFiscalPeriod,
    isDateWithinFiscalPeriod,
    canAddTransaction,
    lockFiscalPeriod,
    unlockFiscalPeriod,
    createFiscalYear,
    closeFiscalYear,
    generateOpeningBalances,
    createYearEndAdjustments,
    generateClosingEntries,
    rolloverToNextYear,
    validateYearEndClose,
    archiveFiscalYear,
    isLoading,
    organization: currentOrganization // Alias for backward compatibility
  }

  return (
    <OrganizationContext.Provider value={value}>
      {children}
    </OrganizationContext.Provider>
  )
}

export function useOrganization() {
  const context = useContext(OrganizationContext)
  if (context === undefined) {
    // During SSR or when context is not available, return safe defaults
    if (typeof window === 'undefined') {
      return {
        organizations: [],
        currentOrganization: null,
        currentFiscalPeriod: null,
        currentFiscalYear: null,
        setCurrentOrganization: () => {},
        setCurrentFiscalPeriod: () => {},
        isDateWithinFiscalPeriod: () => false,
        canAddTransaction: () => ({ allowed: false, reason: 'Not available' }),
        lockFiscalPeriod: async () => false,
        unlockFiscalPeriod: async () => false,
        createFiscalYear: async () => ({ id: '', name: '', startDate: '', endDate: '', organizationId: '', status: 'open' as const, periods: [], closingStatus: 'not-started' as const }),
        closeFiscalYear: async () => false,
        generateOpeningBalances: async () => [],
        createYearEndAdjustments: async () => false,
        generateClosingEntries: async () => [],
        rolloverToNextYear: async () => ({ id: '', name: '', startDate: '', endDate: '', organizationId: '', status: 'open' as const, periods: [], closingStatus: 'not-started' as const }),
        validateYearEndClose: async () => ({ valid: false, errors: [] }),
        archiveFiscalYear: async () => false,
        isLoading: true,
        organization: null, // Alias for currentOrganization
      }
    }
    throw new Error('useOrganization must be used within an OrganizationProvider')
  }
  // Add organization alias for backward compatibility
  return {
    ...context,
    organization: context.currentOrganization,
  }
} 