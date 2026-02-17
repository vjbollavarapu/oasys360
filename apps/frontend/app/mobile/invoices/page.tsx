"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { MobileInvoicesOverview } from "@/components/pages/mobile/invoices"

export default function MobileInvoicesPage() {
  return (
    <DashboardLayout>
      <MobileInvoicesOverview />
    </DashboardLayout>
  )
}
