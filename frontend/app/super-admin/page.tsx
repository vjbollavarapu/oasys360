"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { SuperAdminOverview } from "@/components/pages/super-admin/overview"

export default function SuperAdminDashboard() {
  return (
    <DashboardLayout>
      <SuperAdminOverview />
    </DashboardLayout>
  )
}
