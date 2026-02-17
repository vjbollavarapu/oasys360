"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { UserManagementOverview } from "@/components/pages/admin/users"

export default function UserManagementPage() {
  return (
    <DashboardLayout>
      <UserManagementOverview />
    </DashboardLayout>
  )
}

