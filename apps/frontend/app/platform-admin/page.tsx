"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { PlatformAdminOverview } from "@/components/pages/platform-admin/overview"

export default function PlatformAdminPage() {
  return (
    <DashboardLayout>
      <PlatformAdminOverview />
    </DashboardLayout>
  )
}

