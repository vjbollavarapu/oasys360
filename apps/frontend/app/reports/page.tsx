"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { ReportsOverview } from "@/components/pages/reports/overview"

export default function ReportsPage() {
  return (
    <DashboardLayout>
      <ReportsOverview />
    </DashboardLayout>
  )
}
