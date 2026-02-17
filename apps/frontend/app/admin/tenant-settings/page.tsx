"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { TenantSettingsOverview } from "@/components/pages/admin/tenant-settings"

export default function TenantSettingsPage() {
  return (
    <DashboardLayout>
      <TenantSettingsOverview />
    </DashboardLayout>
  )
}

