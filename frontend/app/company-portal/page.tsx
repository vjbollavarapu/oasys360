"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { CompanyPortalOverview } from "@/components/pages/company-portal/overview"

export default function CompanyPortalDashboard() {
  return (
    <DashboardLayout>
      <CompanyPortalOverview />
    </DashboardLayout>
  )
}
