// components/lazy-components.tsx
import dynamic from 'next/dynamic'
import { Loader2 } from 'lucide-react'

// Loading component for dynamic imports
const LoadingSpinner = () => (
  <div className="flex items-center justify-center p-8">
    <Loader2 className="h-8 w-8 animate-spin text-primary" />
  </div>
)

// Dynamic imports for heavy components
export const DynamicDashboardLayout = dynamic(
  () => import('./dashboard-layout').then(mod => ({ default: mod.DashboardLayout })),
  {
    loading: () => <LoadingSpinner />,
    ssr: false
  }
)

export const DynamicAccountingDashboard = dynamic(
  () => import('./accounting/accounting-dashboard').then(mod => ({ default: mod.AccountingDashboard })),
  {
    loading: () => <LoadingSpinner />,
    ssr: false
  }
)

export const DynamicInvoicingDashboard = dynamic(
  () => import('./invoicing/invoicing-dashboard').then(mod => ({ default: mod.InvoicingDashboard })),
  {
    loading: () => <LoadingSpinner />,
    ssr: false
  }
)

export const DynamicBankingDashboard = dynamic(
  () => import('./banking/banking-dashboard').then(mod => ({ default: mod.BankingDashboard })),
  {
    loading: () => <LoadingSpinner />,
    ssr: false
  }
)

export const DynamicAIProcessingDashboard = dynamic(
  () => import('./ai-processing/ai-processing-dashboard').then(mod => ({ default: mod.AIProcessingDashboard })),
  {
    loading: () => <LoadingSpinner />,
    ssr: false
  }
)

export const DynamicWeb3Dashboard = dynamic(
  () => import('./web3/web3-dashboard').then(mod => ({ default: mod.Web3Dashboard })),
  {
    loading: () => <LoadingSpinner />,
    ssr: false
  }
)

export const DynamicMobileDashboard = dynamic(
  () => import('./mobile/mobile-dashboard').then(mod => ({ default: mod.MobileDashboard })),
  {
    loading: () => <LoadingSpinner />,
    ssr: false
  }
)

// Heavy form components
export const DynamicUserCreateForm = dynamic(
  () => import('./user/user-create-form').then(mod => ({ default: mod.UserCreateForm })),
  {
    loading: () => <LoadingSpinner />,
    ssr: false
  }
)

export const DynamicUserEditForm = dynamic(
  () => import('./user/user-edit-form').then(mod => ({ default: mod.UserEditForm })),
  {
    loading: () => <LoadingSpinner />,
    ssr: false
  }
)

// Chart and visualization components
export const DynamicFinancialReports = dynamic(
  () => import('./accounting/financial-reports').then(mod => ({ default: mod.FinancialReports })),
  {
    loading: () => <LoadingSpinner />,
    ssr: false
  }
)

export const DynamicInvoiceManagement = dynamic(
  () => import('./invoicing/invoice-management').then(mod => ({ default: mod.InvoiceManagement })),
  {
    loading: () => <LoadingSpinner />,
    ssr: false
  }
)

// AI and Web3 components
export const DynamicAIDocumentProcessing = dynamic(
  () => import('./ai-processing/document-processing').then(mod => ({ default: mod.DocumentProcessing })),
  {
    loading: () => <LoadingSpinner />,
    ssr: false
  }
)

export const DynamicWeb3WalletIntegration = dynamic(
  () => import('./web3/wallet-integration').then(mod => ({ default: mod.WalletIntegration })),
  {
    loading: () => <LoadingSpinner />,
    ssr: false
  }
)

// Mobile components
export const DynamicMobileFeatures = dynamic(
  () => import('./mobile/mobile-features').then(mod => ({ default: mod.MobileFeatures })),
  {
    loading: () => <LoadingSpinner />,
    ssr: false
  }
)

export const DynamicOfflineCapabilities = dynamic(
  () => import('./mobile/offline-capabilities').then(mod => ({ default: mod.OfflineCapabilities })),
  {
    loading: () => <LoadingSpinner />,
    ssr: false
  }
)
